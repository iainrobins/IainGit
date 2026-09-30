// Build the web page: bundle the src/ modules into one inline script, embed the piece
// pictures, and write dist/marble-rush.html. The page runs exactly the same generator and
// test run as the command line.
//   node scripts/build-page.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODULES = ['model', 'inventory', 'simulate', 'generate', 'instructions']; // dependency order

// Each module becomes a function scope; imports read from, and exports write to, a registry.
function wrap(name) {
  let src = readFileSync(join(root, 'src', `${name}.js`), 'utf8');
  const exported = [];
  src = src.replace(/^import \{([^}]+)\} from '\.\/(\w+)\.js';$/gm, (_, names, from) =>
    `const {${names.replace(/(\w+) as (\w+)/g, '$1: $2')}} = __m.${from};`);
  src = src.replace(/^export (const|let|function) (\w+)/gm, (_, kind, id) => { exported.push(id); return `${kind} ${id}`; });
  if (/^\s*(import|export) /m.test(src)) throw new Error(`${name}.js has an import or export the bundler can't handle`);
  return `__m.${name} = (() => {\n${src}\nreturn { ${exported.join(', ')} };\n})();`;
}

const bundle = `const __m = {};\n${MODULES.map(wrap).join('\n')}`;
const imgDir = join(root, 'web', 'img');
const images = Object.fromEntries(readdirSync(imgDir).filter((f) => f.endsWith('.png'))
  .map((f) => [f.replace('.png', ''), `data:image/png;base64,${readFileSync(join(imgDir, f)).toString('base64')}`]));

const page = readFileSync(join(root, 'web', 'page.html'), 'utf8')
  .replace('/*__BUNDLE__*/', () => bundle.replace(/<\/script/g, '<\\/script'))
  .replace('"__IMAGES__"', () => JSON.stringify(images));
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'marble-rush.html'), page);
console.log(`dist/marble-rush.html: ${(page.length / 1024).toFixed(0)} KB`);
