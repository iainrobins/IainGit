// What we own, by VTech part code, from the sets' component lists.
//   Adventure Set (5423): full components page read, counts are exact.
//   Corkscrew Rush Set (5194): only the level-3 build manual so far, so counts are unknown (null).
//   Sky Elevator Set (5599): not read yet.
//
// Geometry comes from the top-down board maps in the Corkscrew level-3 manual (steps 3-1..3-12).
// `seen` records where a measurement came from. `unverified: true` means we only know the name.
// `ask` holds what we still need from Iain.

const SETS = ['adventure', 'corkscrew', 'sky'];

export const blocks = [
  { code: 'B-01', color: 'blue',   name: 'Blue straight block', sets: { adventure: 40, corkscrew: null, sky: null } },
  { code: 'B-02', color: 'orange', name: 'Orange end block',    sets: { adventure: 22, corkscrew: null, sky: null } },
  { code: 'B-03', color: 'white',  name: 'White drop block',    sets: { adventure: 12, corkscrew: null, sky: null },
    ask: 'Adventure calls its white drop block B-03, Corkscrew calls one B-04. Same block, or is one of them the clear block?' },
  { code: 'B-04', color: 'white',  name: 'White drop block',    sets: { adventure: 0,  corkscrew: null, sky: null } },
  { code: 'B-05', color: 'red',    name: 'Red turn block',      sets: { adventure: 0,  corkscrew: null, sky: null } },
];

export const pieces = [
  // ---------------------------------------------------------------- track, measured tower to tower
  { code: 'T-06', name: 'Short blue straight', kind: 'track', shape: 'straight', forward: 2, drop: 0,
    sets: { adventure: 6, corkscrew: null, sky: null }, seen: '3-4 H5→H7, 3-7 A2→C2, 3-10 A3→A5' },
  { code: 'T-07', name: 'Long blue straight', kind: 'track', shape: 'straight', forward: 3, drop: 0,
    sets: { adventure: 2, corkscrew: null, sky: null }, guess: true, ask: 'How many squares from tower to tower?' },
  { code: 'T-08', name: 'Short red ramp', kind: 'track', shape: 'straight', forward: 2, drop: 1,
    sets: { adventure: 4, corkscrew: null, sky: null }, seen: '3-5 A3↔A5', ask: 'Is the drop exactly one block?' },
  { code: 'T-03', name: 'Small orange curve', kind: 'track', shape: 'curve', forward: 1, right: 1, drop: 0,
    sets: { adventure: 12, corkscrew: null, sky: null }, seen: '3-4 G7→F8, 3-7 C2→D3, 3-9 C4→D5' },
  { code: 'T-04', name: 'Wide red curve', kind: 'track', shape: 'curve', forward: 2, right: 2, drop: 0,
    sets: { adventure: 4, corkscrew: null, sky: null }, seen: '3-6 A5→C7, 3-11 A5→C7' },
  { code: 'T-05', name: 'Small green U-turn', kind: 'track', shape: 'uturn', forward: 0, right: 1, drop: 0,
    sets: { adventure: 2, corkscrew: null, sky: null }, seen: '3-4 G7↔H7' },
  { code: 'T-02', name: 'Big orange U-turn', kind: 'track', shape: 'uturn', forward: 0, right: 2, drop: 0,
    sets: { adventure: 3, corkscrew: null, sky: null }, seen: '3-3 C8↔C10' },
  { code: 'T-01', name: 'Big yellow U-turn (sloped)', kind: 'track', shape: 'uturn', forward: 0, right: 2, drop: 2,
    sets: { adventure: 3, corkscrew: null, sky: null }, seen: '3-8 from E6', guess: true,
    ask: 'Same size as the orange U-turn but sloped? How many levels does it drop?' },
  { code: 'T-17', name: 'Green curl', kind: 'track', shape: 'loop', drop: 1,
    sets: { adventure: 0, corkscrew: null, sky: null }, seen: '3-6 H5, 3-10 C7, 3-11 A5', guess: true,
    ask: 'Does the marble leave the block, curl round, and come back into the same block one level lower?' },
  { code: 'T-15', name: 'Long yellow ramp', kind: 'track', shape: 'straight', forward: 4, drop: 3,
    sets: { adventure: 0, corkscrew: null, sky: null }, seen: '3-9 D5→H5', guess: true, ask: 'How many levels does it drop?' },

  // track we can't measure yet (Adventure has no board maps)
  { code: 'T-11', name: 'Yellow S-bend', kind: 'track', unverified: true, sets: { adventure: 2, corkscrew: null, sky: null } },
  { code: 'T-12', name: 'Long orange tube slide', kind: 'track', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'T-14', name: 'Yellow catcher lip', kind: 'track', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null },
    ask: 'Clips to one side of a block (3-10 A3, C7). What does it catch, and from where?' },

  // ---------------------------------------------------------------- specials
  { code: 'M-01', name: 'Yellow box with orange lid', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-02', name: 'Blue base with orange buttons', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-03', name: 'Green start funnel', kind: 'special', unverified: true, sets: { adventure: 2, corkscrew: null, sky: null } },
  { code: 'M-04', name: 'Orange crown connector', kind: 'special', unverified: true, sets: { adventure: 2, corkscrew: null, sky: null },
    ask: 'Sits on a tower top and takes track on its sides (3-11 A5, C7). Which sides, and does the marble drop through it?' },
  { code: 'M-05', name: 'Green flag drop', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-06', name: 'Yellow cover', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-07', name: 'Yellow chute tray', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null },
    ask: 'Bridges F8→F11 in 3-4 (three squares, like a track). Is it just a wide straight?' },
  { code: 'M-08', name: 'Swirl disc on yellow building', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-09', name: 'Ferris wheel', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-15', name: 'Clear funnel window', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'T-09', name: 'Green spiral funnel', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'T-10', name: 'Blue spinner', kind: 'special', unverified: true, sets: { adventure: 1, corkscrew: null, sky: null } },
  { code: 'M-16', name: 'Corkscrew tumbler', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null } },
  { code: 'M-17', name: 'Elevator', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null } },
  { code: 'M-18', name: 'Green chute on yellow base', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null } },
  { code: 'T-18', name: 'Green bowl', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null } },
  { code: 'T-20', name: 'Big green funnel', kind: 'special', unverified: true, sets: { adventure: 0, corkscrew: null, sky: null } },
].map((p) => ({ ...p, id: p.code, own: owned(p.sets) }));

// Total across sets, or null while any set's count is still unknown.
function owned(sets) {
  const counts = SETS.map((s) => sets[s]);
  return counts.some((n) => n == null) ? null : counts.reduce((a, b) => a + b, 0);
}
