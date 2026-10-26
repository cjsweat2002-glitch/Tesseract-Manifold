import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkpoint,
  createExpedition,
  DEFAULT_SETTINGS,
  fold,
  grapple,
  interact,
  nearbyPrompt,
  recover,
  step,
  tetherTarget,
  type Expedition,
} from '../src/expedition/model';
import { load, save } from '../src/expedition/save';
import {
  blocked,
  distance,
  MEMORIES,
  projectTesseract,
  supported,
  TESSERACT_EDGES,
} from '../src/expedition/world';

const idle = { forward: 0, strafe: 0, sprint: false, jump: false };
function advance(s: Expedition, seconds = 0.6) {
  for (let i = 0; i < seconds * 60; i++) step(s, idle, 1 / 60);
}
function walkTo(s: Expedition, x: number, z: number) {
  const destination = { x, y: 0, z };
  for (let i = 0; i < 4000 && distance(s.position, destination) > 0.08; i++) {
    s.yaw = Math.atan2(-(x - s.position.x), -(z - s.position.z));
    step(s, { ...idle, forward: 1 }, 1 / 120);
  }
  assert.ok(
    distance(s.position, destination) < 0.1,
    `Could not reach ${x}, ${z}; at ${JSON.stringify(s.position)}`,
  );
}
function shift(s: Expedition) {
  advance(s);
  assert.equal(fold(s), true);
}
const memoryStorage = (value: string | null = null) => ({
  value,
  getItem() {
    return this.value;
  },
  setItem(_key: string, next: string) {
    this.value = next;
  },
});

