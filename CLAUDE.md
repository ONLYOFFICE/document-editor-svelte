# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A publishable npm library (`@onlyoffice/document-editor-svelte`) exposing a single Svelte
component that mounts the ONLYOFFICE Document Server editor. It is **not** an application:
there is no dev server and no `npm run dev` at the repo root. The only way to see the
component actually running is the `e2e/` app.

## Commands

Root (the library):

```
npm run check          # svelte-check against tsconfig.json — the type gate
npm run lint           # eslint (also enforces formatting: 4 spaces, double quotes, max-len 100)
npm run lint:fix
npm run build          # svelte-package → dist/
npm pack               # runs prepack: svelte-package + publint on the published file set
npm run test:e2e       # npm ci in e2e/ + full e2e run
```

End-to-end tests (`e2e/` is a separate nested npm project with its own lockfile and toolchain):

```
npm --prefix e2e exec playwright install chromium   # once
npm run test:e2e                                    # from the repo root
E2E_LIB_VERSION=0.1.0 npm run test:e2e              # test a published npm version instead of local sources
```

Single test / iterating on tests — run from inside `e2e/`:

```
npx playwright test tests/document-editor.e2e.spec.ts -g "reports error code -2"
npx playwright test --headed --debug
```

`e2e/scripts/setup.mjs` runs before Playwright: it builds and `npm pack`s the library, then
installs the tarball into `e2e/node_modules`. So the e2e suite always exercises the *published
artifact*, not `src/`. Skipping setup (`npx playwright test` alone) reuses whatever tarball was
installed last — after changing `src/`, run `node scripts/setup.mjs` or `npm run test` in `e2e/`.

## Architecture

`src/lib/` is the whole library; `src/lib/index.ts` is the only public surface.

**Editor lifecycle.** Document Server is a third-party global script, not a module. The
component therefore juggles three pieces of global state, and most of the code exists to keep
them consistent:

- `window.DocsAPI` — the API object the loaded `api.js` defines.
- `window.DocEditor.instances[id]` — the registry of live editors, keyed by the `id` prop.
  The component owns the entry for its own `id` and must null it out on destroy, otherwise a
  remount is silently skipped ("Instance already exists").
- The `<script id="onlyoffice-api-script">` tag — one per page, shared by every mounted editor.
  `utils/loadScript.ts` deduplicates via a `loading` attribute and a 500 ms polling interval,
  because concurrent mounts can race on the same tag.

**Reload semantics.** `documentServerUrl` and `config` are the "important props": a change
destroys the editor and creates a new one. The comparison is `JSON.stringify([documentServerUrl,
config])`, which deliberately drops `config.events` — swapping a callback identity (common when
a parent re-renders) must not reload the editor. Anything relying on that snapshot must stay
JSON-serializable.

**Async teardown.** Loading `api.js` cannot be cancelled, so the promise can settle after the
component is gone. The `destroyed` flag guards `onLoad` and `onError` — nothing may be created
or reported past unmount.

**`utils/cloneDeep.ts`** exists instead of `structuredClone` because the config carries event
callbacks and `structuredClone` throws on functions. Functions are copied by reference; plain
objects, arrays and `Date`s are cloned. The clone protects the consumer's object from mutation
by the editor.

Errors are numeric and part of the public contract (`onLoadComponentError`): `-1` unknown,
`-2` failed to load DocsAPI from `documentServerUrl`, `-3` DocsAPI undefined. Keep them stable.

## Constraints when editing

- **Svelte 4 *and* 5 must both work.** The component uses the Svelte 4 API on purpose —
  `export let`, `$:`, `onMount`/`onDestroy`. Do not introduce runes (`$props`, `$state`,
  `$effect`); they would drop Svelte 4 consumers named in `peerDependencies`.
- `svelte.config.js` sets `vitePreprocess({ script: true })` — required, since `svelte-package`
  has no Vite to transpile the TypeScript out of the component for publishing.
- `@onlyoffice/doceditor-types` is a peer dependency; `Config` and `DocEditor` types come from
  there, and the `Window` augmentation lives in `src/lib/types.ts`.
- Public prop or error-code changes need matching updates in the README's API table and in
  `e2e/src/App.svelte`.
- `dist/` and `.svelte-kit/` are build output — gitignored, never edit.

## Release flow

Version lives in `package.json`; the release notes' *first* `## <version>` heading in
`CHANGELOG.md` is what CI greps for the tag name. Pushing to `master` auto-creates `v<version>`
(`create-tag.yml`), and the tag triggers `release.yml` → `npm publish --provenance` plus a
GitHub release whose body is the top CHANGELOG section. So a release is prepared by bumping
`package.json` and adding a CHANGELOG section, in the same merge to `master`.
