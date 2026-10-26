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
import {
  RESIDENTS,
  STATIONS,
  canDeliver,
  converse,
  dayLabel,
  entityActive,
  lifeTarget,
  questText,
  sheltered,
  type ResidentId,
} from '../expedition/life';
import '../expedition.css';

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
              : 'Progress cannot be saved here. Keep this tab open to retain your neighbourhood changes.',
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
    screen === 'pause' || screen === 'journal' || screen === 'conversation';
  useEffect(() => {
    if (!modal) return;
    const first = dialog.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
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
    runtime.current.state.life.talking = null;
    controller.current?.play();
  };
  const restart = () => {
    runtime.current.state = createExpedition();
    setHud({ ...runtime.current.state });
    setConfirmReset(false);
    controller.current?.persist();
    controller.current?.play();
  };
  const target = lifeTarget(hud);
  const targetDistance = target
    ? Math.round(distance(hud.position, target))
    : 0;
  const prompt = nearbyPrompt(hud);
  const compass = ['N', 'W', 'S', 'E'][
    ((Math.round(hud.yaw / (Math.PI / 2)) % 4) + 4) % 4
  ];
  const neighbour = RESIDENTS.find(
    (r) => r.id === runtime.current.state.life.talking,
  );
  const stage = neighbour ? hud.life.quests[neighbour.id] : 0;
  const danger = hud.life.entities.some(
    (e, i) =>
      entityActive(hud, i) &&
      !e.repelled &&
      distance(hud.position, e.position) < 14,
  );
  const track = (id: ResidentId | null) => {
    runtime.current.state.life.tracked = id;
    setHud({ ...runtime.current.state });
    controller.current?.persist();
  };
  const chat = (action: 'help' | 'chat') => {
    if (!neighbour) return;
    converse(runtime.current.state, neighbour.id, action);
    setHud({ ...runtime.current.state });
    controller.current?.persist();
  };

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
            THE HOLLOW ARCHIVE <span>/</span> A LIVING NEIGHBOURHOOD
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
              aria-label="Pause world"
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
              <span className="tiny-line" /> AN OPEN WORLD SANDBOX STUDY
            </div>
            <h1>
              A quiet life.
              <br />
              An impossible
              <br />
              <em>neighbourhood.</em>
            </h1>
            <p className="title-description">
              Grow a garden. Know your neighbours. Explore the folds.
              <br />
              When the Hollow comes, keep the hearth alight.
              <br />
              Your stories begin here. The world stays open.
            </p>
            <button
              className="primary-button begin-button"
              disabled={!ready || !!error}
              onClick={start}
            >
              {hasSave.current ? 'Continue living' : 'Make yourself at home'}
              <ArrowRight size={19} />
            </button>
            <div className="title-meta">
              <span>THE HOLLOW ARCHIVE</span>
              <span>SOLO · PLAY AT YOUR OWN PACE</span>
            </div>
            <button
              className="text-button title-guide"
              onClick={() => {
                setPanel('guide');
                controller.current?.setScreen('pause');
              }}
              disabled={!ready}
            >
              <BookOpen size={14} /> Neighbourhood & settings{' '}
              <ChevronRight size={13} />
            </button>
          </section>
          <div className="title-scene-label">
            <span className="coordinate-label">
              GENESIS BASIN / HEARTH DISTRICT
            </span>
            <span className="scene-caption">
              Some things here would rather you did not stay.
            </span>
          </div>
          <footer className="title-footer">
            <span>
              <i className="status-dot" /> SANDBOX PROTOTYPE / THREE RESIDENT
              STORIES
            </span>
            <span>
              HEADPHONES RECOMMENDED <AudioLines size={15} />
            </span>
          </footer>
        </>
      ) : (
        <>
          <div className="compass">
            <span>· · · ·</span>
            <b>{compass}</b>
            <span>· · · ·</span>
          </div>
          <section className="objective-block">
            <div className="eyebrow">{dayLabel(hud)}</div>
            <h2>
              {hud.life.tracked
                ? `${RESIDENTS.find((r) => r.id === hud.life.tracked)!.name}’s story`
                : 'Make a life here.'}
            </h2>
            <p>
              {hud.life.tracked
                ? objective(hud)
                : 'Meet a neighbour, tend the garden, or wander into the ruins. Tab opens your map. Nothing needs doing in order.'}
            </p>
            <div className="needs-strip">
              {(
                [
                  ['Hunger', hud.life.hunger],
                  ['Energy', hud.life.energy],
                  ['Composure', hud.life.composure],
                ] as const
              ).map(([name, value]) => (
                <label key={name}>
                  <span>
                    {name} <b>{Math.round(value)}</b>
                  </span>
                  <meter
                    aria-label={name}
                    value={value}
                    min="0"
                    max="100"
                    low={25}
                    optimum={100}
                  />
                </label>
              ))}
            </div>
            <div className="inventory-line">
              {hud.life.herbs} herbs · {hud.life.meals} packed meals ·{' '}
              {hud.collected.length} relics
            </div>
          </section>
          {screen === 'play' && (
            <>
              <div className="crosshair">
                <Crosshair size={19} strokeWidth={1} />
              </div>
              {marker.visible && target && (
                <div
                  className="world-marker"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                >
                  <Diamond size={15} />
                  <span>
                    {target.name} · {targetDistance} m
                  </span>
                </div>
              )}
              <div
                className={`world-condition ${danger && !sheltered(hud, hud.position) ? 'danger' : ''}`}
              >
                {sheltered(hud, hud.position)
                  ? '◌ Within ward light'
                  : danger
                    ? 'An entity is near · G repel / R retreat'
                    : hud.phase === 'echo'
                      ? 'Echo · The Uninvited walks this fold'
                      : 'Matter · Watch the light after dusk'}
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
                <strong>{hud.phase === 'matter' ? 'Matter' : 'Echo'}</strong>
              </div>
              <kbd>Q</kbd>
            </div>
            <div className="control-strip">
              <span>
                <kbd>WASD</kbd> Move
              </span>
              <span>
                <kbd>E</kbd> Talk / tend
              </span>
              <span>
                <kbd>F</kbd> Tether
              </span>
              <span>
                <kbd>G</kbd> Repel
              </span>
              <button onClick={() => controller.current?.setScreen('journal')}>
                <kbd>TAB</kbd> Neighbourhood
              </button>
            </div>
            <div className="save-status">
              <i className="status-dot" />
              {saved ? 'WORLD SAVED' : 'LOCAL WORLD'}
            </div>
          </footer>
        </>
      )}
      {modal && (
        <div className="modal-backdrop">
          <div
            className={`expedition-dialog ${screen === 'conversation' ? 'conversation-dialog' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            ref={dialog}
          >
            {screen === 'conversation' && neighbour ? (
              <>
                <div className="eyebrow">
                  {neighbour.role} · Friendship {hud.life.bonds[neighbour.id]} /
                  100
                </div>
                <h2 id="dialog-title">{neighbour.name}</h2>
                <p className="resident-quote">“{neighbour.greeting}”</p>
                <p>{questText(hud, neighbour.id)}</p>
                <div className="conversation-reward">
                  {
                    {
                      mira: 'Help her restore the garden to grow herbs faster.',
                      ivo: 'Help him build a permanent ward against the entities.',
                      sen: 'Help them light a mural for the people of the Archive.',
                    }[neighbour.id]
                  }
                </div>
                <div className="conversation-actions">
                  {stage < 3 && (
                    <button
                      className="primary-button"
                      disabled={stage > 0 && !canDeliver(hud, neighbour.id)}
                      onClick={() => chat('help')}
                    >
                      {stage === 0
                        ? 'I’ll help'
                        : canDeliver(hud, neighbour.id)
                          ? 'Share what I found'
                          : 'Still looking'}
                    </button>
                  )}
                  <button className="text-button" onClick={() => chat('chat')}>
                    Spend a moment together
                  </button>
                  <button className="text-button" onClick={start}>
                    See you around <ArrowRight size={16} />
                  </button>
                </div>
                <p className="dialog-notice" role="status">
                  {hud.messageTime > 0 && hud.message}
                </p>
              </>
            ) : (
              <>
                <div className="dialog-top">
                  <div>
                    <div className="eyebrow">THE HOLLOW ARCHIVE</div>
                    <h2 id="dialog-title">Your neighbourhood</h2>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Resume living"
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
                    <BookOpen size={15} /> People & places
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
                  <div className="sandbox-guide">
                    <div className="guide-grid">
                      <section>
                        <div className="eyebrow">
                          ORDINARY DAYS / STRANGE NIGHTS
                        </div>
                        <h3>You decide what matters.</h3>
                        <p>
                          <b>E</b> talks, harvests, cooks, or rests. Herbs
                          regrow. Meals restore hunger; rest restores energy.
                          Friendship grows through visits and favours. Stories
                          are optional and can overlap.
                        </p>
                        <p>
                          <b>Q</b> folds bridges and seals. <b>F</b> tethers to
                          a clear ring within 18 m. The Uninvited hunts in Echo;
                          the Hollow hunts after dusk. <b>G</b> repels nearby
                          entities for 8 seconds, costing 10 energy. Ward
                          circles protect you and your neighbours.
                        </p>
                        <p>
                          <b>R</b> returns home with your belongings. Low needs
                          limit sprinting. Lost composure sends you home.{' '}
                          <b>Space</b> jumps; mouse, drag, or arrows look; Shift
                          runs.
                        </p>
                      </section>
                      <section className="map-panel">
                        <div className="map-heading">
                          <span>HEARTH & OUTER RUINS</span>
                          <span>N ↑</span>
                        </div>
                        <svg
                          viewBox="-34 -44 68 74"
                          className="basin-map"
                          role="img"
                          aria-label="Neighbourhood map with residents, facilities and folded ruins"
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
                                  ? activeIn(p, hud.phase)
                                    ? p.phase === 'echo'
                                      ? '#407f7c'
                                      : '#9c7748'
                                    : 'none'
                                  : '#30484c'
                              }
                              stroke={
                                p.phase === 'echo' ? '#8ed9cc' : '#bda986'
                              }
                              strokeWidth="0.3"
                              strokeDasharray={
                                activeIn(p, hud.phase) ? undefined : '1 1'
                              }
                            />
                          ))}
                          {MEMORIES.map((m) => (
                            <text
                              key={m.id}
                              x={m.x}
                              y={m.z}
                              fill={
                                hud.collected.includes(m.id)
                                  ? '#dfbb83'
                                  : '#eeeadd'
                              }
                              fontSize="3"
                              textAnchor="middle"
                            >
                              {m.numeral}
                            </text>
                          ))}
                          {STATIONS.map((p, i) => (
                            <text
                              key={p.id}
                              x={p.x}
                              y={p.z}
                              fill="#dfbb83"
                              fontSize="3"
                              textAnchor="middle"
                            >
                              {['G', 'K', 'H', 'W'][i]}
                            </text>
                          ))}
                          {hud.life.residents.map((r) => (
                            <circle
                              key={r.id}
                              cx={r.position.x}
                              cy={r.position.z}
                              r="0.9"
                              fill="#9bdecf"
                            />
                          ))}
                          <circle
                            data-player="true"
                            cx={hud.position.x}
                            cy={hud.position.z}
                            r="1"
                            fill="#fff"
                          />
                        </svg>
                        <div className="map-legend">
                          <span>G garden · K kitchen · H hearth · W ward</span>
                        </div>
                        <div className="map-legend">
                          <span>● You (white) / neighbours (mint)</span>
                          <span>I coil · II seed · III record</span>
                        </div>
                      </section>
                    </div>
                    <div className="resident-cards">
                      {RESIDENTS.map((r) => (
                        <article key={r.id}>
                          <div className="eyebrow">
                            {r.role} · Bond {hud.life.bonds[r.id]}
                          </div>
                          <h3>
                            {r.name}
                            <small>
                              {
                                hud.life.residents.find((n) => n.id === r.id)!
                                  .activity
                              }
                            </small>
                          </h3>
                          <p>{questText(hud, r.id)}</p>
                          <div className="resident-stage">
                            {
                              [
                                'Meet in the world',
                                'First favour',
                                'A growing friendship',
                                'Story complete · life continues',
                              ][hud.life.quests[r.id]]
                            }
                          </div>
                          <button
                            className="text-button"
                            onClick={() =>
                              track(hud.life.tracked === r.id ? null : r.id)
                            }
                          >
                            {hud.life.tracked === r.id
                              ? 'Unpin story'
                              : `Pin ${r.name}’s story`}
                          </button>
                        </article>
                      ))}
                    </div>
                    {hud.collected.length > 0 && (
                      <div className="archive-notes">
                        <h3>Found in the folds</h3>
                        {MEMORIES.filter((m) =>
                          hud.collected.includes(m.id),
                        ).map((m) => (
                          <p key={m.id}>
                            <b>{m.name}.</b> {m.text}
                          </p>
                        ))}
                      </div>
                    )}
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
                    <RotateCcw size={14} /> New neighbourhood
                  </button>
                  <button className="primary-button" onClick={start}>
                    Resume living <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
            {confirmReset && (
              <div className="reset-confirm">
                <p>Begin again? This replaces your saved neighbourhood.</p>
                <button
                  className="text-button"
                  onClick={() => setConfirmReset(false)}
                >
                  Keep my neighbourhood
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
