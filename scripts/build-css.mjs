import { execSync } from 'child_process';
import { getAllDemoSassPairs, getSassDirectoryPairs, repoRoot } from './sass-dirs.mjs';

const mainPairs = getSassDirectoryPairs(repoRoot);
const demoPairs = getAllDemoSassPairs(repoRoot);

if (mainPairs.length === 0 && demoPairs.length === 0) {
  console.warn(
    'No `{name}/styles/{name}.scss`, `*-vars.scss`, or `demo/styles/demo.scss` found; nothing to compile.'
  );
  process.exit(0);
}

if (mainPairs.length > 0) {
  execSync(`npx sass ${mainPairs.join(' ')}`, { cwd: repoRoot, stdio: 'inherit', shell: true });
}
if (demoPairs.length > 0) {
  execSync(`npx sass --no-source-map ${demoPairs.join(' ')}`, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true
  });
}
