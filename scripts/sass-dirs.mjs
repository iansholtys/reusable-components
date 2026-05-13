import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const skip = new Set(['node_modules', 'old-sass', '.git', 'scripts', 'demo']);

/**
 * Each top-level component `{name}` uses `{name}/styles/` for Sass and CSS.
 * Entry sheet: `{name}/styles/{name}.scss` → `{name}/styles/{name}.css`.
 */
export function getSassDirectoryPairs(repoRoot) {
  const pairs = [];

  for (const name of readdirSync(repoRoot)) {
    if (skip.has(name) || name.startsWith('.')) continue;
    const dirPath = join(repoRoot, name);
    if (!statSync(dirPath).isDirectory()) continue;

    const stylesDir = join(dirPath, 'styles');
    const primaryScss = join(stylesDir, `${name}.scss`);
    if (existsSync(primaryScss)) {
      pairs.push(`${name}/styles/${name}.scss:${name}/styles/${name}.css`);
    }
  }

  return pairs;
}

/**
 * Each `*-variables.scss` (or partial `_*-variables.scss`) in `{name}/styles/`
 * → `demo/styles/<basename>.css` (leading `_` stripped from the basename).
 *
 * Variables sheets are partials so the main `{name}.scss` `--watch` graph does
 * not treat them as extra entry points next to `{name}.scss` in the same folder.
 */
export function getDemoVariablesSassPairs(repoRoot) {
  const pairs = [];

  for (const name of readdirSync(repoRoot)) {
    if (skip.has(name) || name.startsWith('.')) continue;
    const dirPath = join(repoRoot, name);
    if (!statSync(dirPath).isDirectory()) continue;

    const stylesDir = join(dirPath, 'styles');
    if (!existsSync(stylesDir) || !statSync(stylesDir).isDirectory()) continue;

    for (const f of readdirSync(stylesDir)) {
      if (!f.endsWith('-variables.scss')) continue;
      const outBase = f.replace(/\.scss$/i, '').replace(/^_/, '');
      const outName = `${outBase}.css`;
      pairs.push(`${name}/styles/${f}:demo/styles/${outName}`);
    }
  }

  return pairs;
}

/**
 * `demo/styles/demo.scss` → `demo/styles/demo.css` (compiled next to the entry).
 */
export function getDemoEntrySassPairs(repoRoot) {
  const demoScss = join(repoRoot, 'demo', 'styles', 'demo.scss');
  if (!existsSync(demoScss)) return [];
  return ['demo/styles/demo.scss:demo/styles/demo.css'];
}

export function getAllDemoSassPairs(repoRoot) {
  return [...getDemoVariablesSassPairs(repoRoot), ...getDemoEntrySassPairs(repoRoot)];
}

export const repoRoot = join(__dirname, '..');
