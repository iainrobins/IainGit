// Turn a design into build steps, bottom up: base, then towers level by level, then track
// from the top down, then scoops, then the test run. One small step at a time.

import { pieces as PIECES, blocks as BLOCKS } from './inventory.js';
import { squareName, partsList, simulate } from './simulate.js';
import { openSides } from './model.js';

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

export function instructions(design) {
  const steps = [];
  const parts = partsList(design);
  const run = simulate(design);

  steps.push({
    title: 'Lay the base',
    text: `Clip base plates together to cover ${design.width} squares across by ${design.depth} deep. Rows are lettered A–${String.fromCharCode(64 + design.depth)} from the back, columns numbered 1–${design.width} from the left.`,
  });

  const top = Math.max(...design.towers.map((t) => t.blocks.length));
  for (let l = 0; l < top; l++) {
    const here = design.towers.filter((t) => t.blocks.length > l)
      .map((t) => `${squareName(t.x, t.y)}: ${blockHow(t.blocks[l])}`);
    steps.push({ title: `Towers, level ${l + 1}`, items: here });
  }

  for (const t of design.towers.filter((tw) => tw.top)) {
    steps.push({ title: 'Start funnel', text: `Put the start funnel (${t.top}) on top of the tower at ${squareName(t.x, t.y)}.` });
  }

  const byHeight = [...design.tracks].sort((a, b) => b.from.level - a.from.level);
  for (const tr of byHeight) {
    steps.push({
      title: `Track: ${names[tr.code]} (${tr.code})`,
      text: `Clip it into the ${SIDE[tr.from.side]} side of ${squareName(tr.from.x, tr.from.y)} at level ${tr.from.level + 1}.`,
    });
  }

  for (const a of design.accessories) {
    steps.push({ title: `Scoop (${a.code})`, text: `Clip a scoop to the ${SIDE[a.at.side]} side of ${squareName(a.at.x, a.at.y)} at level ${a.at.level + 1}, so a fast marble can't overshoot the drop.` });
  }

  steps.push({
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
