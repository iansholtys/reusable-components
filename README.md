# reusable-components

Shared frontend UI pieces meant to be placed under a `components/reusable/` directory inside a host project.

## Dependencies

**jQuery** — Components in this repository expect a global `**$`** (and `jQuery`). Host applications should load jQuery once.

## CSS

From the repo root, after `npm install`:

Each **top-level component directory** `{name}` (every directory at the repo root except `node_modules`, `old-sass`, `scripts`, `demo` and dot-folders) keeps SCSS and compiled CSS under **`{name}/styles/`**.

- **Entry stylesheet:** `{name}/styles/{name}.scss` compiles to `{name}/styles/{name}.css` (with source maps).
- **Theme / token sheets:** every **`*-variables.scss`** in `{name}/styles/` (use a **partial** name like **`_table-variables.scss`** so Sass does not treat it as a second entry next to `{name}.scss` during `--watch`) compiles to **`demo/<basename>.css`** (leading `_` stripped; no source maps). Host projects can copy/customize/compile those variable files themselves or supply equivalent custom properties another way.

- `npm run build:css` — One-off compile; each run rescans the tree.
- `npm run watch:css` — Watches files discovered during startup. **Restart** after adding **new** `*.scss` files so watcher path lists stay correct.
