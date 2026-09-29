// Test run: follow a marble through a design and check it can really be built.
//
// A design:
//   { width, depth,
//     towers: [{ x, y, blocks: [{ t, r }, ...bottom to top], top: 'M-03' | null }],
//     tracks: [{ code, from: { x, y, level, side }, variant }],
//     accessories: [{ code: 'T-14', at: { x, y, level, side } }] }
// The marble starts in the start funnel (M-03) and must come to rest in an orange end block.
// This checks the design independently of how it was made, so the generator can't mark
// its own homework.

import { route, openSides, variants, place, towerCells, trackCells, clashes, cellKey, DX, DY } from './model.js';
import { pieces as PIECES, blocks as BLOCKS } from './inventory.js';

export const ROWS = 'ABCDEFGHIJKLMNOP';
export const squareName = (x, y) => `${ROWS[y]}${x + 1}`;
const SIDE = ['north', 'east', 'south', 'west'];
export const COLOR_CODE = { blue: 'B-01', orange: 'B-02', white: 'B-03', clear: 'B-04', red: 'B-05' };
export const FUNNEL_HEIGHT = 2; // M-03, measured by Iain

const pieceByCode = Object.fromEntries(PIECES.map((p) => [p.code, p]));
const portKey = (p) => `${p.x},${p.y},${p.level},${p.side}`;

// Cells a tower fills, including a start funnel on top.
export function towerSpace(t) {
  return towerCells(t.x, t.y, t.blocks.length + (t.top === 'M-03' ? FUNNEL_HEIGHT : 0));
}

// Cells an accessory clipped to a block side fills: the square beside it, at that level.
export function accessorySpace(a) {
  return [cellKey(a.at.x + DX[a.at.side], a.at.y + DY[a.at.side], a.at.level)];
}

// Count every part the design uses, by code.
export function partsList(design) {
  const n = {};
  const add = (code, k = 1) => (n[code] = (n[code] || 0) + k);
  for (const t of design.towers) {
    for (const b of t.blocks) add(COLOR_CODE[b.t]);
    if (t.top) add(t.top);
  }
  for (const tr of design.tracks) add(tr.code);
  for (const a of design.accessories || []) add(a.code);
  return n;
}

