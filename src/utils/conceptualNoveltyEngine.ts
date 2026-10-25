import * as THREE from 'three';
import {
  ConceptualNoveltySeedId,
  ConceptualNoveltySeedSpec,
  FavoritedManifoldAnchor,
  ManifoldWorldSpec,
  PlacedWorldBuilding,
  POVFlowStateTelemetry,
  TerrainExcavationSpot,
  WorldspaceProceduralArtform,
} from '../types/manifold';
import { evaluateTerrainHeight } from './manifoldGenerator';
import { ArticulatedRagdollEntity } from './ragdollPhysics';
import {
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createTPMSGyroidShellGeometry,
} from './dimensionalBleedAndAnomalyEngine';

export const CONCEPTUAL_NOVELTY_SEED_CATALOG: Record<
  ConceptualNoveltySeedId,
  ConceptualNoveltySeedSpec
> = {
  'grunge-typography-graffiti-dirt': {
    id: 'grunge-typography-graffiti-dirt',
    promptOriginLabel: 'Prompts 1 & 10 · Biocomplex Dermis & Font/Graffiti Contrast',
    title: 'Grunge Font-Library Biocomplexity vs. Graffiti Dirt',
    glyphSymbol: 'Ω§',
    accentHex: '#f59e0b',
    behaviorMutation: {
      name: 'Calligraphic Stroke-Weight Stride & Ink-Trap Crouching',
      description:
        'Entities modulate stride cadence like variable-stroke Bodoni/Blackletter glyphs and crouch into recessed excavation craters ("ink-traps") to harvest mineral soot.',
      kinematicModulator: '+28% Stride Dynamic Contrast · Crater Ink-Trap Seeking',
    },
    modellingMutation: {
      name: 'Extruded Serif-Spur & Counter-Void Anatomy',
      description:
        'Expands hollow glyph-bowl counter-void apertures and razor-edged blackletter spurs on entity torsos while deepening matte graffiti-dirt collars at basal joints.',
      topologySignature: '1.35x Counter-Void Aperture & Serif-Spur Extrusion',
    },
    visualBoundaryMutation: {
      name: 'Topological Ridge-to-Dirt Specular Boundary',
      description:
        'Sharpens the normal-space boundary between high-gloss clearcoated typographic ridges and raw, chalky aerosol-grime crevices across skin, props, and terrain.',
      boundaryShaderMechanic: 'High-Contrast Serif Specular vs. Soot-Valley Boundary',
    },
  },
  'walk-in-void-bim-workforce': {
    id: 'walk-in-void-bim-workforce',
    promptOriginLabel: 'Prompt 2 · Walk-In Void Sphere & Workforce BIM Intuition',
    title: 'Walk-In Void Sphere & Autonomous BIM Workforce',
    glyphSymbol: '⌖⊞',
    accentHex: '#22d3ee',
    behaviorMutation: {
      name: 'Autonomous Crew Site-Survey & Cantilever Bracing',
      description:
        'Entities behave as an intuitive field engineering crew: orienting toward placed structures and the Walk-In Void Sphere to project laser-plumb lines and stabilize posture.',
      kinematicModulator: 'Structural Site-Homing & +22% Joint Posture Bracing',
    },
    modellingMutation: {
      name: '5-System CSI Diagrid & MEP Vascular Framing',
      description:
        'Extends articulated manipulator digits into precision caliper mudras and amplifies structural rib-trusses across entities and placed buildings.',
      topologySignature: 'CSI Diagrid Rib Expansion & Caliper Digit Lock',
    },
    visualBoundaryMutation: {
      name: 'Holographic Laser-Tolerance & Plumb-Line Seam',
      description:
        'Projects live 3D cyan laser-tolerance seams connecting active workforce entities to placed buildings and the Walk-In Void Crucible.',
      boundaryShaderMechanic: 'Live 3D BIM Laser-Plumb & Tolerance Ring Projection',
    },
  },
  'lexicon-26-cubed-shapeshift': {
    id: 'lexicon-26-cubed-shapeshift',
    promptOriginLabel: 'Prompts 3, 4 & 5 · 26³ Lexicon Loom & Shapeshift Ontology',
    title: '26³ Combinatorial Lexicon & Glyphic Choir',
    glyphSymbol: 'ÆΔ',
    accentHex: '#a855f7',
    behaviorMutation: {
      name: 'Triad-Resonance Choir Synchronization',
      description:
        'Entities form harmonic triangular choirs in 3D space, synchronizing their olfactory head-feeler oscillations and stride phase with your gaze.',
      kinematicModulator: 'Triangular Choir Orbit & Synchronized Feeler Cadence',
    },
    modellingMutation: {
      name: 'Polyhedral Dorsal Organ & Satellite Morphing',
      description:
        'Continuously morphs dorsal organ pipes, solar-sail fins, and orbiting lexicon satellites in phase with the 4D W-coordinate.',
      topologySignature: '1.45x Dorsal Apparatus & Lexicon Satellite Harmonics',
    },
    visualBoundaryMutation: {
      name: 'Chromatic Phase-Boundary Halo',
      description:
        'Renders a double-helix glyphic boundary ring around entities whose lexical anatomy is entrained with the player’s harmonic tether.',
      boundaryShaderMechanic: 'Phase-Locked Glyphic Perimeter & Chromatic Halo',
    },
  },
  'manifold-anchor-crystallization': {
    id: 'manifold-anchor-crystallization',
    promptOriginLabel: 'Prompt 6 · Manifold Anchors & Bookmark Seed Persistence',
    title: 'Manifold Anchor Beacons & Seed Attractor Wells',
    glyphSymbol: '⚓◈',
    accentHex: '#fbbf24',
    behaviorMutation: {
      name: 'Anchored Seed Homing & Gravity-Well Stabilization',
      description:
        'Bookmarked Manifold Anchors act as physical gravity-well attractors in the 3D world that heal entity ragdoll stun and boost player jump lift.',
      kinematicModulator: '2.0x Stun Recovery Near Anchors & +18% Anchor Lift',
    },
    modellingMutation: {
      name: '3D Crystalline Anchor Reliquary Spires',
      description:
        'Materializes physical 3D Crystalline Anchor Beacon spires on the terrain for every bookmarked dimensional seed in your Favorited Manifolds list.',
      topologySignature: 'Physical 3D Seed-Anchor Reliquary Beacons in World',
    },
    visualBoundaryMutation: {
      name: 'Cross-Seed Anchor Tether Filaments',
      description:
        'Weaves golden ground-hugging phase filaments between your player’s sheathed core and every 3D Manifold Anchor beacon in the world.',
      boundaryShaderMechanic: 'Golden Anchor-to-Core Continuity Filaments',
    },
  },
  'forerooms-4rumes-metric-bleed': {
    id: 'forerooms-4rumes-metric-bleed',
    promptOriginLabel: 'Prompt 7 · The Forerooms (4RumEs) & Deeper-Than-Inside',
    title: '4RumEs 8-Cell Metric Bleed & Deeper-Than-Inside',
    glyphSymbol: '4R',
    accentHex: '#38bdf8',
    behaviorMutation: {
      name: '8-Cell W-Phase Gravity Surfing & Apex Vaulting',
      description:
        'Fractional 5D metric bleed from the exterior Future surface curves airborne trajectories and grants low-gravity apex glide across W-phase crossings.',
      kinematicModulator: 'Low-G Apex Glide & 4D Cell Perspective Drift',
    },
    modellingMutation: {
      name: 'Sheathed Internal 4D Hypercube Expansion',
      description:
        'Amplifies the internal 4D Tesseract and Deeper-Than-Inside core sheathed inside the translucent anatomy of both the player and resonant entities.',
      topologySignature: 'Internal Sheathed 4D Core Resonance (Zero Graffiti)',
    },
    visualBoundaryMutation: {
      name: 'Subsurface Continuum Refraction Membrane',
      description:
        'Dynamically modulates the translucency of the outer biological skin sheath during motion so the internal 4D core refracts through the body cavity.',
      boundaryShaderMechanic: 'Velocity-Driven Subsurface Sheath Translucency',
    },
  },
  'karmic-artform-omniversal-substrate': {
    id: 'karmic-artform-omniversal-substrate',
    promptOriginLabel: 'Prompt 8 · Cross-Timeline Karmic Artforms & Omniversal Substrate',
    title: 'Karmic Artform Pilgrimage & Omniversal Substrate',
    glyphSymbol: '∞☷',
    accentHex: '#10b981',
    behaviorMutation: {
      name: 'Karmic Monument Pilgrimage & Substrate Communion',
      description:
        'Entities pilgrimage toward emergent 3D Worldspace Artforms, performing synchronized 4-digit communion rituals that accelerate Omniversal Substrate Identification.',
      kinematicModulator: 'Artform Pilgrimage & +25% Entrainment Coherence',
    },
    modellingMutation: {
      name: 'Biocomplex Interstitial Artform Harmonics',
      description:
        'Awakens secondary counter-rotating rings and crystalline spires on all 3D Worldspace Artforms and links them to entity dorsal spines.',
      topologySignature: 'Synchronized Artform-to-Entity Spine Harmonics',
    },
    visualBoundaryMutation: {
      name: 'Omniversal Substrate Ground-Bleed Lattice',
      description:
        'Projects luminous substrate-identification bridges across the terrain connecting the player, entities, and cross-timeline artform monuments.',
      boundaryShaderMechanic: 'Omniversal Bedrock Convergence Filaments',
    },
  },
};

