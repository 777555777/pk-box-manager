# Datenmodell v2 – Entwurf

Status: **Entwurf zur Abstimmung** · Ausgangsstand: Tag `v1.0.0`

## Ziele

1. **Klein speichern:** Nur speichern, was der User wirklich eingegeben hat. Alles, was sich aus den mitgelieferten Daten berechnen lässt, wird nicht persistiert.
2. **Erweiterbar:** Neue Pokémon (z. B. aus „Wind & Welle“) und neue Boxen bedeuten nur neue Katalogdaten und Sprites, keine Migration der Userdaten.
3. **Custom Dexe:** Eigene Box-Anordnungen sind ein vollwertiger Layout-Typ.
4. **Bestandsdaten bleiben erhalten:** v1-Daten aus localStorage werden beim ersten Start automatisch übernommen. Alte Export-Dateien bleiben importierbar.
5. **Sync-fähig:** Pro Eintrag gibt es ein `updatedAt`. Damit ist später ein simpler Merge möglich (letzter Schreiber gewinnt).
6. **Testbar:** Fachlogik als reine Funktionen, Storage hinter einem Interface.

## Was in v1 problematisch ist

| Problem                                                                                            | Folge                                                                |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `config.pokemonOrder` wird in jedem Save mitgespeichert                                            | ca. 87 KB pro National Dex, eingefroren auf dem Stand bei Erstellung |
| Alle ~1.400 Pokémon im Grundzustand werden gespeichert, jeweils mit `idEntry`                      | ca. 443 KB für einen **leeren** National Dex                         |
| Box-IDs sind positionsbasiert (`box-001`, …)                                                       | Neue Boxen im Preset würden Wallpaper-Zuordnungen verschieben        |
| Jeder Klick: ganzen Dex parsen und schreiben, dann **alle** Dexe für den Index parsen              | Kosten wachsen mit der Anzahl der Dexe                               |
| `getDexConfig` mutiert die geteilten Preset-Objekte                                                | Tags und `pokemonOrder` „leaken“ zwischen Aufrufen                   |
| `PokemonEditStateSchema` kennt kein `originalTrainer`, valibot-`object()` entfernt unbekannte Keys | **Beim Import geht der OT verloren**                                 |
| Der Index liest `config.updatedAt` und `config.createdAt` (immer 0) statt `meta.*`                 | Zeitstempel in der Liste sind unbrauchbar                            |

## Trennung: Katalog vs. Userdaten

```
┌──────────── Katalog (statisch, mit der App ausgeliefert) ────────────┐
│ pokemon:   PokemonId → { stats, types, sprite, … }  (pk-stats.json)  │
│ boxes:     BoxTemplateId → { title, tags, pokemon: PokemonId[] }     │
│ presets:   PresetId → { name, cover, boxes: BoxTemplateId[] }        │
│ aliases:   alte PokemonId → neue PokemonId  (für spätere Umbenennungen)│
└──────────────────────────────────────────────────────────────────────┘
┌──────────── Userdaten (IndexedDB) ───────────────────────────────────┐
│ dexes:     DexRecord        (Name, Layout, Box-Settings, Zeitstempel)│
│ entries:   DexEntry         (nur gefangene/bearbeitete Pokémon)      │
│ meta:      Schema-Version, Migrationsstatus                          │
└──────────────────────────────────────────────────────────────────────┘
```

Die `PokemonId` ist der bestehende Identifier (`0025-pikachu-cap-alola`). Geprüft: Er ist über alle Boxen eindeutig, und jede ID in den Boxen existiert im Katalog. Neue Pokémon bekommen einfach neue IDs.

## Typen

```ts
type PokemonId = string // "0025-pikachu-cap-alola"
type BoxTag = 'normal' | 'forms' | 'gigantamax' | 'female'

interface DexRecord {
	id: string // neue Dexe: crypto.randomUUID(); migrierte Dexe behalten ihre v1-ID
	name: string
	coverImage: string
	layout: DexLayout
	boxSettings: Record<string, { wallpaper: string }> // Key = Box-ID, nur Abweichungen vom Default
	isDefault: boolean
	createdAt: number
	updatedAt: number
	stats: { total: number; caught: number; shiny: number } // Cache für die Dex-Liste
}

type DexLayout =
	// Preset: wird zur Laufzeit gegen den Katalog aufgelöst und wächst mit App-Updates mit
	| { kind: 'preset'; presetId: string; tags: BoxTag[] }
	// Custom: eingefrorene, frei editierbare Anordnung
	| { kind: 'custom'; boxes: CustomBox[] }

interface CustomBox {
	id: string // stabil, z. B. UUID
	title: string
	slots: (PokemonId | null)[] // max. 30, null = bewusst leerer Slot
}

interface DexEntry {
	dexId: string
	pokemonId: PokemonId
	captured: boolean
	shiny: boolean
	ball: string
	caughtIn: string
	ability: string
	comment: string
	originalTrainer: string
	ribbons: string[]
	marks: string[]
	updatedAt: number
}
```

