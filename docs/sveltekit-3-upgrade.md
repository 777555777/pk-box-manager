# Upgrade auf SvelteKit 3

Stand: 23.11.2026 · Von `@sveltejs/kit` 2.70.4 auf 3.4.0

Das Dokument hat zwei Teile:

- **Teil A** ist allgemein und für andere SvelteKit-Apps (z. B. panopublisher) wiederverwendbar.
- **Teil B** beschreibt, was davon im pk-box-manager zutraf und was gemacht wurde.

---

## Teil A – Allgemein

### Quellen

Gelesen am 23.11.2026:

- Migration Guide: <https://svelte.dev/docs/kit/migrating-to-sveltekit-3>
- Changelog Kit: <https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md>
- Changelog adapter-node: <https://github.com/sveltejs/kit/blob/main/packages/adapter-node/CHANGELOG.md>
- Changelog adapter-static und adapter-auto (gleiches Repo, `packages/adapter-static`, `packages/adapter-auto`)
- Changelog vite-plugin-svelte: <https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md>
- Changelog prettier-plugin-svelte: <https://github.com/sveltejs/prettier-plugin-svelte/blob/master/CHANGELOG.md>
- Changelog svelte-check: <https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/CHANGELOG.md>
- Changelog eslint-plugin-svelte: <https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/CHANGELOG.md>

### Mindestversionen

| Was                            | Mindestens                              |
| ------------------------------ | --------------------------------------- |
| Node                           | **22.17**                               |
| TypeScript                     | 6                                       |
| Svelte                         | 5.57.1 (Peer-Range von Kit 3.4)         |
| Vite                           | 8.0.12 (erste Version mit Rolldown 1.0) |
| `@sveltejs/vite-plugin-svelte` | 7                                       |

Passende Adapter-Majors (alle verlangen SvelteKit 3):

| Paket                      | Major | Bemerkung                                                   |
| -------------------------- | ----- | ----------------------------------------------------------- |
| `@sveltejs/adapter-node`   | 6     | Bündelt mit Rolldown statt Rollup, kein `polka`/`sirv` mehr |
| `@sveltejs/adapter-static` | 4     | Einziger Breaking Change: verlangt SvelteKit 3              |
| `@sveltejs/adapter-auto`   | 8 (9) | 8 = SvelteKit 3; 9 baut für Cloudflare Workers statt Pages  |

Begleitpakete, die **nicht** zwingend einen neuen Major brauchen:

- `svelte-check` 4.x: Kit-3-Support ab **4.7.6** („config merged at the top level“).
- `eslint-plugin-svelte` 3.x: Kit-3-Erkennung ab **3.23.1**. Ab dann ist `no-navigation-without-resolve` im Recommended-Set auch für Kit 3 aktiv. Kann neue Lint-Fehler bei `<a href>`/`goto()` ohne `resolve()` bringen.
- `prettier-plugin-svelte` 4.x ist optional. 4.0 verlangt Svelte 5 und entfernt `svelteBracketNewLine` und `svelteStrictMode`. **Achtung:** 4.2.0 formatiert Element-Inhalte auf eigene Zeilen um. Das erzeugt große Format-Diffs, deshalb besser als eigenen Commit machen.

### Breaking Changes (Auswahl, nach Bereich)

**Konfiguration**

- `svelte.config.js` wird nicht mehr unterstützt. Alles kommt in `sveltekit({...})` in `vite.config.*`. Die früheren `kit.*`-Optionen stehen dort auf oberster Ebene, neben `preprocess`, `compilerOptions` und `adapter`.
- Entfernt: `files.lib`, `preloadStrategy`, `prerender.origin` (→ `paths.origin`), `csrf.checkOrigin` (→ `csrf.trustedOrigins`), `vitePlugin`, `experimental.handleRenderingErrors`, `experimental.instrumentation`. `experimental.tracing` heißt jetzt `tracing`.
- Neu: `paths.origin`, `csrf.trustedOrigins`, `output.linkHeaderPreload`.
- `version.pollInterval` ist jetzt standardmäßig 1 Stunde (vorher kein Polling).

**Module und Imports**