export function simulate(design, { maxHeight = Infinity } = {}) {
  const problems = [];
  const path = [];
  const towerAt = new Map(design.towers.map((t) => [`${t.x},${t.y}`, t]));
  const trackFrom = new Map();
  for (const tr of design.tracks) {
    const k = portKey(tr.from);
    if (trackFrom.has(k)) problems.push(`Two pieces clip into the same side at ${squareName(tr.from.x, tr.from.y)}.`);
    trackFrom.set(k, tr);
  }

  // ---- the board
  for (const t of design.towers) {
    const nm = squareName(t.x, t.y);
    if (t.x < 0 || t.y < 0 || t.x >= design.width || t.y >= design.depth) problems.push(`The tower at ${nm} is off the board.`);
    const h = t.blocks.length + (t.top === 'M-03' ? FUNNEL_HEIGHT : 0);
    if (h > maxHeight) problems.push(`The tower at ${nm} is ${h} blocks tall, over the ${maxHeight}-block limit.`);
  }

  // ---- the run
  const starts = design.towers.filter((t) => t.top === 'M-03');
  if (starts.length !== 1) problems.push(`There should be exactly one start funnel; found ${starts.length}.`);
  let finish = null;
  const usedTracks = new Set();
  if (starts.length) {
    const s = starts[0];
    let m = { x: s.x, y: s.y, level: s.blocks.length - 1, from: 'top' };
    const seen = new Set();
    for (let step = 0; step < 1000; step++) {
      const nm = squareName(m.x, m.y);
      const key = `${m.x},${m.y},${m.level},${m.from}`;
      if (seen.has(key)) { problems.push(`The marble goes round in a loop at ${nm}.`); break; }
      seen.add(key);
      const t = towerAt.get(`${m.x},${m.y}`);
      if (!t) { problems.push(`Nothing catches the marble at ${nm}.`); break; }
      if (m.level < 0) { problems.push(`The marble drops out of the bottom of ${nm}.`); break; }
      if (m.level >= t.blocks.length) { problems.push(`The marble reaches ${nm} at level ${m.level + 1}, but the tower is only ${t.blocks.length} high.`); break; }
      const b = t.blocks[m.level];
      if (m.from === 'top' && (b.t === 'blue' || b.t === 'red')) {
        problems.push(`The marble drops into a ${b.t} block at ${nm}; we don't know which way that sends it. Use an orange block there.`);
        break;
      }
      const r = route(b, m.from);
      path.push({ at: nm, level: m.level, block: b.t, from: m.from });
      if (r.blocked) { problems.push(`The ${b.t} block at ${nm}, level ${m.level + 1}, is closed on the side the marble comes in. Turn it.`); break; }
      if (r.stop) {
        if (b.t === 'orange') finish = { at: nm, level: m.level };
        else problems.push(`The marble stops at ${nm}.`);
        break;
      }
      if (r.down) { m = { x: m.x, y: m.y, level: m.level - 1, from: 'top' }; continue; }
      const out = { x: m.x, y: m.y, level: m.level, side: r.exit };
      const tr = trackFrom.get(portKey(out));
      if (!tr) { problems.push(`The marble rolls out of the ${SIDE[r.exit]} side of ${nm}, level ${m.level + 1}, with no track to catch it.`); break; }
      const def = pieceByCode[tr.code];
      const vs = def && def.kind === 'track' && !def.unverified ? variants(def) : [];
      const v = vs[tr.variant];
      if (!v) { problems.push(`${tr.code} can't be used that way round.`); break; }
      usedTracks.add(tr);
      const to = place(v, out).to;
      path.push({ piece: tr.code, from: nm });
      m = { x: to.x, y: to.y, level: to.level, from: to.side };
    }
  }
  for (const tr of design.tracks) if (!usedTracks.has(tr)) problems.push(`The ${tr.code} at ${squareName(tr.from.x, tr.from.y)} never gets a marble.`);

  // ---- space: nothing may pass through anything else
  const lists = design.towers.map(towerSpace);
  for (const tr of design.tracks) {
    const def = pieceByCode[tr.code];
    const v = def && def.kind === 'track' && !def.unverified ? variants(def)[tr.variant] : null;
    if (v) lists.push(trackCells(tr.from, place(v, tr.from)));
  }
  for (const a of design.accessories || []) lists.push(accessorySpace(a));
  const hit = clashes(...lists);
  if (hit.length) problems.push(`Pieces run into each other at ${hit.map((k) => { const [x, y, l] = k.split(',').map(Number); return `${squareName(x, y)} level ${l + 1}`; }).join(', ')}.`);

  // ---- accessories sit on an open, unused side
  for (const a of design.accessories || []) {
    const t = towerAt.get(`${a.at.x},${a.at.y}`);
    const b = t && t.blocks[a.at.level];
    if (!b || !openSides(b).includes(a.at.side) || trackFrom.has(portKey(a.at)))
      problems.push(`The ${a.code} at ${squareName(a.at.x, a.at.y)} has no open side to clip onto.`);
  }

  // ---- pieces we own
  const own = Object.fromEntries([...PIECES, ...BLOCKS].map((p) => [p.code, p.own ?? owned(p)]));
  for (const [code, n] of Object.entries(partsList(design))) {
    if ((own[code] ?? 0) < n) problems.push(`Needs ${n} × ${code}, but we only have ${own[code] ?? 0}.`);
  }

  if (!finish && !problems.length) problems.push('The marble never comes to rest in an orange end block.');
  return { ok: problems.length === 0, problems, path, finish };
}

function owned(b) {
  return Object.values(b.sets).reduce((a, n) => a + (n ?? 0), 0);
}
