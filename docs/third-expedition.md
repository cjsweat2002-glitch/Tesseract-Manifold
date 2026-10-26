# Third expedition: design and review

## What was reviewed

`main` at `243a21c` is a broad feature laboratory: roughly 77k source lines, a very large viewport, dimensional generation, procedural anatomy, relic materials, portals, grappling, crafting, and overlapping HUDs. Its identity is strongest in the dimensional worlds, tactile void tools, and living monumental architecture. Its opening has too many simultaneous concepts and no clear expedition contract. The crafting callback applies effects outside the resource deduction transaction. Repeated decode rewards and incomplete persistence also need dedicated work before reactivating those systems.

`manus/prime-genesis-basin` at `7e61521` reduces the entry point to a legible basin and three pylons. Its scene and art plan establish a useful cyan/amber/obsidian direction, but yaw never changes, there is no obstacle collision or real gate completion, and most legacy systems are unreachable. Its tesseract omits W and allocates twice the required edge buffer. Input cleanup and GPU disposal are incomplete.

Both were built, typechecked, opened in a browser and captured before implementation. Main built with 21 TypeScript diagnostics; Manus built and typechecked. Ordinary npm installation reproduced the Vite 8 / esbuild 0.25 peer conflict; a temporary legacy-peer baseline install allowed verification. The third branch upgrades the direct esbuild requirement and commits a normal npm lockfile.

Reviewed source included the manifold generator, portal/maze engines, grapple controller, collision engine, carved material/hand system, 4D node system, soundscape, and the stored concept/implementation plan. These systems are deeply coupled; importing them wholesale would reintroduce the broad prototype's lifecycle and progression problems. The new scene recovers the design strengths through focused implementations with a small renderer-independent rules layer. The old sources remain available for later, tested migration.

## Playable contract

**Enter → understand the fold → recover → master traversal → return.**

The missing arrival bridge introduces Q. The west archive requires Echo and unlocks a void tether. The east archive requires Matter and reinforces the same rule through a seal. The northern route chains two folds with a permanent Stillpoint in between. The third archive wakes the arrival gate; an actual crossing back through that gate completes the expedition. A compass, target bearing, world marker, and pause-map support navigation without a feature dashboard.

Every phase-sensitive slab is both rendered and collided from the same authored definition. Inactive bridges are dashed ghosts; active seals block the player. A fold cannot materialize a seal inside the player. Movement is normalized and substepped, including large frame deltas. Tethers need an unlocked tool, a target in the facing cone, range, and an unobstructed route. Falls and manual recalls preserve earned memories. Interaction rewards are ordered and idempotent.

The tesseract contains sixteen W-aware vertices and thirty-two edges, rotating in XW and YZ before perspective projection. A muted relic palette, suspended islands, structural ribs, an articulated geometric gauntlet, dust and restrained harmonic cues connect the mechanics to the original identity.

## Verification strategy

The deterministic suite covers the complete physical route, phase support and seals, anti-embedding, low-framerate collision, movement normalization, jumping, falls, ordered interaction, tether occlusion, gate completion, and malformed/unavailable storage. Browser tests exercise real keyboard dispatch, the full return loop, pause/blur, settings, confirmation, reload and error notices. Title, gameplay, Echo and field-guide captures are inspected separately because a passing state-machine test cannot establish visual readability.

Checkpoints deliberately persist progression, time, folds, recalls and settings, but not an unsafe in-flight position. Mouse lock has drag and keyboard fallbacks. Blur, hidden tabs and pointer-lock loss pause and clear input. Renderer-owned geometries, materials, textures, render targets, animation callbacks, listeners and audio are released on teardown. Graphics context loss produces a recoverable reload message.

## Honest boundaries and follow-up

This is one authored, short expedition. It does not establish commercial parity. It has no combat, ecology, crafting economy, branching campaign, gamepad/touch controls, cloud saves or imported Blender assets. The archived prototype systems are not presented as playable features. No local Windows or Blender access was assumed.

The procedural art is coherent but remains visibly geometric. The next useful work is external player observation, richer sound design, original authored art, additional puzzles that combine folds and tethering, and performance profiling across real integrated/discrete GPUs. Keyboard and menu accessibility are supported; the spatial WebGL gameplay is not a screen-reader-equivalent experience. Browser checks target Chromium; Safari/Firefox and device coverage remain follow-up work.
