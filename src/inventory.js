// What we own. Sets: Adventure, Corkscrew Rush, Sky Elevator.
//
// PLACEHOLDER: every entry marked `guess: true` is carried over from the prototype and
// still needs checking against the real pieces. `own: null` means we haven't counted yet.

export const blocks = {
  blue: null,
  red: null,
  orange: null,
  clear: null,
  white: null,
};

export const pieces = [
  // ---- track: measured tower to tower
  { id: 'straight2', name: 'Straight track',       kind: 'track', shape: 'straight', forward: 2, drop: 0, own: null, guess: true },
  { id: 'ramp2',     name: 'Short ramp',           kind: 'track', shape: 'straight', forward: 2, drop: 1, own: null, guess: true },
  { id: 'ramp3',     name: 'Long ramp',            kind: 'track', shape: 'straight', forward: 3, drop: 1, own: null, guess: true },
  { id: 'curve1',    name: 'Tight curve',          kind: 'track', shape: 'curve', forward: 1, right: 1, drop: 0, own: null, guess: true },
  { id: 'curve2',    name: 'Wide curve',           kind: 'track', shape: 'curve', forward: 2, right: 2, drop: 0, own: null, guess: true },
  { id: 'curve2dR',  name: 'Wide drop curve (R)',  kind: 'track', shape: 'curve', forward: 2, right: 2, drop: 1, own: null, guess: true },
  { id: 'curve2dL',  name: 'Wide drop curve (L)',  kind: 'track', shape: 'curve', forward: 2, right: -2, drop: 1, own: null, guess: true },
  { id: 'uturn',     name: 'U-turn',               kind: 'track', shape: 'uturn', forward: 0, right: 1, drop: 0, own: null, guess: true },

  // ---- specials: names only until we know their footprint, height, ports and stackability
  { id: 'ferris',    name: 'Ferris wheel',      kind: 'special', set: 'Adventure',      own: null, unverified: true },
  { id: 'cone',      name: 'Swirling cone',     kind: 'special', set: 'Adventure',      own: null, unverified: true },
  { id: 'corkscrew', name: 'Corkscrew tumbler', kind: 'special', set: 'Corkscrew Rush', own: null, unverified: true },
  { id: 'seesaw',    name: 'See-saw',           kind: 'special', set: 'Corkscrew Rush', own: null, unverified: true },
  { id: 'vortex',    name: 'Vortex',            kind: 'special', set: 'Corkscrew Rush', own: null, unverified: true },
  { id: 'elevator',  name: 'Elevator',          kind: 'special', set: 'Corkscrew Rush', own: null, unverified: true },
  { id: 'skylift',   name: 'Sky elevator',      kind: 'special', set: 'Sky Elevator',   own: null, unverified: true },
  { id: 'zzloader',  name: 'Zig-zag loader',    kind: 'special', set: 'Sky Elevator',   own: null, unverified: true },
  { id: 'train',     name: 'Freight train',     kind: 'special', set: 'Sky Elevator',   own: null, unverified: true },
];
