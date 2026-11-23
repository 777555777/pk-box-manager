# Review: `feat/data-model-v2` gegen `main`

Stand: 2026-11-23 · Commits `3f222d7` … `e8f17cf` · Read-only-Review (keine Änderungen am Code)

**Legende:** **Blocker** = vor dem Merge beheben · **Should fix** = zeitnah, vor einem Release an Nutzer · **Nit** = klein oder später.
„Verifiziert“ heißt: Codepfad gelesen und, wo angegeben, mit einem Wegwerf-Test (außerhalb des Repos, gegen den echten `DexStore` bzw. Parser) reproduziert. „Verdacht“ heißt: plausibel, aber nicht reproduziert oder abhängig von Annahmen über echte Nutzerdaten.

## Kurzfazit

Ein Blocker: Schlägt ein IndexedDB-Schreibvorgang fehl, gehen die Änderungen dieses Batches still verloren (Details in B1). Migration, Konverter, Katalog und Reaktivität sind sonst sorgfältig umgesetzt und gut getestet. Die übrigen Punkte betreffen vor allem stille Fehlerpfade, also Fälle, in denen der Nutzer nicht erfährt, dass Daten fehlen oder nicht gespeichert werden.

---

## Verifizierte Findings

### B1 · Blocker · Fehlgeschlagener Write verwirft Änderungen endgültig

`src/lib/state/dex-store.svelte.ts:138-145`, `:405-419`, `:250-255` (und analog `createDex`, `resetDex`, `deleteDex`, `importDex`)

- `#takePending()` leert `#pendingDexes`/`#pendingEntries`, **bevor** geschrieben wird. Schlägt `repository.write` fehl, wird nur `persistError` gesetzt. Der Batch wird nicht erneut eingeplant.
- **Reproduziert:** Write 1 schlägt fehl (`0007-squirtle`), Write 2 klappt (`0008-wartortle`). In der DB steht danach nur Wartortle. Squirtle existiert nur noch im Speicher und fehlt nach einem Reload. `persistError` bleibt außerdem auch nach dem erfolgreichen Write gesetzt.
- Es wird schlimmer: `switchDex` (und `createDex`/`importDex`/…) ruft `await this.flush()` auf. `flush` schluckt den Fehler, danach ersetzt `#activate` die `#entries`. Die ungespeicherten Änderungen sind damit **auch im Speicher weg**, schon vor einem Reload.
- `persistError` wird nirgends in der UI angezeigt. Der Nutzer arbeitet also weiter und verliert jede weitere Änderung, wenn die Ursache bleibt.
- Realistische Ursachen: Quota, Safari/WebKit „Connection to Indexed Database server lost“ nach längerem Hintergrund, die DB wird von außen gelöscht (DevTools, anderer Tab → `onversionchange` → `db.close()`, `indexeddb-repository.ts:40`). Danach wirft **jeder** weitere Write `InvalidStateError`, und es gibt keinen Reconnect. In v1 war `localStorage.setItem` synchron, ein Fehler landete sofort im Klick-Handler.
- **Fix:**
  1. Bei Fehler den Batch in die Queue zurücklegen, aber nur Keys, die inzwischen nicht neu eingereiht wurden (neuere Werte gewinnen). Danach mit Backoff erneut versuchen.
  2. `switchDex`/`createDex`/`resetDex`/`deleteDex`/`importDex` abbrechen, wenn noch ungespeicherte Änderungen offen sind und der Flush fehlschlug. Auf keinen Fall `#entries` ersetzen.
  3. `persistError` sichtbar machen (Banner „Speichern fehlgeschlagen – bitte exportieren/neu laden“) und nach einem erfolgreichen Write auf `null` zurücksetzen.
  4. Im Repository `db.onclose`/`onversionchange` behandeln: neu öffnen oder einen Reload-Hinweis anzeigen.
  5. Test: „ein fehlgeschlagener Write geht nicht verloren“ und „switchDex nach fehlgeschlagenem Flush“. Der bestehende Test `reports failed writes` prüft nur die Meldung.

