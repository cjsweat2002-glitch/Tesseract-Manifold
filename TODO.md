# Prime Genesis Basin TODO

## Vertical slice entry experience
- [ ] The branch opens directly into the Prime Genesis Basin scene while preserving the prior prototype source modules for later integration.
- [ ] The scene communicates the next objective without requiring a large modal or dashboard.

## Traversal and interaction
- [ ] The player can move through the basin with `WASD` or arrow keys.
- [ ] The player can activate the nearest resonance pylon with `E` when within interaction range.
- [ ] The slice displays the current objective and nearest pylon distance.
- [ ] `Q` triggers a resonance pulse after the pylons are aligned.
- [ ] `R` resets the slice to the Genesis state.

## Manifold state and gameplay consequence
- [ ] The slice begins in Genesis with all three pylons inactive.
- [ ] Pylon activation advances the resonance count and visibly changes that pylon.
- [ ] After all three pylons are active, the player can trigger Breach.
- [ ] Breach changes the environment, tesseract motion, lighting, fog, and objective text.
- [ ] The player can continue moving during the phase transition.

## 3D presentation
- [ ] A projected tesseract is visible and animated through two rotation planes.
- [ ] Three resonance pylons, energy beams, a ring, terrain dressing, and particles form a readable scene.
- [ ] Lighting has distinct Genesis, Resonance, and Breach states.
- [ ] The scene remains procedural and asset-light so it can run without external downloads.

## Engineering quality
- [ ] The production build succeeds.
- [ ] TypeScript diagnostics are reduced to the pre-existing prototype issues or fixed where encountered.
- [ ] No changes are made to `main`; all work remains on `manus/prime-genesis-basin`.
- [ ] A branch handoff note documents how to continue toward Blender-authored hero assets and animations.