Was dabei wegfällt:

- `idEntry`: kommt aus dem Katalog über die `PokemonId`.
- `isCustomized`: „Eintrag existiert“ hat dieselbe Bedeutung.
- `config.pokemonOrder` und `boxList`: werden aus dem Layout aufgelöst.
- `stateVersion` und `configVersion`: ersetzt durch eine globale Schema-Version im `meta`-Store.

Regel: Eine `PokemonId` kommt pro Dex höchstens einmal vor. Das gilt auch für Custom-Layouts, sonst würden sich zwei Slots einen Eintrag teilen.

### Aufgelöstes Layout (nur im Speicher)

```ts
interface ResolvedBox { id: string; title: string; wallpaper: string; slots: (PokemonId | null)[] }
catalog.resolveLayout(layout, boxSettings): ResolvedBox[] // src/lib/catalog/catalog.ts
```

Preset-Boxen nutzen die Template-ID (`kanto-1`) als Box-ID. Damit hängen Wallpaper an der Box selbst und nicht an ihrer Position.

### Neue Spiele / neue Pokémon

1. Sprites in `project-data/images/...` ablegen, `npm run sprites`
2. Einträge in `pk-stats.json` ergänzen
3. Neue Box-Templates in `pokedex-boxes.json` ergänzen und in `src/lib/catalog/presets.ts` hinten an `NATIONAL_BOXES` anhängen (Generations-Presets sind als „National bis Box X“ definiert und bleiben unverändert)
4. `npm test` prüft die Katalog-Integrität (Box existiert, ≤ 30 Pokémon, jede ID genau einmal, Stats und Sprite vorhanden)
5. Fertig: Bestehende Preset-Dexe zeigen die neuen Boxen automatisch, ohne Migration.

Sollte sich eine bestehende ID einmal ändern, kommt ein Eintrag in `src/lib/data/pokemon-aliases.json` (alte ID → neue ID, Ketten werden verfolgt). Beim Laden werden Einträge dann umgeschlüsselt.

## Storage

IndexedDB, nativ, mit einem dünnen eigenen Promise-Wrapper (ca. 50 Zeilen).

| Store     | keyPath                  | Index               |
| --------- | ------------------------ | ------------------- |
| `dexes`   | `id`                     | –                   |
| `entries` | `['dexId', 'pokemonId']` | `byDex` auf `dexId` |
| `meta`    | `key`                    | –                   |

Die App spricht nur mit einem Interface. Für Tests gibt es eine In-Memory-Implementierung.

```ts
interface DexRepository {
	listDexes(): Promise<DexRecord[]>
	getDex(id: string): Promise<DexRecord | undefined>
	putDex(dex: DexRecord): Promise<void>
	deleteDex(id: string): Promise<void> // inkl. Einträge
	getEntries(dexId: string): Promise<DexEntry[]>
	putEntries(entries: DexEntry[]): Promise<void>
	deleteEntries(dexId: string, ids?: PokemonId[]): Promise<void>
}
```

**Laufzeit:**

- Der aktive Dex liegt vollständig im Svelte-State. Das ist die einzige Quelle der Wahrheit.
- Änderungen werden als „dirty“ markiert und gebündelt geschrieben (Microtask/Debounce, zusätzlich bei `visibilitychange`/`pagehide`).
- Die Zähler werden schrittweise mitgeführt. Es werden nie mehr alle Dexe geparst.
- Beim Start: `navigator.storage.persist()` anfragen.

**Bleibt in localStorage:** `appSettings`, `appDefaults`, `selectedDex`. Die sind klein und werden beim Start synchron gebraucht, damit nichts flackert.

## Migration v1 → v2

Läuft beim Start, bevor der State aufgebaut wird (`+page.ts` `load`, async).

