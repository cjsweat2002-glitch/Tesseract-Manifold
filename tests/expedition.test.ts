import {
  canDeliver,
  converse,
  createLife,
  DAY,
  entityActive,
  lifeTarget,
  pulse,
  RESIDENTS,
  sheltered,
  stepLife,
  useLife,
  wardActive,
  type ResidentId,
} from '../src/expedition/life';
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
test('relics are independent discoveries and rewards cannot be repeated', () => {
  const s = createExpedition();
  s.position = { ...MEMORIES[1] };
  assert.equal(interact(s), true);
  assert.equal(interact(s), false);
  s.position = { ...MEMORIES[0] };
  assert.equal(interact(s), false);
  s.phase = 'echo';
  assert.equal(interact(s), true);
  assert.deepEqual(s.collected, ['becoming', 'remembering']);
});
test('tether is available immediately, checks seals, and survives recall', () => {
  const s = createExpedition();
  s.position = { x: -7, y: 0, z: -4 };
  s.yaw = Math.PI / 2;
  assert.equal(tetherTarget(s), undefined);
  s.phase = 'echo';
  assert.equal(grapple(s), true);
  assert.equal(fold(s), false);
  advance(s, 1);
  assert.ok(distance(s.position, { x: -23, y: 0, z: -4 }) < 0.01);
  recover(s);
  assert.equal(s.tether, null);
  assert.deepEqual(s.position, checkpoint(s));
});
test('settlement and both side ruins are accessible without quests or folding', () => {
  const s = createExpedition();
  walkTo(s, -5, 18);
  walkTo(s, -5, 9);
  walkTo(s, -5, 7);
  walkTo(s, -24, 7);
  walkTo(s, -24, -4);
  walkTo(s, -24, 7);
  walkTo(s, -5, 7);
  walkTo(s, -5, 4);
  walkTo(s, 24, 4);
  walkTo(s, 24, -6);
  walkTo(s, 23, -13);
  assert.equal(interact(s), true);
  assert.deepEqual(s.collected, ['becoming']);
  assert.equal(s.recoveries, 0);
});
test('all relic routes and return home remain playable without a terminal gate', () => {
  const s = createExpedition();
  walkTo(s, 3, 18);
  walkTo(s, 3, -4);
  shift(s);
  walkTo(s, -24, -4);
  interact(s);
  walkTo(s, -7, -4);
  shift(s);
  walkTo(s, 7, -8);
  walkTo(s, 23, -8);
  walkTo(s, 23, -13);
  interact(s);
  walkTo(s, 23, -8);
  walkTo(s, 0, -8);
  shift(s);
  walkTo(s, 0, -19);
  shift(s);
  walkTo(s, 0, -30);
  shift(s);
  walkTo(s, 0, -37);
  interact(s);
  recover(s);
  walkTo(s, 0, 23);
  walkTo(s, 3, 23);
  assert.equal(s.collected.length, 3);
  const elapsed = s.elapsed;
  advance(s);
  assert.ok(s.elapsed > elapsed);
});
function meet(s: Expedition, id: ResidentId) {
  s.position = { ...s.life.residents.find((r) => r.id === id)!.position };
  s.grounded = true;
  assert.equal(interact(s), true);
  assert.equal(s.life.talking, id);
}
test('quests require resident conversations and have independent transactional stages', () => {
  const s = createExpedition();
  assert.equal(converse(s, 'mira', 'help'), false);
  meet(s, 'sen');
  converse(s, 'sen', 'help');
  meet(s, 'mira');
  converse(s, 'mira', 'help');
  assert.equal(canDeliver(s, 'mira'), false);
  assert.equal(converse(s, 'mira', 'help'), false);
  s.life.herbs = 2;
  assert.equal(converse(s, 'mira', 'help'), true);
  assert.equal(s.life.herbs, 0);
  assert.equal(s.life.quests.mira, 2);
  assert.equal(converse(s, 'mira', 'help'), false);
  s.collected.push('becoming');
  assert.equal(converse(s, 'mira', 'help'), true);
  const bond = s.life.bonds.mira;
  assert.equal(converse(s, 'mira', 'help'), false);
  assert.equal(s.life.bonds.mira, bond);
  assert.equal(s.life.quests.sen, 1);
  assert.equal(s.life.quests.ivo, 0);
});
test('Ivo’s story changes the ward, Sen’s story consumes a shared meal, and life continues', () => {
  const s = createExpedition();
  s.collected = MEMORIES.map((m) => m.id);
  meet(s, 'ivo');
  converse(s, 'ivo', 'help');
  converse(s, 'ivo', 'help');
  assert.equal(wardActive(s), false);
  s.life.herbs = 2;
  converse(s, 'ivo', 'help');
  assert.equal(wardActive(s), true);
  assert.equal(s.life.herbs, 0);
  meet(s, 'sen');
  converse(s, 'sen', 'help');
  converse(s, 'sen', 'help');
  assert.equal(converse(s, 'sen', 'help'), false);
  s.life.meals = 1;
  converse(s, 'sen', 'help');
  assert.equal(s.life.meals, 0);
  assert.equal(s.life.quests.sen, 3);
  s.life.tracked = 'sen';
  assert.equal(lifeTarget(s)?.name, 'Sen');
  advance(s);
  assert.ok(s.elapsed > 0);
});
test('mundane activities regrow, consume resources, restore needs and advance mornings', () => {
  const s = createExpedition();
  s.position = { x: -10.8, y: 0, z: 13 };
  assert.equal(useLife(s), true);
  assert.equal(s.life.herbs, 3);
  assert.equal(useLife(s), false);
  s.position = { x: 0, y: 0, z: 8 };
  s.life.hunger = 20;
  assert.equal(useLife(s), true);
  assert.equal(s.life.herbs, 2);
  assert.equal(s.life.meals, 1);
  assert.equal(s.life.hunger, 60);
  s.position = { x: -4, y: 0, z: 20 };
  s.life.energy = 4;
  useLife(s);
  assert.equal(s.life.clock, DAY + 30);
  assert.equal(s.life.energy, 100);
  s.position = { x: -10.8, y: 0, z: 13 };
  assert.equal(useLife(s), true);
  s.position = { x: 0, y: 0, z: -1.5 };
  s.life.herbs = 0;
  assert.equal(useLife(s), false);
  assert.equal(wardActive(s), false);
  s.life.herbs = 1;
  assert.equal(useLife(s), true);
  assert.equal(wardActive(s), true);
  s.life.clock += 91;
  assert.equal(wardActive(s), false);
});
test('social visits are rewarded once per day, including after reload', () => {
  const s = createExpedition();
  meet(s, 'mira');
  converse(s, 'mira', 'chat');
  assert.equal(s.life.bonds.mira, 5);
  assert.equal(converse(s, 'mira', 'chat'), false);
  const storage = memoryStorage();
  save(storage, s, DEFAULT_SETTINGS);
  const restored = load(storage).state;
  meet(restored, 'mira');
  assert.equal(converse(restored, 'mira', 'chat'), false);
  restored.life.clock += DAY;
  assert.equal(converse(restored, 'mira', 'chat'), true);
});
test('residents eat, shelter from night and flee active horrors', () => {
  const s = createExpedition();
  s.life.residents[0].hunger = 40;
  stepLife(s, 0.1, false);
  assert.equal(s.life.residents[0].activity, 'Sharing supper');
  s.life.clock = 200;
  stepLife(s, 0.1, false);
  assert.match(s.life.residents[0].activity, /Sheltering/);
  const old = { ...s.life.residents[0].position };
  stepLife(s, 0.1, false);
  assert.notDeepEqual(s.life.residents[0].position, old);
  s.life.clock = 30;
  s.phase = 'echo';
  s.life.residents[2].position = { x: 0, y: 0, z: 3 };
  s.life.entities[0].position = { x: 0, y: 0, z: 4 };
  stepLife(s, 0.1, false);
  assert.equal(s.life.residents[2].activity, 'Fleeing to the hearth');
  s.life.quests.ivo = 3;
  stepLife(s, 0.1, false);
  assert.notEqual(s.life.residents[2].activity, 'Fleeing to the hearth');
});
test('horrors stalk, harm composure, respect wards, and can be repelled or folded away', () => {
  const s = createExpedition();
  s.position = { x: 0, y: 0, z: -8 };
  s.phase = 'echo';
  s.life.entities[0].position = { x: 0, y: 0, z: -10 };
  advance(s, 1);
  assert.ok(s.life.composure < 100);
  const composure = s.life.composure;
  assert.equal(pulse(s), true);
  assert.equal(pulse(s), false);
  advance(s, 0.5);
  assert.equal(s.life.composure, composure);
  assert.ok(s.life.entities[0].repelled > 0);
  assert.equal(entityActive(s, 1), false);
  s.life.clock = 200;
  assert.equal(entityActive(s, 1), true);
  s.phase = 'matter';
  assert.equal(entityActive(s, 0), false);
  assert.ok(sheltered(s, checkpoint(s)));
  assert.ok(RESIDENTS.every((r) => sheltered(s, r.home)));
  s.life.composure = 0;
  advance(s, 0.1);
  assert.equal(s.recoveries, 1);
  assert.deepEqual(s.position, checkpoint(s));
});
test('save roundtrip retains independent stories, inventory, clock and needs at home', () => {
  const s = createExpedition();
  s.collected = ['unwritten'];
  s.life.quests.sen = 2;
  s.life.tracked = 'sen';
  s.life.herbs = 7;
  s.life.meals = 2;
  s.life.clock = 193;
  s.life.residents[0].hunger = 42;
  s.position = { x: 0, y: -8, z: 60 };
  s.elapsed = 123;
  const storage = memoryStorage();
  save(storage, s, { ...DEFAULT_SETTINGS, quality: 'low' });
  const r = load(storage);
  assert.equal(r.exists, true);
  assert.deepEqual(r.state.position, checkpoint(s));
  assert.equal(r.state.life.quests.sen, 2);
  assert.equal(r.state.life.herbs, 7);
  assert.equal(r.state.life.clock, 193);
  assert.equal(r.state.life.residents[0].hunger, 42);
  assert.equal(r.settings.quality, 'low');
});
test('legacy finished expeditions migrate to an open world without erasing relics or settings', () => {
  const storage = memoryStorage(
    JSON.stringify({
      version: 1,
      collected: MEMORIES.map((m) => m.id),
      phase: 'echo',
      complete: true,
      elapsed: 200,
      recoveries: 2,
      folds: 10,
      settings: { muted: true },
    }),
  );
  const r = load(storage);
  assert.equal(r.exists, true);
  assert.equal(r.state.collected.length, 3);
  assert.equal(r.settings.muted, true);
  const elapsed = r.state.elapsed;
  advance(r.state);
  assert.ok(r.state.elapsed > elapsed);
  assert.match(r.state.message, /living neighbourhood/);
});
test('malformed and impossible sandbox saves fail safely', () => {
  const storage = memoryStorage();
  save(storage, createExpedition(), DEFAULT_SETTINGS);
  const valid = JSON.parse(storage.value!);
  for (const value of [
    '{bad',
    'null',
    JSON.stringify({ ...valid, version: 99 }),
    ...[
      { clock: -1 },
      { herbs: 1.5 },
      { meals: 101 },
      { quests: { mira: 3, ivo: 0, sen: 0 } },
      { tracked: 'unknown' },
      { residents: [] },
      { chattedDay: { mira: 999, ivo: -1, sen: -1 } },
    ].map((p) => JSON.stringify({ ...valid, life: { ...valid.life, ...p } })),
    JSON.stringify({ ...valid, collected: ['becoming', 'becoming'] }),
  ]) {
    const r = load(memoryStorage(value));
    assert.equal(r.exists, false);
    assert.ok(r.warning);
  }
});
test('unavailable storage does not crash play', () => {
  const storage = {
    getItem() {
      throw new Error('denied');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.equal(load(storage).exists, false);
  assert.equal(save(storage, createExpedition(), DEFAULT_SETTINGS), false);
});