### S1 · Should fix · Übersprungene v1-Dexe verschwinden still und dauerhaft

`src/lib/storage/migrate-v1.ts:57-66, 76-80`, `src/lib/dex/v1/v1-save.ts:27-47`

- Kann ein `dex:*`-Key nicht geparst werden, landet er in `v1Migration.skipped`. Trotzdem wird `schemaVersion = 2` gesetzt, die Migration läuft also nie wieder. Der Dex fehlt in der UI, nur die Konsole erwähnt ihn. Die Daten liegen weiter in localStorage. Sie sind also rettbar, aber der Nutzer weiß nichts davon.
- Der Parser lehnt den **ganzen Dex** schon wegen eines einzigen ungültigen Felds ab. **Reproduziert:**
  - Saves im Format vor `8b7d75a` (2025-08-25) haben `config.id` statt `config.presetId` → `Invalid v1 save`. Laut Git-Historie gibt es das Deploy-Skript seit Mai 2025. v1.0.0 zeigt solche Saves noch an (Index und Boxen kommen aus `state`).
  - Ein einzelnes Entry-Feld mit `null` (z. B. `ability: null`) → der ganze Dex wird verworfen. Ob v1 je `null` geschrieben hat, ist nicht geprüft (**Verdacht**).
- **Fix:**
  - `presetId` mit Fallback auf `config.id` lesen.
  - Entry-Felder mit `nullish(…, default)` lesen. Kaputte _Einträge_ einzeln überspringen und melden statt den ganzen Dex.
  - `skipped` in der UI anzeigen, mindestens einmalig, mit Hinweis auf den Export.
  - Alternativ übersprungene Keys bei jedem Start erneut versuchen, solange es keinen v2-Dex mit dieser ID gibt.

### S2 · Should fix · IndexedDB-Fallback auf In-Memory ist still, setzt aber den Migrationsmarker

`src/lib/state/app.ts:58-65`, `src/lib/storage/migrate-v1.ts:82-86`

- Ist IndexedDB nicht verfügbar (z. B. ältere Firefox-Versionen im privaten Modus, Storage blockiert), läuft die App gegen `createMemoryRepository()`. Der Nutzer sieht seine migrierten v1-Daten und arbeitet normal weiter. **Alle Änderungen gehen beim Reload verloren**, es gibt nur `console.error`. In v1 blieben Änderungen in genau diesem Modus über Reloads erhalten (Regression).
- `migrateFromV1` setzt auch in diesem Fall `v1MigratedAt` in localStorage, obwohl nichts dauerhaft gespeichert wurde. Laut Doku ist der Marker nur informativ, ein späteres Aufräum-Release darf sich also **nicht** auf ihn verlassen. Sonst löscht es v1-Daten, die nie in IndexedDB angekommen sind.
- **Fix:** Banner „Änderungen werden nicht gespeichert“. Den Marker nur bei persistentem Repository setzen oder ihn umbenennen. In der Doku festhalten, dass ein Cleanup erst nach einem Rücklesen aus IndexedDB löschen darf.

### S3 · Should fix · v1-Custom-Layouts (Migration und v1-Import) werden nicht validiert

`src/lib/dex/v1/convert-v1.ts:83-92`, `src/lib/dex/transfer.ts:98-101` (im Gegensatz zu `:122-130` für v2)

- **Reproduziert:** Ein v1-Save mit unbekanntem Preset und einer unbekannten Pokémon-ID wird importiert bzw. migriert. Der **eigene v2-Export dieses Dex lässt sich danach nicht mehr importieren** (`The dex layout is invalid: unknown-pokemon (box-001, …)`).
- Doppelte IDs im Custom-Layout (über Aliase oder eine manipulierte Datei) führen zu doppelten Keys in `{#each visiblePokemon … (pokemon ?? …)}` (`pk-box.svelte`). Im Dev-Build ist das ein Laufzeitfehler, in Produktion ist das Verhalten undefiniert. Da der Dex danach aktiv ist und in `selectedDex` gemerkt wird, kann das auch nach einem Reload so bleiben. Beides teilen sich außerdem einen Eintrag. Die Ursache ist verifiziert, die Folge im Prod-Build ist ein **Verdacht**.
- Heute ist das selten: Alle v1-Preset-IDs existieren im Katalog, und `pokemon-aliases.json` ist leer.
- **Fix:** Im v1-Pfad `validateCustomLayout` anwenden oder bereinigen (Duplikate und unbekannte IDs zu `null`, Meldung im Report). Test: „Jeder Dex, den die App hält, übersteht Export → Import“.