- `$lib` gibt es nicht mehr. Stattdessen `#lib` als Node-Subpath-Import in `package.json` (`"imports"`), **mit Dateiendung**: `$lib/foo` → `#lib/foo.ts`.
- `$app/environment` → `$app/env`.
- `$app/stores` ist entfernt → `$app/state` (`page`, `navigating`, `updated` ohne `$`).
- `$service-worker` ist entfernt → `$app/env`, `$app/manifest`, `$app/paths`.
- `$env/*` ist deprecated → `$app/env/private` / `$app/env/public`.
- `$app/paths`: `base`, `assets`, `resolveRoute` entfernt → `resolve()` / `asset()`. Typen `Pathname`/`Asset` heißen `Path`/`AssetPath`, ohne führenden `/`.
- Typen sind umgezogen: Hook-Typen (`Handle`, `HandleServerError` …) → `@sveltejs/kit/hooks`; Env-Typen und `defineEnvVars` → `@sveltejs/kit/env`; `defineParams` → `@sveltejs/kit/params`; Navigations-Typen → `$app/navigation`; `ActionResult`/`SubmitFunction` → `$app/forms`; `Page`, `ReadonlyURL` → `$app/state`; Remote-Function-Typen → `$app/server`.
- `json()`/`text()` sind deprecated → `Response.json()` / `new Response()`.
- `@sveltejs/kit/node/polyfills` ist entfernt. `getRequest`/`setResponse` sind synchron.

**TypeScript**

- `tsconfig.json` erweitert `$app/tsconfig` statt `./.svelte-kit/tsconfig.json` und muss `include` und `exclude` selbst angeben. `$app/tsconfig` bringt `verbatimModuleSyntax`, `isolatedModules`, `allowImportingTsExtensions`, `moduleResolution: bundler` usw. mit.
- `.svelte-kit/ambient.d.ts` usw. gehören nicht mehr in `include`.
- Service Worker ist ein eigenes TS-Projekt (`$app/tsconfig/service-worker`).

**Navigation**

- `goto()` lehnt URLs ab, die keine App-Route sind (externe URLs → `window.location.href`).
- `goto`-Optionen: `invalidateAll` → `refreshAll`, `replaceState` → `replace`, `noScroll` + `keepFocus` → `reset: false`.
- `pushState`/`replaceState` sind deprecated → `goto(url, { shallow: true, state })`.
- `invalidateAll` ist deprecated → `refreshAll`.
- Klick auf einen Link zur aktuellen Seite ruft jetzt `refreshAll()` auf.
- `preloadData` kann `{ type: 'error' }` liefern. `preloadCode` nimmt eine Route-ID.
- `data-sveltekit-*="off"` → `false`.
- `page.url` ist auf Typ-Ebene readonly.

**Fehlerbehandlung**

- `handleError` wird für **alle** Fehler aufgerufen, auch für erwartete (`error(...)`, 404). Unterscheidung über `kind`: `'app' | 'framework' | 'validation' | 'unknown'`.
- `App.Error` hat immer `status` und `message`. `handleError` kann den Status beeinflussen.
- `error(status, {...})` ist deprecated → `error(status, message, {...})`.
- `handleValidationError` ist entfernt.
- `fail(...)`-Status wird bei enhanced Forms jetzt wirklich als HTTP-Status verwendet.

**Sicherheit, Cookies, Server**

- CSRF ist immer an (`checkOrigin` entfernt). Cross-Origin-Requests ohne `Content-Type` werden abgelehnt.
- Externe `redirect()` brauchen `{ external: true }`.
- Cookies: `cookie` v2, nur ASCII-Namen, `path` standardmäßig `'/'`, `httpOnly`/`secure` standardmäßig `true` (außer `secure` im Dev).
- Dateien `*.server.*`/`server.ts` und jeder `server/`-Ordner (außer in `src/routes`, `static`) sind server-only.
- Param-Matcher stehen in einer Datei `src/params.ts` statt im Ordner `src/params/`.
- 204-Antworten haben keinen Body mehr.
- Im Dev setzt SvelteKit kein `access-control-allow-origin: *` mehr auf statische Assets (→ `server.cors` in Vite).

**adapter-node 6**

