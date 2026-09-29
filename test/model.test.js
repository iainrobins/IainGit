import { test } from 'node:test';
import assert from 'node:assert/strict';
import { N, E, S, W, route, variants, place, validatePiece } from '../src/model.js';
import { pieces } from '../src/inventory.js';

const port = (x, y, level, side) => ({ x, y, level, side });

test('blue passes straight through, and only along its axis', () => {
  const b = { t: 'blue', r: N };
  assert.deepEqual(route(b, S), { exit: N });
  assert.deepEqual(route(b, N), { exit: S });
  assert.deepEqual(route(b, E), { blocked: true });
});

test('red turns 90° either way round', () => {
  const b = { t: 'red', r: N }; // open north and east
  assert.deepEqual(route(b, N), { exit: E });
  assert.deepEqual(route(b, E), { exit: N });
  assert.deepEqual(route(b, S), { blocked: true });
});

test('clear and white drop from either open side', () => {
  for (const t of ['clear', 'white']) {
    assert.deepEqual(route({ t, r: E }, E), { down: true });
    assert.deepEqual(route({ t, r: E }, W), { down: true });
    assert.deepEqual(route({ t, r: E }, N), { blocked: true });
    assert.deepEqual(route({ t, r: E }, 'top'), { down: true });
  }
});

test('flat straight bridges two squares and works both ways', () => {
  const def = { id: 's', name: 's', kind: 'track', shape: 'straight', forward: 2, drop: 0, own: 1 };
  const vs = variants(def);
  assert.equal(vs.length, 2);
  const out = place(vs[0], port(0, 5, 2, N));
  assert.deepEqual(out.to, port(0, 3, 2, S));
  assert.deepEqual(out.covers, [[0, 4]]);
});

test('ramp only runs downhill', () => {
  const def = { id: 'r', name: 'r', kind: 'track', shape: 'straight', forward: 2, drop: 1, own: 1 };
  assert.equal(variants(def).length, 1);
  assert.deepEqual(place(variants(def)[0], port(0, 0, 3, E)).to, port(2, 0, 2, W));
});

test('flat right curve used backwards turns left', () => {
  const def = { id: 'c', name: 'c', kind: 'track', shape: 'curve', forward: 1, right: 1, drop: 0, own: 1 };
  const [fwd, back] = variants(def);
  // Leave (1,1) northward, curve right, arrive at (2,0) through its west side.
  const a = place(fwd, port(1, 1, 0, N));
  assert.deepEqual(a.to, port(2, 0, 0, W));
  assert.deepEqual(a.covers, [[1, 0]]);
  // Backwards: leave (2,0) westward, curve left, arrive back at (1,1) through its north side.
  const b = place(back, port(2, 0, 0, W));
  assert.deepEqual(b.to, port(1, 1, 0, N));
  assert.deepEqual(b.covers, [[1, 0]]);
});

test('drop curve works one way and loses a level', () => {
  const def = { id: 'd', name: 'd', kind: 'track', shape: 'curve', forward: 2, right: -2, drop: 1, own: 1 };
  const vs = variants(def);
  assert.equal(vs.length, 1);
  const out = place(vs[0], port(3, 3, 2, E)); // heading east, curving left (north)
  assert.deepEqual(out.to, port(5, 1, 1, S));
  assert.deepEqual(out.covers, [[4, 3], [5, 3], [5, 2]]);
});

test('U-turn comes back into the tower beside', () => {
  const def = { id: 'u', name: 'u', kind: 'track', shape: 'uturn', forward: 0, right: 1, drop: 0, own: 1 };
  const out = place(variants(def)[0], port(0, 2, 1, N));
  assert.deepEqual(out.to, port(1, 2, 1, N));
  assert.deepEqual(out.covers, [[0, 1], [1, 1]]);
});

test('every inventory entry is well formed', () => {
  const errs = pieces.flatMap(validatePiece);
  assert.deepEqual(errs, []);
  const ids = pieces.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'ids must be unique');
});

test('validation catches bad track definitions', () => {
  assert.ok(validatePiece({ id: 'x', name: 'x', kind: 'track', shape: 'curve', forward: 1, drop: 0, own: 1 }).length);
  assert.ok(validatePiece({ id: 'x', name: 'x', kind: 'track', shape: 'straight', forward: 2, drop: -1, own: 1 }).length);
});