### S4 · Should fix · Ungeschützte localStorage-Writes können den Start abbrechen

`src/lib/state/dex-store.svelte.ts:345` → `settings-storage.ts:110-112`, außerdem `loadAppSettings`/`loadAppDefaults` (schreiben beim Laden zurück)

- `#activate` ruft `this.#selection.save()` ohne `try/catch` auf. Wirft `setItem` (Quota, Storage gesperrt), wirft `init()`, `load()` schlägt fehl und die App startet nicht.
- Das Risiko ist größer als in v1, weil die v1-Daten bewusst in localStorage **liegen bleiben**. Wer mit vielen National-Dexen nahe an der 5-MB-Grenze war, bleibt dort. Der Migrationsmarker und `persistentStorageRequested` sind bereits abgesichert, `selectedDex` nicht. Der Codepfad ist verifiziert, das Quota-Szenario ein **Verdacht**.
- **Fix:** `saveSelectedDexId` sowie die Rückschreib-Pfade in `loadAppSettings`/`loadAppDefaults` in `try/catch` kapseln. Die Auswahl ist nur Komfort.

### N1 · Nit (latent) · Klicks während `resetDex`/`importDex` erzeugen Abweichungen zwischen UI und DB

`src/lib/state/dex-store.svelte.ts:268-282`, `:303-320`

- **Reproduziert:**
  - Eine Änderung während des laufenden Reset-Writes landet nach dem Reset in der DB. Die UI leert danach aber `#entries` und zählt `caught: 1` ohne sichtbaren Eintrag. Nach einem Reload ist das Pokémon wieder gefangen.
  - Beim Import der aktiven ID landet der Klick in der DB, aber nicht in der UI.
- Über die heutige UI ist das praktisch nicht erreichbar, weil Reset und Import in modalen Dialogen liegen. Deshalb nur ein Nit.
- **Fix:** Den Speicher-Zustand synchron vor dem `await` umstellen (`#entries`, Stats, `activeId`) und den Write in die Kette hängen. Oder Mutationen per `#busy`-Flag sperren.

### N2 · Nit · `persistError` wird nie zurückgesetzt

`dex-store.svelte.ts:73, 142`: Sobald der Fehler angezeigt wird (B1), muss er bei Erfolg wieder verschwinden.

### N3 · Nit · Letzten Dex löschen ohne Default-Dex führt zum Absturz

`dex-store.svelte.ts:293-296`

Gibt es keinen `isDefault`-Dex und der letzte Dex wird gelöscht, ist `fallback` `undefined`, und `fallback.id` wirft. Der DB-Delete ist dann aber schon passiert. Erreichbar ist das nur mit v1-Daten ohne System-Default (in v1 praktisch ausgeschlossen, weil der Default nicht löschbar war). **Fix:** Den letzten Dex nicht löschbar machen oder in `ensureSingleDefault` einen Default bestimmen, falls keiner existiert.

### N4 · Nit · Neuer Lint-Fehler

`src/routes/+page.svelte:5`: `appState` wird nach dem Umbau nicht mehr benutzt. Das ist der einzige ESLint-Fehler in den neuen bzw. umgebauten Dateien.

---

## Verdachtsmomente (nicht reproduziert)

