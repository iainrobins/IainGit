// Track generator: search for a design that uses only pieces we own and passes the test run.
//
// It grows the run forwards from the start funnel. At each block it picks how the marble
// is routed, then which track piece carries it to the next tower, backtracking when
// something doesn't fit. Towers can be reused at different levels, so one tower can carry
// the marble several times. Fillers (blocks under the ones that route the marble) are
// coloured at the end from whatever is left over.

import { variants, place, openSides, trackCells, cellKey, towerCells, DX, DY } from './model.js';
import { pieces as PIECES, blocks as BLOCKS } from './inventory.js';
import { simulate, FUNNEL_HEIGHT, COLOR_CODE, accessorySpace } from './simulate.js';

export const DEFAULTS = {
  width: 6,          // board squares, east–west
  depth: 6,          // board squares, north–south
  maxHeight: 6,      // tallest tower in blocks, start funnel included
  minPieces: 3,      // track pieces in the run
  maxPieces: 6,
  maxTowers: 6,
  overhang: false,   // allow track to hang past the edge of the base plates
  include: [],       // part codes the run must use, e.g. ['T-17']
  exclude: [],       // part codes to leave out
  seed: 1,
  attempts: 400,
  nodesPerAttempt: 4000,
};

// Seeded random numbers, so a seed always gives the same design.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = (arr, rand) => {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
};

const blockOwn = Object.fromEntries(BLOCKS.map((b) => [b.t ?? b.color, Object.values(b.sets).reduce((a, n) => a + (n ?? 0), 0)]));
const TOTAL_BLOCKS = Object.values(blockOwn).reduce((a, n) => a + n, 0);

// Track pieces the generator may use: measured, checked, and (for drop pieces) known handedness.
export function usableTrack(opts = {}) {
  const exclude = new Set(opts.exclude || []);
  return PIECES.filter((p) => p.kind === 'track' && !p.unverified && !p.guess && !p.handedUnknown && !exclude.has(p.code))
    .flatMap((p) => variants(p).map((v, i) => ({ code: p.code, own: p.own, v, i })));
}

export function generate(options = {}) {
  const o = { ...DEFAULTS, ...options };
  const rand = rng(o.seed);
  const moves = usableTrack(o);
  const missing = o.include.filter((c) => !moves.some((m) => m.code === c));
  if (missing.length) return { ok: false, reason: `Can't use ${missing.join(', ')} yet: not measured or not confirmed.` };
  const funnelOwn = PIECES.find((p) => p.code === 'M-03').own;
  if (funnelOwn < 1) return { ok: false, reason: 'No start funnel.' };

  for (let attempt = 0; attempt < o.attempts; attempt++) {
    const d = attemptOnce(o, rand, moves);
    if (!d) continue;
    const check = simulate(d, { maxHeight: o.maxHeight });
    if (check.ok) return { ok: true, design: d, check, attempt };
  }
  return { ok: false, reason: 'No design found. Try a bigger board, taller towers, or fewer must-use pieces.' };
}

