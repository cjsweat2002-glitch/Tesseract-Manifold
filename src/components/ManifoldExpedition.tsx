import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  ChevronRight,
  Crosshair,
  Diamond,
  MoveUpRight,
  Pause,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ExpeditionController,
  type Marker,
  type Runtime,
  type Screen,
} from '../expedition/controller';
import {
  createExpedition,
  DEFAULT_SETTINGS,
  nearbyPrompt,
  objective,
  type Settings,
} from '../expedition/model';
import { load } from '../expedition/save';
import { MEMORIES, PLATFORMS, activeIn, distance } from '../expedition/world';
import '../expedition.css';

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
function initial() {
  try {
    const result = load(window.localStorage);
    if (!result.exists)
      result.settings.reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    return result;
  } catch {
    return {
      state: createExpedition(),
      settings: { ...DEFAULT_SETTINGS },
      exists: false,
      warning: 'Local saves are unavailable in this browser.',
    };
  }
}
export function ManifoldExpedition() {
  const [loaded] = useState(initial);
  const runtime = useRef<Runtime>({
    state: loaded.state,
    settings: loaded.settings,
    screen: 'title',
  });
  const mount = useRef<HTMLDivElement>(null);
  const controller = useRef<ExpeditionController | null>(null);
  const [screen, setScreen] = useState<Screen>('title');
  const [hud, setHud] = useState({ ...loaded.state });
  const [settings, setSettings] = useState(loaded.settings);
  const [marker, setMarker] = useState<Marker>({
    x: 50,
    y: 50,
    visible: false,
  });
  const [warning, setWarning] = useState(loaded.warning);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(loaded.exists);
  const [panel, setPanel] = useState<'guide' | 'settings'>('guide');
  const [confirmReset, setConfirmReset] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const hasSave = useRef(loaded.exists);

  useEffect(() => {
    try {
      controller.current = new ExpeditionController(
        mount.current!,
        runtime.current,
        (p) => {
          setHud({
            ...runtime.current.state,
            collected: [...runtime.current.state.collected],
          });
          setMarker(p);
        },
        (next) => {
          setScreen(next);
          if (next === 'journal') setPanel('guide');
        },
        (ok) => {
          setSaved(ok);
          if (ok) hasSave.current = true;
          setWarning(
            ok
              ? ''
              : 'Progress cannot be saved here. Keep this tab open to finish your expedition.',
          );
        },
        setError,
      );
      setReady(true);
    } catch {
      setError(
        'The manifold needs WebGL graphics. Enable hardware acceleration or try a WebGL-capable browser, then reload.',
      );
    }
    return () => controller.current?.dispose();
  }, []);

  const modal =
    screen === 'pause' || screen === 'journal' || screen === 'complete';
  useEffect(() => {
    if (!modal) return;
    const first = dialog.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && screen !== 'complete') {
        e.preventDefault();
        controller.current?.play();
      }
      if (e.code === 'Tab') {
        const nodes = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            'button, input, select',
          ) ?? [],
        ).filter((el) => !el.hasAttribute('disabled'));
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, [modal, screen, panel, confirmReset]);

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...runtime.current.settings, ...patch };
    runtime.current.settings = next;
    setSettings(next);
    controller.current?.settingsChanged();
  };
  const start = () => {
    if (runtime.current.state.complete)
      controller.current?.setScreen('complete');
    else controller.current?.play();
  };
  const restart = () => {
    runtime.current.state = createExpedition();
    setHud({ ...runtime.current.state });
    setConfirmReset(false);
    controller.current?.persist();
    controller.current?.play();
  };
  const target = MEMORIES[hud.collected.length] ?? {
    x: 0,
    y: 0,
    z: 21,
    name: 'The way home',
    numeral: '◇',
  };
  const targetDistance = Math.round(distance(hud.position, target));
  const bearing =
    Math.atan2(target.x - hud.position.x, -(target.z - hud.position.z)) +
    hud.yaw;
  const prompt = nearbyPrompt(hud);
  const compass = ['N', 'W', 'S', 'E'][
    ((Math.round(hud.yaw / (Math.PI / 2)) % 4) + 4) % 4
  ];

  return (
    <main
      className={`expedition ${hud.phase} ${screen === 'title' ? 'at-title' : ''}`}
    >
      <div ref={mount} className="world-canvas" />
      <div className="world-vignette" />
      <header className="expedition-header">
        <div className="wordmark">
          <span className="brand-mark">⟐</span>
          <span>
            TESSERACT<span className="wordmark-sub">M A N I F O L D</span>
          </span>
        </div>
        <div className="header-right">
          <span className="edition">
            EXPEDITION 001 <span>/</span> THE HOLLOW ARCHIVE
          </span>
          <button
            className="icon-button"
            aria-label={settings.muted ? 'Unmute sound' : 'Mute sound'}
            onClick={() => updateSettings({ muted: !settings.muted })}
          >
            {settings.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          {screen === 'play' && (
            <button
              className="icon-button"
              aria-label="Pause expedition"
              onClick={() => controller.current?.pause()}
            >
              <Pause size={17} />
            </button>
          )}
        </div>
      </header>

      {screen === 'title' ? (
        <>
          <section className="title-content">
            <div className="eyebrow">
              <span className="tiny-line" /> A DIMENSIONAL EXPEDITION
            </div>
            <h1>
              Some worlds
              <br />
              are waiting
              <br />
              to be <em>remembered.</em>
            </h1>
            <p className="title-description">
              Enter a living ruin between dimensions.
              <br />
              Fold its geometry. Recover its memories.
              <br />
              Find your way home.
            </p>
            <button
              className="primary-button begin-button"
              disabled={!ready || !!error}
              onClick={start}
            >
              {loaded.state.complete
                ? 'View expedition record'
                : hasSave.current
                  ? 'Continue expedition'
                  : 'Enter the manifold'}
              <ArrowRight size={19} />
            </button>
            <div className="title-meta">
              <span>01 — THE HOLLOW ARCHIVE</span>
              <span>~10 MIN · SOLO</span>
            </div>
            <button
              className="text-button title-guide"
              onClick={() => {
                setPanel('guide');
                controller.current?.setScreen('pause');
              }}
              disabled={!ready}
            >
              <BookOpen size={14} /> Field guide & settings{' '}
              <ChevronRight size={13} />
            </button>
          </section>
          <div className="title-scene-label">
            <span className="coordinate-label">W +0.000 / GENESIS BASIN</span>
            <span className="scene-caption">A place outside the possible.</span>
          </div>
          <footer className="title-footer">
            <span>
              <i className="status-dot" /> THIRD EXPEDITION{' '}
              <span className="muted">/ PLAYABLE STUDY</span>
            </span>
            <span>
              HEADPHONES RECOMMENDED <AudioLines size={15} />
            </span>
          </footer>
        </>
      ) : (
        <>
          <div className="compass">
            <span aria-hidden="true">· · · ·</span>
            <b>{compass}</b>
            <span aria-hidden="true">· · · ·</span>
          </div>
          <section className="objective-block">
            <div className="eyebrow">
              {hud.collected.length === 3
                ? 'THE RETURN'
                : `MEMORY ${String(hud.collected.length + 1).padStart(2, '0')} / 03`}
            </div>
            <h2>{objective(hud)}</h2>
            <p>
              {hud.collected.length === 0
                ? 'The west archive lies across an echo bridge.'
                : hud.collected.length === 1
                  ? 'Cross the atrium. The east archive exists in matter.'
                  : hud.collected.length === 2
                    ? 'Fold at the Stillpoint to reach the northern archive.'
                    : 'Return south. Walk through the awakened gate.'}
            </p>
            <div className="memory-progress">
              {MEMORIES.map((m, i) => (
                <span
                  key={m.id}
                  className={hud.collected.length > i ? 'recovered' : ''}
                >
                  {hud.collected.length > i ? <Check size={12} /> : m.numeral}
                </span>
              ))}
              <small>{hud.collected.length} / 3 RECOVERED</small>
            </div>
          </section>
          {screen === 'play' && (
            <>
              <div className="crosshair">
                <Crosshair size={19} strokeWidth={1} />
              </div>
              {marker.visible && (
                <div
                  className="world-marker"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                >
                  <Diamond size={15} />
                  <span>
                    {target.numeral} · {targetDistance} m
                  </span>
                </div>
              )}
              <div className="target-bearing">
                <MoveUpRight
                  size={17}
                  style={{
                    transform: `rotate(${(bearing * 180) / Math.PI - 45}deg)`,
                  }}
                />
                <span>
                  {target.name} · {targetDistance} m
                </span>
              </div>
              <div className="interaction-prompt">{prompt}</div>
              <div className="transmission" role="status">
                {hud.messageTime > 0 && hud.message}
              </div>
            </>
          )}
          <footer className="game-footer">
            <div className="phase-display">
              <span className="phase-symbol">
                {hud.phase === 'matter' ? '◈' : '◇'}
              </span>
              <div>
                <span className="eyebrow">CURRENT FOLD</span>
                <strong>
                  {hud.phase === 'matter' ? 'Matter' : 'Echo'}{' '}
                  <small>
                    W {hud.phase === 'matter' ? '+0.000' : '+1.000'}
                  </small>
                </strong>
              </div>
              <kbd>Q</kbd>
            </div>
            <div className="control-strip">
              <span>
                <kbd>W A S D</kbd> Move
              </span>
              <span>
                <kbd>SPACE</kbd> Jump
              </span>
              <span>
                <kbd>E</kbd> Recover
              </span>
              <span className={hud.collected.length ? '' : 'muted'}>
                <kbd>F</kbd> Tether
              </span>
              <button onClick={() => controller.current?.setScreen('journal')}>
                <kbd>TAB</kbd> Field guide
              </button>
            </div>
            <div className="save-status">
              <i className="status-dot" />
              {saved ? 'MEMORY SAVED' : 'LOCAL EXPEDITION'}
            </div>
          </footer>
        </>
      )}

      {modal && (
        <div className="modal-backdrop">
          <div
            className={`expedition-dialog ${screen === 'complete' ? 'completion-dialog' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            ref={dialog}
          >
            {screen === 'complete' ? (
              <>
                <div className="completion-sigil">⟐</div>
                <div className="eyebrow">EXPEDITION COMPLETE</div>
                <h2 id="dialog-title">
                  Nothing remembered
                  <br />
                  is ever truly <em>lost.</em>
                </h2>
                <p>
                  You crossed the manifold and brought three voices home.
                  <br />
                  The Hollow Archive has a witness.
                </p>
                <div className="completion-stats">
                  <div>
                    <b>{formatTime(hud.elapsed)}</b>
                    <span>TIME IN THE FOLD</span>
                  </div>
                  <div>
                    <b>{hud.folds}</b>
                    <span>DIMENSIONAL FOLDS</span>
                  </div>
                  <div>
                    <b>{hud.recoveries}</b>
                    <span>RECALLS</span>
                  </div>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setConfirmReset(true)}
                >
                  Begin another expedition <ArrowRight size={17} />
                </button>
                <button
                  className="text-button"
                  onClick={() => controller.current?.setScreen('title')}
                >
                  Return to title
                </button>
              </>
            ) : (
              <>
                <div className="dialog-top">
                  <div>
                    <div className="eyebrow">THE HOLLOW ARCHIVE</div>
                    <h2 id="dialog-title">
                      {screen === 'journal'
                        ? 'Your field guide'
                        : 'Between moments'}
                    </h2>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Resume expedition"
                    onClick={start}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="dialog-tabs">
                  <button
                    className={panel === 'guide' ? 'selected' : ''}
                    onClick={() => setPanel('guide')}
                  >
                    <BookOpen size={15} /> Expedition
                  </button>
                  <button
                    className={panel === 'settings' ? 'selected' : ''}
                    onClick={() => setPanel('settings')}
                  >
                    <Settings2 size={15} /> Settings
                  </button>
                  <span>WORLD PAUSED</span>
                </div>
                {panel === 'guide' ? (
                  <div className="guide-grid">
                    <section>
                      <div className="eyebrow">READING THE MANIFOLD</div>
                      <h3>Two folds. One place.</h3>
                      <p>
                        <b>Q folds reality.</b> Cyan bridges exist in Echo;
                        amber bridges exist in Matter. Dotted paths are absent.
                        Seals obey the same rule. Shift on an island, or the
                        path beneath you may vanish.
                      </p>
                      <p>
                        Recover memories in order with <b>E</b>. The first
                        restores your <b>F void tether</b>: aim toward a
                        floating ring within 18 m to cross a clear gap.
                      </p>
                      <div className="guide-controls">
                        <span>
                          <kbd>W A S D</kbd> Move · <kbd>SHIFT</kbd> Run
                        </span>
                        <span>
                          <kbd>SPACE</kbd> Jump · <kbd>R</kbd> Recall safely
                        </span>
                        <span>Mouse / drag / arrow keys to look</span>
                        <span>
                          <kbd>ESC</kbd> Pause · <kbd>TAB</kbd> Field guide
                        </span>
                      </div>
                      <p className="guide-note">
                        Falling recalls you to your last memory. Progress is
                        saved locally at each recovery. Reloading resumes at a
                        safe anchor.
                      </p>
                    </section>
                    <section>
                      <div className="map-heading">
                        <span className="eyebrow">BASIN CARTOGRAPHY</span>
                        <span>N ↑</span>
                      </div>
                      <svg
                        className="basin-map"
                        viewBox="-34 -44 68 75"
                        role="img"
                        aria-label="Basin map: arrival south, first memory west, second east, third north. Two northern bridges meet at the Stillpoint."
                      >
                        {PLATFORMS.map((p) => (
                          <rect
                            key={p.id}
                            x={p.x - p.width / 2}
                            y={p.z - p.depth / 2}
                            width={p.width}
                            height={p.depth}
                            fill={
                              p.phase
                                ? p.phase === 'echo'
                                  ? '#5da99c'
                                  : '#ac8655'
                                : '#263b3d'
                            }
                            fillOpacity={activeIn(p, hud.phase) ? 0.75 : 0.1}
                            stroke={p.phase === 'echo' ? '#9ce3d1' : '#bba47b'}
                            strokeWidth="0.25"
                            strokeDasharray={
                              activeIn(p, hud.phase) ? undefined : '1 1'
                            }
                          />
                        ))}
                        {MEMORIES.map((m, i) => (
                          <text
                            key={m.id}
                            x={m.x}
                            y={m.z + 1}
                            textAnchor="middle"
                            fill={
                              i < hud.collected.length ? '#e2b474' : '#f2eee1'
                            }
                            fontSize="3.4"
                          >
                            {m.numeral}
                          </text>
                        ))}
                        <circle
                          cx={hud.position.x}
                          cy={hud.position.z}
                          r="1.3"
                          fill="#fff"
                        />
                        <text x="6" y="23" fill="#d9c9a9" fontSize="2.5">
                          HOME
                        </text>
                        <text x="5" y="-19" fill="#b4c4be" fontSize="2.3">
                          STILLPOINT
                        </text>
                      </svg>
                      <div className="map-legend">
                        <span>● You</span>
                        <span className="echo-text">— Echo</span>
                        <span className="matter-text">— Matter</span>
                      </div>
                    </section>
                    <section className="memory-journal">
                      {MEMORIES.map((m, i) => (
                        <article
                          key={m.id}
                          className={i < hud.collected.length ? 'unlocked' : ''}
                        >
                          <span>{m.numeral}</span>
                          <div>
                            <h4>
                              {i < hud.collected.length ? m.title : m.name}
                            </h4>
                            <p>
                              {i < hud.collected.length
                                ? m.text
                                : 'A voice waiting to be recovered.'}
                            </p>
                          </div>
                          {i < hud.collected.length && <Check size={16} />}
                        </article>
                      ))}
                    </section>
                  </div>
                ) : (
                  <div className="settings-panel">
                    <label>
                      <span>
                        Soundscape
                        <small>Ambient tone and interaction chimes</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={!settings.muted}
                        onChange={(e) =>
                          updateSettings({ muted: !e.target.checked })
                        }
                      />
                    </label>
                    <label>
                      <span>
                        Reduced motion
                        <small>Still relics, particles, and viewmodel</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) =>
                          updateSettings({ reducedMotion: e.target.checked })
                        }
                      />
                    </label>
                    <label>
                      <span>
                        Look sensitivity
                        <small>{settings.sensitivity.toFixed(1)}×</small>
                      </span>
                      <input
                        aria-label="Look sensitivity"
                        type="range"
                        min="0.2"
                        max="2"
                        step="0.1"
                        value={settings.sensitivity}
                        onChange={(e) =>
                          updateSettings({
                            sensitivity: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>
                        Graphics
                        <small>Low reduces resolution and disables bloom</small>
                      </span>
                      <select
                        value={settings.quality}
                        onChange={(e) =>
                          updateSettings({
                            quality: e.target.value as Settings['quality'],
                          })
                        }
                      >
                        <option value="high">High</option>
                        <option value="low">Low</option>
                      </select>
                    </label>
                    <p>
                      Designed for desktop keyboard and mouse. All look controls
                      also work with arrow keys. Audio and mouse capture are
                      optional.
                    </p>
                  </div>
                )}
                <div className="dialog-actions">
                  <button
                    className="text-button"
                    onClick={() => setConfirmReset(true)}
                  >
                    <RotateCcw size={14} /> New expedition
                  </button>
                  <button className="primary-button" onClick={start}>
                    Resume expedition <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
            {confirmReset && (
              <div className="reset-confirm">
                <p>Begin again? This replaces your saved expedition.</p>
                <button
                  className="text-button"
                  onClick={() => setConfirmReset(false)}
                >
                  Keep my expedition
                </button>
                <button className="primary-button" onClick={restart}>
                  Start fresh
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {(warning || error) && (
        <div className={`system-notice ${error ? 'error' : ''}`} role="alert">
          {error || warning}
          {error && (
            <button onClick={() => window.location.reload()}>Reload</button>
          )}
        </div>
      )}
      <div className="small-screen-note">
        A world best explored with a keyboard and mouse.
      </div>
    </main>
  );
}