- **V1 · Should fix · Veralteter v1-Tab nach dem Deploy.** Ein Tab, der noch den v1-JS-Code geladen hat (SPA, kein Reload), schreibt nach der Migration weiter in `dex:*`. Diese Änderungen erreicht v2 nie. **Fix (günstig):** Beim Start `meta.updatedAt` jedes v1-Saves mit `v1Migration.migratedAt` vergleichen und bei neueren Saves warnen bzw. eine Nachmigration anbieten. Zusätzlich ein `storage`-Event-Listener auf `dex:*`.
- **V2 · Nit · Mehrere v2-Tabs.**
  - Jeder Klick schreibt den **ganzen** `DexRecord` als Snapshot. Ein veralteter Tab überschreibt so Name und Wallpaper aus einem anderen Tab. v1 hat vor jedem Write frisch geladen, für diese Felder ist das also eine kleine Regression. Einträge selbst sind pro Key und damit besser als in v1.
  - Ein veralteter Tab kann einen anderswo gelöschten Dex teilweise wiederbeleben.
  - Zwei Tabs beim allerersten Start legen zwei Default-Dexe an (UUID statt deterministischer ID).
  - Später: `BroadcastChannel` mit Reload-Hinweis.
- **V3 · Nit · IndexedDB gelöscht, localStorage nicht.** Dann migriert die App beim nächsten Start still den **alten** v1-Stand. Das ist besser als nichts, aber überraschend. Der Marker `v1MigratedAt` würde das erkennen und könnte einen Hinweis auslösen. In der Praxis löschen Browser meist beides zusammen.
- **V4 · Nit · Zukünftige DB-Versionen.** `openDatabase` hat keinen `onblocked`-Handler und kein Timeout, ein hängendes `open` lässt die Seite leer. `onversionchange` schließt still (siehe B1). Mit DB-Version 1 ist das heute unkritisch.
- **V5 · Nit · Vorwärtskompatibilität des v2-Imports.** `EntryDataSchema` verlangt alle Felder, und `object()` entfernt unbekannte Keys. Kommt später ein neues Feld dazu, scheitern alte v2-Exporte. Das ist dasselbe Muster wie der OT-Bug aus v1. Lieber `optional(…, default)` für die Felder verwenden.
- **V6 · Nit · Migration schlägt beim Schreiben fehl.** Dann wirft `start()`, SvelteKit zeigt die Fehlerseite, und `started` cacht das abgelehnte Promise. Ein erneuter Versuch beim Reload funktioniert, wie vorgesehen. Eine verständliche Meldung wäre trotzdem besser.

---

## Geprüft und in Ordnung

- **Migration:**
  - Ein atomarer Batch inklusive `schemaVersion` und `v1Migration`. Scheitert er, wird beim nächsten Start erneut migriert (getestet).
  - Puts sind idempotent, zwei gleichzeitig migrierende Tabs schreiben identische Daten.
  - v1-Daten bleiben unangetastet, und die IDs bleiben erhalten, sodass `selectedDex` weiter passt.
  - `ensureSingleDefault` funktioniert.
- **v1-Semantik:** v1 setzt bei _jeder_ Bearbeitung `isCustomized = true` (siehe `pk-state.svelte.ts` auf `main`). Die Regel `captured || isCustomized` verliert deshalb keine Nutzerdaten, auch freigelassene Pokémon mit Daten bleiben erhalten. OT bleibt erhalten, `convertV1Save` mutiert nichts, Wallpaper werden über eindeutige Titel zugeordnet, verwaiste Einträge bleiben erhalten und zählen nicht mit.
- **IndexedDB:** Key-Range `[dexId] … [dexId, []]` ist korrekt. Arrays sortieren nach Strings, die erste Komponente muss exakt passen, `'ab'` fällt also nicht in den Bereich von `'a'`. Die Reihenfolge löschen → schreiben innerhalb einer Transaktion passt zur Request-Reihenfolge. Bei `DataCloneError` wird abgebrochen und nichts geschrieben (Vertragstest läuft gegen beide Implementierungen).
- **Write-Kette:** Writes überholen sich nicht. `#writeChain = run.catch(…)` hält die Kette nach Fehlern am Leben.
- **Snapshots:** `$state.snapshot` steht vor jedem `putDexes`. Einträge werden aus Snapshots neu aufgebaut und per `structuredClone` (plain objects) übernommen. Beim Import wird geklont.
- **Zähler:** Die inkrementellen Stats stimmen mit `computeStats` überein (gleiche Regel: shiny zählt nur, wenn gefangen; nur Layout-IDs). Beim Aktivieren wird gegen den Katalog korrigiert.
- **Reaktivität:**
  - `getPokemon` liest pro Key aus dem Proxy, ein Klick aktualisiert also nur den betroffenen Slot.
  - `boxes` hängt nur von `layout`/`boxSettings` ab, nicht von `stats`/`updatedAt`. Klicks lösen kein `resolveLayout` aus.
  - Boxen und Slots sind keyed. Komplett neu gerendert wird nur beim Dex-Wechsel.
  - `isSelected` wird pro Klick in allen Slots neu ausgewertet, ist aber nur ein String-Vergleich (wie in v1).
  - Die Dex-Liste ist jetzt keyed, das ist besser als der Index-Loop in v1.