export const ALL_CONCEPTUAL_NOVELTY_SEEDS: ConceptualNoveltySeedSpec[] =
  Object.values(CONCEPTUAL_NOVELTY_SEED_CATALOG);

export interface ConceptualNoveltyBoundaryRig {
  group: THREE.Group;
  anchorBeaconsGroup: THREE.Group;
  boundaryLinesMesh: THREE.LineSegments;
  boundaryLinesPositions: Float32Array;
  boundaryLinesColors: Float32Array;
  lastAnchoredCount: number;
  lastWorldSeed: number;
}

const MAX_BOUNDARY_SEGMENTS = 48;

export function buildConceptualNoveltyBoundaryRig(): ConceptualNoveltyBoundaryRig {
  const group = new THREE.Group();
  const anchorBeaconsGroup = new THREE.Group();
  group.add(anchorBeaconsGroup);

  const boundaryLinesPositions = new Float32Array(MAX_BOUNDARY_SEGMENTS * 2 * 3);
  const boundaryLinesColors = new Float32Array(MAX_BOUNDARY_SEGMENTS * 2 * 3);

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(boundaryLinesPositions, 3)
  );
  lineGeo.setAttribute(
    'color',
    new THREE.BufferAttribute(boundaryLinesColors, 3)
  );

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
  });

  const boundaryLinesMesh = new THREE.LineSegments(lineGeo, lineMat);
  boundaryLinesMesh.frustumCulled = false;
  group.add(boundaryLinesMesh);

  return {
    group,
    anchorBeaconsGroup,
    boundaryLinesMesh,
    boundaryLinesPositions,
    boundaryLinesColors,
    lastAnchoredCount: -1,
    lastWorldSeed: -1,
  };
}

