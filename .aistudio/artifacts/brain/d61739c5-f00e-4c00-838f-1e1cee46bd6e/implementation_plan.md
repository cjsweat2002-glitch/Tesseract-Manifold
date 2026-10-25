# Implementation Plan: Carved Relic HUD, `Shift+V` Mindspace, Void Ball Menu Dial, Right-Hand Weapon Pull & Realistic Human-to-Morph Anatomy

## 1. Architectural Overview & Core Pillars

### A. Unobtrusive Custom Relic HUD Themes & `Shift + V` Mindspace Sink
- **Eliminate Intrusive Screen Overlays & Gemini-Style UI**:
  - Remove bulky translucent SaaS/cyan cards and intrusive Portal Room sidebars that block the 3D viewport.
  - Replace them with an unobtrusive, edge-anchored **Dark Relic HUD** that keeps the center viewport and Portal Room completely clear while surfacing essential telemetry and dynamic quick keys.
- **4 Selectable Custom HUD & UI Themes** (accessible in the Portal Room and via `Shift + V`):
  1. **Carved Obsidian & Etched Rune Inlays** (Chiseled dark volcanic stone frames, sunken amber/crimson glyph inlays, weathered bevel edges)
  2. **Biomechanical Chitin, Bone & Sinew Framing** (Ossified rib borders, pulsing bioluminescent neural filaments, organic marrow gauges)
  3. **Ancient Brass Astrolabe & Weathered Parchment** (Engraved celestial brass rings, oxidized verdigris dials, inked grimoire typography)
  4. **Minimal Diegetic Wrist & Void-Core Projections Only** (Near-zero 2D HUD; vitals and quick keys project holographically around the Left-Hand Void Ball and wrist gauntlet)
- **`Shift + V` Mindspace Perspective Sink**:
  - Pressing `Shift + V` smoothly sinks the player's camera perspective downward through a dimensional ripple into a dedicated **3D Mindspace Chamber** (`mindspace-customization` studio state).
  - Inside the 3D Mindspace, **3D Example Figures** stand on carved plinths:
    - Figure 1: **Default Human Form** (displaying live skin tone, carved gauntlet/glove style, and articulated hand/weapon grip).
    - Figure 2: **Active Special Transformation Morph** (displaying the equipped Eldritch / Ophanim / Biomechanical metamorphosis form).
    - Figure 3: **Carved Weapon & Void Ball Pedestal** (previewing procedural carved relief, rune bump-mapping, and Void Dial control scheme).
  - Players can customize HUD theme, `[V]` Void Dial control mode, human skin/glove appearance, and Special Morph loadouts directly in this Mindspace, or at the **Reliquary Customization Station** inside the 36m×36m Square Portal Room.

---

### B. Customizable `[V]` Void Ball Menu Dial, Dynamic Quick Keys & Right-Hand Weapon Pull
- **3 Selectable `[V]` Control Schemes** (configurable in Mindspace / Portal Room):
  1. **Toggle Dial + 1–4 Dynamic Quick Keys**: Pressing `V` opens/closes the 4-sector orbital Void Ball Dial floating above the left palm; keys `1–4` trigger context-sensitive actions for the active sector.
  2. **Hold `V` for Dial / Tap `V` for Active Portal**: Holding `V` (>220ms) opens the radial dial; tapping `V` immediately tears open the exterior Reality-Tear Portal (or opens the Inner Maze Selector Portal when inside the Square Portal Room).
  3. **Scroll-Wheel Dial + Click Confirm**: Pressing `V` opens the dial; scrolling the mouse wheel rotates the 3D orbital sectors around the Void Ball and clicking confirms/pulls the selected item.
- **4 Diegetic Sectors on the Left-Hand Void Ball Dial**:
  1. **Sector I — Portals & Liminal Mazes**: Tear open the Sanctum Portal, open the Inner Maze Selector (`←/→` through 100+ multi-themed procedural mazes), or tune local gravity/time.
  2. **Sector II — Weapons & Tools Window (with Right-Hand Pull-From-Void Animation)**:
     - Displays a 3D miniature carousel of weapons and tools suspended inside the translucent Void Ball core.
     - Selecting any weapon or tool triggers a **choreographed 3-stage First-Person Dual-Hand Animation** (`rightHandVoidPullProgress`: `0.0 → 1.0` over `0.68s`):
       - **Stage 1 (Reach-In, `0.0–0.30`)**: Left hand turns palm-up expanding the Void Ball; Right hand unclenches and plunges its fingers directly into the swirling singularity core.
       - **Stage 2 (Grasp & Condense, `0.30–0.65`)**: Right fingers wrap tightly around the materializing weapon hilt inside the Void Ball as substrate sparks and dimensional ripples flare; the weapon scales up from `0.25x` to `1.0x` as it is physically dragged out of the left palm.
       - **Stage 3 (Lock & Flourish, `0.65–1.00`)**: Right hand settles into the weapon's combat grip with a recoil/weight flourish while the Left hand folds back into its supporting stance.
  3. **Sector III — Substrate Synthesis & Room Architecture**: Synthesize grounding monuments, furnish Portal Room wings, or transmute multiversal matter with dedicated hand-weaving mudra animations.
  4. **Sector IV — Character Morph & Resonance Shift**: Shift between the Default Human anatomy and unlocked Special Transformation Modes.
