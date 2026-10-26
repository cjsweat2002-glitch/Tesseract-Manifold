/** The same authored geometry drives rendering, collision, and the expedition map. */
export type Phase = 'matter' | 'echo';
export type Point = { x: number; y: number; z: number };
export type Slab = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  phase?: Phase;
};
export const PLATFORMS: Slab[] = [
  { id: 'Arrival', x: 0, z: 18, width: 16, depth: 16 },
  { id: 'Threshold', x: 0, z: 9, width: 5, depth: 4, phase: 'echo' },
  { id: 'Atrium', x: 0, z: -2, width: 22, depth: 20 },
  { id: 'West fold', x: -15, z: -4, width: 10, depth: 4, phase: 'echo' },
  { id: 'The Remembering', x: -23, z: -4, width: 12, depth: 12 },
  { id: 'East fold', x: 15, z: -8, width: 10, depth: 4, phase: 'matter' },
  { id: 'The Becoming', x: 23, z: -10, width: 12, depth: 14 },
  { id: 'Near fold', x: 0, z: -14, width: 4, depth: 8, phase: 'echo' },
  { id: 'Stillpoint', x: 0, z: -19, width: 7, depth: 6 },
  { id: 'Far fold', x: 0, z: -25, width: 4, depth: 8, phase: 'matter' },
  { id: 'The Unwritten', x: 0, z: -35, width: 16, depth: 12 },
];
export const WALLS: (Slab & { height: number })[] = [
  {
    id: 'West seal',
    x: -20,
    z: -4,
    width: 1,
    depth: 11,
    height: 4,
    phase: 'matter',
  },
  {
    id: 'East seal',
    x: 23,
    z: -9,
    width: 11,
    depth: 1,
    height: 4,
    phase: 'echo',
  },
  {
    id: 'Archive seal',
    x: 0,
    z: -32,
    width: 15,
    depth: 1,
    height: 5,
    phase: 'matter',
  },
  { id: 'Atrium pillar L', x: -7, z: 1, width: 2, depth: 2, height: 7 },
  { id: 'Atrium pillar R', x: 7, z: 1, width: 2, depth: 2, height: 7 },
];
export const MEMORIES = [
  {
    id: 'remembering',
    name: 'The Remembering',
    x: -24,
    y: 0,
    z: -4,
    phase: 'echo' as Phase,
    numeral: 'I',
    title: 'A world folded inward',
    text: 'We did not build the manifold. We taught it to remember us. Every empty space is a room seen from the wrong direction.',
    reward: 'Void tether restored. Aim at a ring and press F to cross a gap.',
  },
  {
    id: 'becoming',
    name: 'The Becoming',
    x: 23,
    y: 0,
    z: -13,
    phase: 'matter' as Phase,
    numeral: 'II',
    title: 'The shape of absence',
    text: 'Stone and echo occupy the same place, but never the same moment. The architects crossed the silence between them and called it home.',
    reward:
      'The northern archive is listening. Change folds at the Stillpoint.',
  },
  {
    id: 'unwritten',
    name: 'The Unwritten',
    x: 0,
    y: 0,
    z: -37,
    phase: 'echo' as Phase,
    numeral: 'III',
    title: 'Someone must return',
    text: 'A memory without a witness is only light. Carry us through the threshold. Let there be one place in the universe that knows we were here.',
    reward:
      'The arrival gate is awake. Retrace your path and carry the archive home.',
  },
];
export const ANCHORS: Point[] = [
  { x: 0, y: 0, z: 14 },
  { x: -7, y: 0, z: -4 },
  { x: -23, y: 0, z: -4 },
  { x: 7, y: 0, z: -8 },
  { x: 23, y: 0, z: -6 },
  { x: 0, y: 0, z: -8 },
  { x: 0, y: 0, z: -19 },
  { x: 0, y: 0, z: -30 },
];
export const START: Point = { x: 0, y: 0, z: 18 };
export const activeIn = (slab: Slab, phase: Phase) =>
  !slab.phase || slab.phase === phase;
export const inside = (p: Pick<Point, 'x' | 'z'>, slab: Slab, margin = 0) =>
  Math.abs(p.x - slab.x) < slab.width / 2 + margin &&
  Math.abs(p.z - slab.z) < slab.depth / 2 + margin;
export const supported = (p: Point, phase: Phase) =>
  PLATFORMS.some((s) => activeIn(s, phase) && inside(p, s));
export const blocked = (p: Point, phase: Phase) =>
  WALLS.some(
    (s) =>
      activeIn(s, phase) &&
      p.y < s.height &&
      p.y + 1.7 > 0 &&
      inside(p, s, 0.35),
  );
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Rotate XW and YZ, then perspective-project all sixteen distinct 4D vertices. */
export function projectTesseract(angle: number): Point[] {
  return Array.from({ length: 16 }, (_, i) => {
    const x = i & 1 ? 1 : -1,
      y = i & 2 ? 1 : -1,
      z = i & 4 ? 1 : -1,
      w = i & 8 ? 1 : -1;
    const xx = x * Math.cos(angle) - w * Math.sin(angle);
    const ww = x * Math.sin(angle) + w * Math.cos(angle);
    const a = angle * 0.63,
      scale = 3 / (3 - ww);
    return {
      x: xx * scale,
      y: (y * Math.cos(a) - z * Math.sin(a)) * scale,
      z: (y * Math.sin(a) + z * Math.cos(a)) * scale,
    };
  });
}
export const TESSERACT_EDGES = Array.from({ length: 16 }, (_, i) =>
  Array.from({ length: 4 }, (_, b) => [i, i ^ (1 << b)]).filter(
    ([a, b]) => a < b,
  ),
).flat();
