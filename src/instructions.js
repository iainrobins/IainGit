// Turn a design into build steps, bottom up: base, then towers level by level, then track
// from the top down, then scoops, then the test run. One small step at a time.

import { pieces as PIECES, blocks as BLOCKS } from './inventory.js';
import { squareName, partsList, simulate } from './simulate.js';
import { openSides, variants, place } from './model.js';

const SIDE = ['north', 'east', 'south', 'west'];
const names = Object.fromEntries([...PIECES, ...BLOCKS].map((p) => [p.code, p.name]));
const BLOCK_NAME = { blue: 'blue', red: 'red', orange: 'orange', white: 'white', clear: 'clear' };

function blockHow(b) {
  const open = openSides(b).map((s) => SIDE[s]);
  if (b.filler) return `${BLOCK_NAME[b.t]} (support, any way round)`;
  if (b.t === 'orange') return `orange, open side facing ${open[0]}`;
  if (b.t === 'red') return `red, turning between ${open[0]} and ${open[1]}`;
  return `${BLOCK_NAME[b.t]}, open ${open.sort().join(' and ')}`;
}

function trackText(tr) {
  const def = PIECES.find((p) => p.code === tr.code);
  const to = place(variants(def)[tr.variant], tr.from).to;
  const a = `the ${SIDE[tr.from.side]} side of ${squareName(tr.from.x, tr.from.y)} at level ${tr.from.level + 1}`;
  const b = to.x === tr.from.x && to.y === tr.from.y
    ? `back into the ${SIDE[to.side]} side of the same tower at level ${to.level + 1}`
    : `the ${SIDE[to.side]} side of ${squareName(to.x, to.y)} at level ${to.level + 1}`;
  return `Clip one end into ${a}, and the other end into ${b}.`;
}

export function instructions(design) {
  const steps = [];
  const parts = partsList(design);
  const run = simulate(design);

  // `adds` says what each step puts on the board, so pictures can highlight it.
  steps.push({
    adds: { base: true },
    title: 'Lay the base',
    text: `Clip base plates together to cover ${design.width} squares across by ${design.depth} deep. Rows are lettered A–${String.fromCharCode(64 + design.depth)} from the back, columns numbered 1–${design.width} from the left.`,
  });

  const top = Math.max(...design.towers.map((t) => t.blocks.length));
  for (let l = 0; l < top; l++) {
    const towers = design.towers.filter((t) => t.blocks.length > l);
    const here = towers.map((t) => `${squareName(t.x, t.y)}: ${blockHow(t.blocks[l])}`);
    steps.push({ adds: { blocks: towers.map((t) => [t.x, t.y, l]) }, title: `Towers, level ${l + 1}`, items: here });
  }

  for (const t of design.towers.filter((tw) => tw.top)) {
    steps.push({ adds: { funnel: [t.x, t.y] }, title: 'Start funnel', text: `Put the start funnel (${t.top}) on top of the tower at ${squareName(t.x, t.y)}.` });
  }

  const byHeight = design.tracks.map((tr, i) => ({ tr, i })).sort((a, b) => b.tr.from.level - a.tr.from.level);
  for (const { tr, i } of byHeight) {
    steps.push({
      adds: { track: i },
      title: `Track: ${names[tr.code]} (${tr.code})`,
      text: trackText(tr),
    });
  }

  design.accessories.forEach((a, i) => {
    steps.push({ adds: { accessory: i }, title: `Scoop (${a.code})`, text: `Clip a scoop to the ${SIDE[a.at.side]} side of ${squareName(a.at.x, a.at.y)} at level ${a.at.level + 1}, so a fast marble can't overshoot the drop.` });
  });

  steps.push({
    adds: {},
    title: 'Test run',
    text: run.ok ? `Drop a marble in the funnel. It should finish in the orange block at ${run.finish.at}.` : `This design fails its test run: ${run.problems.join(' ')}`,
  });

  return { parts, steps, run };
}

export function asText(design) {
  const { parts, steps } = instructions(design);
  const lines = ['PARTS'];
  for (const [code, n] of Object.entries(parts).sort()) lines.push(`  ${String(n).padStart(2)} × ${code}  ${names[code] ?? ''}`);
  lines.push('', 'STEPS');
  steps.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.title}`);
    if (s.text) lines.push(`   ${s.text}`);
    for (const it of s.items || []) lines.push(`   - ${it}`);
  });
  return lines.join('\n');
}