/**
 * Rebuilds the physical 3D Manifold Anchor Reliquary Beacons in the worldspace
 * whenever the player bookmarks or unbookmarks a Favorited Manifold seed.
 */
function syncManifoldAnchor3DBeacons(
  rig: ConceptualNoveltyBoundaryRig,
  world: ManifoldWorldSpec,
  favoritedAnchors: FavoritedManifoldAnchor[],
  excavations: TerrainExcavationSpot[]
) {
  while (rig.anchorBeaconsGroup.children.length > 0) {
    const ch = rig.anchorBeaconsGroup.children[0];
    rig.anchorBeaconsGroup.remove(ch);
  }

  const count = Math.min(8, favoritedAnchors.length);
  for (let i = 0; i < count; i++) {
    const anchor = favoritedAnchors[i];
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + 0.45;
    const radius = 16.5 + (anchor.seed % 9);
    const bx = Math.cos(angle) * radius;
    const bz = Math.sin(angle) * radius;
    const by = evaluateTerrainHeight(bx, bz, world, excavations);

    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(bx, by, bz);
    beaconGroup.userData.anchorSeed = anchor.seed;

    const crystalSpire = new THREE.Mesh(
      createTPMSGyroidShellGeometry(0.56, 2.2, 16, 12, 3.2, 0.34),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#fbbf24'),
        emissive: new THREE.Color(anchor.versionLog.world.palette.accentColor),
        emissiveIntensity: 0.85,
        metalness: 0.45,
        roughness: 0.14,
        clearcoat: 0.95,
        transparent: true,
        opacity: 0.88,
      })
    );
    crystalSpire.position.y = 1.65;
    crystalSpire.userData.isAnchorCrystal = true;
    beaconGroup.add(crystalSpire);

    const haloRing = new THREE.Mesh(
      createDifferentialGrowthRibbonGeometry(0.95, 0.22, 9, 0.3),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#fbbf24'),
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      })
    );
    haloRing.position.y = 1.65;
    haloRing.userData.isAnchorRing = true;
    beaconGroup.add(haloRing);

    rig.anchorBeaconsGroup.add(beaconGroup);
  }
}

