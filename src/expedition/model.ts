import {
  createLife,
  useLife,
  nearbyLife,
  stepLife,
  questText,
  type Life,
} from './life';
import {
  ANCHORS,
  MEMORIES,
  START,
  blocked,
  distance,
  supported,
  type Phase,
  type Point,
} from './world';

export type Settings = {
  muted: boolean;
  reducedMotion: boolean;
  sensitivity: number;
  quality: 'high' | 'low';
};
export type Expedition = {
  phase: Phase;
  collected: string[];
  position: Point;
  velocityY: number;
  yaw: number;
  pitch: number;
  grounded: boolean;
  elapsed: number;
  recoveries: number;
  folds: number;
  life: Life;
  message: string;
  messageTime: number;
  foldCooldown: number;
  tether: { from: Point; to: Point; progress: number } | null;
};
export const DEFAULT_SETTINGS: Settings = {
  muted: false,
  reducedMotion: false,
  sensitivity: 1,
  quality: 'high',
};
export const createExpedition = (): Expedition => ({
  phase: 'matter',
  collected: [],
  position: { ...START },
  velocityY: 0,
  yaw: 0,
  pitch: 0,
  grounded: true,
  elapsed: 0,
  recoveries: 0,
  folds: 0,
  life: createLife(),
  message:
    'Welcome home. Explore freely. E talks or tends; Tab shows neighbours. G flares your lantern.',
  messageTime: 8,
  foldCooldown: 0,
  tether: null,
});
export function announce(s: Expedition, text: string) {
  s.message = text;
  s.messageTime = 6;
}
export function checkpoint(s: Expedition): Point {
  return { ...START };
}
export function recover(s: Expedition) {
  s.position = checkpoint(s);
  s.velocityY = 0;
  s.grounded = true;
  s.tether = null;
  s.phase = 'matter';
  s.life.composure = 100;
  s.life.talking = null;
  s.recoveries++;
  announce(s, 'Back at your hearth. Your belongings and friendships are safe.');
}
export function fold(s: Expedition): boolean {
  if (s.tether || s.foldCooldown > 0) return false;
  const next = s.phase === 'matter' ? 'echo' : 'matter';
  if (blocked(s.position, next)) {
    announce(s, 'Stone occupies this fold. Step clear of the seal.');
    return false;
  }
  s.phase = next;
  s.folds++;
  s.foldCooldown = 0.5;
  announce(
    s,
    next === 'echo'
      ? 'Echo revealed. Cyan paths are solid; amber paths are absent.'
      : 'Matter restored. Amber paths are solid; cyan paths are absent.',
  );
  return true;
}
export function interact(s: Expedition): boolean {
  if (!s.grounded) return false;
  if (useLife(s)) return true;
  const m = MEMORIES.find(
    (m) => !s.collected.includes(m.id) && distance(s.position, m) <= 3,
  );
  if (!m) return false;
  if (s.phase !== m.phase) {
    announce(s, `This memory exists in ${m.phase}. Press Q to fold.`);
    return false;
  }
  s.collected.push(m.id);
  announce(s, m.reward);
  return true;
}
export function tetherTarget(s: Expedition): Point | undefined {
  if (s.tether) return;
  const forward = { x: -Math.sin(s.yaw), z: -Math.cos(s.yaw) };
  return ANCHORS.filter((a) => {
    const d = distance(a, s.position);
    if (d < 3 || d > 18 || !supported(a, s.phase)) return false;
    if (
      ((a.x - s.position.x) * forward.x + (a.z - s.position.z) * forward.z) /
        d <
      0.88
    )
      return false;
    // A tether may cross the void, but never pull through solid architecture.
    for (let t = 0; t <= 1; t += 0.025) {
      const p = {
        x: s.position.x + (a.x - s.position.x) * t,
        y: 0,
        z: s.position.z + (a.z - s.position.z) * t,
      };
      if (blocked(p, s.phase)) return false;
    }
    return true;
  }).sort((a, b) => distance(a, s.position) - distance(b, s.position))[0];
}
export function grapple(s: Expedition): boolean {
  const to = tetherTarget(s);
  if (!to) {
    announce(s, 'Aim toward a clear tether ring within 18 metres.');
    return false;
  }
  s.tether = { from: { ...s.position }, to: { ...to }, progress: 0 };
  s.velocityY = 0;
  announce(s, 'Void tether connected.');
  return true;
}
export type Input = {
  forward: number;
  strafe: number;
  sprint: boolean;
  jump: boolean;
};
export function step(s: Expedition, input: Input, delta: number) {
  // Bound catch-up and substep collision so low frame rates cannot tunnel through seals.
  let remaining = Math.max(0, Math.min(delta, 0.1));
  while (remaining > 0.000001) {
    const dt = Math.min(remaining, 1 / 120);
    remaining -= dt;
    s.elapsed += dt;
    stepLife(s, dt, input.sprint && !!(input.forward || input.strafe));
    if (s.life.composure <= 0) {
      recover(s);
      announce(
        s,
        'The Hollow drove you home. Rest, use G to repel it, or stay within ward light.',
      );
    }
    s.messageTime = Math.max(0, s.messageTime - dt);
    s.foldCooldown = Math.max(0, s.foldCooldown - dt);
    const previous = { ...s.position };
    if (s.tether) {
      const t = s.tether;
      t.progress = Math.min(1, t.progress + dt / 0.85);
      const k = t.progress * t.progress * (3 - 2 * t.progress);
      s.position = {
        x: t.from.x + (t.to.x - t.from.x) * k,
        z: t.from.z + (t.to.z - t.from.z) * k,
        y: t.from.y * (1 - k) + Math.sin(k * Math.PI) * 2.5,
      };
      s.grounded = false;
      if (t.progress === 1) {
        s.tether = null;
        s.grounded = true;
        s.position.y = 0;
      }
    } else {
      const length = Math.max(1, Math.hypot(input.forward, input.strafe));
      const speed =
        input.sprint && s.life.energy > 10 && s.life.hunger > 10 ? 8 : 5;
      const dx =
        ((input.strafe * Math.cos(s.yaw) - input.forward * Math.sin(s.yaw)) /
          length) *
        speed *
        dt;
      const dz =
        ((-input.forward * Math.cos(s.yaw) - input.strafe * Math.sin(s.yaw)) /
          length) *
        speed *
        dt;
      const nextX = { ...s.position, x: s.position.x + dx };
      if (!blocked(nextX, s.phase)) s.position.x = nextX.x;
      const nextZ = { ...s.position, z: s.position.z + dz };
      if (!blocked(nextZ, s.phase)) s.position.z = nextZ.z;
      if (input.jump && s.grounded) {
        s.velocityY = 6;
        s.grounded = false;
      }
      // Jump is an edge-triggered input, consumed once even during substeps.
      input = { ...input, jump: false };
      const floor = supported(s.position, s.phase);
      if (!floor) s.grounded = false;
      if (!s.grounded) {
        s.velocityY -= 18 * dt;
        s.position.y += s.velocityY * dt;
        if (
          floor &&
          previous.y >= -0.05 &&
          s.position.y <= 0 &&
          s.velocityY <= 0
        ) {
          s.position.y = 0;
          s.velocityY = 0;
          s.grounded = true;
        }
      }
      if (s.position.y < -9) recover(s);
    }
  }
}
export function objective(s: Expedition) {
  return s.life.tracked
    ? questText(s, s.life.tracked)
    : 'Make a life in the manifold';
}
export function nearbyPrompt(s: Expedition) {
  const near = nearbyLife(s);
  if (near) return `E · ${near.label}`;
  const m = MEMORIES.find(
    (m) => !s.collected.includes(m.id) && distance(s.position, m) < 3.5,
  );
  if (m)
    return s.phase === m.phase
      ? `E · Gather ${m.name}`
      : `Q · Reveal ${m.name} in ${m.phase}`;
  if (tetherTarget(s)) return 'F · Tether across';
  return 'E · Talk / tend     G · Lantern flare     Tab · Neighbourhood';
}