test('the tesseract has sixteen unique projected vertices and thirty-two nonzero edges', () => {
  for (const angle of [0, 0.31, 1.2, 2.6]) {
    const points = projectTesseract(angle);
    assert.equal(new Set(points.map((p) => JSON.stringify(p))).size, 16);
    assert.equal(TESSERACT_EDGES.length, 32);
    for (const [a, b] of TESSERACT_EDGES)
      assert.ok(distance(points[a], points[b]) > 0.1);
  }
});
test('the same bridge changes physical support between folds', () => {
  assert.equal(supported({ x: -15, y: 0, z: -4 }, 'matter'), false);
  assert.equal(supported({ x: -15, y: 0, z: -4 }, 'echo'), true);
  assert.equal(blocked({ x: -20, y: 0, z: -4 }, 'matter'), true);
  assert.equal(blocked({ x: -20, y: 0, z: -4 }, 'echo'), false);
});
test('folding cannot embed the player in solid architecture or repeat during cooldown', () => {
  const s = createExpedition();
  s.phase = 'echo';
  s.position = { x: -20, y: 0, z: -4 };
  assert.equal(fold(s), false);
  assert.equal(s.phase, 'echo');
  s.position.x = -23;
  assert.equal(fold(s), true);
  assert.equal(fold(s), false);
});
test('movement speed is independent of framerate and diagonals are normalized', () => {
  const a = createExpedition(),
    b = createExpedition(),
    diagonal = createExpedition();
  for (let i = 0; i < 60; i++) step(a, { ...idle, forward: 1 }, 1 / 60);
  for (let i = 0; i < 20; i++) step(b, { ...idle, forward: 1 }, 1 / 20);
  for (let i = 0; i < 60; i++)
    step(diagonal, { ...idle, forward: 1, strafe: 1 }, 1 / 60);
  assert.ok(Math.abs(a.position.z - b.position.z) < 1e-6);
  assert.ok(
    Math.abs(distance(createExpedition().position, diagonal.position) - 5) <
      1e-6,
  );
});
test('collision prevents wall tunneling at low framerates and slides along walls', () => {
  const s = createExpedition();
  s.position = { x: 23, y: 0, z: -7 };
  s.phase = 'echo';
  for (let i = 0; i < 10; i++)
    step(s, { ...idle, forward: 1, sprint: true }, 0.1);
  assert.ok(s.position.z > -8.2);
  const before = s.position.x;
  step(s, { ...idle, forward: 1, strafe: 1 }, 0.1);
  assert.ok(s.position.x > before);
  assert.ok(s.position.z > -8.2);
});
test('jump is consumed once and lands on solid ground', () => {
  const s = createExpedition();
  step(s, { ...idle, jump: true }, 0.1);
  assert.ok(s.position.y > 0);
  advance(s, 1);
  assert.equal(s.position.y, 0);
  assert.equal(s.grounded, true);
});
test('missing floors trigger recovery without losing collected memories', () => {
  const s = createExpedition();
  s.collected = [MEMORIES[0].id];
  s.position = { x: 45, y: 0, z: 0 };
  advance(s, 2);
  assert.equal(s.recoveries, 1);
  assert.deepEqual(s.position, checkpoint(s));
  assert.equal(s.collected.length, 1);
});
test('memories require proximity, the correct phase, and ordered single collection', () => {
  const s = createExpedition();
  assert.equal(interact(s), false);
  s.position = { ...MEMORIES[1] };
  assert.equal(interact(s), false);
  s.position = { ...MEMORIES[0] };
  assert.equal(interact(s), false);
  s.phase = 'echo';
  assert.equal(interact(s), true);
  assert.equal(interact(s), false);
  assert.equal(s.collected.length, 1);
});
test('tether unlocks with first memory and cannot pass through a seal', () => {
  const s = createExpedition();
  s.position = { x: -7, y: 0, z: -4 };
  s.yaw = Math.PI / 2;
  assert.equal(grapple(s), false);
  s.collected = [MEMORIES[0].id];
  assert.equal(tetherTarget(s), undefined);
  s.phase = 'echo';
  assert.ok(tetherTarget(s));
  assert.equal(grapple(s), true);
  assert.equal(fold(s), false);
  advance(s, 1);
  assert.ok(distance(s.position, { x: -23, y: 0, z: -4 }) < 0.01);
  assert.equal(s.tether, null);
});
test('gate requires all memories and an actual crossing within the aperture', () => {
  const s = createExpedition();
  s.position.z = 20.9;
  step(s, { ...idle, forward: -1 }, 0.1);
  assert.equal(s.complete, false);
  s.collected = MEMORIES.map((m) => m.id);
  s.position = { x: 5, y: 0, z: 20.9 };
  step(s, { ...idle, forward: -1 }, 0.1);
  assert.equal(s.complete, false);
  s.position = { x: 0, y: 0, z: 20.9 };
  step(s, { ...idle, forward: -1 }, 0.1);
  assert.equal(s.complete, true);
  const elapsed = s.elapsed;
  advance(s, 1);
  assert.equal(s.elapsed, elapsed);
});
test('complete outbound and return route is physically traversable with zero recalls', () => {
  const s = createExpedition();
  shift(s);
  walkTo(s, 0, -4);
  walkTo(s, -24, -4);
  assert.equal(interact(s), true);
  walkTo(s, -7, -4);
  shift(s);
  walkTo(s, 7, -8);
  walkTo(s, 23, -8);
  walkTo(s, 23, -13);
  assert.equal(interact(s), true);
  walkTo(s, 23, -8);
  walkTo(s, 7, -8);
  walkTo(s, 0, -8);
  shift(s);
  walkTo(s, 0, -19);
  shift(s);
  walkTo(s, 0, -30);
  shift(s);
  walkTo(s, 0, -37);
  assert.equal(interact(s), true);
  walkTo(s, 0, -30);
  shift(s);
  walkTo(s, 0, -19);
  shift(s);
  walkTo(s, 0, -8);
  walkTo(s, 0, 18);
  // Stop on the crossing: completed expeditions correctly stop accepting movement.
  s.yaw = Math.PI;
  for (let i = 0; i < 120 && !s.complete; i++)
    step(s, { ...idle, forward: 1 }, 1 / 60);
  assert.equal(s.complete, true);
  assert.equal(s.recoveries, 0);
  assert.equal(s.collected.length, 3);
});
test('save roundtrip restores progression and settings at a safe checkpoint', () => {
  const s = createExpedition();
  s.collected = MEMORIES.slice(0, 2).map((m) => m.id);
  s.position = { x: 55, y: -8, z: 70 };
  s.elapsed = 123.5;
  s.phase = 'echo';
  const storage = memoryStorage();
  assert.equal(
    save(storage, s, { ...DEFAULT_SETTINGS, quality: 'low', muted: true }),
    true,
  );
  const restored = load(storage);
  assert.equal(restored.exists, true);
  assert.deepEqual(restored.state.position, checkpoint(s));
  assert.equal(restored.state.phase, 'matter');
  assert.equal(restored.state.elapsed, 123.5);
  assert.equal(restored.settings.muted, true);
  assert.equal(restored.settings.quality, 'low');
});
test('corrupt, future, and impossible saves cannot grant completion', () => {
  for (const value of [
    '{broken',
    'null',
    '{}',
    JSON.stringify({ version: 2 }),
    JSON.stringify({ version: 1, collected: ['unwritten'], complete: true }),
  ]) {
    const restored = load(memoryStorage(value));
    assert.equal(restored.exists, false);
    assert.equal(restored.state.complete, false);
    assert.ok(restored.warning);
  }
  const storage = memoryStorage();
  save(storage, createExpedition(), DEFAULT_SETTINGS);
  const valid = JSON.parse(storage.value!);
  for (const patch of [
    { elapsed: -1 },
    { folds: '2' },
    { complete: true },
    { collected: ['remembering', 'remembering'] },
    { phase: 'unknown' },
  ]) {
    const restored = load(
      memoryStorage(JSON.stringify({ ...valid, ...patch })),
    );
    assert.equal(restored.exists, false);
  }
});
test('unavailable storage does not crash the expedition', () => {
  const storage = {
    getItem() {
      throw new Error('denied');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.equal(save(storage, createExpedition(), DEFAULT_SETTINGS), false);
  assert.equal(load(storage).exists, false);
});
test('manual recall cancels tether and preserves progression', () => {
  const s = createExpedition();
  s.collected = [MEMORIES[0].id];
  s.tether = { from: s.position, to: { x: 0, y: 0, z: 0 }, progress: 0.2 };
  recover(s);
  assert.equal(s.tether, null);
  assert.equal(s.collected.length, 1);
  assert.equal(s.phase, 'echo');
  assert.equal(s.grounded, true);
});

test('onboarding advances after revealing the arrival bridge', () => {
  const s = createExpedition();
  assert.match(nearbyPrompt(s), /Q · Fold/);
  fold(s);
  assert.match(nearbyPrompt(s), /Cross the echo bridge/);
});
