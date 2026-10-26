# Tesseract Manifold — The Hollow Archive

An open world sandbox prototype in a dimensional neighbourhood. Grow herbs, cook, rest, get to know three residents, and explore folded ruins at your own pace. Optional missions belong to those residents' lives. The Uninvited stalks Echo; the Hollow emerges after dusk and drives neighbours toward shelter. The world stays playable after every story is complete.

This third branch builds on `manus/prime-genesis-basin`. Both that branch and `main` remain independent reference implementations. This is one small authored neighbourhood, not a finished life simulator or a commercially complete open world.

## Run

Use Node 22.12+ (Node 24 in CI) and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API key or backend is required. Desktop keyboard/mouse and WebGL are required. Fonts are optional remote enhancements; geometry and audio are procedural. Select Low graphics in Neighbourhood & settings on slower devices.

## Live here

| Control | Action |
| --- | --- |
| WASD / Shift | Move / run |
| Mouse, drag, or arrow keys | Look |
| Space | Jump |
| E | Talk, harvest, cook, rest, tend a ward, or gather a nearby relic |
| Q | Fold between Matter and Echo |
| F | Tether toward a clear ring within 18 m; available from the start |
| G | Lantern flare: repel entities within 12 m for 8 seconds; costs 10 energy, 6-second cooldown |
| R | Return to your hearth with belongings and relationships intact |
| Tab / Escape | Neighbourhood map / pause |

Start with any neighbour or simply explore. Mira tends the garden to the west, Ivo repairs lanterns to the east, and Sen reads near the plaza. Talk in person to accept or deliver a favour; use the guide to pin or unpin its marker. They move to supper or shelter as their needs, time, and threats change. Casual conversation improves friendship once per day.

The garden yields three herbs every 50 seconds. Cooking consumes one, restores hunger and energy, and packs a meal to share. Rest at your hearth advances to the next morning and restores energy and composure. Low hunger or energy prevents sprinting, but never stops walking. No chore or quest is mandatory.

The side promenades connect the neighbourhood and outer ruins. Dimensional bridges remain shortcuts and the northern archive needs folding: cyan exists in Echo, amber in Matter, dashed paths are absent. Fold on permanent islands; seals block movement in their active phase. Relics can be discovered in any order, before or after meeting their residents.

Days last five active minutes, with night beginning at 190 seconds. Menus pause everyone. Entities pursue exposed people, drain your composure on contact, and frighten residents away from their routines. Your hearth and the residents' homes are always safe. One herb lights the plaza ward for 90 seconds. Ivo's two favours make that ward permanent; Mira improves regrowth; Sen lights a community mural. Nothing ends or resets the world when these stories finish. Lost composure or falling recalls you home without deleting progress.

Progress and settings save locally under the existing `tesseract.expedition.v1` key, now with a **version 2** payload. Version 1 saves (including finished expeditions) migrate while retaining relics, statistics, and settings. Saves retain needs, inventory, friendships, quest stages, garden/ward timers, resident needs, and world time. Reloads place you at your hearth; residents and threats restart at authored positions and resume routines. Corrupt/unavailable storage shows a notice. Replacing a neighbourhood requires confirmation. There are no cloud saves.

## Verify

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The deterministic suite covers geometry, collision, free exploration, independent resident stories, transactional rewards, daily routines, chores, entity behaviour, wards, recovery, and save migration/validation. Browser checks exercise a resident's full story through keyboard movement and conversations, gardening/cooking/rest, night pursuit and repel, old-save migration, tether traversal, pause/settings, and storage failures. Browser tests use a controlled clock and reduced render resolution; gameplay is driven through real UI and input, with saved fixtures only for night and legacy-resume scenarios. CI repeats these checks.

## Architecture

- `src/expedition/world.ts`: shared physical layout, relics, and 4D projection.
- `model.ts`: collision, movement, folding, tethering, discovery and recall.
- `life.ts`: residents, needs, optional questlines, chores, world clock, wards and horror AI.
- `save.ts`: versioned persistence, validation and legacy migration.
- `scene.ts` / `neighbourhoodScene.ts`: procedural ruins, homes, inhabitants, entities and GPU ownership.
- `controller.ts` / `audio.ts`: input lifecycle, pause, simulation and optional sound.
- `src/components/ManifoldExpedition.tsx`: title, needs HUD, conversations, neighbourhood guide and settings.

The `expedition` filenames remain to avoid unnecessary module churn; they now host the sandbox. Legacy systems remain reference material rather than advertised playable features. See [design review and limitations](docs/third-expedition.md).
