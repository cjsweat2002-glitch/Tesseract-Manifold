import { MEMORIES, distance, blocked, type Point } from './world';
import type { Expedition } from './model';

export const RESIDENTS = [
  {
    id: 'mira',
    name: 'Mira',
    role: 'Gardener',
    color: 0xa2c797,
    home: { x: -10, y: 0, z: 22 },
    work: { x: -6, y: 0, z: 13 },
    greeting: 'Even between dimensions, someone has to water the garden.',
  },
  {
    id: 'ivo',
    name: 'Ivo',
    role: 'Hearth keeper',
    color: 0xe8b879,
    home: { x: 10, y: 0, z: 22 },
    work: { x: 6, y: 0, z: 13 },
    greeting:
      'Tea, repairs, a quiet evening. That is all I want. The things in the fold want otherwise.',
  },
  {
    id: 'sen',
    name: 'Sen',
    role: 'Archivist',
    color: 0xa6b8eb,
    home: { x: 4, y: 0, z: 22 },
    work: { x: 0, y: 0, z: 3 },
    greeting:
      'These ruins are our neighbourhood, not a tomb. I want to remember the people who lived here.',
  },
] as const;
export type ResidentId = (typeof RESIDENTS)[number]['id'];
export const STATIONS = [
  {
    id: 'garden',
    name: 'Community garden',
    action: 'Harvest herbs',
    x: -9,
    y: 0,
    z: 13,
  },
  {
    id: 'kitchen',
    name: 'Communal kitchen',
    action: 'Cook & eat • 1 herb',
    x: 0,
    y: 0,
    z: 6,
  },
  {
    id: 'bed',
    name: 'Your hearth',
    action: 'Rest until morning',
    x: -4,
    y: 0,
    z: 21,
  },
  {
    id: 'ward',
    name: 'Hearth ward',
    action: 'Tend ward • 1 herb',
    x: 0,
    y: 0,
    z: 0,
  },
] as const;
export type Life = {
  clock: number;
  hunger: number;
  energy: number;
  composure: number;
  herbs: number;
  meals: number;
  gardenReady: number;
  wardUntil: number;
  pulseCooldown: number;
  quests: Record<ResidentId, number>;
  bonds: Record<ResidentId, number>;
  chattedDay: Record<ResidentId, number>;
  tracked: ResidentId | null;
  talking: ResidentId | null;
  residents: {
    id: ResidentId;
    position: Point;
    activity: string;
    hunger: number;
    comfort: number;
  }[];
  entities: { position: Point; repelled: number }[];
};
export const DAY = 300;
export const createLife = (): Life => ({
  clock: 30,
  hunger: 85,
  energy: 90,
  composure: 100,
  herbs: 0,
  meals: 0,
  gardenReady: 0,
  wardUntil: 0,
  pulseCooldown: 0,
  quests: { mira: 0, ivo: 0, sen: 0 },
  bonds: { mira: 0, ivo: 0, sen: 0 },
  chattedDay: { mira: -1, ivo: -1, sen: -1 },
  tracked: null,
  talking: null,
  residents: RESIDENTS.map((r) => ({
    id: r.id,
    position: { ...r.work },
    activity: 'Working',
    hunger: 80,
    comfort: 100,
  })),
  entities: [
    { position: { x: -26, y: 0, z: -6 }, repelled: 0 },
    { position: { x: 4, y: 0, z: -35 }, repelled: 0 },
  ],
});
export const isNight = (s: Expedition) => s.life.clock % DAY >= 190;
export const dayLabel = (s: Expedition) =>
  `Day ${Math.floor(s.life.clock / DAY) + 1} · ${isNight(s) ? 'Night' : s.life.clock % DAY >= 150 ? 'Dusk' : 'Daylight'}`;
export const wardActive = (s: Expedition) =>
  s.life.quests.ivo === 3 || s.life.wardUntil > s.life.clock;
export const sheltered = (s: Expedition, p: Point) =>
  distance(p, { x: 0, y: 0, z: 19 }) < 8 ||
  RESIDENTS.some((r) => distance(p, r.home) < 3.5) ||
  (wardActive(s) && distance(p, STATIONS[3]) < 18);
export const entityActive = (s: Expedition, index: number) =>
  index === 0 ? s.phase === 'echo' : isNight(s);