1. `meta.schemaVersion` ist bereits 2? Dann nichts tun.
2. Alle `dex:*`-Keys aus localStorage lesen und mit `parseV1Save` (`src/lib/dex/v1/v1-save.ts`) tolerant prüfen: Fehlende Felder wie `originalTrainer` bekommen Defaults, nicht benötigte Felder (`idEntry`, `pokemonOrder`) werden ignoriert. Kaputte Einträge überspringen und loggen.
3. `convertV1Save(save, catalog)` (`src/lib/dex/v1/convert-v1.ts`, reine Funktion) liefert `{ dex, entries, report }`:
   - `id` übernehmen, damit `selectedDex` weiter stimmt
   - `config.type === 'preset'` mit bekanntem Preset wird zu `{ kind: 'preset', presetId, tags }`
   - Unbekanntes Preset oder v1-Custom-Dex: Die v1-Reihenfolge wird als Custom-Layout eingefroren (Box-IDs `box-001` …), `report.layoutFallback` sagt warum
   - Box-Wallpaper: v1-Box über den **Titel** einer Template-Box zuordnen (Titel sind eindeutig). Keine Zuordnung möglich: `report.unmatchedBoxes`
   - Pokémon mit `captured || isCustomized` werden zu `DexEntry` (`updatedAt = meta.updatedAt`). IDs über `aliases` auflösen (`report.renamedEntries`, bei Kollision gewinnt der erste: `report.duplicateEntries`). Einträge, deren Pokémon nicht im Layout ist, bleiben erhalten (`report.orphanedEntries`)
   - `stats` neu berechnen (verwaiste Einträge zählen nicht)
   - Geprüft gegen alle Fixtures und echte Exporte: gleiche Boxen, gleiche Reihenfolge, gleiche Wallpaper, identische Userdaten, gleiche Zähler
4. Alles in **einer** IDB-Transaktion schreiben, danach `schemaVersion = 2` setzen.
5. **v1-Daten in localStorage nicht löschen**, sondern nur als migriert markieren. Aufräumen erst in einem späteren Release.

Der Import nutzt denselben Konverter. v1-Exportdateien werden erkannt (`config` + `state` vorhanden) und konvertiert.

## Export-Format v2

```json
{
	"format": "pk-box-manager",
	"version": 2,
	"exportedAt": 0,
	"dex": { "…": "DexRecord ohne stats" },
	"entries": []
}
```

Das ist klein, enthält nur Userdaten und ist die Grundlage für ein späteres Teilen-/Sync-Feature.

## Tests (Vitest)

Die Tests liegen neben dem Code (`src/**/*.test.ts`), die bestehenden Katalog-Tests bleiben unter `tests/`.

- **Fixtures:** echte v1-Saves aus dem Code von `v1.0.0` erzeugen (leerer National Dex, teilgefüllt mit Bändern/Marks/Kommentar/OT, Gen-3 mit Formen, umbenannter Dex) und als JSON einchecken
- `resolveLayout`: Tag-Filter, Preset-Grenzen, Custom-Layouts, leere Slots
- `convertV1Save`: alle Fixtures, Wallpaper-Zuordnung, unbekannte IDs, OT bleibt erhalten
- Fachlogik: Fangen mit Defaults, Bänder/Marks togglen, Reset, Zähler
- Import: v1 und v2, kaputte Dateien
- Repository: Vertragstests gegen die In-Memory-Implementierung und die IDB-Implementierung (mit `fake-indexeddb` als dev-only Abhängigkeit)
- Katalog-Integrität: jede Box-ID im Preset existiert, jede PokemonId hat Sprite und Stats, Box ≤ 30

## Umsetzungsschritte

Jeder Schritt ist für sich lauffähig und wird einzeln committet.

1. ✅ Vitest-Setup, v1-Fixtures, Tests für das heutige Verhalten
2. ✅ Katalog-Modul (`src/lib/catalog/`): `resolveLayout`, Presets ohne Mutation, Aliases. Die v1-Helfer (`getDexConfig` & Co.) laufen bereits über den Katalog
3. ✅ v2-Typen und Schemas (`src/lib/dex/`), toleranter v1-Parser, `convertV1Save` + Tests. Nebenbei: Das v1-Import-Schema behält jetzt den OT
4. Repository (IDB + Memory), Migrations-Runner, `storage.persist()`
5. `pkState` auf Repository umbauen (In-Memory als Wahrheit, gebündeltes Schreiben), async Start
6. Import/Export v2 (v1 weiterhin lesbar)
7. _Später:_ Editor für Custom-Dexe, ausgeblendete Bänder, Sync, `adapter-static`

## Offene Entscheidungen

- **Preset-Dexe „live“ statt eingefroren?** Vorschlag: live. Neue Pokémon erscheinen automatisch. Wer eine feste Anordnung will, macht daraus einen Custom-Dex („In Custom umwandeln“).
- **`fake-indexeddb` als dev-only Abhängigkeit** für die IDB-Tests. Vorschlag: ja, sie landet nicht im Bundle.
- **Settings in localStorage lassen?** Vorschlag: ja (klein, synchron, kein Flackern).