- Statische Assets werden beim Build in eine Liste geschrieben. Dateien, die nachträglich in `build/` landen, werden **nicht** ausgeliefert; ersetzte Dateien behalten alte Größe und ETag.
- ETag ist ein Content-Hash, `Last-Modified` entfällt.
- Statische Assets nur noch auf `GET`/`HEAD`, sonst 405.
- `ORIGIN` war in 6.0.0 entfernt (→ `paths.origin`), ist seit 6.0.2 wieder als Fallback erlaubt, wenn `paths.origin` fehlt.
- Seit 6.0.5 basiert er auf `@sveltejs/adapter-server`.

### Automatische Migration

```bash
npx sv migrate sveltekit-3 --tasks
```

Listet die Tasks. Mit `--tasks all --confirm --no-install` laufen alle ohne Rückfrage:
`package-json`, `tsconfig`, `svelte-config`, `environment`, `paths`, `external-redirects`, `shallow-routing`, `params`, `imports`, `lib-alias`, `app-state`, `collect-migration-instructions`.

Erfahrungen aus dem pk-box-manager (sv 1.7.0):

- Das Tool führt am Ende **`npm run format` über das ganze Projekt** aus. Generierte oder bewusst nicht formatierte Dateien danach mit `git checkout -- <pfad>` zurücksetzen.
- Es legt den Adapter zusätzlich in `devDependencies` an, auch wenn er schon in `dependencies` steht. Es lässt einen ungenutzten `adapter-auto` stehen und hebt ihn sogar an. Ranges (`^3.0.0`) prüfen und auf die aktuelle Version setzen.
- `#lib` zeigt in `package.json` auf `./src/lib/index.js`, auch wenn die Datei `index.ts` heißt.
- Es übernimmt die alten Kommentare aus `svelte.config.js` in `vite.config.ts`, inklusive veralteter adapter-auto-Hinweise.
- Was nicht automatisch geht, landet in `MIGRATION_TASKS.md` und als `// @migration-task`-Kommentar (z. B. in `tsconfig.json`). Beides abarbeiten und dann löschen.

### Checkliste

1. Auf die letzte 2.x-Version gehen und Deprecation-Warnungen beheben.
2. `npm audit` sichern (vorher).
3. Node ≥ 22.17 lokal, im CI und **im Docker-Base-Image** sicherstellen.
4. Vite ≥ 8.0.12, TypeScript 6, Svelte ≥ 5.57.1, vite-plugin-svelte 7 installieren.
5. `npx sv migrate sveltekit-3 --tasks all --confirm --no-install` ausführen.
6. Diff prüfen: reine Format-Änderungen zurücksetzen, `package.json` aufräumen (Adapter-Duplikate, ungenutzte Adapter, Ranges, `#lib`-Ziel).
7. `MIGRATION_TASKS.md` und `@migration-task`-Kommentare abarbeiten, dann löschen.
8. `tsconfig.json`: `.svelte-kit/*`-Includes entfernen; Optionen streichen, die `$app/tsconfig` schon setzt.
9. `handleError` prüfen: bekommt jetzt auch 404 und erwartete Fehler → nach `kind` filtern.
10. Nach Verwendungen suchen: `$app/stores`, `$app/environment`, `$env/`, `$service-worker`, `base`/`assets`/`resolveRoute`, `pushState`/`replaceState`, `invalidateAll`, `goto(` mit alten Optionen oder externen URLs, `redirect(` nach extern, `error(status, {`, `cookies.set`, `src/params/`, `json(`/`text(`.
11. Adapter-Major mitziehen. Bei adapter-node: keine Dateien nachträglich in `build/` legen.
12. `svelte-check` ≥ 4.7.6 und `eslint-plugin-svelte` ≥ 3.23.1 sicherstellen.
13. `npm run check`, Tests, Lint (vorher/nachher vergleichen), `npm run build`.
14. Build ohne `node_modules` starten (so wie im Container) und per `curl` und im Browser prüfen.
15. `npm audit` nachher; verbleibende Funde mit `npm audit fix` (nicht `--force`) beheben.

### Ändert SvelteKit 3 die Entscheidung adapter-node vs. adapter-static?

Nicht grundsätzlich. adapter-static 4 hat laut Changelog als einzigen Breaking Change „verlangt SvelteKit 3“; der Migration Guide erwähnt SPA-Modus und `fallback` gar nicht. Für reine Client-Apps ohne Server-Logik bleibt adapter-static die schlankere Wahl. Zwei Punkte aus Kit 3 sprechen aber eher dafür:

