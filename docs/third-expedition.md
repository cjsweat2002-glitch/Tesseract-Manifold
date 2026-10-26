# Hollow Archive: sandbox design and review

## What was reviewed

`main` at `243a21c` is a broad feature laboratory: roughly 77k source lines, a very large viewport, dimensional generation, procedural anatomy, relic materials, portals, grappling, crafting, and overlapping HUDs. Its identity is strongest in the dimensional worlds, tactile void tools, and living monumental architecture. Its opening has too many simultaneous concepts and no clear expedition contract. The crafting callback applies effects outside the resource deduction transaction. Repeated decode rewards and incomplete persistence also need dedicated work before reactivating those systems.

`manus/prime-genesis-basin` at `7e61521` reduces the entry point to a legible basin and three pylons. Its scene and art plan establish a useful cyan/amber/obsidian direction, but yaw never changes, there is no obstacle collision or real gate completion, and most legacy systems are unreachable. Its tesseract omits W and allocates twice the required edge buffer. Input cleanup and GPU disposal are incomplete.

Both were built, typechecked, opened in a browser and captured before implementation. Main built with 21 TypeScript diagnostics; Manus built and typechecked. Ordinary npm installation reproduced the Vite 8 / esbuild 0.25 peer conflict; a temporary legacy-peer baseline install allowed verification. The third branch upgrades the direct esbuild requirement and commits a normal npm lockfile.

Reviewed source included the manifold generator, portal/maze engines, grapple controller, collision engine, carved material/hand system, 4D node system, soundscape, and the stored concept/implementation plan. These systems are deeply coupled; importing them wholesale would reintroduce the broad prototype's lifecycle and progression problems. The new scene recovers the design strengths through focused implementations with a small renderer-independent rules layer. The old sources remain available for later, tested migration.

## Revised direction after Craig’s review

Craig clarified that the game is an open world sandbox: missions belong to the world and Sim character questlines, while evil horror entities counter mundane life. The first Hollow Archive implementation incorrectly made the whole game a linear expedition. Its ordered memory objectives and terminal gate have been removed.

The original `multiversalEmergenceAndCultureEngine.ts` models autonomous denizens, hunger, comfort, kinship, communal meals, hostile raids and resident-authored questlines. `proceduralMazeDimensionEngine.ts` models stalking horror entities. These are the relevant conceptual precedents for this revision, alongside the original relic/void-tool aesthetic. They remain reference systems; their larger procedural city, sabotage and combat systems are not claimed as integrated.

## Current playable contract

**Live, explore, befriend, and protect — in the order you choose.**

A connected hearth neighbourhood adds houses, a garden, communal kitchen, resting place, ward and side promenades. The player starts with folding and tethering available. Three residents move between work, supper and shelter based on the clock, hunger and nearby danger. Player hunger/energy/composure make cooking, rest and safety meaningful without preventing free movement or forcing quest participation.

Each resident offers two connected favours through an in-world conversation. Mira needs herbs, then an eastern seed memory; her garden regrows faster afterward. Ivo needs a western Echo coil, then herbs to build a permanent ward. Sen needs a northern record, then a shared meal to commemorate the neighbourhood with a mural. All three lines can overlap; relics can be collected beforehand and in any order. Acceptance and delivery occur beside the resident. Journal pinning is optional navigation, not remote quest completion. Repeated delivery cannot duplicate rewards; conversation rewards are limited to one per day.

The Uninvited is active in Echo. The Hollow stalks at night. Both pursue exposed residents or the player, frighten residents from their routines, and drain player composure at contact. Ward light excludes their attacks; a lantern flare buys time to retreat or fold away. Running out of composure recalls the player with progress intact. The hearth and homes are always safe. A temporary herb-fuelled ward protects the plaza; Ivo’s quest gives the same protection permanently and allows neighbours to keep their routines after dark. The clock continues cycling and the world never closes after a story reward or gate crossing.

Geometry, folded support, seals, tether occlusion, input cleanup and the true sixteen-vertex tesseract remain from the first implementation. Persistence is upgraded in place to version 2, retaining old relics/settings while opening finished expedition saves into the neighbourhood. Player resumes at home; resident needs persist, while actor positions and threat encounters restart safely. Menus pause the whole simulation.

## Verification

Automated rules tests retain collision/traversal coverage and add independent quests, no repeated rewards, needs/chores, resident schedules, horror pursuit/repel/ward protection, persistent daily friendship limits, and legacy-save migration. Chromium flows exercise a full resident story using keyboard movement and UI, cooking and the next morning, night danger, pause/input clearing, tether traversal, and corrupt/unavailable saves. Visual review covers entry, neighbourhood guide, resident conversation, settlement gameplay and a night encounter. Screenshots are review artifacts, not committed assets.

## Boundaries

This is a small authored sandbox neighbourhood with three residents and two simple horror archetypes. It establishes the revised direction; it does not establish commercial parity, a full Sims-scale society, an endless generated world, freeform building, a complex economy, romance/families, combat, or a branching campaign. Character art and routines are deliberately simple. Friendships currently reward visits and favours; deeper personality and social simulation need further work.

Existing limitations remain: desktop keyboard/mouse, local-only saves, no gamepad/mobile support, and Chromium-focused checks. Procedural art and sound need richer authorship and hardware profiling. The spatial WebGL game is not a screen-reader-equivalent experience. No local Windows or Blender access is assumed.
