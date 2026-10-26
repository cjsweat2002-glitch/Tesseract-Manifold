import {
  checkpoint,
  createExpedition,
  DEFAULT_SETTINGS,
  type Expedition,
  type Settings,
} from './model';
import { MEMORIES } from './world';
import { RESIDENTS, type ResidentId } from './life';
export const SAVE_KEY = 'tesseract.expedition.v1';
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type Saved = {
  state: Expedition;
  settings: Settings;
  exists: boolean;
  warning: string;
};
const finite = (v: unknown, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
export function load(storage: StorageLike): Saved {
  const fallback = {
    state: createExpedition(),
    settings: { ...DEFAULT_SETTINGS },
    exists: false,
    warning: '',
  };
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (
      ![1, 2].includes(data.version) ||
      !Array.isArray(data.collected) ||
      data.collected.length > 3 ||
      !data.collected.every((id: unknown) =>
        MEMORIES.some((m) => m.id === id),
      ) ||
      !['matter', 'echo'].includes(data.phase) ||
      new Set(data.collected).size !== data.collected.length ||
      !finite(data.elapsed, 1e8) ||
      !finite(data.recoveries, 1e7) ||
      !finite(data.folds, 1e7)
    )
      throw new Error('Invalid save');
    const state = createExpedition();
    Object.assign(state, {
      collected: [...data.collected],
      phase: data.phase,
      elapsed: data.elapsed,
      recoveries: data.recoveries,
      folds: data.folds,
    });
    // Resume on an authored safe checkpoint, never in a missing bridge or a solid seal.
    state.position = checkpoint(state);
    state.phase = 'matter';
    if (data.version === 2) {
      const l = data.life;
      if (
        !l ||
        !finite(l.clock, 1e8) ||
        !['hunger', 'energy', 'composure'].every((k) => finite(l[k], 100)) ||
        !['herbs', 'meals'].every(
          (k) => Number.isInteger(l[k]) && finite(l[k], 99),
        ) ||
        !['gardenReady', 'wardUntil'].every((k) => finite(l[k], 1e8)) ||
        !RESIDENTS.every(
          ({ id }) =>
            Number.isInteger(l.quests?.[id]) &&
            finite(l.quests[id], 3) &&
            finite(l.bonds?.[id], 100) &&
            Number.isInteger(l.chattedDay?.[id]) &&
            l.chattedDay[id] >= -1 &&
            l.chattedDay[id] <= Math.floor(l.clock / 300),
        ) ||
        !(l.tracked === null || RESIDENTS.some((r) => r.id === l.tracked))
      )
        throw new Error('Invalid neighbourhood');
      // Impossible quest rewards must not activate permanent world upgrades.
      if (
        (l.quests.mira === 3 && !state.collected.includes('becoming')) ||
        (l.quests.ivo >= 2 && !state.collected.includes('remembering')) ||
        (l.quests.sen >= 2 && !state.collected.includes('unwritten'))
      )
        throw new Error('Invalid quest');
      for (const k of [
        'clock',
        'hunger',
        'energy',
        'composure',
        'herbs',
        'meals',
        'gardenReady',
        'wardUntil',
      ] as const)
        state.life[k] = l[k];
      for (const { id } of RESIDENTS) {
        state.life.quests[id] = l.quests[id];
        state.life.bonds[id] = l.bonds[id];
        state.life.chattedDay[id] = l.chattedDay[id];
      }
      state.life.tracked = l.tracked as ResidentId | null;
      // Residents and threats restart at safe authored places; needs persist.
      if (
        !Array.isArray(l.residents) ||
        l.residents.length !== RESIDENTS.length ||
        !l.residents.every(
          (r: any, i: number) =>
            r.id === RESIDENTS[i].id &&
            finite(r.hunger, 100) &&
            finite(r.comfort, 100),
        )
      )
        throw new Error('Invalid residents');
      state.life.residents.forEach((r, i) => {
        r.hunger = l.residents[i].hunger;
        r.comfort = l.residents[i].comfort;
      });
    }
    state.message =
      data.version === 1
        ? 'Your archive memories are safe. Welcome to a living neighbourhood — the world stays open.'
        : 'Welcome home. Your neighbourhood and friendships are restored.';
    const settings = { ...DEFAULT_SETTINGS };
    const v = data.settings;
    if (v && typeof v === 'object') {
      if (typeof v.muted === 'boolean') settings.muted = v.muted;
      if (typeof v.reducedMotion === 'boolean')
        settings.reducedMotion = v.reducedMotion;
      if (finite(v.sensitivity, 2) && v.sensitivity >= 0.2)
        settings.sensitivity = v.sensitivity;
      if (v.quality === 'high' || v.quality === 'low')
        settings.quality = v.quality;
    }
    return { state, settings, exists: true, warning: '' };
  } catch {
    return {
      ...fallback,
      warning:
        'Your save could not be read. A fresh neighbourhood is available.',
    };
  }
}
export function save(
  storage: StorageLike,
  state: Expedition,
  settings: Settings,
): boolean {
  try {
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 2,
        collected: state.collected,
        phase: state.phase,
        life: {
          clock: state.life.clock,
          hunger: state.life.hunger,
          energy: state.life.energy,
          composure: state.life.composure,
          herbs: state.life.herbs,
          meals: state.life.meals,
          gardenReady: state.life.gardenReady,
          wardUntil: state.life.wardUntil,
          quests: state.life.quests,
          bonds: state.life.bonds,
          chattedDay: state.life.chattedDay,
          tracked: state.life.tracked,
          residents: state.life.residents.map(({ id, hunger, comfort }) => ({
            id,
            hunger,
            comfort,
          })),
        },
        elapsed: state.elapsed,
        recoveries: state.recoveries,
        folds: state.folds,
        settings,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