- adapter-node 6 liefert statische Dateien nur noch aus einer beim Build erzeugten Liste aus. Ein Node-Prozess bringt also gegenüber einem statischen Webserver keine zusätzliche Flexibilität.
- `handleError` und die Server-Hooks laufen bei `ssr = false` nur für die HTML-Shell und 404s, bringen also wenig.

---

## Teil B – pk-box-manager

### Ausgangslage

SvelteKit 2.70.4, adapter-node 5.5.8, SPA (`ssr = false`, `prerender = false` in `src/routes/+page.ts`), Deployment als Docker-Container mit `node:22-alpine` aus vorgebautem `build/`. Kein `$app/*`-, `$env`- oder Service-Worker-Code, keine Cookies, keine Form Actions, keine Param-Matcher, keine `goto`/`redirect`-Aufrufe.

Vite 8.3.8, vite-plugin-svelte 7.3.1, Svelte 5.57.3 und TypeScript 6.0.3 erfüllten die Mindestversionen schon.

### Betroffene Stellen und Änderungen

| Breaking Change                           | Datei(en)                                                                                                                           | Änderung                                                                                                                                                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `svelte.config.js` nicht mehr unterstützt | `svelte.config.js`, `vite.config.ts`                                                                                                | Datei gelöscht; `preprocess` und `adapter` stehen jetzt in `sveltekit({...})`                                                                                                                                                           |
| `$lib` → `#lib` mit Endung                | 34 Svelte-Komponenten, `src/routes/+page.ts`, `src/routes/+page.svelte`, `src/routes/spritesheet-demo/+page.svelte`, `package.json` | Imports per `sv migrate` umgeschrieben (`#lib/state/app.ts`, Svelte-Dateien behalten `.svelte`); `"imports"` in `package.json`                                                                                                          |
| `tsconfig` erweitert `$app/tsconfig`      | `tsconfig.json`                                                                                                                     | `extends: "$app/tsconfig"`, `.svelte-kit/*`-Includes entfernt, doppelte Compiler-Optionen entfernt                                                                                                                                      |
| Hook-Typen nach `@sveltejs/kit/hooks`     | `src/hooks.server.ts`                                                                                                               | Import angepasst                                                                                                                                                                                                                        |
| `handleError` bekommt alle Fehler         | `src/hooks.server.ts`                                                                                                               | Nur noch `kind === 'unknown'` loggen und mit generischer Meldung beantworten. Sonst würde jede 404 (z. B. Bot-Anfragen auf `/wp-login.php`) als Serverfehler mit Stacktrace geloggt und die Meldung „unexpected server error“ bekommen. |
| adapter-node 6                            | `package.json`                                                                                                                      | `^5.5.8` → `^6.0.5` (bleibt in `dependencies`)                                                                                                                                                                                          |
| —                                         | `package.json`                                                                                                                      | `@sveltejs/adapter-auto` (ungenutzt) entfernt                                                                                                                                                                                           |
| Kommentar                                 | `src/lib/index.ts`                                                                                                                  | `$lib` → `#lib` im Hinweistext                                                                                                                                                                                                          |

Nicht angefasst: die generierten `src/lib/models/*-models.ts` (`sv migrate` hatte sie umformatiert, das wurde zurückgesetzt; sie enthalten keine `$lib`-Imports).

Nicht betroffen: `$app/stores`, `$app/environment`, `$env`, `$service-worker`, `$app/paths`, Navigation, Cookies, CSRF, Params, Remote Functions, `ORIGIN` (wird nirgends gesetzt).

### Paketversionen

| Paket                          | vorher  | nachher                                      |
| ------------------------------ | ------- | -------------------------------------------- |
| `@sveltejs/kit`                | 2.70.4  | **3.4.0**                                    |
| `@sveltejs/adapter-node`       | 5.5.8   | **6.0.5**                                    |
| `@sveltejs/adapter-auto`       | 7.0.1   | entfernt                                     |
| `@sveltejs/vite-plugin-svelte` | 7.3.1   | 7.3.1 (unverändert, schon Kit-3-kompatibel)  |
| `svelte`                       | 5.57.3  | 5.57.3 (erfüllt ≥ 5.57.1)                    |
| `svelte-check`                 | 4.7.8   | 4.7.8 (enthält Kit-3-Fix aus 4.7.6)          |
| `eslint-plugin-svelte`         | 3.24.1  | 3.24.1 (enthält Kit-3-Erkennung aus 3.23.1)  |
| `prettier-plugin-svelte`       | 3.5.2   | 3.5.2 (4.x nicht nötig, siehe offene Punkte) |
| `eslint` (Lockfile)            | 10.14.0 | 10.15.0 (via `npm audit fix`)                |
| `typescript-eslint` (Lockfile) | 8.72.2  | 8.74.0 (via `npm audit fix`)                 |

