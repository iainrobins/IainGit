// What we own, by VTech part code, from the sets' component lists.
//   Adventure Set (5423): full components page read, counts are exact.
//   Corkscrew Rush Set (5194): components page from Iain's screenshot, counts are exact.
//   Sky Elevator Set (5599): components page from Iain's screenshots, counts are exact.
//
// A part code identifies a shape, not a colour: T-04 is red in Adventure and green in Sky
// Elevator. Names below describe the shape; `colors` lists what we've seen per set.
// Geometry comes from the top-down board maps in the Corkscrew level-3 manual (steps 3-1..3-12).
// `seen` records where a measurement came from. `unverified: true` means we only know the name.
// `ask` holds what we still need from Iain. `handedUnknown` marks a drop piece whose turning
// direction (right or left, going downhill) isn't confirmed; the generator leaves those out. Iain's piece-check answers (29 Sep 2026) are folded in.

const SETS = ['adventure', 'corkscrew', 'sky'];

export const blocks = [
  { code: 'B-01', color: 'blue',   name: 'Blue straight block', sets: { adventure: 40, corkscrew: 24, sky: 31 } },
  { code: 'B-02', color: 'orange', name: 'Orange end block',    sets: { adventure: 22, corkscrew: 10, sky: 11 } },
  { code: 'B-03', color: 'white',  name: 'White drop block',    sets: { adventure: 12, corkscrew: 0, sky: 23 } },
  { code: 'B-04', color: 'clear',  name: 'Clear drop block',    sets: { adventure: 0,  corkscrew: 10, sky: 0 } },
  { code: 'B-05', color: 'red',    name: 'Red turn block',      sets: { adventure: 0,  corkscrew: 5, sky: 6 } },
];

// Base plates. P-01 is 2×4 squares, P-02 is 1×2.
export const plates = [
  { code: 'P-01', squares: 8, sets: { adventure: 8, corkscrew: 3, sky: 2 } },
  { code: 'P-02', squares: 2, sets: { adventure: 0, corkscrew: 11, sky: 17 } },
];

