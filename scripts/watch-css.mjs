/**
 * Watches Sass for each discovered component directory (see sass-dirs.mjs).
 *
 * Limitation: pairs are computed once at startup. Dart Sass only
 * watches those paths, so a new top-level component directory added while this
 * process runs will not compile until you restart watch:css.
 */
import { spawn } from 'child_process';
import { getAllDemoSassPairs, getSassDirectoryPairs, repoRoot } from './sass-dirs.mjs';

const mainPairs = getSassDirectoryPairs(repoRoot);
const demoPairs = getAllDemoSassPairs(repoRoot);

if (mainPairs.length === 0 && demoPairs.length === 0) {
  console.warn(
    'No `{name}/styles/{name}.scss`, `*-variables.scss`, or `demo/styles/demo.scss` found; nothing to watch.'
  );
  process.exit(0);
}

const children = [];

if (mainPairs.length > 0) {
  children.push(
    spawn('npx', ['sass', '--watch', ...mainPairs], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: true
    })
  );
}
if (demoPairs.length > 0) {
  children.push(
    spawn('npx', ['sass', '--watch', '--no-source-map', ...demoPairs], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: true
    })
  );
}

function shutdown() {
  for (const c of children) {
    c.kill('SIGINT');
  }
}

process.on('SIGINT', shutdown);

let remaining = children.length;
let exitCode = 0;
for (const c of children) {
  c.on('exit', (code) => {
    remaining -= 1;
    if (code != null && code !== 0) {
      exitCode = code;
      shutdown();
    }
    if (remaining === 0) {
      process.exit(exitCode);
    }
  });
}