- **Dynamic Context-Sensitive Quick Keys (`1–4`)**:
  - Depending on which portal is open or which substrate/weapon mode is active in the Void Ball, quick keys `1–4` dynamically update their labels, behaviors, and **Left/Right Hand animations** (e.g., Portal Stabilize Gesture, Maze CCTV Assimilation Pulse, Substrate Extrusion Mudra, or Resonance Morph Surge).

---

### C. Realistic Human Arms/Fingers & Special Transformation Modes
- **Realistic Default Human Character & First-Person Arms**:
  - Rebuild the default player arm and hand meshes so the baseline character is a **realistic human** with:
    - Anatomically proportioned forearm flexors/extensors, ulna/radius wrist taper, palm metacarpal arch, and thumb thenar eminence.
    - 5 articulated fingers (`Thumb`, `Index`, `Middle`, `Ring`, `Pinky`), each with 3 distinct phalange joints (`proximal`, `intermediate`, `distal`), knuckle joint capsules, fingernail plates, and natural sequential finger curl/splay.
    - Customizable human skin subsurface tones and carved tactical/relic bracers & half-finger gloves.
- **Existing Non-Human Models Preserved as Special Transformation Modes**:
  - All existing surreal/biomechanical forms (*Seraphic 4-Winged Ophanim*, *Vascular Flame-Crown & Porcelain Mask*, *Escher-Jade Pyramid-Eye*, *Hadal Piezo-Cephalopod*, *Tesseractic 8-Cell Hypercage*, *Mycelial Exocortex*) are preserved as **Special Transformation Modes**:
    1. **Manual Void Dial Shift**: Shift forms at will via Sector IV of the Void Ball Dial (or its dynamic quick key).
    2. **Unlockable Gameplay Abilities**: Unlock additional morph forms through Deviance XP / Crucible progression.
    3. **High Combat Resonance Metamorphosis**: Dealing/taking rapid combat impacts fills a **Combat Resonance Meter** (`0–100%`); at peak resonance, the human character can trigger (or auto-surge into) a temporary high-powered metamorphosis with amplified limb reach, gravity control, and eldritch hand geometry.

---

### D. Carved Features & Procedural Normal/Bump/Roughness Mapping
- **Eliminate Plastic Shading Across All Models**:
  - Create a cached procedural texture synthesizer (`buildCarvedMaterialTextureSet`) that generates tileable HTML5 Canvas / `THREE.CanvasTexture` **Normal Maps, Bump Maps, and Roughness/Cavity Maps** for:
    - `carved-obsidian-runes` (deep chiseled stone grooves, weathered micro-pitting, and glowing rune channels)
    - `forged-damascus-relic-metal` (hammered fuller flutes, bevelled edge chamfers, brushed patina)
    - `ossified-leviathan-bone` (carved osteon grain, sutures, and etched sigil recesses)
    - `human-skin-and-stitched-leather` (epidermal micro-grain, knuckle creases, and stitched bracer relief)
  - Upgrade weapon builders (`buildImprovisedWeaponMesh`, compendium weapons, and Void Ball rings) with physical **carved geometric features**—recessed blade fullers, beveled guards, fluted shafts, and sunken rune collars—combined with the procedural `bumpMap` and `roughnessMap` so light catches every carved edge.

---

## 2. Planned File Changes

1. **`src/utils/carvedMaterialAndMindspaceEngine.ts` (New Module)**:
   - Procedural Canvas bump/normal/roughness texture generator (`getCarvedRelicMaterial`, `applyCarvedTexturesToHierarchy`) to replace flat plastic materials across weapons, hands, Portal Room structures, and entities.
   - Realistic Human Arm & 5-Finger Articulated Hand Builder (`buildRealisticHumanArmAndHandRig`) + Special Transformation Morph overlay meshes.
   - Right-Hand Pull-From-Void-Ball animation state machine (`VoidBallWeaponPullAnimationState`, `updateRightHandPullFromVoidBall`).
   - `Shift + V` 3D Mindspace Chamber & 3 Example Figures stage builder (`buildMindspaceCustomizationRig`, `updateMindspaceCustomizationRig`).
   - Void Ball 3D Orbital Menu Dial & Dynamic Quick-Key resolver (`getDynamicVoidDialQuickKeys`).
2. **`src/utils/visceralCombatAndGrabEngine.ts` & `src/utils/granularDirtAndInEngineCharacterRig.ts`**:
   - Upgrade weapon meshes with carved blade fullers, crossguards, pommel rings, and procedural bump/roughness maps.
   - Integrate Human vs. Special Morph Mode visibility and transformation transition effects on both the 1st-person hands and 3rd-person avatar rig.
3. **`src/components/ManifoldSandboxViewport.tsx`**:
   - Wire `Shift + V` to sink the camera into the 3D Mindspace Customization perspective with live 3D example figures.
   - Wire `V` according to the user's selected Void Dial control mode (`toggle-dial-quickkeys`, `hold-dial-tap-portal`, or `wheel-dial-click-confirm`).
   - Trigger the **Right-Hand Pull-From-Void-Ball Animation** whenever a weapon or tool is drawn from the Void Ball Weapons & Tools window.
   - Replace intrusive HUD panels (both in the exterior world and inside the Square Portal Room) with the customizable **Carved Relic HUD** and diegetic **Void Ball Menu Dial**.
