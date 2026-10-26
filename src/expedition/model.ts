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
  complete: boolean;
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
  complete: false,
  message: 'The path is missing. Press Q to reveal its echo.',
  messageTime: 8,
  foldCooldown: 0,
  tether: null,
});
export function announce(s: Expedition, text: string) {
  s.message = text;
  s.messageTime = 6;
}
export function checkpoint(s: Expedition): Point {
  const memory = MEMORIES[s.collected.length - 1];
  return memory ? { x: memory.x, y: 0, z: memory.z + 1.8 } : { ...START };
}
export function recover(s: Expedition) {
  s.position = checkpoint(s);
  s.velocityY = 0;
  s.grounded = true;
  s.tether = null;
  s.phase = MEMORIES[s.collected.length - 1]?.phase ?? 'matter';
  s.recoveries++;
  announce(s, 'Recalled to your last memory. The archive is safe.');
}
export function fold(s: Expedition): boolean {
  if (s.complete || s.tether || s.foldCooldown > 0) return false;
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
  if (s.complete || !s.grounded) return false;
  const m = MEMORIES[s.collected.length];
  if (!m) {
    announce(s, 'Carry the archive through the arrival gate to the south.');
    return false;
  }
  if (distance(s.position, m) > 3) {
    announce(s, `Follow the marker to ${m.name}.`);
    return false;
  }
  if (s.phase !== m.phase) {
    announce(s, `This memory exists in ${m.phase}. Press Q to fold.`);
    return false;
  }
  s.collected.push(m.id);
  announce(s, m.reward);
  return true;
}
export function tetherTarget(s: Expedition): Point | undefined {
  if (!s.collected.length || s.tether || s.complete) return;
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
    announce(
      s,
      s.collected.length
        ? 'Aim toward a clear tether ring within 18 metres.'
        : 'Recover the first memory to restore your void tether.',
    );
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
  if (s.complete) return;
  // Bound catch-up and substep collision so low frame rates cannot tunnel through seals.
  let remaining = Math.max(0, Math.min(delta, 0.1));
  while (remaining > 0.000001) {
    const dt = Math.min(remaining, 1 / 120);
    remaining -= dt;
    s.elapsed += dt;
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
      const speed = input.sprint ? 8 : 5;
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
    if (
      s.collected.length === 3 &&
      s.grounded &&
      Math.abs(s.position.x) < 2.3 &&
      previous.z < 21 &&
      s.position.z >= 21
    ) {
      s.complete = true;
      announce(s, 'The archive has a witness. You brought them home.');
    }
  }
}
export function objective(s: Expedition) {
  return s.collected.length < 3
    ? `Recover ${MEMORIES[s.collected.length].name}`
    : 'Return through the arrival gate';
}
export function nearbyPrompt(s: Expedition) {
  const m = MEMORIES[s.collected.length];
  if (m && distance(s.position, m) < 3.5)
    return s.phase === m.phase
      ? `E · Recover ${m.name}`
      : `Q · Reveal this memory in ${m.phase}`;
  if (tetherTarget(s)) return 'F · Tether across';
  if (!s.collected.length && s.position.z > 10)
    return s.phase === 'matter'
      ? 'Q · Fold reality to reveal the bridge'
      : 'WASD · Cross the echo bridge, then follow the west marker';
  return '';
}
