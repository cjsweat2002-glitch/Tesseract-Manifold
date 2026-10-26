import { ExpeditionAudio } from './audio';
import { ExpeditionScene } from './scene';
import {
  announce,
  fold,
  grapple,
  interact,
  recover,
  step,
  type Expedition,
  type Settings,
} from './model';
import { save } from './save';
export type Screen = 'title' | 'play' | 'pause' | 'journal' | 'complete';
export type Marker = { x: number; y: number; visible: boolean };
export type Runtime = { state: Expedition; settings: Settings; screen: Screen };
export class ExpeditionController {
  private scene: ExpeditionScene;
  private audio = new ExpeditionAudio();
  private keys = new Set<string>();
  private frame = 0;
  private previous = 0;
  private lastHud = 0;
  private lastSave = 0;
  private lastDraw = 0;
  private renderKey = '';
  private jump = false;
  private dragging = false;
  private locked = false;
  private disposed = false;
  private events = new AbortController();
  constructor(
    private mount: HTMLElement,
    readonly runtime: Runtime,
    private update: (marker: Marker) => void,
    private onScreen: (screen: Screen) => void,
    private onSave: (ok: boolean) => void,
    private onError: (error: string) => void,
  ) {
    this.scene = new ExpeditionScene(mount);
    const options = { signal: this.events.signal };
    window.addEventListener('keydown', this.keydown, options);
    window.addEventListener('keyup', (e) => this.keys.delete(e.code), options);
    window.addEventListener('blur', this.pause, options);
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) this.pause();
      },
      options,
    );
    document.addEventListener(
      'pointerlockchange',
      () => {
        const wasLocked = this.locked;
        this.locked =
          document.pointerLockElement === this.scene.renderer.domElement;
        if (wasLocked && !this.locked) this.pause();
      },
      options,
    );
    document.addEventListener(
      'mousemove',
      (e) => {
        if (runtime.screen !== 'play' || (!this.locked && !this.dragging))
          return;
        runtime.state.yaw -= e.movementX * 0.002 * runtime.settings.sensitivity;
        runtime.state.pitch = Math.max(
          -1.3,
          Math.min(
            1.3,
            runtime.state.pitch -
              e.movementY * 0.002 * runtime.settings.sensitivity,
          ),
        );
      },
      options,
    );
    mount.addEventListener(
      'pointerdown',
      () => {
        if (runtime.screen !== 'play') return;
        this.dragging = true;
        this.captureMouse();
      },
      options,
    );
    window.addEventListener(
      'pointerup',
      () => {
        this.dragging = false;
      },
      options,
    );
    this.scene.renderer.domElement.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.pause();
        onError(
          'The graphics context was lost. Reload to resume from your saved memory.',
        );
      },
      options,
    );
    window.addEventListener('pagehide', () => this.persist(), options);
    this.frame = requestAnimationFrame(this.tick);
  }
  captureMouse() {
    try {
      const request = this.scene.renderer.domElement.requestPointerLock();
      request?.catch(() =>
        announce(
          this.runtime.state,
          'Mouse capture unavailable. Drag to look, or use the arrow keys.',
        ),
      );
    } catch {
      announce(this.runtime.state, 'Drag to look, or use the arrow keys.');
    }
  }
  setScreen(screen: Screen) {
    this.runtime.screen = screen;
    this.keys.clear();
    this.jump = false;
    this.dragging = false;
    if (screen !== 'play') {
      if (document.pointerLockElement === this.scene.renderer.domElement)
        document.exitPointerLock();
      if (screen !== 'complete') this.audio.pause();
    }
    this.onScreen(screen);
  }
  play() {
    this.setScreen('play');
    void this.audio.start(this.runtime.settings.muted);
    this.captureMouse();
  }
  pause = () => {
    if (this.runtime.screen === 'play') {
      this.setScreen('pause');
      this.persist();
    }
  };
  persist() {
    let ok = false;
    try {
      ok = save(window.localStorage, this.runtime.state, this.runtime.settings);
    } catch {
      /* Storage may be denied. */
    }
    this.onSave(ok);
  }
  settingsChanged() {
    this.audio.mute(this.runtime.settings.muted);
    this.persist();
  }
  private keydown = (event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement
    )
      return;
    if (this.runtime.screen !== 'play') return;
    const controls = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'KeyQ',
      'KeyE',
      'KeyF',
      'KeyR',
      'Space',
      'Tab',
      'Escape',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ];
    if (controls.includes(event.code)) event.preventDefault();
    this.keys.add(event.code);
    if (event.repeat) return;
    const s = this.runtime.state;
    switch (event.code) {
      case 'Escape':
        this.pause();
        break;
      case 'Tab':
        this.setScreen('journal');
        this.persist();
        break;
      case 'Space':
        this.jump = true;
        break;
      case 'KeyQ':
        if (fold(s)) this.audio.cue('fold');
        this.persist();
        break;
      case 'KeyE':
        if (interact(s)) {
          this.audio.cue('memory');
          this.persist();
        }
        break;
      case 'KeyF':
        if (grapple(s)) this.audio.cue('tether');
        break;
      case 'KeyR':
        recover(s);
        this.persist();
        break;
    }
  };
  private tick = (time: number) => {
    if (this.disposed) return;
    const dt = this.previous ? Math.min((time - this.previous) / 1000, 0.1) : 0;
    this.previous = time;
    const { state: s, settings, screen } = this.runtime;
    if (screen === 'play') {
      s.yaw +=
        (Number(this.keys.has('ArrowLeft')) -
          Number(this.keys.has('ArrowRight'))) *
        dt *
        1.6;
      s.pitch = Math.max(
        -1.3,
        Math.min(
          1.3,
          s.pitch +
            (Number(this.keys.has('ArrowUp')) -
              Number(this.keys.has('ArrowDown'))) *
              dt,
        ),
      );
      const recoveries = s.recoveries;
      step(
        s,
        {
          forward:
            Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS')),
          strafe: Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')),
          sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
          jump: this.jump,
        },
        dt,
      );
      this.jump = false;
      if (s.recoveries !== recoveries) this.persist();
      if (s.complete) {
        this.audio.cue('return');
        this.setScreen('complete');
        this.persist();
      }
      if (time - this.lastSave > 5000) {
        this.lastSave = time;
        this.persist();
      }
    }
    const renderKey = `${screen}:${s.phase}:${s.collected.length}:${JSON.stringify(settings)}`;
    const animated =
      screen === 'play' || (screen === 'title' && !settings.reducedMotion);
    if (
      !document.hidden &&
      (this.scene.needsRender ||
        this.renderKey !== renderKey ||
        (animated &&
          time - this.lastDraw >= (settings.quality === 'low' ? 32 : 15)))
    ) {
      this.scene.render(
        s,
        settings,
        screen === 'title' ? 'title' : 'game',
        settings.reducedMotion
          ? 0
          : screen === 'title'
            ? time / 1000
            : s.elapsed,
      );
      this.lastDraw = time;
      this.renderKey = renderKey;
    }
    if (time - this.lastHud > 100) {
      this.lastHud = time;
      this.update(this.scene.marker(s));
    }
    this.frame = requestAnimationFrame(this.tick);
  };
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.events.abort();
    if (document.pointerLockElement === this.scene.renderer.domElement)
      document.exitPointerLock();
    this.scene.dispose();
    this.audio.dispose();
  }
}