### npm audit

**Vorher:** 13 Funde (1 high, 9 moderate, 3 low)

- `@sveltejs/kit` ≤ 3.1.0, **high**: GHSA-pfhg-q3qv-9q6r (Open Redirect über enhanced Forms), GHSA-27mw-82g8-phjj (XSS über Cache-Control in prerenderten Seiten), GHSA-3r8g-jcqq-3p5j (DoS beim Parsen von Remote-`form`-Daten), GHSA-6cf5-gc4q-fm3x (Kollision privater `query.batch`-Funktionen). Dazu abhängig: `adapter-node` 5.x, `adapter-auto` 7.x.
- `cookie` < 0.7.0, low: GHSA-pxg6-pf52-xh8x (Zeichen außerhalb des erlaubten Bereichs in Name/Pfad/Domain).
- `minimatch` 7.0.0–11.0.0, moderate: GHSA-g3hv-75wg-m249 (DoS über „globparts amplification“), über `eslint`, `@eslint/config-array` und die `@typescript-eslint/*`-Pakete.

**Nach dem Kit-Upgrade:** 9 moderate, alle `minimatch` (Kit-, Adapter- und `cookie`-Funde sind weg; Kit 3 nutzt `cookie` 2.0.2).

**Nach `npm audit fix`** (ohne `--force`, nur Lockfile): **0 Funde**. `minimatch` ist jetzt 11.0.9.

Die `minimatch`-Kette betrifft nur Dev-Tools (ESLint), nicht den ausgelieferten Build.

### Verifikation

- `npm run check`: 0 Fehler, 2 bekannte Warnungen in `src/lib/components/ui/pk-dex-card.svelte`.
- `npm test`: 325/325 grün (mit `/.testdata` verlinkt; ohne den Ordner 318 grün + 3 übersprungen, wie vorher).
- `npx eslint .`: 68 Probleme vorher, 68 nachher, keine neuen.
- `prettier --check .`: nur die 7 generierten Model-Dateien (wie vorher).
- `npm run build`: ok.
- `build/` in einen leeren Ordner außerhalb des Repos kopiert, `PORT=3123 node build/index.js` ohne `node_modules`: `/` → 200 HTML, JS-Asset → 200, unbekannter Pfad → 404 (ohne Log-Eintrag), `POST` auf Asset → 405.
- Browser (Build und `vite dev`): Box-Ansicht lädt ohne Konsolenfehler; Feld „Original Trainer“ bei Bulbasaur geändert, nach Reload noch da (danach zurückgesetzt).

### Offene Punkte

- **Docker-Base-Image:** Erledigt. Das `Dockerfile` nutzt jetzt `node:26-alpine` (aktive LTS, Support bis 2029-04), und `deploy.sh` baut mit `docker compose build --pull`, damit der Server kein altes gecachtes Base-Image verwendet. Tests, Build und Server unter Node 26.13.1 geprüft.
- **Version-Polling:** `version.pollInterval` ist jetzt standardmäßig 1 Stunde. Offene Tabs fragen damit `/_app/version.json` beim eigenen Server ab (kein externer Dienst). Die App nutzt `updated` nicht. Wer das nicht will: `version: { pollInterval: 0 }` in `sveltekit({...})`. Nicht im Browser nachgemessen.
- **prettier-plugin-svelte 4:** Nicht von Kit 3 verlangt. 4.2.0 würde viele `.svelte`-Dateien umformatieren. Wenn gewünscht, als eigenen Commit mit `npm run format` machen.
- **adapter-node 6 und Deployment:** `deploy.sh` kopiert `build/` komplett per `rsync --delete`. Das passt zur neuen Regel, dass nur beim Build bekannte Dateien ausgeliefert werden. Nichts nachträglich in `build/client` legen oder dort ersetzen.