- **Katalog:** Parität mit v1 über alle 7 × 16 Preset/Tag-Kombinationen (Fixture). Presets werden nicht mehr mutiert, die Integritätstests passen, und die v1-Preset-IDs (`national`, `generation-1…6`) existieren alle.
- **Import/Export:**
  - Vor dem Überschreiben wird gefragt, `isDefault` des bestehenden Dex bleibt erhalten, `stats` werden neu berechnet, neuere Formatversionen werden abgelehnt.
  - Der Export eines aktiven Dex nutzt den Speicherstand und ist damit nie veraltet.
- **`persist()`:** Wird synchron im Klick-Handler und nur einmal pro Browser aufgerufen.
- **Checks:**
  - `npm test`: 13 Dateien, 296 Tests grün, inklusive der echten Exporte aus `/.testdata`.
  - `npm run check`: 0 Fehler. Die 2 Warnungen in `pk-dex-card.svelte` stammen aus altem Code und sind unkritisch.
  - ESLint über `src/lib/{state,storage,dex,catalog}` ist sauber, abgesehen von N4.

## Fehlende Tests (wichtigste zuerst)

1. Fehlgeschlagener Write: Daten bleiben erhalten bzw. werden erneut versucht. Dazu `switchDex`/`createDex` nach fehlgeschlagenem Flush (B1).
2. v1-Saves älterer Formate (`config.id`, `null`-Felder, einzelne kaputte Einträge) (S1).
3. Export → Import-Roundtrip für **jeden** Dex, den Migration oder Import erzeugen können, inklusive Custom-Fallback (S3).
4. Start mit In-Memory-Fallback: kein Marker, Hinweis an den Nutzer (S2).
5. Start, wenn `localStorage.setItem` wirft (S4).
6. Nebenläufigkeit: Änderung während `resetDex`/`importDex`/`switchDex` (N1).

---

## Nachprüfung der Fixes

Stand: Arbeitsverzeichnis (uncommitted) auf `e8f17cf`. Geprüft per Code-Lesen und mit Wegwerf-Tests außerhalb des Repos gegen den echten `DexStore`, `fake-indexeddb` und die v1-Fixtures. `npm test` (320 grün), `npm run check` (0 Fehler) und ESLint über die geänderten Dateien sind sauber. Der einzige ESLint-Fehler steht in `app-state.svelte.ts:141` und stammt aus altem Code.

### Ergebnis pro Finding