export const pieces = [
  // ---------------------------------------------------------------- track, measured tower to tower
  // `checked` means Iain confirmed it against the real piece (piece-check page, 29 Sep 2026).
  { code: 'T-06', name: 'Short straight', kind: 'track', shape: 'straight', forward: 2, drop: 0, checked: true,
    sets: { adventure: 6, corkscrew: 8, sky: 4 }, seen: '3-4 H5→H7, 3-7 A2→C2, 3-10 A3→A5' },
  { code: 'T-07', name: 'Long straight', kind: 'track', shape: 'straight', forward: 3, drop: 0, checked: true,
    sets: { adventure: 2, corkscrew: 2, sky: 2 } },
  { code: 'T-08', name: 'Short ramp', kind: 'track', shape: 'straight', forward: 2, drop: 1, checked: true,
    sets: { adventure: 4, corkscrew: 2, sky: 5 }, seen: '3-5 A3↔A5' },
  { code: 'T-03', name: 'Small curve', kind: 'track', shape: 'curve', forward: 1, right: 1, drop: 0, checked: true,
    sets: { adventure: 12, corkscrew: 3, sky: 1 }, seen: '3-4 G7→F8, 3-7 C2→D3, 3-9 C4→D5' },
  { code: 'T-04', name: 'Wide curve', kind: 'track', shape: 'curve', forward: 2, right: 2, drop: 0, checked: true,
    sets: { adventure: 4, corkscrew: 4, sky: 5 }, seen: '3-6 A5→C7, 3-11 A5→C7' },
  { code: 'T-27', name: 'Elevator feed curve', kind: 'track', shape: 'curve', forward: 1, right: 1, drop: 1, checked: true, handedUnknown: true,
    sets: { adventure: 0, corkscrew: 0, sky: 1 }, note: 'Used to get marbles into the elevator.',
    ask: 'It drops, so it only works one way. Does it turn right or left as the marble goes down it?' },
  { code: 'T-05', name: 'Small U-turn', kind: 'track', shape: 'uturn', forward: 0, right: 1, drop: 0, checked: true,
    sets: { adventure: 2, corkscrew: 1, sky: 0 }, seen: '3-4 G7↔H7' },
  { code: 'T-02', name: 'Big U-turn', kind: 'track', shape: 'uturn', forward: 0, right: 2, drop: 0, checked: true,
    sets: { adventure: 3, corkscrew: 1, sky: 4 }, seen: '3-3 C8↔C10' },
  { code: 'T-01', name: 'Big sloped U-turn', kind: 'track', shape: 'uturn', forward: 0, right: 2, drop: 1, checked: true, handedUnknown: true,
    sets: { adventure: 3, corkscrew: 1, sky: 1 }, seen: '3-8 from E6',
    ask: 'It drops, so it only works one way. Does it turn right or left as the marble goes down it?' },
  { code: 'T-17', name: 'Curl', kind: 'track', shape: 'loop', right: 1, drop: 1, checked: true,
    sets: { adventure: 0, corkscrew: 3, sky: 2 }, seen: '3-6 H5, 3-10 C7, 3-11 A5 (all curl to the right)',
    note: 'Leaves a block, curls round the corner, and comes back into the same tower one level lower, through the side perpendicular to the one it left by.' },
  { code: 'T-15', name: 'Long ramp', kind: 'track', shape: 'straight', forward: 4, drop: 3,
    sets: { adventure: 0, corkscrew: 1, sky: 0 }, seen: '3-9 D5→H5', guess: true, ask: 'How many levels does it drop?' },

  // track not measured yet
  { code: 'T-11', name: 'S-bend', kind: 'track', unverified: true, sets: { adventure: 2, corkscrew: 0, sky: 0 } },
  { code: 'T-12', name: 'Long tube slide', kind: 'track', unverified: true, sets: { adventure: 1, corkscrew: 0, sky: 0 },
    note: 'A marble hitting the M-01 box hard gets sent up this tube.' },
  { code: 'T-23', name: 'Big U-turn (blue)', kind: 'track', unverified: true, sets: { adventure: 0, corkscrew: 0, sky: 1 },
    ask: 'Looks like T-02. Same size and flat?' },

  // ---------------------------------------------------------------- accessories: clip onto a block, no route of their own
  { code: 'T-14', name: 'Overrun scoop', kind: 'accessory', sets: { adventure: 0, corkscrew: 4, sky: 3 },
    note: 'Clips to the far side of a white or clear drop block. A marble going too fast to drop runs into it and comes back out the same spot, then drops.' },
  { code: 'M-15', name: 'Funnel backstop', kind: 'accessory', sets: { adventure: 1, corkscrew: 0, sky: 0 },
    note: 'Backstop for the catcher funnel, to help it catch the marble.' },

  // ---------------------------------------------------------------- specials
  // role: start | finish | drop | passthrough | lift | launcher | funnel | receiver
  // footprint is [width, depth] in squares, height is in blocks. null = not answered yet.
  { code: 'M-03', name: 'Start funnel', kind: 'special', role: 'start', footprint: [1, 1], height: 2, stackable: false,
    in: 'drops in the top', out: 'into the block below', sets: { adventure: 2, corkscrew: 0, sky: 1 } },
  { code: 'M-07', name: 'Catch basin', kind: 'special', role: 'finish', footprint: [1, 2], height: 1, stackable: false,
    in: 'from track on either end, one level up', out: 'none: marbles stay here', sets: { adventure: 1, corkscrew: 1, sky: 1 } },
  { code: 'M-05', name: 'Flag drop', kind: 'special', role: 'drop', footprint: [1, 1], height: 1, stackable: false,
    in: 'from a side', out: 'drops down through the middle', sets: { adventure: 1, corkscrew: 1, sky: 0 } },
  { code: 'T-10', name: 'Spinner', kind: 'special', role: 'drop', footprint: [1, 1], height: 3, stackable: true,
    in: 'from track at the top, on a side', out: 'drops out the bottom', sets: { adventure: 1, corkscrew: 0, sky: 1 } },
  { code: 'M-01', name: 'Booster box', kind: 'special', role: 'passthrough', footprint: [1, 1], height: null, stackable: false,
    in: 'from either side', out: 'straight out the other side', sets: { adventure: 1, corkscrew: 0, sky: 0 },
    note: 'Hit hard, it sends the marble up the long tube slide (T-12).', ask: 'How tall is it, in blocks?' },
  { code: 'T-09', name: 'Spiral funnel', kind: 'special', role: 'funnel', footprint: [3, 3], height: 2, stackable: false,
    in: 'from a corner', out: 'drops out the centre square', sets: { adventure: 1, corkscrew: 0, sky: 0 },
    note: 'The marble spins round before dropping.' },
  { code: 'M-17', name: 'Elevator', kind: 'special', role: 'lift', footprint: [1, 1], height: 4, stackable: null,
    in: 'at the bottom, from one side', out: 'at the top, on the opposite side', sets: { adventure: 0, corkscrew: 1, sky: 0 },
    note: 'Lifts marbles 4 levels when you pull it.', ask: 'Can you build on top of it?' },
  { code: 'M-02', name: 'Cannon', kind: 'special', role: 'launcher', footprint: [1, 2], height: null, stackable: false,
    in: 'from track on either side of the first square', out: 'launched through the air, ideally into a start funnel',
    sets: { adventure: 1, corkscrew: 0, sky: 0 }, note: 'The second square is the launch button.', ask: 'How tall is it, in blocks?' },
  { code: 'M-35', name: 'Wagon dump chute', kind: 'special', role: 'receiver', footprint: [2, 1], height: 1, stackable: false,
    in: 'dropped in the top from the freight wagon', out: 'out the far end, from the block below', sets: { adventure: 0, corkscrew: 0, sky: 1 } },

  // specials still to measure
  { code: 'M-04', name: 'Crown connector', kind: 'special', unverified: true, sets: { adventure: 2, corkscrew: 2, sky: 2 },
    ask: 'Sits on a tower top and takes track on its sides (3-11 A5, C7). Which sides, and does the marble drop through it?' },
  { code: 'M-06', name: 'Yellow cover', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: 0, sky: 0 } },
  { code: 'M-08', name: 'Swirl disc on yellow building', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: 0, sky: 0 } },
  { code: 'M-09', name: 'Ferris wheel', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: 0, sky: 0 } },
  { code: 'M-16', name: 'Corkscrew tumbler', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 1, sky: 0 } },
  { code: 'M-18', name: 'Green chute on yellow base', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 1, sky: 0 } },
  { code: 'T-18', name: 'Green bowl', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 1, sky: 0 } },
  { code: 'T-20', name: 'Big green funnel', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 1, sky: 0 } },
  { code: 'M-34', name: 'Blue double-width block', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 0, sky: 1 } },
  { code: 'M-40', name: 'Sky elevator column (with M-45 base block)', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: 0, sky: 1 } },

  // ---------------------------------------------------------------- freight train (Sky Elevator)
  // A separate system on its own track: the crank lift loads the wagon, the engine pulls it,
  // the bump track tips it out into the dump chute (M-35), which feeds marble track again.
  { code: 'M-37', name: 'Crank lift loader', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 1 },
    height: 3, in: 'top, at the back', out: 'middle of the front, one level down, into the passing wagon' },
  { code: 'M-36', name: 'Lift trigger', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 1 },
    note: 'Triggers the crank lift to dump marbles into the wagon.' },
  { code: 'M-38', name: 'Freight wagon', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 1 }, note: 'Holds 3 or 4 marbles.' },
  { code: 'M-39', name: 'Train engine', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 1 } },
  { code: 'T-24', name: 'Train track curve', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 4 } },
  { code: 'T-25', name: 'Train track straight', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 2 } },
  { code: 'T-26', name: 'Train track with bump', kind: 'train', sets: { adventure: 0, corkscrew: 0, sky: 1 },
    note: 'The bump tips the wagon out to the side of this piece.' },

  // ---------------------------------------------------------------- scenery
  { code: 'M-44', name: 'Sky tower', kind: 'decor', sets: { adventure: 0, corkscrew: 0, sky: 1 } },
  { code: 'M-41', name: 'Trees scenery', kind: 'decor', sets: { adventure: 0, corkscrew: 0, sky: 1 } },
  { code: 'M-42', name: 'City scenery', kind: 'decor', sets: { adventure: 0, corkscrew: 0, sky: 1 } },
  { code: 'M-43', name: 'Bridge scenery', kind: 'decor', sets: { adventure: 0, corkscrew: 0, sky: 1 } },
].map((p) => ({ ...p, id: p.code, ...owned(p.sets) }));

// Total across sets. `partial` is true if any set's count is unknown, making `own` a minimum.
function owned(sets) {
  const counts = SETS.map((s) => sets[s]);
  return { own: counts.reduce((a, n) => a + (n ?? 0), 0), partial: counts.some((n) => n == null) };
}

export const plateSquares = plates.reduce((n, p) => n + p.squares * owned(p.sets).own, 0);

export const blockCounts = Object.fromEntries(blocks.map((b) => [b.code, owned(b.sets)]));
