import {
  checkpoint,
  createExpedition,
  DEFAULT_SETTINGS,
  type Expedition,
  type Settings,
} from './model';
import { MEMORIES } from './world';
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
      data.version !== 1 ||
      !Array.isArray(data.collected) ||
      data.collected.length > 3 ||
      !data.collected.every(
        (id: unknown, i: number) => id === MEMORIES[i].id,
      ) ||
      !['matter', 'echo'].includes(data.phase) ||
      typeof data.complete !== 'boolean' ||
      (data.complete && data.collected.length !== 3) ||
      !finite(data.elapsed, 1e8) ||
      !finite(data.recoveries, 1e7) ||
      !finite(data.folds, 1e7)
    )
      throw new Error('Invalid save');
    const state = createExpedition();
    Object.assign(state, {
      collected: [...data.collected],
      phase: data.phase,
      complete: data.complete,
      elapsed: data.elapsed,
      recoveries: data.recoveries,
      folds: data.folds,
    });
    // Resume on an authored safe checkpoint, never in a missing bridge or a solid seal.
    state.position = checkpoint(state);
    state.phase = MEMORIES[state.collected.length - 1]?.phase ?? 'matter';
    if (state.complete) state.position = { x: 0, y: 0, z: 22 };
    state.message = 'Memory restored. Continue from your last safe anchor.';
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
      warning: 'Your save could not be read. A fresh expedition is available.',
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
        version: 1,
        collected: state.collected,
        phase: state.phase,
        complete: state.complete,
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