| Finding                                                    | Status                                 | Beleg / Rest                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1** Fehlgeschlagener Write verwirft Änderungen          | **behoben** (kleine Lücke siehe NEU-2) | `dex-store.svelte.ts:484-538`: Der fehlgeschlagene Batch kommt zurück in die Queue, neuere Keys gewinnen, Retry mit Backoff, `persistError` wird bei Erfolg gelöscht. **Reproduziert:** Write schlägt fehl → Banner-Zustand gesetzt → nach dem Retry ist Squirtle gespeichert und der Fehler weg. `switchDex` bei dauerhaftem Fehler wird abgelehnt, der Dex bleibt aktiv, die Daten bleiben im Speicher. Reconnect in `indexeddb-repository.ts:50-62` und Banner in `pk-storage-notice.svelte` sind vorhanden.                                                                                                                                                                                         |
| **S1** Übersprungene v1-Dexe verschwinden still            | **behoben**                            | `v1-save.ts:154` mit Fallback auf `config.id`, `nullish`-Defaults, Validierung pro Eintrag (`:142-146`). `migrate-v1.ts:111-159` versucht übersprungene Keys bei jedem Start erneut und überschreibt nie einen bestehenden v2-Dex. Das Banner zeigt übersprungene Dexe. Rest (Nit): Einzelne verworfene **Einträge** (`report.invalidEntries`) erscheinen nur in der Konsole, nicht im Banner. Die Daten liegen weiter in localStorage.                                                                                                                                                                                                                                                                 |
| **S2** Stiller In-Memory-Fallback, Marker trotzdem gesetzt | **teilweise**                          | Marker nur bei `persistent` (`migrate-v1.ts:95`), Banner „memory“ vorhanden, beides passt. Rest: Wenn der Browser _jeglichen_ Storage blockiert, wirft schon der Zugriff auf `localStorage` (SecurityError). `app.ts:46` (`migrateFromV1(repository, localStorage, …)`) und der Default-Parameter `persist.ts:36` werten `localStorage` ungeschützt aus. Der Start bricht dann ab, bevor das Banner erscheinen kann. Das Banner greift also nur, wenn IndexedDB fehlt, localStorage aber funktioniert. **Fix:** Zugriff in einer Hilfsfunktion kapseln (`try { return localStorage } catch { return null }`) und ohne Quelle die Migration überspringen. Gleiches Verhalten wie v1, daher kein Blocker. |
| **S3** v1-Custom-Layouts ungeprüft                         | **behoben**                            | `convert-v1.ts` `sanitizeCustomLayout`: Unbekannte, doppelte und überzählige Slots werden zu `null` und landen in `report.removedSlots`. Ein Roundtrip-Test für jeden konvertierten Dex ist da. Rest (Nit): Die Box-ID-Reparatur `${id}-${index + 1}` kann theoretisch mit einer _anderen_ vorhandenen ID kollidieren (z. B. Boxen `a`, `a`, `a-2`). Das scheitert dann erst beim Re-Import.                                                                                                                                                                                                                                                                                                            |
| **S4** Ungeschützte localStorage-Writes                    | **behoben**                            | `settings-storage.ts` (`writeItem`, `readJson`, `loadSelectedDexId`) und `#activateWith` (`dex-store.svelte.ts:398-403`) sind abgesichert. Den Fall „Zugriff selbst wirft“ behandelt S2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **N1** Klicks während Reset/Import                         | **behoben**                            | **Reproduziert:** Reset und Import laufen jetzt synchron über die Queue. Klicks während der Operation landen in UI und DB gleich (Reset: UI und DB = `[squirtle]`; Import: UI und DB = `[wartortle]`, Name `IMPORTED`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **N2** `persistError` nie zurückgesetzt                    | **behoben**                            | `#markSaved` (`:524-527`), `retrySaving` (`:167-171`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **N3** Letzter Dex / kein Default                          | **behoben**                            | `deleteDex` sperrt den letzten Dex (`:322`), `#ensureDefault` (`:415-424`) setzt einen Default. Beides ist getestet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **N4** Ungenutzter Import                                  | **behoben**                            | `+page.svelte`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Neue Probleme durch die Fixes

**NEU-1 · Should fix · Reconnect nach einer gelöschten DB meldet „gespeichert“, obwohl die DB nur Bruchstücke enthält**
`indexeddb-repository.ts:50-62` zusammen mit `:151-153`

- **Reproduziert** mit `fake-indexeddb`, 4 migrierte Dexe: Die DB wird extern gelöscht (DevTools, anderer Tab, Browser-Eviction). Danach wird ein Pokémon gefangen.
- Der Reconnect legt per `onupgradeneeded` (`oldVersion 0`) eine **leere** DB an, und der Write gelingt. Ergebnis: `persistError === null`, in der DB steht **1 von 4** Dexen, und `schemaVersion` fehlt.
- Folgen:
  - Das Banner verschwindet, der Nutzer hält alles für gespeichert.
  - Der Export eines _nicht aktiven_ Dex liest aus der DB und liefert dann still einen leeren Dex.
  - Beim nächsten Laden läuft `migrateFromV1` erneut, weil `schemaVersion` fehlt. Es entsteht eine Mischung aus altem v1-Stand und den Bruchstücken nach dem Reconnect. Ohne v1-Daten bleibt nur der eine Dex mit den Einträgen nach dem Reconnect.
- Vor dem Fix schlugen die Writes in diesem Fall fehl. Die verlorenen Daten sind nicht neu verloren, aber der Zustand wird jetzt fälschlich als gesund angezeigt.
- **Fix:** Erkennen, wenn ein Reconnect die DB neu anlegt (`oldVersion === 0` bei einem Reopen). Dann nicht still weiterschreiben, sondern einen eigenen Fehler melden („Der Speicher wurde gelöscht – bitte jetzt exportieren“). Optional einen vollständigen Snapshot aus dem Speicher zurückschreiben: alle `dexes`, die Einträge des aktiven Dex und `schemaVersion`.

**NEU-2 · Nit · `#flushStrict` kann zurückkehren, während ein parallel gestarteter Write noch läuft**
`dex-store.svelte.ts:484-492`

- **Reproduziert:** Ein Write W1 läuft noch. Der Nutzer fängt ein Pokémon, der Microtask-Flush wartet auf W1. Danach `switchDex`. Beide warten auf dasselbe Ketten-Promise, der Microtask-Flush übernimmt die Queue, und `switchDex` findet sie leer und kehrt sofort zurück. Schlägt der übernommene Write fehl, wird trotzdem gewechselt (`active = gen3`, `hasUnsavedChanges = true`).
- Die Änderung bleibt in der Queue, und der Retry speichert sie später. Sie geht nur verloren, wenn der Nutzer neu lädt, solange das Speichern weiter fehlschlägt. Bis dahin zeigt der alte Dex nach dem Zurückwechseln den DB-Stand ohne die Änderung.
- **Fix:** Nach der Prüfung auf leere Queue nochmals auf `#writeChain` warten und erneut prüfen (Schleife, bis Kette und Queue stabil sind). Oder einen Fehler des parallelen Writes an alle Wartenden weitergeben.

**NEU-3 · Nit · Ein dauerhaft ungültiger Batch blockiert die Queue für immer**
`#requeue`/`#reportError`

Nicht-transiente Fehler (`assertValidBatch`, `DataCloneError`) werden genauso wiederholt wie transiente. Weil der Batch atomar zurückgelegt wird, bleibt ab dann _jede_ Änderung ungespeichert (Retry alle 30 s, Banner bleibt). Heute ist das durch Snapshots und Schemas praktisch ausgeschlossen. Später sinnvoll: Fehlerarten unterscheiden oder den betroffenen Eintrag isolieren.

**NEU-4 · Nit · `deleteDex` erzeugt bei Fehlern kurz eine „unhandled rejection“**
`dex-store.svelte.ts:329-335`

`written` wird erst nach `await this.#activate(…)` abgewartet. Lehnt es vorher ab, meldet der Browser eine unhandled rejection (nur Konsole). **Fix:** `written.catch(() => {})` anhängen und den Fehler danach trotzdem per `await written` weiterreichen.

### Urteil

**Merge-ready: ja.** Kein Blocker mehr. B1 und N1 sind nachweislich behoben. NEU-1 und der Rest von S2 sollten vor einem Release an Nutzer behoben werden, blockieren aber den lokalen Merge nicht.