/**
 * Steps the active Conceptual Novelty Seed across Behavior, 3D Modelling, and Visual Boundaries,
 * while also computing the non-popping Continuous Spatiotemporal POV Flow telemetry.
 */
export function updateConceptualNoveltyEngine(params: {
  rig: ConceptualNoveltyBoundaryRig;
  activeSeedId: ConceptualNoveltySeedId;
  world: ManifoldWorldSpec;
  playerPos: THREE.Vector3;
  playerVel: THREE.Vector3;
  playerGrounded: boolean;
  isInsideVoidBall: boolean;
  continuityBlendAlpha: number;
  elevationSpringResidual: number;
  entities: ArticulatedRagdollEntity[];
  placedBuildings: PlacedWorldBuilding[];
  favoritedAnchors: FavoritedManifoldAnchor[];
  worldArtforms: WorldspaceProceduralArtform[];
  excavations: TerrainExcavationSpot[];
  nowSec: number;
  dt: number;
}): {
  povFlowTelemetry: POVFlowStateTelemetry;
  jumpBoostModulator: number;
  gravityModulator: number;
} {
  const {
    rig,
    activeSeedId,
    world,
    playerPos,
    playerVel,
    playerGrounded,
    isInsideVoidBall,
    continuityBlendAlpha,
    elevationSpringResidual,
    entities,
    placedBuildings,
    favoritedAnchors,
    worldArtforms,
    excavations,
    nowSec,
    dt,
  } = params;

  const seedSpec = CONCEPTUAL_NOVELTY_SEED_CATALOG[activeSeedId];
  const seedColor = new THREE.Color(seedSpec.accentHex);

  // 1. Rebuild 3D Manifold Anchor Beacons if favorited count or world seed changed
  if (
    rig.lastAnchoredCount !== favoritedAnchors.length ||
    rig.lastWorldSeed !== world.seed
  ) {
    rig.lastAnchoredCount = favoritedAnchors.length;
    rig.lastWorldSeed = world.seed;
    syncManifoldAnchor3DBeacons(rig, world, favoritedAnchors, excavations);
  }

  // Animate 3D Manifold Anchor Beacons
  for (let i = 0; i < rig.anchorBeaconsGroup.children.length; i++) {
    const beacon = rig.anchorBeaconsGroup.children[i];
    for (const ch of beacon.children) {
      if (ch.userData.isAnchorCrystal) {
        ch.rotation.y = nowSec * 1.4 + i;
        ch.position.y = 2.1 + Math.sin(nowSec * 2.2 + i) * 0.18;
      } else if (ch.userData.isAnchorRing) {
        ch.rotation.z = -nowSec * 1.8;
        const s =
          activeSeedId === 'manifold-anchor-crystallization' ? 1.35 : 1.0;
        ch.scale.setScalar(s + Math.sin(nowSec * 3.0 + i) * 0.08);
      }
    }
  }

  // 2. Apply Real-Time Behavioral, Modelling & Visual Boundary Mutations to Entities & Visual Seam Lines
  let segIndex = 0;
  const posArr = rig.boundaryLinesPositions;
  const colArr = rig.boundaryLinesColors;

  const pushBoundaryLine = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    cA: THREE.Color,
    cB: THREE.Color
  ) => {
    if (segIndex >= MAX_BOUNDARY_SEGMENTS) return;
    const base = segIndex * 6;
    posArr[base] = a.x;
    posArr[base + 1] = a.y;
    posArr[base + 2] = a.z;
    posArr[base + 3] = b.x;
    posArr[base + 4] = b.y;
    posArr[base + 5] = b.z;

    colArr[base] = cA.r;
    colArr[base + 1] = cA.g;
    colArr[base + 2] = cA.b;
    colArr[base + 3] = cB.r;
    colArr[base + 4] = cB.g;
    colArr[base + 5] = cB.b;
    segIndex++;
  };

  const playerCorePos = new THREE.Vector3(
    playerPos.x,
    playerPos.y + 1.15,
    playerPos.z
  );

  // Connect player core to 3D Manifold Anchor Beacons when anchor seed or substrate seed is active
  if (
    activeSeedId === 'manifold-anchor-crystallization' ||
    activeSeedId === 'karmic-artform-omniversal-substrate'
  ) {
    for (let i = 0; i < rig.anchorBeaconsGroup.children.length; i++) {
      const beacon = rig.anchorBeaconsGroup.children[i];
      const topPos = beacon.position.clone().add(new THREE.Vector3(0, 2.1, 0));
      if (topPos.distanceTo(playerCorePos) < 48) {
        pushBoundaryLine(
          playerCorePos,
          topPos,
          seedColor,
          new THREE.Color('#fbbf24')
        );
      }
    }
  }

  for (let eIdx = 0; eIdx < entities.length; eIdx++) {
    const ent = entities[eIdx];
    const pelvis = ent.particles[0].pos;
    const torso = ent.particles[1].pos;

    // Modelling Mutation: Morph the entity's 3D Typographic Counter-Void & Dorsal Apparatus
    const glyphVoidGroup = ent.torsoMesh.userData.glyphCounterVoidGroup as
      | THREE.Group
      | undefined;
    if (glyphVoidGroup) {
      const targetGlyphScale =
        activeSeedId === 'grunge-typography-graffiti-dirt'
          ? 1.38 + Math.sin(nowSec * 3.5 + eIdx) * 0.14
          : 1.0;
      glyphVoidGroup.scale.setScalar(targetGlyphScale);
      glyphVoidGroup.rotation.z =
        activeSeedId === 'grunge-typography-graffiti-dirt'
          ? Math.sin(nowSec * 2.2 + eIdx) * 0.18
          : 0;
    }

    const dorsalGroup = ent.torsoMesh.userData.dorsalApparatusGroup as
      | THREE.Group
      | undefined;
    if (dorsalGroup && activeSeedId === 'lexicon-26-cubed-shapeshift') {
      dorsalGroup.scale.setScalar(1.42 + Math.sin(nowSec * 4.0 + eIdx) * 0.16);
    }

    // Behavioral & Visual Boundary Mutations per Seed:
    if (activeSeedId === 'grunge-typography-graffiti-dirt') {
      // Seek recessed ink-trap excavation craters & amplify calligraphic stride contrast
      if (excavations.length > 0) {
        const nearestEx = excavations[eIdx % excavations.length];
        const dx = nearestEx.x - pelvis.x;
        const dz = nearestEx.z - pelvis.z;
        if (Math.hypot(dx, dz) < 28) {
          ent.targetHeading = Math.atan2(dx, dz);
          ent.activeBehaviorLabel = 'Ink-Trap Crater Bracing & Soot Harvest';
          pushBoundaryLine(
            torso,
            new THREE.Vector3(nearestEx.x, pelvis.y - 0.5, nearestEx.z),
            seedColor,
            new THREE.Color('#573b26')
          );
        }
      }
    } else if (activeSeedId === 'walk-in-void-bim-workforce') {
      // Autonomous BIM Workforce Site-Survey: orient toward nearest Placed Building and project laser-plumb lines
      if (placedBuildings.length > 0) {
        const bld = placedBuildings[eIdx % placedBuildings.length];
        const bldTop = new THREE.Vector3(bld.x, bld.y + 3.2, bld.z);
        const dist = pelvis.distanceTo(bldTop);
        if (dist < 36) {
          ent.targetHeading = Math.atan2(bld.x - pelvis.x, bld.z - pelvis.z);
          ent.currentStiffness = Math.min(0.98, ent.currentStiffness + dt * 0.4);
          ent.activeBehaviorLabel = `BIM Workforce Survey (${bld.presetName})`;
          pushBoundaryLine(
            torso,
            bldTop,
            new THREE.Color('#22d3ee'),
            new THREE.Color('#a855f7')
          );
        }
      } else {
        // Project BIM survey tether toward the Walk-In Void Sanctuary locus
        const voidLocus = new THREE.Vector3(-7.5, pelvis.y, 5.5);
        if (pelvis.distanceTo(voidLocus) < 34) {
          pushBoundaryLine(
            torso,
            voidLocus,
            new THREE.Color('#22d3ee'),
            new THREE.Color('#38bdf8')
          );
        }
      }
    } else if (activeSeedId === 'lexicon-26-cubed-shapeshift') {
      // Triad-Resonance Choir: link entities in a triangular glyphic boundary web
      const nextEnt = entities[(eIdx + 1) % entities.length];
      if (nextEnt && nextEnt.id !== ent.id) {
        const nextTorso = nextEnt.particles[1].pos;
        if (torso.distanceTo(nextTorso) < 28) {
          ent.activeBehaviorLabel = `26³ Lexicon Choir [${ent.blueprint.lexiconTriad?.[0] ?? 'A'}]`;
          pushBoundaryLine(
            torso,
            nextTorso,
            seedColor,
            new THREE.Color('#22d3ee')
          );
        }
      }
    } else if (activeSeedId === 'manifold-anchor-crystallization') {
      // Home toward 3D Manifold Anchor Beacons and accelerate ragdoll recovery
      if (ent.stunTimer > 0) {
        ent.stunTimer = Math.max(0, ent.stunTimer - dt * 1.2);
      }
      if (rig.anchorBeaconsGroup.children.length > 0) {
        const beacon =
          rig.anchorBeaconsGroup.children[
            eIdx % rig.anchorBeaconsGroup.children.length
          ];
        const bPos = beacon.position;
        if (pelvis.distanceTo(bPos) < 35) {
          const tangent =
            Math.atan2(bPos.x - pelvis.x, bPos.z - pelvis.z) + 0.45;
          ent.targetHeading = tangent;
          ent.activeBehaviorLabel = `Anchor Seed #${beacon.userData.anchorSeed} Orbit`;
          pushBoundaryLine(
            torso,
            bPos.clone().add(new THREE.Vector3(0, 2.1, 0)),
            new THREE.Color('#fbbf24'),
            seedColor
          );
        }
      }
    } else if (activeSeedId === 'forerooms-4rumes-metric-bleed') {
      // 4RumEs Metric Bleed: connect entity internal sheathed core to the player's sheathed 4D core
      if (torso.distanceTo(playerCorePos) < 26) {
        ent.activeBehaviorLabel = '4RumEs Fractional Metric Entrainment';
        pushBoundaryLine(
          torso,
          playerCorePos,
          new THREE.Color('#38bdf8'),
          new THREE.Color('#a855f7')
        );
      }
    } else if (activeSeedId === 'karmic-artform-omniversal-substrate') {
      // Pilgrimage toward emergent 3D Worldspace Artforms & weave Omniversal Substrate lattice
      if (worldArtforms.length > 0) {
        const art = worldArtforms[eIdx % worldArtforms.length];
        const artY = evaluateTerrainHeight(art.x, art.z, world, excavations);
        const artPos = new THREE.Vector3(art.x, artY + 2.2, art.z);
        if (pelvis.distanceTo(artPos) < 42) {
          ent.targetHeading = Math.atan2(art.x - pelvis.x, art.z - pelvis.z);
          ent.activeBehaviorLabel = `Karmic Artform Pilgrimage (${art.title.slice(0, 18)})`;
          pushBoundaryLine(
            torso,
            artPos,
            new THREE.Color('#10b981'),
            new THREE.Color(art.accentColor)
          );
        }
      }
    }
  }

  // Zero out unused line segments
  for (let k = segIndex * 6; k < posArr.length; k++) {
    posArr[k] = 0;
    colArr[k] = 0;
  }
  rig.boundaryLinesMesh.geometry.attributes.position.needsUpdate = true;
  rig.boundaryLinesMesh.geometry.attributes.color.needsUpdate = true;

  // 3. Compute Continuous Spatiotemporal POV Flow State Machine Telemetry
  let activeFlowState: POVFlowStateTelemetry['activeFlowState'] =
    'grounded-continuum-flow';
  if (isInsideVoidBall) {
    activeFlowState = 'void-crucible-immersion';
  } else if (continuityBlendAlpha > 0.04) {
    activeFlowState = 'dimensional-slipstream-morph';
  } else if (!playerGrounded || Math.abs(playerVel.y) > 1.2) {
    activeFlowState = 'ballistic-apex-glide';
  }

  const jumpBoostModulator =
    activeSeedId === 'manifold-anchor-crystallization'
      ? 1.18
      : activeSeedId === 'forerooms-4rumes-metric-bleed'
      ? 1.14
      : 1.0;

  const gravityModulator =
    activeSeedId === 'forerooms-4rumes-metric-bleed' ? 0.84 : 1.0;

  return {
    povFlowTelemetry: {
      activeFlowState,
      continuityBlendAlpha: Number(continuityBlendAlpha.toFixed(2)),
      elevationSpringResidual: Number(elevationSpringResidual.toFixed(2)),
      activeNoveltySeedId: activeSeedId,
      activeNoveltyBoundaryLabel: seedSpec.visualBoundaryMutation.name,
    },
    jumpBoostModulator,
    gravityModulator,
  };
}
