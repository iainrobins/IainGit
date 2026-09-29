// Marble Rush connection model.
//
// Everything connects through ports. A port is one side of one block in a tower:
//   { x, y, level, side }   side: 0 north, 1 east, 2 south, 3 west. level 0 = bottom block.
// Blocks route the marble between their own ports (or drop it to the block below).
// Track pieces join a port on one tower to a port on another tower. Nothing stands under them.
// Specials sit on the board like towers and expose their own ports.

export const N = 0, E = 1, S = 2, W = 3;
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];
export const SIDE_NAMES = ['north', 'east', 'south', 'west'];

// Local frame used by piece definitions: f = forward (the way the marble leaves the entry
// tower), s = right. Local directions: 0 forward, 1 right, 2 back, 3 left.
const LOCAL = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// ---------------------------------------------------------------- blocks

// `open` lists the open sides relative to the block's rotation r.
// Every block is one level tall. Track pieces clip into open sides only, never the top.
// Orange has one open side: a marble rolling in stops there, and a marble falling in from a
// drop block above leaves by that side (used under a drop to send it one way).
export const BLOCKS = {
  blue:   { name: 'Blue straight block', open: [0, 2], action: 'through' },
  red:    { name: 'Red turn block',      open: [0, 1], action: 'turn' },
  orange: { name: 'Orange end block',    open: [0],    action: 'end' },
  clear:  { name: 'Clear drop block',    open: [0, 2], action: 'drop' },
  white:  { name: 'White drop block',    open: [0, 2], action: 'drop' },
};

export const openSides = (block) => BLOCKS[block.t].open.map((o) => (o + block.r) % 4);

// Where does a marble go after entering `block` by `from` (a side, or 'top' when it falls
// in from a drop block above)? Returns one of:
//   { exit: side }  leaves by that side, same level
//   { down: true }  falls into the block below, entering it from 'top'
//   { stop: true }  comes to rest
//   { blocked: true } it can't get in that way
export function route(block, from) {
  const def = BLOCKS[block.t];
  const open = openSides(block);
  if (from === 'top') {
    if (def.action === 'drop') return { down: true };
    if (def.action === 'end') return { exit: open[0] };
    // UNVERIFIED: which side a blue/red block sends a marble that falls in from above.
    // Assume the first open side, as the prototype did.
    return { exit: open[0] };
  }
  if (!open.includes(from)) return { blocked: true };
  switch (def.action) {
    case 'through': return { exit: (from + 2) % 4 };
    case 'turn': return { exit: open.find((o) => o !== from) };
    case 'drop': return { down: true };
    default: return { stop: true };
  }
}

// ---------------------------------------------------------------- track pieces

// A track definition, measured tower to tower with the marble heading forward out of the
// entry tower:
//   shape    'straight' | 'curve' | 'uturn' | 'loop'
//            (a loop leaves a tower, curls round the corner and comes back into the same tower
//            through the perpendicular side, lower down; `right` is 1 if it curls to the
//            marble's right, -1 to the left)
//   forward  squares forward from the entry tower to the exit tower
//   right    squares right to the exit tower (negative = left). 0 for straights.
//   drop     levels lower at the exit tower (0 = flat)
//   covers   optional list of [f, s] squares the piece hangs over; derived if left out
//
// A flat piece works either way round, so it also gives a mirror-image placement when the
// marble enters from the other end (a right curve used backwards is a left curve).
// A piece with a drop only works one way.

// The one-way geometry, in the entry tower's local frame.
function baseVariant(def) {
  const F = def.forward, R = def.right ?? 0, g = Math.sign(R) || 1;
  let exit, heading, covers = [];
  if (def.shape === 'straight') {
    exit = [F, 0]; heading = 0;
    for (let f = 1; f < F; f++) covers.push([f, 0]);
  } else if (def.shape === 'curve') {
    exit = [F, R]; heading = g > 0 ? 1 : 3;
    for (let f = 1; f <= F; f++) covers.push([f, 0]);
    for (let s = 1; s < Math.abs(R); s++) covers.push([F, g * s]);
  } else if (def.shape === 'uturn') {
    exit = [0, R]; heading = 2;
    for (let s = 0; s <= Math.abs(R); s++) covers.push([1, g * s]);
  } else if (def.shape === 'loop') {
    // Arrives heading back across the tower, so it enters through the side it curled towards.
    exit = [0, 0]; heading = g > 0 ? 3 : 1;
    covers.push([1, 0], [1, g]);
  } else {
    throw new Error(`Unknown track shape "${def.shape}" on ${def.id}`);
  }
  if (def.covers) covers = def.covers.map((c) => [...c]);
  return { exit, heading, drop: def.drop, covers };
}

// Re-express a variant as seen from its exit tower, with the marble going the other way.
function reverse(v) {
  const nf = (v.heading + 2) % 4;
  const [ex, es] = v.exit;
  const to = ([f, s]) => {
    const d = [f - ex, s - es];
    const dot = (k) => d[0] * LOCAL[k][0] + d[1] * LOCAL[k][1];
    return [dot(nf) + 0, dot((nf + 1) % 4) + 0];
  };
  return { exit: to([0, 0]), heading: (2 - nf + 4) % 4, drop: -v.drop, covers: v.covers.map(to) };
}

