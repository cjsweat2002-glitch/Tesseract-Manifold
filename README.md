# Tesseract Manifold — The Hollow Archive

A short first-person dimensional expedition through a living ruin. Fold between Matter and Echo to change which bridges and seals are solid, recover three memories, restore your void tether, and return through the arrival gate.

This third branch builds on `manus/prime-genesis-basin`. Both that branch and `main` remain independent reference implementations. This is a focused playable study, not a commercially finished game.

## Run

Use Node 22.12+ (Node 24 is used in CI) and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API key or backend is required. Desktop keyboard/mouse and WebGL are required. Fonts are optional remote enhancements; the game uses local procedural geometry and audio. Use Low graphics in the field guide on slower devices.

## Play

| Control                    | Action                                                               |
| -------------------------- | -------------------------------------------------------------------- |
| WASD / Shift               | Move / run                                                           |
| Mouse, drag, or arrow keys | Look                                                                 |
| Space                      | Jump                                                                 |
| Q                          | Fold between Matter and Echo                                         |
| E                          | Recover the nearby memory                                            |
| F                          | Tether toward a clear ring within 18 m, unlocked by the first memory |
| R                          | Recall to the last memory without losing progress                    |
| Tab / Escape               | Field guide / pause                                                  |

Solid cyan paths belong to Echo; solid amber paths belong to Matter. Dashed outlines are absent geometry. Shift on permanent islands to avoid dropping through a bridge. The map shows the current layout and your position. The west memory comes first, then east, then north. The two northern bridges require a fold at the Stillpoint. After the third memory, return south and **walk through** the arrival gate.

Progress and settings are saved locally under `tesseract.expedition.v1`. Reloads resume at the last safe memory rather than an arbitrary position over the void. Corrupt or inaccessible storage produces a notice and does not prevent play. Starting a new expedition asks before replacing the save. There are no cloud saves.

## Verify

```sh
npm run lint          # TypeScript across the repository
npm test              # Geometry, collision, traversal, progression, save regressions
npm run build         # Production bundle
npx playwright install chromium
npm run test:browser  # Full keyboard expedition and UI/persistence regressions
```

Browser tests run against a local Vite server and retain traces/screenshots on failure. They use the documented keyboard fallback and a controlled browser clock at 10 fps with reduced rendering resolution; they do not teleport the player or expose a production debug API. CI repeats these checks. npm and `package-lock.json` are the canonical installation path; the obsolete Bun lock was removed after fixing the esbuild/Vite peer mismatch.

## Architecture

- `src/expedition/world.ts`: authored shared platform/seal definitions, archive content, 4D projection.
- `model.ts`: renderer-independent collision, traversal, fold/tether rules, progression and gate crossing.
- `save.ts`: validated, versioned checkpoint persistence and settings.
- `scene.ts`: procedural Three.js scene and GPU resource ownership.
- `controller.ts`: input lifecycle, pause, simulation loop, audio and persistence orchestration.
- `src/components/ManifoldExpedition.tsx`: onboarding, objective HUD, field guide, settings and ending.

Legacy prototype systems remain in the repository as reference material but are not bundled into the expedition. See [the design review](docs/third-expedition.md) for the comparison, decisions and remaining scope.