function attemptOnce(o, rand, moves) {
  const blockLimit = o.maxHeight; // blocks in a tower; the funnel tower gets FUNNEL_HEIGHT less
  const towers = new Map();       // "x,y" -> { x, y, levels: [ {t, r} | null ] }
  const tracks = [];
  const used = {};                // part code -> count
  const colorUse = {};            // routing blocks by colour
  const trackSpace = new Map();   // cell -> track index
  const ports = new Set();
  let nodes = 0;

  const key = (x, y) => `${x},${y}`;
  const inBoard = (x, y) => x >= 0 && y >= 0 && x < o.width && y < o.depth;
  const blocksUsed = () => [...towers.values()].reduce((a, t) => a + t.levels.length, 0);

  // Grow (or create) a tower to `h` blocks. Returns an undo function, or null if it can't.
  function grow(x, y, h, cap = blockLimit) {
    if (!inBoard(x, y) || h > cap) return null;
    let t = towers.get(key(x, y));
    const created = !t;
    if (created) {
      if (towers.size >= o.maxTowers) return null;
      t = { x, y, levels: [] };
    }
    const old = t.levels.length;
    if (h <= old) return () => {};
    if (blocksUsed() + (h - old) > TOTAL_BLOCKS) return null;
    for (let l = old; l < h; l++) if (trackSpace.has(cellKey(x, y, l))) return null;
    if (t.funnel && h > old) return null; // can't build under a funnel once it's placed
    if (created) towers.set(key(x, y), t);
    for (let l = old; l < h; l++) t.levels.push(null);
    return () => { t.levels.length = old; if (created) towers.delete(key(x, y)); };
  }

  // Ways a block can route a marble that arrives from `from`.
  function blockChoices(level, from) {
    const c = [];
    if (from === 'top') {
      for (let r = 0; r < 4; r++) c.push({ t: 'orange', r, exit: r });
      if (level > 0) for (const t of ['white', 'clear']) c.push({ t, r: 0, down: true }, { t, r: 1, down: true });
    } else {
      c.push({ t: 'blue', r: from % 2, exit: (from + 2) % 4 });
      for (const r of [from, (from + 3) % 4]) { // red open on r and r+1
        c.push({ t: 'red', r, exit: r === from ? (r + 1) % 4 : r });
      }
      if (level > 0) for (const t of ['white', 'clear']) c.push({ t, r: from % 2, down: true });
      c.push({ t: 'orange', r: from, stop: true });
    }
    return c.filter((b) => (colorUse[b.t] || 0) < blockOwn[b.t]);
  }

  const includesMet = () => o.include.every((c) => used[c] > 0);

  function go(m, n) {
    if (++nodes > o.nodesPerAttempt) return false;
    const t = towers.get(key(m.x, m.y));
    if (!t || m.level < 0 || m.level >= t.levels.length || t.levels[m.level]) return false;
    const choices = shuffle(blockChoices(m.level, m.from), rand);
    // Finishing early makes runs too short; prefer carrying on until the minimum is met.
    choices.sort((a, b) => (a.stop ? 1 : 0) - (b.stop ? 1 : 0));
    for (const b of choices) {
      if (b.stop && (n < o.minPieces || !includesMet())) continue;
      t.levels[m.level] = { t: b.t, r: b.r };
      colorUse[b.t] = (colorUse[b.t] || 0) + 1;
      let ok;
      if (b.stop) ok = true;
      else if (b.down) ok = go({ x: m.x, y: m.y, level: m.level - 1, from: 'top' }, n);
      else ok = n < o.maxPieces && leave({ x: m.x, y: m.y, level: m.level, side: b.exit }, n);
      if (ok) return true;
      colorUse[b.t]--;
      t.levels[m.level] = null;
    }
    return false;
  }

  function leave(port, n) {
    if (ports.has(`${port.x},${port.y},${port.level},${port.side}`)) return false;
    const want = o.include.filter((c) => !used[c]);
    const opts = shuffle(moves.filter((mv) => (used[mv.code] || 0) < mv.own), rand);
    opts.sort((a, b) => (want.includes(b.code) ? 1 : 0) - (want.includes(a.code) ? 1 : 0));
    for (const mv of opts) {
      const placed = place(mv.v, port);
      const to = placed.to;
      if (to.level < 0 || !inBoard(to.x, to.y)) continue;
      const toKey = `${to.x},${to.y},${to.level},${to.side}`;
      if (ports.has(toKey)) continue;
      if (!o.overhang && placed.covers.some(([x, y]) => !inBoard(x, y))) continue;
      const cells = trackCells(port, placed);
      if (cells.some((c) => trackSpace.has(c))) continue;
      if (cells.some((c) => { const [x, y, l] = c.split(',').map(Number); const tw = towers.get(key(x, y)); return tw && (l < tw.levels.length || (tw.funnel && l < tw.levels.length + FUNNEL_HEIGHT)); })) continue;
      const undoGrow = grow(to.x, to.y, to.level + 1);
      if (!undoGrow) continue;
      const i = tracks.length;
      tracks.push({ code: mv.code, from: { ...port }, variant: mv.i });
      used[mv.code] = (used[mv.code] || 0) + 1;
      cells.forEach((c) => trackSpace.set(c, i));
      ports.add(`${port.x},${port.y},${port.level},${port.side}`); ports.add(toKey);
      if (go({ x: to.x, y: to.y, level: to.level, from: to.side }, n + 1)) return true;
      ports.delete(`${port.x},${port.y},${port.level},${port.side}`); ports.delete(toKey);
      cells.forEach((c) => trackSpace.delete(c));
      used[mv.code]--;
      tracks.pop();
      undoGrow();
    }
    return false;
  }

  // Start: a tower with the funnel on top, somewhere on the board.
  const sx = Math.floor(rand() * o.width), sy = Math.floor(rand() * o.depth);
  const lo = Math.min(2, blockLimit - FUNNEL_HEIGHT);
  const h = lo + Math.floor(rand() * (blockLimit - FUNNEL_HEIGHT - lo + 1));
  if (h < 1 || !grow(sx, sy, h, blockLimit - FUNNEL_HEIGHT)) return null;
  towers.get(key(sx, sy)).funnel = true;
  if (!go({ x: sx, y: sy, level: h - 1, from: 'top' }, 0)) return null;

  return finish(o, towers, tracks, colorUse);
}

