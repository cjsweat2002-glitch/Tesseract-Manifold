import * as THREE from 'three';
import {
  BehaviorEvaluationOutput,
  DamageGoreModality,
  DimensionalGoreGenre,
  EcologicalDietRole,
  EntityBlueprint,
  EntityGeneticDNA,
  EntityRuntimeTelemetry,
  FrontierComplexSite,
  InternalDamageTelemetry,
  ManifoldWorldSpec,
  SkinTopologyTelemetry,
  TerrainExcavationSpot,
} from '../types/manifold';
import {
  buildEntityBodyPartMesh,
  evaluateTerrainHeight,
  evaluateUnifiedAuthoritativeFloorY,
} from './manifoldGenerator';
import { BiomeWeatherFieldSample } from './weather5DSystem';
import {
  resolveEntitySkinTopology,
  updateSkinTopologyAndDeformation,
} from './skinTopologyEngine';
import { AnomalousObjectInstance } from './dimensionalBleedAndAnomalyEngine';
import {
  harmonicSoundscape,
  resolvePainPleasureVocalNode,
} from './harmonicSoundscapeEngine';
import {
  DimensionalGoreGenreSpec,
  evaluateComplexDamageInteraction,
  resolveDimensionalGoreGenre,
  synthesizeInitialEntityDNA,
} from './evolutionaryEcologyEngine';
import { sharedGeometryPool } from './graphicsMeshAndCollisionEngine';

export interface RagdollParticle {
  id: string;
  pos: THREE.Vector3;
  prevPos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  invMass: number;
}

export interface RagdollConstraint {
  a: number; // index in particles
  b: number; // index in particles
  restLength: number;
  stiffness: number;
}

export interface LimbChainIndices {
  legIndex: number;
  hipAngleOffset: number;
  kneeIdx: number;
  footIdx: number;
  upperMesh: THREE.Object3D;
  lowerMesh: THREE.Object3D;
  stridePhaseOffset: number;
  tendonIntegrity: number; // 1.0 = intact, < 0.45 = severed/limping tendon
}

interface GoreDropletInstance {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  active: boolean;
}

export class ArticulatedRagdollEntity {
  public id: string;
  public blueprint: EntityBlueprint;
  public rootGroup: THREE.Group;

  // Core skeletal particles:
  // 0: Pelvis, 1: Torso/Chest, 2: Head
  // Followed by (knee, foot) pairs for each leg
  public particles: RagdollParticle[] = [];
  public constraints: RagdollConstraint[] = [];
  public limbs: LimbChainIndices[] = [];

  public pelvisMesh: THREE.Object3D;
  public torsoMesh: THREE.Object3D;
  public headMesh: THREE.Object3D;
  public selectionRing: THREE.Mesh;
  public contactShadowMesh: THREE.Mesh;

  // 3D Internal Gore & Arterial Bleed Particle Pool + Viscera Siphon Tether
  private goreDroplets: GoreDropletInstance[] = [];
  private siphonTendrilMesh: THREE.Mesh;

  // Navigation, ecological interaction, internal damage & kinematics state
  public headingAngle: number = 0;
  public targetHeading: number = 0;
  public gaitCycle: number = 0;
  public animTime: number = Math.random() * 100;
  public stunTimer: number = 0; // > 0 when hit by kinetic impulse, predator strike, or shockwave
  public forcedRagdoll: boolean = false;
  public wPhaseOffset: number = 0;
  public currentStiffness: number = 0.85;
  public activeBehaviorLabel: string = 'Harmonic Stride';
  public interactionMode:
    | 'stride'
    | 'sky-communion'
    | 'symbiotic-ritual'
    | 'gale-bracing'
    | 'scent-foraging'
    | 'anomaly-vigil'
    | 'smin-coalescence'
    | 'schism-divergence'
    | 'predator-stalking'
    | 'predator-gore-strike'
    | 'wounded-limp-retreat' = 'stride';
  public strainHeatmapEnabled: boolean = false;
  public latestWindSpeed: number = 4.0;
  public latestSkinTelemetry?: SkinTopologyTelemetry;

  // Internal Damage, Gore Bleed & Pain/Pleasure State
  public structuralHealth: number = 1.0; // 1.0 = healthy, 0.12 = critically wounded/eviscerated
  public activeBleedRate: number = 0.0; // 0.0 to 1.0
  public exposedVisceraRatio: number = 0.0; // 0.0 to 1.0
  public dominantGoreType: DamageGoreModality | 'intact-homeostasis' =
    'intact-homeostasis';
  public activeGoreGenre: DimensionalGoreGenre = 'ferro-mercury-coagulation';
  public painPleasureGradient: number = 0.12; // -1.0 (Agonal Pain) to +1.0 (Ecstatic Pleasure / Predatory Satiation)
  public predatorStrikeCooldown: number = 0;
  public vocalCooldown: number = 1.5 + Math.random() * 2.5;
  public activePredatorTargetName: string | null = null;

  // Evolutionary DNA, Frontier Exploration, Husbandry & Ecological Activity State
  public geneticDNA: EntityGeneticDNA;
  public activeEcologicalActivity: string = 'Native Patrol';
  public pendingOrganEjection: {
    pos: THREE.Vector3;
    modality: DamageGoreModality;
  } | null = null;
  public lastSwayPhase: number = 0;
  public lastElasticRatio: number = 0.15;
  public defecationTimer: number = 14 + Math.random() * 18;
  public caveExcavationTimer: number = 22 + Math.random() * 25;
  public frontierMutationTimer: number = 16 + Math.random() * 20;

  constructor(
    id: string,
    blueprint: EntityBlueprint,
    spawnPos: THREE.Vector3,
    wPhaseOffset: number = 0
  ) {
    this.id = id;
    this.blueprint = blueprint;
    this.geneticDNA = synthesizeInitialEntityDNA(blueprint, 408291);
    this.wPhaseOffset = wPhaseOffset;
    this.headingAngle = Math.random() * Math.PI * 2;
    this.targetHeading = this.headingAngle;
    this.rootGroup = new THREE.Group();

    const legLen = blueprint.limbLength;
    const pelvisHeight = legLen * 1.15;
    const torsoLen = 0.78 * blueprint.torsoScale[1];
    const headLen = 0.52;

    // 0: Pelvis
    const pPelvis = spawnPos.clone().add(new THREE.Vector3(0, pelvisHeight, 0));
    // 1: Torso
    const pTorso = pPelvis.clone().add(new THREE.Vector3(0, torsoLen, 0));
    // 2: Head
    const pHead = pTorso.clone().add(new THREE.Vector3(0, headLen, 0));

    this.addParticle('pelvis', pPelvis, 0.28, 1.0);
    this.addParticle('torso', pTorso, 0.34, 0.9);
    this.addParticle('head', pHead, 0.24, 1.2);

    // Spine constraints
    this.addConstraint(0, 1, torsoLen, 0.98);
    this.addConstraint(1, 2, headLen, 0.98);
    // Spinal anti-fold brace (Pelvis to Head soft distance)
    this.addConstraint(0, 2, torsoLen + headLen, 0.55);

    // Build custom 3D body meshes from blueprint
    this.pelvisMesh = buildEntityBodyPartMesh('pelvis', blueprint);
    this.torsoMesh = buildEntityBodyPartMesh('torso', blueprint);
    this.headMesh = buildEntityBodyPartMesh('head', blueprint);

    this.rootGroup.add(this.pelvisMesh);
    this.rootGroup.add(this.torsoMesh);
    this.rootGroup.add(this.headMesh);

    // Subtle ground telemetry ring
    const ringGeo = new THREE.RingGeometry(0.65, 0.78, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(blueprint.jointGlowColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectionRing.rotation.x = -Math.PI / 2;
    this.rootGroup.add(this.selectionRing);

    // Soft radial contact shadow decal grounded directly beneath the entity
    this.contactShadowMesh = sharedGeometryPool.createGroundedContactShadowMesh(
      1.35,
      0.56
    );
    this.rootGroup.add(this.contactShadowMesh);

    // Build Articulated Limbs (2, 3, 4, or 6 legs depending on morphology)
    const legCount = blueprint.legCount;
    const upperLen = legLen * 0.56;
    const lowerLen = legLen * 0.58;

    for (let i = 0; i < legCount; i++) {
      const angleOffset =
        legCount === 2
          ? i === 0
            ? Math.PI * 0.5
            : -Math.PI * 0.5
          : (i / legCount) * Math.PI * 2 + Math.PI * 0.25;

      const hipRadius = legCount > 2 ? 0.42 : 0.28;
      const kneePos = pPelvis
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(angleOffset) * (hipRadius + upperLen * 0.45),
            -upperLen * 0.7,
            Math.sin(angleOffset) * (hipRadius + upperLen * 0.45)
          )
        );
      const footPos = kneePos
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(angleOffset) * 0.12,
            -lowerLen,
            Math.sin(angleOffset) * 0.12
          )
        );