// Every way the marble can travel through a piece, in local terms.
export function variants(def) {
  const v = baseVariant(def);
  return def.drop === 0 ? [v, reverse(v)] : [v];
}

// Local (f, s) from a tower at (x, y) whose forward direction is `dir` → grid square.
export const toGrid = (x, y, dir, f, s) =>
  [x + f * DX[dir] + s * DX[(dir + 1) % 4], y + f * DY[dir] + s * DY[(dir + 1) % 4]];

// Place a track piece so the marble leaves `from` (a port) along it.
// Returns the port it arrives at on the far tower and the squares it hangs over.
export function place(v, from) {
  const { x, y, level, side } = from;
  const [tx, ty] = toGrid(x, y, side, ...v.exit);
  const heading = (side + v.heading) % 4;
  return {
    to: { x: tx, y: ty, level: level - v.drop, side: (heading + 2) % 4 },
    covers: v.covers.map(([f, s]) => toGrid(x, y, side, f, s)),
  };
}

// ---------------------------------------------------------------- space

// The board is shared in 3D: a square can hold a short tower with track passing over it,
// and tracks can cross at different levels. Space is tracked as "x,y,level" cells.
export const cellKey = (x, y, level) => `${x},${y},${level}`;

// A tower of h blocks fills levels 0..h-1 of its square (a special on top adds its height).
export function towerCells(x, y, height) {
  return Array.from({ length: height }, (_, l) => cellKey(x, y, l));
}

// A placed track fills every level between its two ends over each square it hangs across.
// ASSUMPTION: one level of clearance is enough for another track or a tower top below it.
export function trackCells(from, placed) {
  const hi = Math.max(from.level, placed.to.level), lo = Math.min(from.level, placed.to.level);
  const out = [];
  for (const [x, y] of placed.covers) for (let l = lo; l <= hi; l++) out.push(cellKey(x, y, l));
  return out;
}

// Keys found in more than one of the given cell lists.
export function clashes(...lists) {
  const seen = new Set(), dup = new Set();
  for (const list of lists) for (const k of new Set(list)) (seen.has(k) ? dup : seen).add(k);
  return [...dup];
}

// ---------------------------------------------------------------- specials

// A special definition:
//   role       what it does for the route: start, finish, drop, passthrough, lift, launcher,
//              funnel or receiver
//   footprint  [width, depth] in squares; height in blocks
//   stackable  true if blocks or other pieces can be built on top of it
//              (every special can itself stand on top of a tower)
//   in, out    where the marble enters and leaves, in words until the simulator models them

// ---------------------------------------------------------------- validation

export function validatePiece(def) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(`${def.id ?? '?'}: ${msg}`); };
  need(typeof def.id === 'string' && def.id, 'needs an id');
  need(typeof def.name === 'string' && def.name, 'needs a name');
  need(def.own === null || (Number.isInteger(def.own) && def.own >= 0), 'own must be a whole number or null (unknown)');
  if (def.kind === 'track' && def.unverified) {
    need(['straight', 'curve', 'uturn', 'loop', undefined].includes(def.shape), 'unknown shape');
  } else if (def.kind === 'track') {
    need(['straight', 'curve', 'uturn', 'loop'].includes(def.shape), 'shape must be straight, curve, uturn or loop');
    need(Number.isInteger(def.drop) && def.drop >= 0, 'drop must be a whole number, 0 or more');
    if (def.shape === 'loop') need(def.drop > 0 && !def.forward && Math.abs(def.right) === 1, 'a loop comes back into its own tower, lower down, curling right (1) or left (-1)');
    else need(Number.isInteger(def.forward) && def.forward >= (def.shape === 'uturn' ? 0 : 1), 'forward must be a whole number of squares');
    if (def.shape === 'straight') need(!def.right, 'a straight has no sideways reach');
    else if (def.shape !== 'loop') need(Number.isInteger(def.right) && def.right !== 0, 'a curve or U-turn needs a sideways reach');
  } else if (def.kind === 'special') {
    if (!def.unverified) {
      const roles = ['start', 'finish', 'drop', 'passthrough', 'lift', 'launcher', 'funnel', 'receiver'];
      need(roles.includes(def.role), `role must be one of ${roles.join(', ')}`);
      need(def.footprint === null || (Array.isArray(def.footprint) && def.footprint.length === 2), 'footprint must be [width, depth] or null');
      need(def.height === null || (Number.isInteger(def.height) && def.height > 0), 'height must be whole blocks or null');
      need(def.stackable === null || typeof def.stackable === 'boolean', 'stackable must be true, false or null');
      need(typeof def.in === 'string' && typeof def.out === 'string', 'needs in and out descriptions');
    }
  } else if (!['train', 'decor', 'accessory'].includes(def.kind)) {
    errs.push(`${def.id}: kind must be track, special, accessory, train or decor`);
  }
  return errs;
}
