import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, usableTrack } from '../src/generate.js';
import { simulate, partsList, FUNNEL_HEIGHT } from '../src/simulate.js';
import { instructions } from '../src/instructions.js';

const clone = (d) => JSON.parse(JSON.stringify(d));

test('every seed from 1 to 40 gives a design that passes the test run', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const res = generate({ seed });
    assert.ok(res.ok, `seed ${seed}: ${res.reason}`);
    const check = simulate(res.design, { maxHeight: 6 });
    assert.ok(check.ok, `seed ${seed}: ${check.problems.join(' ')}`);
    assert.ok(res.design.tracks.length >= 3 && res.design.tracks.length <= 6, `seed ${seed} track count`);
  }
});

test('the same seed always gives the same design', () => {
  assert.deepEqual(generate({ seed: 7 }).design, generate({ seed: 7 }).design);
});

test('constraints hold: board, height, towers and must-use pieces', () => {
  const o = { seed: 11, width: 5, depth: 4, maxHeight: 5, maxTowers: 4, minPieces: 4, maxPieces: 5, include: ['T-17'] };
  const res = generate(o);
  assert.ok(res.ok, res.reason);
  const d = res.design;
  assert.ok(d.towers.length <= 4);
  for (const t of d.towers) {
    assert.ok(t.x < 5 && t.y < 4);
    assert.ok(t.blocks.length + (t.top ? FUNNEL_HEIGHT : 0) <= 5);
  }
  assert.ok(d.tracks.some((tr) => tr.code === 'T-17'));
  assert.ok(d.tracks.length >= 4 && d.tracks.length <= 5);
});

test('unconfirmed pieces are left out, and asking for one says why', () => {
  const codes = new Set(usableTrack().map((m) => m.code));
  for (const c of ['T-01', 'T-27', 'T-15', 'T-11']) assert.ok(!codes.has(c), c);
  const res = generate({ include: ['T-01'] });
  assert.equal(res.ok, false);
  assert.match(res.reason, /T-01/);
});

test('the test run catches a turned block', () => {
  const d = clone(generate({ seed: 3 }).design);
  const t = d.towers.find((tw) => tw.blocks.some((b) => !b.filler && (b.t === 'blue' || b.t === 'red')));
  const b = t.blocks.find((bl) => !bl.filler && (bl.t === 'blue' || bl.t === 'red'));
  b.r = (b.r + 1) % 4;
  assert.equal(simulate(d).ok, false);
});

test('the test run catches a missing track piece', () => {
  const d = clone(generate({ seed: 4 }).design);
  d.tracks.pop();
  const check = simulate(d);
  assert.equal(check.ok, false);
});

test('the test run catches a marble dropped into a blue block', () => {
  const d = clone(generate({ seed: 5 }).design);
  const start = d.towers.find((t) => t.top);
  start.blocks[start.blocks.length - 1] = { t: 'blue', r: 0 };
  assert.match(simulate(d).problems.join(' '), /don't know which way/);
});

test('the test run catches using more pieces than we own', () => {
  const d = clone(generate({ seed: 6 }).design);
  for (let i = 0; i < 20; i++) d.tracks.push({ ...d.tracks[0] });
  assert.match(simulate(d).problems.join(' '), /we only have/);
});

test('build steps go bottom up and end with a passing test run', () => {
  const { steps, parts, run } = instructions(generate({ seed: 8 }).design);
  assert.ok(run.ok);
  assert.equal(steps[0].title, 'Lay the base');
  const levels = steps.filter((s) => s.title.startsWith('Towers, level')).map((s) => Number(s.title.split(' ').pop()));
  assert.deepEqual(levels, [...levels].sort((a, b) => a - b));
  const trackLevels = steps.filter((s) => s.title.startsWith('Track:')).map((s) => Number(s.text.match(/level (\d+)/)[1]));
  assert.deepEqual(trackLevels, [...trackLevels].sort((a, b) => b - a));
  assert.equal(steps.at(-1).title, 'Test run');
  assert.equal(parts['M-03'], 1);
});

test('parts list counts every block', () => {
  const d = generate({ seed: 9 }).design;
  const blocks = d.towers.reduce((n, t) => n + t.blocks.length, 0);
  const counted = Object.entries(partsList(d)).filter(([c]) => c.startsWith('B-')).reduce((n, [, k]) => n + k, 0);
  assert.equal(counted, blocks);
});

test('track stays over the base plates unless overhang is allowed', async () => {
  const { variants, place } = await import('../src/model.js');
  const { pieces } = await import('../src/inventory.js');
  for (let seed = 1; seed <= 30; seed++) {
    const d = generate({ seed }).design;
    for (const tr of d.tracks) {
      const v = variants(pieces.find((p) => p.code === tr.code))[tr.variant];
      for (const [x, y] of place(v, tr.from).covers) assert.ok(x >= 0 && y >= 0 && x < d.width && y < d.depth, `seed ${seed} ${tr.code}`);
    }
  }
});
