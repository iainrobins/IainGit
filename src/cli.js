#!/usr/bin/env node
// Generate a track and print its parts list and build steps.
//   node src/cli.js --seed 3 --width 6 --depth 6 --max-height 6 --pieces 3-6 --include T-17 [--json]

import { generate, DEFAULTS } from './generate.js';
import { asText } from './instructions.js';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const o = {};
if (opt('--seed')) o.seed = Number(opt('--seed'));
if (opt('--width')) o.width = Number(opt('--width'));
if (opt('--depth')) o.depth = Number(opt('--depth'));
if (opt('--max-height')) o.maxHeight = Number(opt('--max-height'));
if (opt('--max-towers')) o.maxTowers = Number(opt('--max-towers'));
if (opt('--pieces')) { const [a, b] = opt('--pieces').split('-').map(Number); o.minPieces = a; o.maxPieces = b ?? a; }
if (opt('--include')) o.include = opt('--include').split(',');
if (opt('--exclude')) o.exclude = opt('--exclude').split(',');

const res = generate(o);
if (!res.ok) { console.error(res.reason); process.exit(1); }
if (args.includes('--json')) console.log(JSON.stringify(res.design, null, 2));
else {
  const s = { ...DEFAULTS, ...o };
  console.log(`Seed ${s.seed} · ${s.width}×${s.depth} board · up to ${s.maxHeight} blocks tall · ${res.design.tracks.length} track pieces · test run passed\n`);
  console.log(asText(res.design));
}
