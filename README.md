# reusable-components

Shared frontend UI pieces meant to be placed under a `components/reusable/` directory inside a host project.

## Dependencies

**jQuery** — Components in this repository expect a global `$` (and `jQuery`). Host applications should load jQuery once.

## Installation

1. Create (if needed) and navigate to a project's `components/reusable` directory and run `git clone (repo) .`
2. Run `npm install`
3. Run `npm run build:css` for a one-time SASS compilation or `npm run watch:css` for a SASS watcher.
4. In your application, add stylesheet and JS links for each components you want. Relative to the repo root, those are at `{name}/styles/{name}.css` and `{name}/{name}.js` respectively.
5. To customize component styling, copy-paste the relevant `demo/styles/*-vars.css` files into the place you store custom CSS, add stylesheet links, and modify the values as needed. Alternately, if you use Sass, copy the relevant `{name}/styles/_{name}-vars.scss` files into the place monitoring for SASS/SCSS. Modify the duplicated `*-vars.scss` files, verify they compiled as expected, and add stylesheet links to them.

## CSS

Each **top-level component directory** `{name}` (every directory at the repo root except `node_modules`, `old-sass`, `scripts`, `demo` and dot-folders) keeps SCSS and compiled CSS under **`{name}/styles/`**.

- **Entry stylesheet:** `{name}/styles/{name}.scss` compiles to `{name}/styles/{name}.css` (with source maps).
- **Theme / token sheets:** every **`*-vars.scss`** in `{name}/styles/` (use a **partial** name like **`_table-vars.scss`** so Sass does not treat it as a second entry next to `{name}.scss` during `--watch`) compiles to **`demo/styles/<basename>.css`** (leading `_` stripped; no source maps). Host projects can copy/customize/compile those variable files themselves or supply equivalent custom properties another way.

- `npm run build:css` — One-off compile; each run rescans the tree.
- `npm run watch:css` — Watches files discovered during startup. **Restart** after adding **new** `*.scss` files so watcher path lists stay correct.