const say = (s: Expedition, text: string) => {
  s.message = text;
  s.messageTime = 7;
};
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export function questText(s: Expedition, id: ResidentId) {
  const stage = s.life.quests[id];
  if (stage === 3)
    return {
      mira: 'The garden flourishes. Herbs regrow faster.',
      ivo: 'The plaza ward is permanent. Neighbours can work after dark.',
      sen: 'The archive has a living history. Our mural is lit.',
    }[id];
  return {
    mira:
      stage < 2
        ? 'Bring 2 herbs from the community garden for Mira’s seedlings.'
        : 'Find the seed memory in the eastern Matter ruin and bring it to Mira.',
    ivo:
      stage < 2
        ? 'Bring Ivo the coil memory from the western Echo ruin.'
        : 'Bring Ivo 2 herbs to bind the coil into a permanent plaza ward.',
    sen:
      stage < 2
        ? 'Bring Sen the record from the northern Echo archive.'
        : 'Cook a meal at the communal kitchen, then share it with Sen.',
  }[id];
}
export function canDeliver(s: Expedition, id: ResidentId) {
  const stage = s.life.quests[id];
  if (stage !== 1 && stage !== 2) return false;
  if (id === 'mira')
    return stage === 1 ? s.life.herbs >= 2 : s.collected.includes('becoming');
  if (id === 'ivo')
    return stage === 1
      ? s.collected.includes('remembering')
      : s.life.herbs >= 2;
  return stage === 1 ? s.collected.includes('unwritten') : s.life.meals >= 1;
}
/** Conversation actions are checked at the resident, and rewards are transactional and once-only. */
export function converse(
  s: Expedition,
  id: ResidentId,
  action: 'help' | 'chat',
) {
  const resident = s.life.residents.find((r) => r.id === id)!;
  if (
    s.life.talking !== id ||
    !s.grounded ||
    distance(s.position, resident.position) > 3
  )
    return false;
  if (action === 'chat') {
    const day = Math.floor(s.life.clock / DAY);
    if (s.life.chattedDay[id] === day) {
      say(s, 'We have caught up today. Come by again tomorrow.');
      return false;
    }
    s.life.chattedDay[id] = day;
    s.life.bonds[id] = clamp(s.life.bonds[id] + 5);
    s.life.composure = clamp(s.life.composure + 15);
    resident.comfort = clamp(resident.comfort + 20);
    say(
      s,
      `${RESIDENTS.find((r) => r.id === id)!.name}: A familiar voice makes this place feel like home.`,
    );
    return true;
  }
  if (s.life.quests[id] === 0) {
    s.life.quests[id] = 1;
    s.life.tracked = id;
    say(s, questText(s, id));
    return true;
  }
  if (!canDeliver(s, id)) return false;
  if (
    (id === 'mira' && s.life.quests[id] === 1) ||
    (id === 'ivo' && s.life.quests[id] === 2)
  )
    s.life.herbs -= 2;
  if (id === 'sen' && s.life.quests[id] === 2) s.life.meals--;
  s.life.quests[id]++;
  s.life.bonds[id] = clamp(s.life.bonds[id] + 20);
  say(s, questText(s, id));
  return true;
}
export function lifeTarget(
  s: Expedition,
): (Point & { name: string; numeral: string }) | null {
  const id = s.life.tracked;
  if (!id) return null;
  const r = s.life.residents.find((r) => r.id === id)!;
  let target: Point & { name: string } = {
    ...r.position,
    name: RESIDENTS.find((r) => r.id === id)!.name,
  };
  const stage = s.life.quests[id];
  if (stage > 0 && stage < 3 && !canDeliver(s, id)) {
    if ((id === 'mira' && stage === 1) || (id === 'ivo' && stage === 2))
      target = STATIONS[0];
    else if (id === 'sen' && stage === 2)
      target = s.life.herbs ? STATIONS[1] : STATIONS[0];
    else target = MEMORIES[id === 'ivo' ? 0 : id === 'mira' ? 1 : 2];
  }
  return { ...target, numeral: '◇' };
}
export function nearbyLife(s: Expedition) {
  const options = [
    ...s.life.residents.map((r) => ({
      kind: 'resident' as const,
      id: r.id,
      point: r.position,
      label: `Talk to ${RESIDENTS.find((d) => d.id === r.id)!.name}`,
    })),
    ...STATIONS.map((p) => ({
      kind: 'station' as const,
      id: p.id,
      point: p,
      label:
        p.id === 'garden' && s.life.clock < s.life.gardenReady
          ? `Herbs regrow in ${Math.ceil(s.life.gardenReady - s.life.clock)}s`
          : p.action,
    })),
  ];
  return options
    .filter((o) => distance(s.position, o.point) <= 2.6)
    .sort(
      (a, b) => distance(s.position, a.point) - distance(s.position, b.point),
    )[0];
}
export function useLife(s: Expedition): boolean {
  const near = nearbyLife(s);
  if (!near || !s.grounded) return false;
  if (near.kind === 'resident') {
    s.life.talking = near.id as ResidentId;
    return true;
  }
  const l = s.life;
  switch (near.id) {
    case 'garden':
      if (l.clock < l.gardenReady) {
        say(s, near.label);
        return false;
      }
      if (l.herbs > 97) {
        say(s, 'Your herb basket is full. Cook or share some first.');
        return false;
      }
      l.herbs += 3;
      l.gardenReady = l.clock + (l.quests.mira === 3 ? 25 : 50);
      say(
        s,
        'Gathered 3 herbs. Cook at the kitchen, share with a neighbour, or tend the ward.',
      );
      break;
    case 'kitchen':
      if (!l.herbs || l.meals >= 99) {
        say(
          s,
          l.meals >= 99
            ? 'Your pantry is full. Share a meal with Sen.'
            : 'Gather an herb at the garden first.',
        );
        return false;
      }
      l.herbs--;
      l.meals++;
      l.hunger = clamp(l.hunger + 40);
      l.energy = clamp(l.energy + 10);
      say(s, 'A warm meal, and a portion saved to share. Hunger restored.');
      break;
    case 'bed':
      l.clock = (Math.floor(l.clock / DAY) + 1) * DAY + 30;
      l.energy = 100;
      l.composure = 100;
      l.entities = createLife().entities;
      say(
        s,
        'Morning at the hearth. The garden has grown; your neighbours begin another day.',
      );
      break;
    case 'ward':
      if (l.quests.ivo === 3) {
        say(s, 'Ivo’s repaired ward keeps the plaza safe permanently.');
        return false;
      }
      if (!l.herbs) {
        say(
          s,
          'The ward needs 1 herb. Its light shelters the plaza for 90 seconds.',
        );
        return false;
      }
      l.herbs--;
      l.wardUntil = l.clock + 90;
      say(
        s,
        'The plaza ward is lit for 90 seconds. Its light drives the entities away.',
      );
      break;
  }
  return true;
}
export function pulse(s: Expedition) {
  if (s.life.pulseCooldown > 0 || s.life.energy < 10) {
    say(
      s,
      'Lantern needs 10 energy and 6 seconds between pulses. Rest at your hearth.',
    );
    return false;
  }
  s.life.energy -= 10;
  s.life.pulseCooldown = 6;
  let hits = 0;
  s.life.entities.forEach((e, i) => {
    if (entityActive(s, i) && distance(s.position, e.position) < 12) {
      e.repelled = 8;
      hits++;
    }
  });
  say(
    s,
    hits
      ? 'Lantern flare. The entities retreat for 8 seconds — reach a ward or change folds.'
      : 'Lantern flare. No entity within 12 metres.',
  );
  return true;
}
function moveToward(
  position: Point,
  target: Point,
  speed: number,
  dt: number,
  phase: Expedition['phase'],
) {
  const d = distance(position, target);
  if (d < 0.1) return;
  const k = Math.min(1, (speed * dt) / d);
  const x = { ...position, x: position.x + (target.x - position.x) * k };
  if (!blocked(x, phase)) position.x = x.x;
  const z = { ...position, z: position.z + (target.z - position.z) * k };
  if (!blocked(z, phase)) position.z = z.z;
}
/** Routines and hostile behaviour share the world clock; menus pause the entire simulation. */
export function stepLife(s: Expedition, dt: number, sprint: boolean) {
  const l = s.life;
  l.clock += dt;
  l.hunger = clamp(l.hunger - dt * 0.035);
  l.energy = clamp(l.energy - dt * (sprint ? 0.13 : 0.018));
  l.pulseCooldown = Math.max(0, l.pulseCooldown - dt);
  l.entities.forEach((e, i) => {
    e.repelled = Math.max(0, e.repelled - dt);
    if (!entityActive(s, i)) return;
    const victims = [s.position, ...l.residents.map((r) => r.position)].filter(
      (p) => !sheltered(s, p),
    );
    const target = victims.sort(
      (a, b) => distance(e.position, a) - distance(e.position, b),
    )[0];
    if (e.repelled > 0 || sheltered(s, e.position)) {
      // Spectral entities retreat toward the outer ruins, never remove player progress.
      moveToward(e.position, { x: i ? 15 : -26, y: 0, z: -35 }, 4, dt, s.phase);
    } else if (target && distance(e.position, target) < 28)
      moveToward(e.position, target, i ? 2.3 : 2, dt, s.phase);
    if (
      !s.tether &&
      !sheltered(s, s.position) &&
      e.repelled === 0 &&
      distance(e.position, s.position) < 2.3
    ) {
      l.composure = clamp(l.composure - dt * 23);
    }
  });
  if (sheltered(s, s.position)) l.composure = clamp(l.composure + dt * 5);
  l.residents.forEach((r, i) => {
    const def = RESIDENTS[i];
    const frightened = l.entities.some(
      (e, j) =>
        entityActive(s, j) &&
        !e.repelled &&
        distance(e.position, r.position) < 10 &&
        !sheltered(s, r.position),
    );
    r.hunger = clamp(r.hunger - dt * 0.12);
    r.comfort = clamp(r.comfort + dt * (frightened ? -8 : 2));
    const supper =
      r.hunger < 45 || (l.clock % DAY >= 135 && l.clock % DAY < 185);
    r.activity = frightened
      ? 'Fleeing to the hearth'
      : isNight(s) && !wardActive(s)
        ? 'Sheltering for the night'
        : supper
          ? 'Sharing supper'
          : ['Tending seedlings', 'Repairing lanterns', 'Reading the archive'][
              i
            ];
    const target =
      frightened || (isNight(s) && !wardActive(s))
        ? def.home
        : supper
          ? { x: -3 + i * 3, y: 0, z: 8 }
          : def.work;
    moveToward(r.position, target, frightened ? 3.5 : 1.3, dt, s.phase);
    if (supper && distance(r.position, target) < 1)
      r.hunger = clamp(r.hunger + dt * 4);
  });
}
