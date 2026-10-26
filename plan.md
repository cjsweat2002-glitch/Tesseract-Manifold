# Prime Genesis Basin Vertical Slice

## Goal
Create a focused playable vertical slice for Tesseract Manifold on a feature branch, without modifying `main`. The slice validates the game’s identity through traversal, resonance activation, dimensional phase changes, procedural environment dressing, animation, and lighting.

## Design

### Design movement
**Dark bioluminescent relic sci-fi**: monumental silhouettes, restrained emissive accents, and a readable focal object rather than a wall of glowing UI.

### Core principles
- The manifold is a gameplay instrument: the player changes the world state instead of only observing it.
- Light communicates state: Genesis, Resonance, and Breach are visually distinct phases.
- The environment is sparse enough to read movement, pylons, and the tesseract at a glance.
- Every interaction has a visible consequence in geometry, animation, atmosphere, or access.

### Color philosophy
Deep indigo and charcoal establish an unknown, low-light basin. Cyan identifies stable manifold energy, amber marks activated resonance, and magenta/red is reserved for dimensional breach. The palette makes the player’s objective legible before text is read.

### Layout paradigm
A wide 3D stage with a centered suspended tesseract, three readable pylon landmarks arranged around it, and a low-profile diegetic HUD anchored to the screen edges. No central dashboard competes with the play space.

### Signature elements
1. A four-dimensional wireframe tesseract projected into the basin and continuously rotating through two planes.
2. Three resonance pylons that activate in sequence and send animated energy into the tesseract.
3. A dimensional phase shift that changes fog, light, ring motion, and ground color after all pylons are aligned.

### Interaction philosophy
Movement is immediate and forgiving. `WASD` moves, mouse-look is optional through pointer lock, `E` activates the nearest pylon, `Q` triggers a phase pulse after activation, and `R` resets the slice. The HUD reports only the next meaningful action.

### Animation
Use slow, legible idle motion for the tesseract and pylons; accelerate rotation, pulse beams, and camera-safe particles during activation. The breach transition uses a short ease-in/ease-out surge rather than a long cinematic that removes control.

### Brand essence
A playable geometric mystery where the player repairs a living dimensional machine by walking through its equations. Personality: monumental, strange, tactile.

## Implementation approach
- Add a self-contained `PrimeGenesisBasin` React/Three.js scene.
- Keep the existing prototype modules in place for future migration; the new slice becomes the branch’s default entrypoint.
- Use deterministic procedural geometry and a small number of materials so the scene remains performant in a browser.
- Represent the slice as explicit state: `Genesis`, `Resonance`, and `Breach`.
- Drive renderer clear color, fog, emissive intensity, pylon animation, tesseract rotation, and HUD copy from that state.
- Keep gameplay state separate from render-loop mutation so the scene can later be moved into a dedicated engine layer.

## Project structure
- `src/components/PrimeGenesisBasin.tsx`: slice state, Three.js scene, input, interaction, and HUD.
- `src/primeGenesis.css`: slice-specific presentation and HUD styling.
- `src/App.tsx`: thin entry wrapper for the branch’s vertical slice.
- Existing `src/utils` and `src/components` modules: preserved as the source pool for subsequent integration.

## Material constraints
Use the existing React 19, Vite, TypeScript, and Three.js stack. Do not add a large engine dependency or external asset dependency for this slice. Use procedural meshes, canvas-safe materials, and a small post-processing bloom pass.

## Future integration
The next branch after this slice should migrate the current game’s entity/portal systems behind the explicit phase state, then replace procedural hero props with Blender-authored GLB assets and animation clips while retaining runtime-generated placement and lighting.