// Colour the filler blocks from what's left, and add overrun scoops where they help.
function finish(o, towers, tracks, colorUse) {
  const left = Object.fromEntries(Object.keys(blockOwn).map((c) => [c, blockOwn[c] - (colorUse[c] || 0)]));
  const fillOrder = ['blue', 'orange', 'white', 'clear', 'red'];
  const design = { width: o.width, depth: o.depth, towers: [], tracks, accessories: [] };
  for (const t of towers.values()) {
    const blocks = t.levels.map((b) => {
      if (b) return b;
      const c = fillOrder.find((k) => left[k] > 0);
      if (!c) return null;
      left[c]--;
      return { t: c, r: 0, filler: true };
    });
    if (blocks.includes(null)) return null;
    design.towers.push({ x: t.x, y: t.y, blocks, top: t.funnel ? 'M-03' : null });
  }

  // A fast marble can overshoot a drop block. Clip a scoop (T-14) to its far side if free.
  let scoops = PIECES.find((p) => p.code === 'T-14').own;
  const taken = new Set(tracks.flatMap((tr) => {
    const v = variants(PIECES.find((p) => p.code === tr.code))[tr.variant];
    return trackCells(tr.from, place(v, tr.from));
  }));
  design.towers.forEach((t) => towerCells(t.x, t.y, t.blocks.length + (t.top ? FUNNEL_HEIGHT : 0)).forEach((c) => taken.add(c)));
  const attached = new Set(tracks.map((tr) => `${tr.from.x},${tr.from.y},${tr.from.level},${tr.from.side}`));
  const check = simulate(design);
  for (const step of check.path) {
    if (!scoops || !step.block || (step.block !== 'white' && step.block !== 'clear') || step.from === 'top') continue;
    const t = design.towers.find((tw) => `${tw.x},${tw.y}` === xyOf(design, step.at));
    const side = (step.from + 2) % 4;
    const at = { x: t.x, y: t.y, level: step.level, side };
    const cell = accessorySpace({ at })[0];
    const [cx, cy] = cell.split(',').map(Number);
    if (!o.overhang && (cx < 0 || cy < 0 || cx >= o.width || cy >= o.depth)) continue;
    if (attached.has(`${at.x},${at.y},${at.level},${at.side}`) || taken.has(cell) || !openSides(t.blocks[step.level]).includes(side)) continue;
    design.accessories.push({ code: 'T-14', at });
    taken.add(cell);
    scoops--;
  }
  return design;
}

function xyOf(design, name) {
  const y = name.charCodeAt(0) - 65, x = Number(name.slice(1)) - 1;
  return `${x},${y}`;
}