      const kneeIdx = this.addParticle(`knee-${i}`, kneePos, 0.14, 1.4);
      const footIdx = this.addParticle(`foot-${i}`, footPos, 0.12, 1.6);

      // Structural limb bones
      this.addConstraint(0, kneeIdx, upperLen, 0.95);
      this.addConstraint(kneeIdx, footIdx, lowerLen, 0.95);
      // Soft knee hyper-extension limiter connecting torso to knee
      this.addConstraint(
        1,
        kneeIdx,
        Math.hypot(torsoLen, upperLen * 0.85),
        0.32
      );

      const upperMesh = buildEntityBodyPartMesh('upper-limb', blueprint);
      const lowerMesh = buildEntityBodyPartMesh('lower-limb', blueprint);
      this.rootGroup.add(upperMesh);
      this.rootGroup.add(lowerMesh);

      this.limbs.push({
        legIndex: i,
        hipAngleOffset: angleOffset,
        kneeIdx,
        footIdx,
        upperMesh,
        lowerMesh,
        stridePhaseOffset: (i / legCount) * Math.PI * 2,
        tendonIntegrity: 1.0,
      });
    }

    // Initialize Pool of 12 3D Arterial Ichor / Marrow Splinter Gore Droplets
    const dropletGeo = new THREE.IcosahedronGeometry(0.075, 1);
    for (let g = 0; g < 12; g++) {
      const dropletMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#be123c'),
        emissive: new THREE.Color('#f43f5e'),
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1.0,
      });
      const mesh = new THREE.Mesh(dropletGeo, dropletMat);
      mesh.visible = false;
      this.rootGroup.add(mesh);
      this.goreDroplets.push({
        mesh,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        age: 0,
        maxAge: 0.95,
        active: false,
      });
    }

    // Initialize Predatory Viscera-Siphon / Hemophagic Feeding Tendril
    const tendrilGeo = new THREE.CylinderGeometry(0.032, 0.055, 1.0, 10, 6);
    const tendrilMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e11d48'),
      emissive: new THREE.Color('#fb7185'),
      emissiveIntensity: 0.95,
      roughness: 0.15,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.88,
    });
    this.siphonTendrilMesh = new THREE.Mesh(tendrilGeo, tendrilMat);
    this.siphonTendrilMesh.visible = false;
    this.rootGroup.add(this.siphonTendrilMesh);
  }

  private addParticle(
    id: string,
    pos: THREE.Vector3,
    radius: number,
    invMass: number
  ): number {
    const idx = this.particles.length;
    this.particles.push({
      id,
      pos: pos.clone(),
      prevPos: pos.clone(),
      vel: new THREE.Vector3(),
      radius,
      invMass,
    });
    return idx;
  }

  private addConstraint(
    a: number,
    b: number,
    restLength: number,
    stiffness: number
  ) {
    this.constraints.push({ a, b, restLength, stiffness });
  }

  public getEcologicalRole(): EcologicalDietRole {
    if (this.blueprint.ecologicalRole) {
      return this.blueprint.ecologicalRole;
    }
    const morph = this.blueprint.morphology;
    if (morph === 'hexapod-arachnid') return 'hemophagic-stalker';
    if (morph === 'avian-tensor-raptor') return 'synaptic-parasite-raptor';
    if (morph === 'reliquary-golem' || morph === 'quadruped-strider')
      return 'osteophagic-crusher';
    if (morph === 'serpentine-leviathan' || morph === 'abyssal-cetacean')
      return 'viscera-siphon-leviathan';
    return 'symbiont-grazer';
  }

  public getSpecializedAttackModality(): DamageGoreModality {
    if (this.blueprint.specializedAttackDamage) {
      return this.blueprint.specializedAttackDamage;
    }
    const role = this.getEcologicalRole();
    switch (role) {
      case 'hemophagic-stalker':
        return 'laceration-hemorrhage';
      case 'osteophagic-crusher':
        return 'calcified-marrow-shatter';
      case 'viscera-siphon-leviathan':
        return 'hydrostatic-viscera-rupture';
      case 'synaptic-parasite-raptor':
        return 'neural-synapse-hemolysis';
      default:
        return 'corrosive-ichor-dissolution';
    }
  }

  /**
   * Inflicts internal anatomical trauma, dimensional liquid gore spray, complex damage synergy,
   * tendon severing, and triggers a somatic Pain Vocalization scaled by distance to the explorer.
   */
  public applyInternalGoreTrauma(
    modality: DamageGoreModality,
    severity: number, // 0.15 to 0.65
    impulseVec: THREE.Vector3,
    listenerPos?: THREE.Vector3,
    goreGenreOverride?: DimensionalGoreGenreSpec
  ) {
    const goreSpec =
      goreGenreOverride ??
      resolveDimensionalGoreGenre(
        'non-euclidean-spires',
        this.activeGoreGenre
      );
    const interaction = evaluateComplexDamageInteraction(
      this.dominantGoreType,
      modality,
      goreSpec
    );

    this.dominantGoreType = modality;
    this.structuralHealth = Math.max(
      0.12,
      this.structuralHealth - severity * 0.55 * interaction.bleedJetMultiplier * 0.75
    );
    this.activeBleedRate = Math.min(
      1.0,
      this.activeBleedRate + severity * 0.75 * interaction.bleedJetMultiplier
    );
    this.exposedVisceraRatio = Math.min(
      1.0,
      this.exposedVisceraRatio +
        severity * 0.65 +
        interaction.visceraExposureDelta
    );
    this.activeEcologicalActivity = interaction.synergyLabel;

    // Shift Pain/Pleasure Gradient sharply into Agonal Trauma (-1.0 to -0.35)
    this.painPleasureGradient = Math.max(
      -1.0,
      Math.min(-0.35, this.painPleasureGradient - severity * 1.45)
    );

    // Sever or weaken a limb tendon under calcified-marrow-shatter or laceration-hemorrhage
    if (
      (modality === 'calcified-marrow-shatter' ||
        modality === 'laceration-hemorrhage') &&
      this.limbs.length > 0
    ) {
      const targetLimb =
        this.limbs[Math.floor(Math.random() * this.limbs.length)];
      targetLimb.tendonIntegrity = Math.max(
        0.18,
        targetLimb.tendonIntegrity - severity * 0.85
      );
    }

    // Spawn 3D Dimensional Gore Genre Liquid / Crystal Burst from the Torso Cavity
    const torsoPos = this.particles[1].pos;
    const goreColorHex =
      modality === 'calcified-marrow-shatter'
        ? goreSpec.secondaryClotHex
        : goreSpec.primaryLiquidHex;

    let spawned = 0;
    const targetBurstCount = Math.min(
      10,
      Math.round(6 * interaction.bleedJetMultiplier)
    );
    for (const drop of this.goreDroplets) {
      if (!drop.active && spawned < targetBurstCount) {
        drop.active = true;
        drop.age = 0;
        drop.maxAge = 0.85 + goreSpec.viscosity * 0.65;
        drop.pos.copy(torsoPos).add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.3) * 0.35,
            (Math.random() - 0.5) * 0.35
          )
        );
        drop.vel
          .copy(impulseVec)
          .multiplyScalar(0.24 * interaction.dropletVelocityBoost)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 6.8 * interaction.dropletVelocityBoost,
              (3.2 + Math.random() * 4.5) * (1.0 + goreSpec.buoyancyLift * 0.4),
              (Math.random() - 0.5) * 6.8 * interaction.dropletVelocityBoost
            )
          );
        const mat = drop.mesh.material as THREE.MeshPhysicalMaterial;
        mat.color.set(goreColorHex);
        mat.emissive.set(
          spawned % 2 === 0
            ? goreSpec.primaryLiquidHex
            : goreSpec.secondaryClotHex
        );
        mat.emissiveIntensity = goreSpec.emissiveIntensity;
        mat.metalness =
          goreSpec.id === 'ferro-mercury-coagulation' ? 0.88 : 0.22;
        mat.roughness = 0.08 + goreSpec.viscosity * 0.25;
        drop.mesh.position.copy(drop.pos);
        drop.mesh.scale.set(
          0.95,
          0.95 * goreSpec.dropletStretchFactor,
          0.95
        );
        drop.mesh.visible = true;
        spawned++;
      }
    }

    // Physical ragdoll shock
    this.applyKineticImpulse(
      impulseVec.clone().multiplyScalar(interaction.dropletVelocityBoost),
      1.8 + severity * 1.6
    );

    // Queue physical 3D Visceral Organ & DNA Helix Core ejection into the 3D world
    this.pendingOrganEjection = {
      pos: torsoPos.clone().add(new THREE.Vector3(0, 0.45, 0)),
      modality,
    };

    // Trigger Somatic Pain Vocalization
    const dist = listenerPos ? torsoPos.distanceTo(listenerPos) : 8.0;
    harmonicSoundscape.triggerPainPleasureVocalization({
      painPleasureGradient: this.painPleasureGradient,
      goreType: modality,
      creatureMass: this.blueprint.mass,
      distanceToListener: dist,
    });
  }

  /**
   * Injects a 3D physical impulse into the articulated ragdoll skeleton
   * (e.g. projectile collision, shockwave blast, upward tether tug, or ragdoll trip).
   */
  public applyKineticImpulse(
    impulseVec: THREE.Vector3,
    stunDurationSec: number = 2.6
  ) {
    this.stunTimer = Math.max(this.stunTimer, stunDurationSec);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.2) * 2.5,
        (Math.random() - 0.5) * 3.5
      );
      const scale = i === 1 || i === 2 ? 1.15 : 0.85;
      p.prevPos.sub(
        impulseVec
          .clone()
          .multiplyScalar(0.016 * scale)
          .add(jitter.multiplyScalar(0.016))
      );
    }
  }

  /**
   * Steps the 4D Node Behavior controller, Whole-Biome Weather Physics, Natural Predator Hunting,
   * Internal Gore & Bleed Physics, and Verlet multi-joint ragdoll physics.
   */
  public stepPhysics(
    dt: number,
    world: ManifoldWorldSpec,
    behavior: BehaviorEvaluationOutput,
    playerPos: THREE.Vector3,
    allEntities: ArticulatedRagdollEntity[],
    weatherSample?: BiomeWeatherFieldSample,
    excavations?: TerrainExcavationSpot[],
    anomalousObjects?: AnomalousObjectInstance[],
    localBleedCoeff: number = 0,
    goreGenreOverride?: DimensionalGoreGenre | null,
    frontierComplexes?: FrontierComplexSite[]
  ) {
    const clampedDt = Math.min(dt, 0.033);
    this.animTime += clampedDt;
    this.defecationTimer -= clampedDt;
    this.caveExcavationTimer -= clampedDt;
    this.frontierMutationTimer -= clampedDt;
    this.lastSwayPhase = behavior.limbSwayPhase ?? 0;
    this.lastElasticRatio = behavior.elasticDeformationRatio ?? 0.15;

    const goreSpec = resolveDimensionalGoreGenre(
      world.archetype,
      goreGenreOverride
    );
    this.activeGoreGenre = goreSpec.id;

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - clampedDt);
    }
    if (this.predatorStrikeCooldown > 0) {
      this.predatorStrikeCooldown = Math.max(
        0,
        this.predatorStrikeCooldown - clampedDt
      );
    }
    if (this.vocalCooldown > 0) {
      this.vocalCooldown = Math.max(0, this.vocalCooldown - clampedDt);
    }

    const pelvis = this.particles[0];
    const torso = this.particles[1];
    const head = this.particles[2];

    // 0. Natural Tissue Coagulation, Regeneration & Continuous Dimensional Liquid Bleed Emitter
    if (this.activeBleedRate > 0.01) {
      this.activeBleedRate = Math.max(
        0,
        this.activeBleedRate - clampedDt * (0.045 + goreSpec.viscosity * 0.04)
      );
      if (Math.random() < this.activeBleedRate * 0.38) {
        for (const drop of this.goreDroplets) {
          if (!drop.active) {
            drop.active = true;
            drop.age = 0;
            drop.maxAge = 0.75 + goreSpec.viscosity * 0.5;
            drop.pos.copy(torso.pos).add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 0.25,
                -0.1,
                (Math.random() - 0.5) * 0.25
              )
            );
            drop.vel.set(
              (Math.random() - 0.5) * 2.4,
              1.2 + goreSpec.buoyancyLift * 2.5 + Math.random() * 1.8,
              (Math.random() - 0.5) * 2.4
            );
            const mat = drop.mesh.material as THREE.MeshPhysicalMaterial;
            mat.color.set(goreSpec.primaryLiquidHex);
            mat.emissive.set(goreSpec.secondaryClotHex);
            mat.emissiveIntensity = goreSpec.emissiveIntensity;
            drop.mesh.position.copy(drop.pos);
            drop.mesh.scale.set(
              0.72,
              0.72 * goreSpec.dropletStretchFactor,
              0.72
            );
            drop.mesh.visible = true;
            break;
          }
        }
      }
    } else if (this.structuralHealth < 1.0) {
      this.structuralHealth = Math.min(
        1.0,
        this.structuralHealth + clampedDt * 0.035
      );
      this.exposedVisceraRatio = Math.max(
        0,
        this.exposedVisceraRatio - clampedDt * 0.045
      );
      for (const limb of this.limbs) {
        limb.tendonIntegrity = Math.min(
          1.0,
          limb.tendonIntegrity + clampedDt * 0.04
        );
      }
      if (this.structuralHealth > 0.92 && this.exposedVisceraRatio < 0.05) {
        this.dominantGoreType = 'intact-homeostasis';
      }
    }

    // Step 3D Aesthetic Liquid Bleed Physics per Dimensional Gore Genre
    for (const drop of this.goreDroplets) {
      if (!drop.active) continue;
      drop.age += clampedDt;

      // Buoyancy vs Gravity + Viscous Drag + Hyperbolic Vortex Swirl
      const netGravity = world.gravity * (0.85 - goreSpec.buoyancyLift * 1.15);
      drop.vel.y -= netGravity * clampedDt;
      const drag = Math.max(0.86, 1.0 - goreSpec.viscosity * clampedDt * 2.2);
      drop.vel.multiplyScalar(drag);

      if (goreSpec.id === 'hyperbolic-void-plasm') {
        // Lorentz orbital swirl around torso wound
        const dx = drop.pos.x - torso.pos.x;
        const dz = drop.pos.z - torso.pos.z;
        drop.vel.x += -dz * 4.5 * clampedDt;
        drop.vel.z += dx * 4.5 * clampedDt;
      }

      drop.pos.addScaledVector(drop.vel, clampedDt);

      const gY = evaluateTerrainHeight(
        drop.pos.x,
        drop.pos.z,
        world,
        excavations
      );
      if (drop.pos.y <= gY + 0.05) {
        drop.pos.y = gY + 0.05;
        drop.vel.x *= 0.25;
        drop.vel.z *= 0.25;
        drop.vel.y = 0;
        if (goreSpec.id === 'ferro-mercury-coagulation') {
          // Magnetic ferrofluid spike clot on impact
          drop.mesh.scale.set(0.65, 2.45 * goreSpec.surfaceTension, 0.65);
        } else if (goreSpec.id === 'vitreous-amber-crystallization') {
          // Non-Newtonian crystalline shard spall
          drop.mesh.scale.set(1.85, 0.85, 0.45);
        } else {
          // Viscous puddle pool
          drop.mesh.scale.set(1.75, 0.18, 1.75);
        }
      } else {
        // Elongate droplet along velocity vector according to surface tension & stretch factor
        const speed = drop.vel.length();
        const stretch = Math.min(
          3.8,
          1.0 + speed * 0.14 * goreSpec.dropletStretchFactor
        );
        drop.mesh.scale.set(0.75 / Math.sqrt(stretch), 0.75 * stretch, 0.75 / Math.sqrt(stretch));
        drop.mesh.rotation.x += clampedDt * 6;
        drop.mesh.rotation.z += clampedDt * 5;
      }
      drop.mesh.position.copy(drop.pos);

      if (drop.age >= drop.maxAge) {
        drop.active = false;
        drop.mesh.visible = false;
      }
    }

    const piezoMod = weatherSample ? weatherSample.piezoStiffnessMultiplier : 1.0;

    // Effective muscle stiffness combines 4D Node Graph, blueprint stiffness, internal structural health, and stun decay
    const healthStiffnessMod = 0.38 + 0.62 * this.structuralHealth;
    let targetStiffness =
      behavior.muscleStiffness *
      (0.35 + 0.65 * this.blueprint.baseStiffness) *
      piezoMod *
      healthStiffnessMod;
    if (this.forcedRagdoll) {
      targetStiffness = 0.01;
    } else if (this.stunTimer > 0.4) {
      targetStiffness *= 0.06; // Limp ragdoll while stunned from impact
    } else if (this.stunTimer > 0) {
      targetStiffness *= 1.0 - this.stunTimer / 0.4;
    }

    this.currentStiffness +=
      (Math.min(0.98, targetStiffness) - this.currentStiffness) * 0.18;

    const groundYAtPelvis = evaluateUnifiedAuthoritativeFloorY(
      pelvis.pos.x,
      pelvis.pos.z,
      pelvis.pos.y,
      world,
      excavations
    );

    const weatherGravMult = weatherSample
      ? weatherSample.effectiveGravityMultiplier
      : 1.0;
    const gravityAccel =
      -world.gravity *
      weatherGravMult *
      (1.0 - behavior.antiGravityLift * 0.88);

    // 1. Determine Ecological Role, Natural Predator Target, or Symbiotic Partner
    const role = this.getEcologicalRole();
    const isNaturalPredator = role !== 'symbiont-grazer';
    this.interactionMode = 'stride';
    this.activePredatorTargetName = null;
    this.siphonTendrilMesh.visible = false;

    let symbioticPartner: ArticulatedRagdollEntity | null = null;
    let preyTarget: ArticulatedRagdollEntity | null = null;
    let nearestPreyDist = 999;

    for (const other of allEntities) {
      if (other.id === this.id) continue;
      const d = pelvis.pos.distanceTo(other.particles[0].pos);
      if (d > 1.3 && d < 4.6 && other.currentStiffness > 0.35) {
        symbioticPartner = other;
      }
      // Natural predators scent-track wounded creatures OR organize pack raids on high-DNA-value evolved targets!
      if (
        isNaturalPredator &&
        this.structuralHealth > 0.45 &&
        (other.getEcologicalRole() === 'symbiont-grazer' ||
          other.activeBleedRate > 0.1 ||
          other.geneticDNA.dnaNutritionalValue >= 0.65 ||
          other.blueprint.morphology !== this.blueprint.morphology)
      ) {
        // High-DNA-nutrition mutated prey & bleeding prey strongly attract organized predator attacks
        const dnaValueAttraction =
          other.geneticDNA.dnaNutritionalValue >= 0.65
            ? (other.geneticDNA.dnaNutritionalValue - 0.4) * 0.55
            : 0;
        const scentWeightedDist =
          d * (1.0 - other.activeBleedRate * 0.45 - dnaValueAttraction);
        if (d < 26.0 && scentWeightedDist < nearestPreyDist) {
          nearestPreyDist = scentWeightedDist;
          preyTarget = other;
        }
      }
    }

    let nearbyAnomaly: AnomalousObjectInstance | null = null;
    let nearbyAnomalyDist = 999;
    if (anomalousObjects) {
      for (const anom of anomalousObjects) {
        const dAnom = pelvis.pos.distanceTo(anom.position);
        if (dAnom < 10.5 && dAnom < nearbyAnomalyDist) {
          nearbyAnomaly = anom;
          nearbyAnomalyDist = dAnom;
        }
      }
    }

    if (this.structuralHealth < 0.45 || this.activeBleedRate > 0.45) {
      this.interactionMode = 'wounded-limp-retreat';
    } else if (isNaturalPredator && preyTarget) {
      const actualDist = pelvis.pos.distanceTo(preyTarget.particles[0].pos);
      this.activePredatorTargetName = preyTarget.blueprint.name;
      if (actualDist < 3.1) {
        this.interactionMode = 'predator-gore-strike';
      } else {
        this.interactionMode = 'predator-stalking';
      }
    } else if (nearbyAnomaly) {
      this.interactionMode = 'anomaly-vigil';
    } else if (weatherSample?.in5DCausticBeam) {
      this.interactionMode = 'sky-communion';
    } else if (localBleedCoeff > 0.35 && symbioticPartner) {
      this.interactionMode = 'smin-coalescence';
    } else if (localBleedCoeff < -0.25) {
      this.interactionMode = 'schism-divergence';
    } else if (symbioticPartner && Math.sin(this.animTime * 0.6) > 0.15) {
      this.interactionMode = 'symbiotic-ritual';
    } else if (weatherSample && weatherSample.squallIntensity > 0.72) {
      this.interactionMode = 'gale-bracing';
    } else if (
      excavations &&
      excavations.some(
        (ex) => Math.hypot(pelvis.pos.x - ex.x, pelvis.pos.z - ex.z) < 7.5
      )
    ) {
      this.interactionMode = 'scent-foraging';
    }

    // Update Pain/Pleasure Gradient smoothly based on ecological & internal damage state
    const targetGradient =
      this.activeBleedRate > 0.25 || this.stunTimer > 0.2
        ? -0.45 - this.activeBleedRate * 0.55
        : this.interactionMode === 'wounded-limp-retreat'
          ? -0.52
          : this.interactionMode === 'sky-communion' ||
              this.interactionMode === 'symbiotic-ritual' ||
              this.interactionMode === 'smin-coalescence'
            ? 0.85
            : this.interactionMode === 'predator-gore-strike'
              ? 0.62
              : this.interactionMode === 'predator-stalking'
                ? 0.38
                : 0.12;

    this.painPleasureGradient +=
      (THREE.MathUtils.clamp(targetGradient, -1.0, 1.0) -
        this.painPleasureGradient) *
      clampedDt *
      2.4;

    // Trigger ambient pleasure choir or predatory thrill vocalizations when cooldown expires
    if (
      this.vocalCooldown <= 0 &&
      Math.abs(this.painPleasureGradient) > 0.52 &&
      pelvis.pos.distanceTo(playerPos) < 34
    ) {
      this.vocalCooldown = 4.2 + Math.random() * 3.5;
      harmonicSoundscape.triggerPainPleasureVocalization({
        painPleasureGradient: this.painPleasureGradient,
        goreType: this.dominantGoreType,
        creatureMass: this.blueprint.mass,
        distanceToListener: pelvis.pos.distanceTo(playerPos),
      });
    }

    const attackModality = this.getSpecializedAttackModality();
    this.activeBehaviorLabel = this.forcedRagdoll
      ? 'Manual Ragdoll Override'
      : this.stunTimer > 0.2
        ? `Visceral Trauma (${this.dominantGoreType})`
        : this.interactionMode === 'wounded-limp-retreat'
          ? `Hemorrhaging Limp (${Math.round(this.structuralHealth * 100)}% Integrity)`
          : this.interactionMode === 'predator-gore-strike' && preyTarget
            ? `Inflicting ${attackModality} on ${preyTarget.blueprint.name.split(' ')[0]}`
            : this.interactionMode === 'predator-stalking' && preyTarget
              ? `Predator Stalking (${role} → ${preyTarget.blueprint.name.split(' ')[0]})`
              : this.interactionMode === 'anomaly-vigil' && nearbyAnomaly
                ? `Anomaly Entrained (${nearbyAnomaly.meta.title.split(' ')[0]})`
                : this.interactionMode === 'smin-coalescence'
                  ? 'Viscous smin Form-Bleed Communion'
                  : this.interactionMode === 'schism-divergence'
                    ? 'Non-Euclidean Schism Divergence'
                    : this.interactionMode === 'sky-communion'
                      ? '5D Cloud Caustic Communion'
                      : this.interactionMode === 'symbiotic-ritual'
                        ? 'Symbiotic Digit Ritual'
                        : this.interactionMode === 'gale-bracing'
                          ? 'Storm Gale-Bracing'
                          : this.interactionMode === 'scent-foraging'
                            ? 'Scent-Breeze Foraging'
                            : behavior.activeBranchLabel;

    // 2. Steering, Predator Lunge Attacks & Locomotion when muscle stiffness is sufficient
    const isBalanced = this.currentStiffness > 0.24;
    const forwardDir = new THREE.Vector3(
      Math.sin(this.headingAngle),
      0,
      Math.cos(this.headingAngle)
    );

    if (isBalanced) {
      const toPlayer = new THREE.Vector3(
        playerPos.x - pelvis.pos.x,
        0,
        playerPos.z - pelvis.pos.z
      );
      const distToPlayer = toPlayer.length();

      if (
        (this.interactionMode === 'predator-stalking' ||
          this.interactionMode === 'predator-gore-strike') &&
        preyTarget
      ) {
        const preyPelvis = preyTarget.particles[0].pos;
        const toPrey = new THREE.Vector3().subVectors(preyPelvis, pelvis.pos);
        // Organized Pack Flanking Pincer Angle when hunting high-DNA-nutrition targets
        const isHighValueDNA =
          preyTarget.geneticDNA.dnaNutritionalValue >= 0.65;
        const packFlankOffset =
          isHighValueDNA && this.interactionMode === 'predator-stalking'
            ? Math.sin(this.wPhaseOffset * 6.0) * 0.52
            : 0;
        this.targetHeading = Math.atan2(toPrey.x, toPrey.z) + packFlankOffset;
        if (isHighValueDNA) {
          this.activeEcologicalActivity = `Pack Flanking Raid (DNA Value ${Math.round(
            preyTarget.geneticDNA.dnaNutritionalValue * 100
          )}%)`;
        }

        // Render Viscera-Siphon / Hemophagic Feeding Tendril when striking
        if (this.interactionMode === 'predator-gore-strike') {
          const startPt = head.pos.clone();
          const endPt = preyTarget.particles[1].pos.clone();
          const midPt = new THREE.Vector3()
            .addVectors(startPt, endPt)
            .multiplyScalar(0.5);
          const span = startPt.distanceTo(endPt);
          this.siphonTendrilMesh.visible = true;
          this.siphonTendrilMesh.position.copy(midPt);
          this.siphonTendrilMesh.scale.set(
            1.0 + Math.sin(this.animTime * 14) * 0.35,
            span,
            1.0 + Math.sin(this.animTime * 14) * 0.35
          );
          this.siphonTendrilMesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3().subVectors(endPt, startPt).normalize()
          );

          // Execute Specialized Predator Gore Attack when cooldown is ready!
          if (this.predatorStrikeCooldown <= 0) {
            this.predatorStrikeCooldown = 2.6 + Math.random() * 1.2;
            const lungeDir = toPrey.clone().normalize();

            // Predator lunges forward
            pelvis.pos.addScaledVector(lungeDir, 0.48);
            torso.pos.addScaledVector(lungeDir, 0.55);
            head.pos.addScaledVector(lungeDir, 0.65);

            // Inflict specialized internal damage & gore on the prey
            const knockVec = lungeDir
              .clone()
              .multiplyScalar(14.5)
              .add(new THREE.Vector3(0, 6.5, 0));
            preyTarget.applyInternalGoreTrauma(
              attackModality,
              0.38,
              knockVec,
              playerPos
            );

            // Predator experiences feeding satiation pleasure (+0.78) & heals slightly
            this.painPleasureGradient = Math.min(
              1.0,
              this.painPleasureGradient + 0.55
            );
            this.structuralHealth = Math.min(1.0, this.structuralHealth + 0.18);
          }
        }
      } else if (this.interactionMode === 'wounded-limp-retreat') {
        // Wounded creature retreats away from nearest predator or player
        this.targetHeading = Math.atan2(-toPlayer.x, -toPlayer.z) + 0.35;
      } else if (this.interactionMode === 'anomaly-vigil' && nearbyAnomaly) {
        const toAnom = new THREE.Vector3().subVectors(
          nearbyAnomaly.position,
          pelvis.pos
        );
        if (
          nearbyAnomaly.archetype === 'quantum-weeping-hepworth-monolith' &&
          !nearbyAnomaly.isObservationLocked
        ) {
          this.targetHeading = Math.atan2(-toAnom.x, -toAnom.z);
        } else if (
          nearbyAnomaly.archetype === 'flesh-pit-bronchial-geyser' &&
          nearbyAnomalyDist < 6.5
        ) {
          pelvis.pos.y += clampedDt * 2.2;
          torso.pos.y += clampedDt * 2.4;
          this.targetHeading = Math.atan2(toAnom.x, toAnom.z) + Math.PI * 0.35;
        } else {
          this.targetHeading = Math.atan2(toAnom.x, toAnom.z) + 0.45;
        }
      } else if (
        (this.interactionMode === 'symbiotic-ritual' ||
          this.interactionMode === 'smin-coalescence') &&
        symbioticPartner
      ) {
        const toPartner = new THREE.Vector3().subVectors(
          symbioticPartner.particles[0].pos,
          pelvis.pos
        );
        this.targetHeading = Math.atan2(toPartner.x, toPartner.z);
        // Symbiotic communion heals internal damage & boosts pleasure gradient
        this.currentStiffness = Math.min(0.96, this.currentStiffness + 0.02);
        this.structuralHealth = Math.min(
          1.0,
          this.structuralHealth + clampedDt * 0.08
        );
      } else if (this.interactionMode === 'schism-divergence') {
        this.targetHeading += Math.sin(this.animTime * 3.2) * 0.22;
      } else if (
        this.interactionMode === 'sky-communion' &&
        weatherSample
      ) {
        const toBeam = new THREE.Vector3().subVectors(
          weatherSample.nearestCausticBeamCenter,
          pelvis.pos
        );
        if (toBeam.length() > 1.2) {
          this.targetHeading = Math.atan2(toBeam.x, toBeam.z);
        }
      } else if (behavior.steeringMode === 'seek-player' && distToPlayer > 3.2) {
        this.targetHeading = Math.atan2(toPlayer.x, toPlayer.z);
      } else if (behavior.steeringMode === 'vortex-orbit') {
        const tangentAngle = Math.atan2(toPlayer.x, toPlayer.z) + Math.PI * 0.42;
        this.targetHeading = tangentAngle;
      } else if (behavior.steeringMode === 'evade' && distToPlayer < 24) {
        this.targetHeading = Math.atan2(-toPlayer.x, -toPlayer.z);
      } else {
        const distFromOrigin = Math.hypot(pelvis.pos.x, pelvis.pos.z);
        // Native entities actively explore outward toward the Frontier Edge (r = 30m..46m) or visit Frontier Complexes
        let targetComplex: FrontierComplexSite | null = null;
        if (frontierComplexes && frontierComplexes.length > 0) {
          let bestDist = 999;
          for (const fc of frontierComplexes) {
            const dFc = Math.hypot(pelvis.pos.x - fc.x, pelvis.pos.z - fc.z);
            if (dFc < bestDist) {
              bestDist = dFc;
              targetComplex = fc;
            }
          }
        }

        if (distFromOrigin > 340) {
          this.targetHeading = Math.atan2(-pelvis.pos.x, -pelvis.pos.z);
          this.activeEcologicalActivity = 'Returning from Outer Horizon';
        } else if (
          targetComplex &&
          Math.hypot(
            pelvis.pos.x - targetComplex.x,
            pelvis.pos.z - targetComplex.z
          ) >
            targetComplex.radius * 0.8 &&
          Math.sin(this.animTime * 0.25 + this.wPhaseOffset * 4) > -0.15
        ) {
          this.targetHeading = Math.atan2(
            targetComplex.x - pelvis.pos.x,
            targetComplex.z - pelvis.pos.z
          );
          this.activeEcologicalActivity =
            targetComplex.kind === 'tech-species-husbandry-paddock'
              ? `Tech-Husbandry Herding (${targetComplex.name.split('#')[0].trim()})`
              : `Migrating to ${targetComplex.name.split('#')[0].trim()}`;
        } else if (distFromOrigin < 29 && Math.sin(this.animTime * 0.35 + this.wPhaseOffset) > 0.2) {
          // Venture outward toward the unexplored Frontier Edge of the map!
          const outwardAngle =
            Math.atan2(pelvis.pos.x, pelvis.pos.z) +
            Math.sin(this.animTime * 0.5) * 0.35;
          this.targetHeading = outwardAngle;
          this.activeEcologicalActivity =
            'Exploring Map Frontier Edge (Seeking Biocomplex)';
        } else if (weatherSample && Math.random() < 0.03) {
          const scentHeading = Math.atan2(
            weatherSample.scentVec.x,
            weatherSample.scentVec.z
          );
          this.targetHeading = scentHeading + (Math.random() - 0.5) * 0.85;
        } else if (Math.random() < 0.02) {
          this.targetHeading += (Math.random() - 0.5) * 1.4;
        }

        for (const other of allEntities) {
          if (other.id === this.id) continue;
          const dx = pelvis.pos.x - other.particles[0].pos.x;
          const dz = pelvis.pos.z - other.particles[0].pos.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.01 && d < 3.2) {
            this.targetHeading += 0.08;
          }
        }
      }

      // Smooth angular turn
      let angleDiff = this.targetHeading - this.headingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.headingAngle += angleDiff * Math.min(1, clampedDt * 4.5);

      forwardDir.set(Math.sin(this.headingAngle), 0, Math.cos(this.headingAngle));

      const severedCount = this.limbs.filter(
        (l) => l.tendonIntegrity < 0.55
      ).length;
      const limpPenalty = Math.max(
        0.35,
        1.0 - severedCount / Math.max(2, this.limbs.length)
      );

      const interactionSpeedMod =
        this.interactionMode === 'predator-stalking'
          ? 1.38
          : this.interactionMode === 'wounded-limp-retreat'
            ? 0.52 * limpPenalty
            : this.interactionMode === 'sky-communion' ||
                this.interactionMode === 'symbiotic-ritual'
              ? 0.25
              : this.interactionMode === 'gale-bracing'
                ? 0.55
                : limpPenalty;

      const moveSpeed =
        behavior.locomotionSpeed *
        (0.6 + 0.4 * this.blueprint.strideFrequency) *
        this.currentStiffness *
        interactionSpeedMod;

      this.gaitCycle +=
        clampedDt * moveSpeed * this.blueprint.strideFrequency * 1.65;

      const stepDisplacement = forwardDir
        .clone()
        .multiplyScalar(moveSpeed * clampedDt * 0.42);
      pelvis.pos.add(stepDisplacement);
      torso.pos.add(stepDisplacement);
      head.pos.add(stepDisplacement);
    }

    // 3. Verlet integration for all skeletal particles + Whole-Biome Weather Wind & Viscosity
    const fluidVisc = weatherSample ? weatherSample.atmosphericViscosity : 0.14;
    const baseDamping = this.currentStiffness < 0.25 ? 0.985 : 0.92;
    const damping = Math.max(0.84, baseDamping - fluidVisc * 0.06);

    const windForceX = weatherSample ? weatherSample.windVec.x * 0.35 : 0;
    const windForceY = weatherSample ? weatherSample.windVec.y * 0.28 : 0;
    const windForceZ = weatherSample ? weatherSample.windVec.z * 0.35 : 0;

    for (const p of this.particles) {
      const vx = (p.pos.x - p.prevPos.x) * damping;
      const vy = (p.pos.y - p.prevPos.y) * damping;
      const vz = (p.pos.z - p.prevPos.z) * damping;

      p.vel.set(vx / clampedDt, vy / clampedDt, vz / clampedDt);
      p.prevPos.copy(p.pos);

      p.pos.x += vx + windForceX * clampedDt * clampedDt;
      p.pos.y += vy + (gravityAccel + windForceY) * clampedDt * clampedDt;
      p.pos.z += vz + windForceZ * clampedDt * clampedDt;

      // Visceral pain tremor when wounded or high-energy W-phase
      const painTremor = Math.max(0, -this.painPleasureGradient) * 0.022;
      if (painTremor > 0.005 || (behavior.angularImpulseBurst > 0.25 && Math.random() < 0.08)) {
        const amp = painTremor + 0.02 * behavior.angularImpulseBurst;
        p.pos.x += (Math.random() - 0.5) * amp;
        p.pos.z += (Math.random() - 0.5) * amp;
      }
    }

    // 4. Active P-D Muscle Posture Controllers + Environmentally Reactive Slope & Limp Adaptation
    const kP = this.currentStiffness;
    if (kP > 0.05) {
      const legLen = this.blueprint.limbLength;
      const torsoLen = 0.78 * this.blueprint.torsoScale[1];
      const headLen = 0.52;

      // Sample terrain slope ahead and to the right for natural body banking
      const groundAhead = evaluateUnifiedAuthoritativeFloorY(
        pelvis.pos.x + forwardDir.x * 1.2,
        pelvis.pos.z + forwardDir.z * 1.2,
        pelvis.pos.y,
        world,
        excavations
      );
      const slopePitch = THREE.MathUtils.clamp(
        (groundAhead - groundYAtPelvis) * 0.32,
        -0.38,
        0.38
      );

      // Asymmetric limp dip when tendons are severed
      const limpDip =
        this.structuralHealth < 0.75
          ? Math.sin(this.gaitCycle) * (1.0 - this.structuralHealth) * 0.28
          : 0;

      const bobbing =
        Math.sin(this.gaitCycle * 2) * 0.08 * behavior.strideAmplitude * kP +
        limpDip;
      const communionLift =
        this.interactionMode === 'sky-communion' ? 0.45 : 0;
      const braceCrouch =
        this.interactionMode === 'gale-bracing' ||
        this.interactionMode === 'predator-stalking'
          ? -0.2
          : 0;

      // Respiratory thoracic breathing wave
      const breathWave =
        Math.sin(this.animTime * (2.4 + Math.max(0, -this.painPleasureGradient) * 4.0)) *
        0.045;

      const desiredPelvisY =
        groundYAtPelvis +
        legLen * 1.05 +
        bobbing +
        communionLift +
        braceCrouch +
        behavior.antiGravityLift * 1.6;

      pelvis.pos.y += (desiredPelvisY - pelvis.pos.y) * kP * 0.35;

      // Forward lean proportional to speed, wind bracing, slope pitch, and predatory crouch
      const leanScalar =
        (this.interactionMode === 'gale-bracing'
          ? 0.28
          : this.interactionMode === 'predator-stalking'
            ? 0.34
            : this.interactionMode === 'symbiotic-ritual'
              ? 0.18 * Math.sin(this.animTime * 2.5)
              : 0.14 * Math.min(1, behavior.locomotionSpeed / 8)) +
        slopePitch * 0.45;

      const leanOffset = forwardDir.clone().multiplyScalar(leanScalar);

      const desiredTorsoPos = new THREE.Vector3(
        pelvis.pos.x + leanOffset.x,
        pelvis.pos.y + torsoLen + breathWave,
        pelvis.pos.z + leanOffset.z
      );
      torso.pos.lerp(desiredTorsoPos, kP * 0.42);

      const desiredHeadPos = new THREE.Vector3(
        torso.pos.x + leanOffset.x * 0.65,
        torso.pos.y + headLen + breathWave * 0.5,
        torso.pos.z + leanOffset.z * 0.65
      );
      head.pos.lerp(desiredHeadPos, kP * 0.45);

        // Procedural Multi-Limb Inverse-Stride Placement + 4D Spring-Damper Limb-Sway & Severed-Tendon Drag Physics
      const swayOffset = (behavior.limbSwayPhase ?? 0) * 0.42;
      const rightDir = new THREE.Vector3(forwardDir.z, 0, -forwardDir.x);

      for (const limb of this.limbs) {
        const kneeP = this.particles[limb.kneeIdx];
        const footP = this.particles[limb.footIdx];

        const worldHipAngle = this.headingAngle + limb.hipAngleOffset;
        const hipRadial = this.blueprint.legCount > 2 ? 0.52 : 0.32;
        const sideVec = new THREE.Vector3(
          Math.sin(worldHipAngle) * hipRadial,
          0,
          Math.cos(worldHipAngle) * hipRadial
        );

        const phase = this.gaitCycle + limb.stridePhaseOffset;
        // If tendon is severed/injured, stride lift collapses so the foot drags across the ground!
        const tendonMod = limb.tendonIntegrity;
        const strideSwing =
          Math.sin(phase) * 0.48 * behavior.strideAmplitude * kP * tendonMod;
        const strideLift =
          Math.max(0, Math.cos(phase)) *
          0.38 *
          behavior.strideAmplitude *
          kP *
          tendonMod *
          tendonMod;

        // Lateral pendulum limb-sway driven by 4D spring-damper transitions
        const limbSwayLateral =
          Math.sin(phase * 0.5 + swayOffset * 2.5) * swayOffset * 0.38;

        const targetFootX =
          pelvis.pos.x +
          sideVec.x * 1.35 +
          forwardDir.x * strideSwing +
          rightDir.x * limbSwayLateral;
        const targetFootZ =
          pelvis.pos.z +
          sideVec.z * 1.35 +
          forwardDir.z * strideSwing +
          rightDir.z * limbSwayLateral;
        const footGroundY = evaluateUnifiedAuthoritativeFloorY(
          targetFootX,
          targetFootZ,
          pelvis.pos.y,
          world,
          excavations
        );

        const desiredFootPos = new THREE.Vector3(
          targetFootX,
          footGroundY + 0.1 + strideLift,
          targetFootZ
        );
        footP.pos.lerp(desiredFootPos, kP * 0.48 * tendonMod);

        const desiredKneePos = new THREE.Vector3(
          (pelvis.pos.x + footP.pos.x) * 0.5 +
            sideVec.x * 0.65 +
            forwardDir.x * 0.22 +
            rightDir.x * (limbSwayLateral * 0.65),
          (pelvis.pos.y + footP.pos.y) * 0.5 + 0.18 * tendonMod,
          (pelvis.pos.z + footP.pos.z) * 0.5 +
            sideVec.z * 0.65 +
            forwardDir.z * 0.22 +
            rightDir.z * (limbSwayLateral * 0.65)
        );
        kneeP.pos.lerp(desiredKneePos, kP * 0.4 * tendonMod);
      }
    }

    // 5. Solve Skeletal Distance Constraints & Terrain Collision (4 relaxation iterations)
    const delta = new THREE.Vector3();
    for (let iter = 0; iter < 4; iter++) {
      for (const c of this.constraints) {
        const pA = this.particles[c.a];
        const pB = this.particles[c.b];
        delta.subVectors(pB.pos, pA.pos);
        const dist = delta.length();
        if (dist < 0.0001) continue;

        const diff = (dist - c.restLength) / dist;
        const totalInvMass = pA.invMass + pB.invMass;
        if (totalInvMass <= 0) continue;

        const correction = diff * c.stiffness;
        pA.pos.addScaledVector(delta, correction * (pA.invMass / totalInvMass));
        pB.pos.addScaledVector(
          delta,
          -correction * (pB.invMass / totalInvMass)
        );
      }

      for (const p of this.particles) {
        const groundY = evaluateUnifiedAuthoritativeFloorY(
          p.pos.x,
          p.pos.z,
          p.pos.y,
          world,
          excavations
        );
        const minY = groundY + p.radius;
        if (p.pos.y < minY) {
          p.pos.y = minY;
          p.prevPos.x = p.pos.x - (p.pos.x - p.prevPos.x) * 0.72;
          p.prevPos.z = p.pos.z - (p.pos.z - p.prevPos.z) * 0.72;
        }
      }
    }

    // 6. Synchronize Three.js 3D Meshes, Internal Viscera Gore Organs & Articulated Digits
    this.syncMeshesToSkeleton(groundYAtPelvis);
  }

  public syncMeshesToSkeleton(groundY: number) {
    const pelvis = this.particles[0].pos;
    const torso = this.particles[1].pos;
    const head = this.particles[2].pos;

    const upVec = new THREE.Vector3(0, 1, 0);
    const spineDir = new THREE.Vector3().subVectors(torso, pelvis).normalize();
    const neckDir = new THREE.Vector3().subVectors(head, torso).normalize();

    this.pelvisMesh.position.copy(pelvis);
    const pelvisQuat = new THREE.Quaternion().setFromUnitVectors(
      upVec,
      spineDir
    );
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(
      upVec,
      this.headingAngle
    );
    this.pelvisMesh.quaternion.copy(pelvisQuat).multiply(yawQuat);

    this.torsoMesh.position.copy(pelvis).lerp(torso, 0.55);
    this.torsoMesh.quaternion.copy(pelvisQuat).multiply(yawQuat);

    // Subtle Volume-Preserving Elastic Soft-Body Squash-and-Stretch + Genetic DNA Morphing
    const [dnaSx, dnaSy, dnaSz] = this.geneticDNA.torsoScaleMorph;
    const elasticWave =
      Math.sin(this.gaitCycle * 2.0 + this.lastSwayPhase * 3.0) *
      0.11 *
      (0.35 + this.lastElasticRatio);
    const stretchY = Math.max(0.75, Math.min(1.35, 1.0 + elasticWave));
    const squashXZ = 1.0 / Math.sqrt(stretchY);
    this.torsoMesh.scale.set(
      dnaSx * squashXZ,
      dnaSy * stretchY,
      dnaSz * squashXZ
    );
    this.pelvisMesh.scale.set(
      dnaSx * (1.0 / squashXZ),
      dnaSy,
      dnaSz * (1.0 / squashXZ)
    );

    // Animate Internal Visceral Organ & Rib-Cavity Gore Rig when wounded or bleeding!
    const internalVisceraGroup = this.torsoMesh.userData
      .internalVisceraGroup as THREE.Group | undefined;
    const visceralHeartMesh = this.torsoMesh.userData.visceralHeartMesh as
      | THREE.Mesh
      | undefined;
    const herniatedGutRibbon = this.torsoMesh.userData.herniatedGutRibbon as
      | THREE.Mesh
      | undefined;
    const ribFlaps = this.torsoMesh.userData.ribFlaps as
      | THREE.Mesh[]
      | undefined;
    const visceraBloodMat = this.torsoMesh.userData.visceraBloodMat as
      | THREE.MeshPhysicalMaterial
      | undefined;

    if (internalVisceraGroup) {
      const goreExposure = Math.max(
        this.exposedVisceraRatio,
        1.0 - this.structuralHealth
      );
      // Scale visceral organ cluster outward through the chest cavity as damage increases
      const visceraScale = 0.35 + goreExposure * 0.95;
      internalVisceraGroup.scale.setScalar(visceraScale);

      // Tachycardic heart-rate pulse accelerates with pain (-gradient) or predatory thrill
      const bpmFreq = 3.5 + Math.abs(this.painPleasureGradient) * 9.5;
      const systole = 1.0 + Math.sin(this.animTime * bpmFreq) * (0.14 + goreExposure * 0.25);
      if (visceralHeartMesh) {
        visceralHeartMesh.scale.set(systole, 2.0 - systole, systole);
      }
      if (herniatedGutRibbon) {
        herniatedGutRibbon.rotation.z =
          Math.sin(this.animTime * 4.2) * 0.28 * goreExposure;
        herniatedGutRibbon.position.z = 0.06 + goreExposure * 0.16;
      }
      if (ribFlaps) {
        ribFlaps.forEach((rib, idx) => {
          const side = idx % 2 === 0 ? -1 : 1;
          // Calcified ribs splay open violently when chest cavity ruptures
          rib.rotation.z =
            side * (0.65 - goreExposure * 0.85) +
            Math.sin(this.animTime * bpmFreq + idx) * 0.08;
        });
      }
      if (visceraBloodMat) {
        if (this.dominantGoreType === 'corrosive-ichor-dissolution') {
          visceraBloodMat.color.set('#65a30d');
          visceraBloodMat.emissive.set('#84cc16');
        } else if (this.dominantGoreType === 'neural-synapse-hemolysis') {
          visceraBloodMat.color.set('#0284c7');
          visceraBloodMat.emissive.set('#38bdf8');
        } else {
          visceraBloodMat.color.set('#9f1239');
          visceraBloodMat.emissive.set('#e11d48');
        }
        visceraBloodMat.emissiveIntensity = 0.55 + goreExposure * 1.25;
      }
    }

    // Animate Deep-Lexicon Dorsal Apparatus, Orbiting Aura Satellites & Caudal Tail
    const dorsalGroup = this.torsoMesh.userData.dorsalApparatusGroup as
      | THREE.Group
      | undefined;
    if (dorsalGroup) {
      dorsalGroup.rotation.x = Math.sin(this.animTime * 2.2) * 0.14;
      dorsalGroup.scale.setScalar(
        1.0 +
          (this.interactionMode === 'sky-communion' ||
          this.interactionMode === 'predator-gore-strike'
            ? 0.28
            : 0) +
          Math.sin(this.animTime * 3.1) * 0.06
      );
    }

    const auraGroup = this.torsoMesh.userData.auraOrbitGroup as
      | THREE.Group
      | undefined;
    if (auraGroup) {
      auraGroup.rotation.y = this.animTime * 1.45;
      auraGroup.rotation.z = Math.sin(this.animTime * 0.9) * 0.35;
    }

    const tailGroup = this.pelvisMesh.userData.tailApparatusGroup as
      | THREE.Group
      | undefined;
    if (tailGroup) {
      const tailWhip =
        this.interactionMode === 'predator-stalking' ||
        this.interactionMode === 'predator-gore-strike'
          ? 2.2
          : 0.85;
      tailGroup.rotation.y = Math.sin(this.gaitCycle * tailWhip) * 0.44;
      tailGroup.rotation.x = Math.cos(this.animTime * 2.4) * 0.18;
    }

    // Orient head with ecological, pain-spasm, or predatory gaze tilt
    this.headMesh.position.copy(head);
    const headQuat = new THREE.Quaternion().setFromUnitVectors(upVec, neckDir);
    this.headMesh.quaternion.copy(headQuat).multiply(yawQuat);
    if (this.interactionMode === 'sky-communion') {
      this.headMesh.rotateX(-0.48);
    } else if (this.interactionMode === 'wounded-limp-retreat') {
      this.headMesh.rotateX(0.38); // Drooping head in agony
      this.headMesh.rotateZ(Math.sin(this.animTime * 8.0) * 0.18);
    } else if (this.interactionMode === 'predator-gore-strike') {
      this.headMesh.rotateX(0.28 * Math.sin(this.animTime * 10.0)); // Tearing predatory bite motion
    } else if (this.interactionMode === 'scent-foraging') {
      this.headMesh.rotateX(0.32 * Math.sin(this.animTime * 4.0));
    }

    // Animate Head Olfactory Sensory Digits
    const sensoryDigits = this.headMesh.userData.sensoryDigits as
      | THREE.Group[]
      | undefined;
    if (sensoryDigits) {
      for (let s = 0; s < sensoryDigits.length; s++) {
        const feeler = sensoryDigits[s];
        const side = s === 0 ? -1 : 1;
        feeler.rotation.x =
          0.25 + Math.sin(this.animTime * 5.5 + s * 1.4) * 0.28;
        feeler.rotation.z =
          side * (0.2 + Math.cos(this.animTime * 4.2 + s) * 0.22);
      }
    }

    // Animate Torso Upper Manipulator Arms & 4-Digit Hands/Claws
    const forelimbArms = this.torsoMesh.userData.forelimbArms as
      | {
          shoulder: THREE.Group;
          elbow: THREE.Group;
          digits: THREE.Group[];
          side: number;
        }[]
      | undefined;
    if (forelimbArms) {
      for (const arm of forelimbArms) {
        const phase = this.animTime * 3.4 + (arm.side > 0 ? 0 : Math.PI);
        if (this.interactionMode === 'predator-gore-strike') {
          // Rending predatory claw slash!
          arm.shoulder.rotation.x = -1.65 + Math.sin(phase * 3.2) * 0.75;
          arm.shoulder.rotation.z = arm.side * (0.45 + Math.cos(phase * 3.2) * 0.35);
          arm.elbow.rotation.x = -0.55 + Math.sin(phase * 3.2) * 0.45;
        } else if (this.interactionMode === 'wounded-limp-retreat') {
          // Clutching wounded chest / visceral hernia in pain
          arm.shoulder.rotation.x = -0.85;
          arm.shoulder.rotation.z = -arm.side * 0.35;
          arm.elbow.rotation.x = -1.65;
        } else if (this.interactionMode === 'sky-communion') {
          arm.shoulder.rotation.x = -2.2 + Math.sin(phase * 0.6) * 0.18;
          arm.shoulder.rotation.z = arm.side * 0.45;
          arm.elbow.rotation.x = -0.25;
        } else if (this.interactionMode === 'symbiotic-ritual') {
          arm.shoulder.rotation.x = -1.15 + Math.sin(phase * 1.4) * 0.35;
          arm.shoulder.rotation.z = arm.side * (0.25 + Math.cos(phase) * 0.2);
          arm.elbow.rotation.x = -0.85 + Math.sin(phase * 2.0) * 0.3;
        } else if (this.interactionMode === 'gale-bracing') {
          arm.shoulder.rotation.x = -1.35;
          arm.shoulder.rotation.z = -arm.side * 0.22;
          arm.elbow.rotation.x = -1.45;
        } else if (this.interactionMode === 'scent-foraging') {
          arm.shoulder.rotation.x = -0.45 + Math.sin(phase * 1.8) * 0.4;
          arm.elbow.rotation.x = -0.65 + Math.cos(phase * 1.8) * 0.35;
        } else {
          arm.shoulder.rotation.x =
            Math.sin(this.gaitCycle + (arm.side > 0 ? 0 : Math.PI)) * 0.42;
          arm.shoulder.rotation.z = arm.side * 0.28;
          arm.elbow.rotation.x =
            -0.55 - Math.abs(Math.cos(this.gaitCycle)) * 0.25;
        }

        for (let d = 0; d < arm.digits.length; d++) {
          const digit = arm.digits[d];
          const distTip = digit.userData.distTip as THREE.Group | undefined;
          const baseSpread = (digit.userData.baseSpread as number) || 0;
          const ripple = Math.sin(this.animTime * 5.2 + d * 0.85 + arm.side);

          const isOpenGesture =
            this.interactionMode === 'sky-communion' ||
            this.interactionMode === 'symbiotic-ritual' ||
            this.interactionMode === 'predator-gore-strike';

          digit.rotation.x = isOpenGesture
            ? 0.25 + ripple * 0.25
            : -0.35 + ripple * 0.32;
          digit.rotation.z =
            baseSpread * (isOpenGesture ? 1.55 : 1.0) + ripple * 0.08;

          if (distTip) {
            distTip.rotation.x = isOpenGesture
              ? 0.15 + ripple * 0.2
              : -0.55 + ripple * 0.35;
          }
        }
      }
    }

    // Orient each articulated upper & lower limb segment + Pedal Talons/Digits
    const segDir = new THREE.Vector3();
    for (const limb of this.limbs) {
      const knee = this.particles[limb.kneeIdx].pos;
      const foot = this.particles[limb.footIdx].pos;

      limb.upperMesh.position.copy(pelvis).lerp(knee, 0.5);
      segDir.subVectors(knee, pelvis);
      const upperLen = Math.max(0.1, segDir.length());
      // Dynamic gastrocnemius/quadriceps muscle bulge on stride push-off
      const stridePush =
        1.0 +
        Math.max(0, Math.sin(this.gaitCycle + limb.stridePhaseOffset)) *
          0.14 *
          limb.tendonIntegrity;
      limb.upperMesh.scale.set(stridePush, upperLen, stridePush);
      limb.upperMesh.quaternion.setFromUnitVectors(upVec, segDir.normalize());

      limb.lowerMesh.position.copy(knee).lerp(foot, 0.5);
      segDir.subVectors(foot, knee);
      const lowerLen = Math.max(0.1, segDir.length());
      limb.lowerMesh.scale.set(stridePush * 0.96, lowerLen, stridePush * 0.96);
      limb.lowerMesh.quaternion.setFromUnitVectors(upVec, segDir.normalize());

      const pedalDigits = limb.lowerMesh.userData.pedalDigits as
        | THREE.Group[]
        | undefined;
      if (pedalDigits) {
        const stridePhase = this.gaitCycle + limb.stridePhaseOffset;
        const gripCurl =
          this.interactionMode === 'gale-bracing'
            ? 0.55
            : Math.sin(stridePhase) * 0.38;
        for (let t = 0; t < pedalDigits.length; t++) {
          pedalDigits[t].rotation.x = gripCurl;
        }
      }
    }

    this.selectionRing.position.set(pelvis.x, groundY + 0.08, pelvis.z);
    const heightAboveGround = Math.max(0, pelvis.y - groundY - 0.6);
    const shadowScale = Math.max(0.45, 1.0 - heightAboveGround * 0.08);
    this.contactShadowMesh.position.set(pelvis.x, groundY + 0.04, pelvis.z);
    this.contactShadowMesh.scale.setScalar(shadowScale);

    // Real-Time Complex Skin Topology Deformation (with visceral vascular flush during bleeding/predation)
    const spineFlexion = Math.acos(
      THREE.MathUtils.clamp(spineDir.dot(neckDir), -1, 1)
    );
    const avgLimbFlexion =
      Math.abs(Math.sin(this.gaitCycle)) * 0.85 + spineFlexion;
    const skinStyle = resolveEntitySkinTopology(this.blueprint);

    this.latestSkinTelemetry = updateSkinTopologyAndDeformation(
      this.rootGroup,
      skinStyle,
      this.animTime,
      {
        flexionAngle: avgLimbFlexion,
        locomotionSpeed: this.particles[0].vel.length(),
        muscleStiffness: this.currentStiffness,
        windSpeed: this.latestWindSpeed,
        stunIntensity: Math.min(
          1,
          this.stunTimer / 2.0 + this.activeBleedRate * 0.65
        ),
        entrainmentCoherence:
          this.interactionMode === 'symbiotic-ritual' ||
          this.interactionMode === 'sky-communion' ||
          this.interactionMode === 'predator-gore-strike'
            ? 0.88
            : 0.42,
        strainHeatmapEnabled: this.strainHeatmapEnabled,
      }
    );
  }

  public getInternalDamageTelemetry(): InternalDamageTelemetry {
    const vocalNode = resolvePainPleasureVocalNode(
      this.painPleasureGradient,
      this.dominantGoreType
    );
    const severedTendonsCount = this.limbs.filter(
      (l) => l.tendonIntegrity < 0.55
    ).length;

    return {
      structuralHealth: Number(this.structuralHealth.toFixed(2)),
      activeBleedRate: Number(this.activeBleedRate.toFixed(2)),
      exposedVisceraRatio: Number(this.exposedVisceraRatio.toFixed(2)),
      severedTendonsCount,
      dominantGoreType: this.dominantGoreType,
      goreGenre: this.activeGoreGenre,
      painPleasureGradient: Number(this.painPleasureGradient.toFixed(2)),
      activeVocalNodeLabel: vocalNode.label,
      ecologicalRole: this.getEcologicalRole(),
      predatorTargetName: this.activePredatorTargetName,
    };
  }

  public getTelemetry(): EntityRuntimeTelemetry {
    const pelvis = this.particles[0];
    let ragdollState: EntityRuntimeTelemetry['ragdollState'] = 'active-balanced';
    if (this.currentStiffness < 0.25) {
      ragdollState = 'full-ragdoll-limp';
    } else if (this.stunTimer > 0 || this.structuralHealth < 0.45) {
      ragdollState = 'stumbling-recovery';
    } else if (pelvis.pos.y > 5.5) {
      ragdollState = 'zero-g-suspended';
    }

    return {
      id: this.id,
      name: this.blueprint.name,
      blueprintId: this.blueprint.id,
      morphology: this.blueprint.morphology,
      position: [
        Number(pelvis.pos.x.toFixed(1)),
        Number(pelvis.pos.y.toFixed(1)),
        Number(pelvis.pos.z.toFixed(1)),
      ],
      velocityMagnitude: Number(pelvis.vel.length().toFixed(2)),
      ragdollState,
      currentStiffness: Number(this.currentStiffness.toFixed(2)),
      activeBehavior: this.activeBehaviorLabel,
      jointCount: this.particles.length,
      wPhaseOffset: this.wPhaseOffset,
      skinTelemetry: this.latestSkinTelemetry,
      internalDamage: this.getInternalDamageTelemetry(),
      geneticDNA: this.geneticDNA,
      activeEcologicalActivity: this.activeEcologicalActivity,
    };
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.rootGroup);
    this.rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (!obj.geometry.userData?.isSharedPooledGeometry) {
          obj.geometry.dispose();
        }
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
