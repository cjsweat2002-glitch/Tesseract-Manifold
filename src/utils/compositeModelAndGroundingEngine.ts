import * as THREE from 'three';
import {
  BETHESDA_SCALE_COMPENDIUM_CATALOG,
  CompendiumLoadoutAndMuseumState,
  CompositeWeaponSubType,
  DimensionalItemDefinition,
  resolveCompendiumItemById,
} from './bethesdaScaleCompendiumEngine';
import {
  CustomVoidPortalTuningState,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  DifferentialUniverseBoundarySpec,
  GroundingBehaviorLayerMode,
  GroundingTaxonomyClass,
} from '../types/portalAndBiodepth';
import { PORTAL_ROOM_ORIGIN } from './realityTearAndPortalRoomEngine';
import {
  applyCarvedRelicSurfaceToGroup,
  augmentWeaponWithCarvedReliefGeometry,
} from './carvedMaterialAndMindspaceEngine';

/**
 * Builds a multi-part (7 to 12 sub-meshes) composite 3D model for any weapon, tool, armor carapace, or relic
 * in the 325-item Bethesda-scale compendium using LatheGeometry, beveled ExtrudeGeometry, TubeGeometry,
 * and MeshPhysicalMaterial.
 */
export function buildCompositeItem3DMesh(
  item: DimensionalItemDefinition,
  isFirstPersonViewmodel: boolean = false
): THREE.Group {
  const root = new THREE.Group();
  root.name = `composite-item-${item.id}`;

  const spec = item.visualSpec;
  const primaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec.primaryHex),
    metalness: spec.metalness,
    roughness: spec.roughness,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
  });

  const secondaryBrassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec.secondaryHex),
    metalness: Math.min(0.95, spec.metalness + 0.15),
    roughness: Math.max(0.15, spec.roughness - 0.08),
    clearcoat: 0.8,
  });

  const accentCrystalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec.accentEmissiveHex),
    emissive: new THREE.Color(spec.accentEmissiveHex),
    emissiveIntensity: 0.95,
    roughness: 0.12,
    metalness: 0.2,
    transmission: spec.transmission,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1.0,
  });

  const gripWrapMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1c1917'),
    roughness: 0.82,
    metalness: 0.15,
  });

  // 1. Turned Lathe Ergonomic Hilt / Receiver Shaft (Common foundational craftsmanship)
  const hiltPoints: THREE.Vector2[] = [
    new THREE.Vector2(0.022, -0.28),
    new THREE.Vector2(0.034, -0.24),
    new THREE.Vector2(0.024, -0.12),
    new THREE.Vector2(0.028, 0.0),
    new THREE.Vector2(0.038, 0.08),
    new THREE.Vector2(0.026, 0.14),
  ];
  const hiltGeo = new THREE.LatheGeometry(hiltPoints, 14);
  const hiltMesh = new THREE.Mesh(hiltGeo, gripWrapMat);
  hiltMesh.castShadow = true;
  root.add(hiltMesh);

  // Brass Pommel & Collar Rings
  const pommelMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.042, 1),
    secondaryBrassMat
  );
  pommelMesh.position.set(0, -0.29, 0);
  root.add(pommelMesh);

  const guardCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.042, 0.05, 12),
    secondaryBrassMat
  );
  guardCollar.position.set(0, 0.12, 0);
  root.add(guardCollar);

  // 2. SubType-Specific Multi-Part Assemblies
  switch (spec.weaponSubType) {
    case 'cleaver-halberd': {
      // Extended polearm shaft + beveled ExtrudeGeometry halberd cleaver blade + back spike + plasma filament
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.025, 0.68, 12),
        primaryMat
      );
      shaft.position.set(0, 0.42, 0);
      root.add(shaft);

      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0.22);
      bladeShape.lineTo(0.18, 0.32);
      bladeShape.lineTo(0.24, 0.58);
      bladeShape.lineTo(0.14, 0.82);
      bladeShape.lineTo(0, 0.74);
      bladeShape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: 0.024,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.014,
        bevelSegments: 2,
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      bladeGeo.translate(-0.01, 0, -0.012);
      const bladeMesh = new THREE.Mesh(bladeGeo, primaryMat);
      bladeMesh.castShadow = true;
      root.add(bladeMesh);

      // glowing bevel edge strip
      const edgeStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.54, 0.032),
        accentCrystalMat
      );
      edgeStrip.position.set(0.19, 0.56, 0);
      edgeStrip.rotation.z = -0.14;
      root.add(edgeStrip);

      // Rear counter-hook
      const rearSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.036, 0.18, 6),
        secondaryBrassMat
      );
      rearSpike.rotation.z = Math.PI * 0.58;
      rearSpike.position.set(-0.09, 0.52, 0);
      root.add(rearSpike);

      // Top spear tip
      const topSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.24, 8),
        secondaryBrassMat
      );
      topSpike.position.set(0, 0.86, 0);
      root.add(topSpike);
      break;
    }

    case 'excavating-lance': {
      // Telescoping Lathe drill cone + triple helical auger ribs + glowing core chamber
      const coreTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.048, 0.36, 12),
        accentCrystalMat
      );
      coreTube.position.set(0, 0.32, 0);
      root.add(coreTube);

      // 3 Structural Cage Struts around the core
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        const strut = new THREE.Mesh(
          new THREE.BoxGeometry(0.018, 0.4, 0.018),
          secondaryBrassMat
        );
        strut.position.set(Math.cos(ang) * 0.052, 0.32, Math.sin(ang) * 0.052);
        root.add(strut);
      }

      // Stepped Rotary Auger Cone
      const drillPoints: THREE.Vector2[] = [
        new THREE.Vector2(0.065, 0.52),
        new THREE.Vector2(0.048, 0.64),
        new THREE.Vector2(0.054, 0.66),
        new THREE.Vector2(0.032, 0.8),
        new THREE.Vector2(0.038, 0.82),
        new THREE.Vector2(0.004, 1.02),
      ];
      const drillMesh = new THREE.Mesh(
        new THREE.LatheGeometry(drillPoints, 12),
        primaryMat
      );
      drillMesh.userData.isSpinningAuger = true;
      root.add(drillMesh);

      // Helical Tube Ribbon around drill
      const curvePts: THREE.Vector3[] = [];
      for (let t = 0; t <= 16; t++) {
        const u = t / 16;
        const r = (1 - u) * 0.058 + 0.008;
        const a = u * Math.PI * 6;
        curvePts.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            0.52 + u * 0.46,
            Math.sin(a) * r
          )
        );
      }
      const helixGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(curvePts),
        32,
        0.009,
        6,
        false
      );
      const helixMesh = new THREE.Mesh(helixGeo, accentCrystalMat);
      root.add(helixMesh);
      break;
    }

    case 'resonance-pistol': {
      // Forward receiver barrel + piezo-coil rings + optical reflex sight
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.075, 0.11, 0.46),
        primaryMat
      );
      receiver.position.set(0, 0.16, -0.14);
      root.add(receiver);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.028, 0.52, 14),
        secondaryBrassMat
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.18, -0.22);
      barrel.userData.isReciprocatingBarrel = true;
      barrel.userData.baseZ = -0.22;
      root.add(barrel);

      // 4 Piezo-Coil Rings along the barrel
      for (let c = 0; c < 4; c++) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(0.044, 0.009, 8, 18),
          accentCrystalMat
        );
        coil.position.set(0, 0.18, -0.12 - c * 0.09);
        root.add(coil);
      }

      // Reflex Sight Arch & Lens
      const sightLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.012, 16),
        accentCrystalMat
      );
      sightLens.rotation.x = Math.PI / 2;
      sightLens.position.set(0, 0.25, -0.06);
      root.add(sightLens);
      break;
    }

    case 'chrono-tuning-fork': {
      // U-shaped yoke + twin resonant tines + floating rotating astrolabe core
      const yoke = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.022, 10, 20, Math.PI),
        secondaryBrassMat
      );
      yoke.rotation.z = Math.PI;
      yoke.position.set(0, 0.26, 0);
      root.add(yoke);

      for (const side of [-1, 1]) {
        const tine = new THREE.Mesh(
          new THREE.BoxGeometry(0.026, 0.54, 0.038),
          primaryMat
        );
        tine.position.set(side * 0.11, 0.53, 0);
        root.add(tine);

        const innerEdge = new THREE.Mesh(
          new THREE.BoxGeometry(0.008, 0.48, 0.016),
          accentCrystalMat
        );
        innerEdge.position.set(side * 0.092, 0.53, 0);
        root.add(innerEdge);
      }

      const floatingCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.058, 0),
        accentCrystalMat
      );
      floatingCore.position.set(0, 0.54, 0);
      floatingCore.userData.isResonantCore = true;
      root.add(floatingCore);

      const astroRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.082, 0.007, 8, 24),
        secondaryBrassMat
      );
      astroRing.position.set(0, 0.54, 0);
      astroRing.userData.isResonantCore = true;
      root.add(astroRing);
      break;
    }

    case 'spore-caster': {
      // Organic curved carapace barrel + glowing bioluminescent spore sac + tendril tubes
      const carapace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.078, 0.58, 10),
        primaryMat
      );
      carapace.position.set(0, 0.4, 0);
      root.add(carapace);

      for (let p = 0; p < 3; p++) {
        const pod = new THREE.Mesh(
          new THREE.SphereGeometry(0.052 - p * 0.008, 12, 10),
          accentCrystalMat
        );
        pod.position.set(
          p % 2 === 0 ? 0.055 : -0.055,
          0.28 + p * 0.13,
          0.03
        );
        root.add(pod);
      }

      const muzzleCrown = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.052, 0.014, 36, 8, 2, 3),
        secondaryBrassMat
      );
      muzzleCrown.rotation.x = Math.PI / 2;
      muzzleCrown.position.set(0, 0.7, 0);
      muzzleCrown.userData.isReciprocatingCrown = true;
      muzzleCrown.userData.baseY = 0.7;
      root.add(muzzleCrown);
      break;
    }

    case 'gravity-hammer': {
      // Reinforced polearm shaft + monolithic brutalist strike block + graviton damper rings
      const heavyShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.03, 0.62, 12),
        secondaryBrassMat
      );
      heavyShaft.position.set(0, 0.42, 0);
      root.add(heavyShaft);

      const strikeHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.19, 0.22),
        primaryMat
      );
      strikeHead.position.set(0, 0.72, 0);
      strikeHead.castShadow = true;
      root.add(strikeHead);

      const impactFaceA = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.095, 0.04, 8),
        secondaryBrassMat
      );
      impactFaceA.rotation.z = Math.PI / 2;
      impactFaceA.position.set(0.18, 0.72, 0);
      root.add(impactFaceA);

      const gravCore = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.045, 0.24),
        accentCrystalMat
      );
      gravCore.position.set(0, 0.72, 0);
      root.add(gravCore);
      break;
    }

    case 'prism-saber': {
      // Swept brass handguard + tapered refractive crystal blade + internal core filament
      const handguard = new THREE.Mesh(
        new THREE.TorusGeometry(0.095, 0.014, 8, 16, Math.PI * 0.85),
        secondaryBrassMat
      );
      handguard.rotation.z = -Math.PI * 0.42;
      handguard.position.set(0.03, 0.02, 0);
      root.add(handguard);

      const saberShape = new THREE.Shape();
      saberShape.moveTo(-0.022, 0.14);
      saberShape.lineTo(0.028, 0.14);
      saberShape.lineTo(0.018, 0.78);
      saberShape.lineTo(0.0, 0.92);
      saberShape.lineTo(-0.016, 0.76);
      saberShape.closePath();

      const bladeGeo = new THREE.ExtrudeGeometry(saberShape, {
        steps: 1,
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      });
      bladeGeo.translate(0, 0, -0.006);
      const bladeMesh = new THREE.Mesh(bladeGeo, accentCrystalMat);
      root.add(bladeMesh);

      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.62, 0.02),
        primaryMat
      );
      spine.position.set(-0.014, 0.45, 0);
      root.add(spine);
      break;
    }

    case 'void-arbalest':
    default: {
      // Recurved torsion limbs + rail channel + loaded glowing bolt
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.065, 0.56),
        primaryMat
      );
      rail.position.set(0, 0.18, -0.18);
      root.add(rail);

      const prodArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.018, 8, 20, Math.PI * 0.85),
        secondaryBrassMat
      );
      prodArc.rotation.x = Math.PI / 2;
      prodArc.rotation.z = Math.PI * 0.075;
      prodArc.position.set(0, 0.19, -0.22);
      prodArc.userData.isTorsionLimb = true;
      root.add(prodArc);

      const loadedBolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.018, 0.48, 8),
        accentCrystalMat
      );
      loadedBolt.rotation.x = Math.PI / 2;
      loadedBolt.position.set(0, 0.22, -0.24);
      loadedBolt.userData.isReciprocatingBolt = true;
      loadedBolt.userData.baseZ = -0.24;
      root.add(loadedBolt);
      break;
    }
  }

  // Optional Coiled Energy Conduit Tube for high-rarity or resonant items
  if (spec.hasCoiledConduit) {
    const conduitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.03, -0.08, 0.02),
      new THREE.Vector3(0.055, 0.05, 0.04),
      new THREE.Vector3(0.04, 0.22, -0.03),
      new THREE.Vector3(0.02, 0.36, 0.02),
    ]);
    const conduitMesh = new THREE.Mesh(
      new THREE.TubeGeometry(conduitCurve, 16, 0.007, 6, false),
      accentCrystalMat
    );
    root.add(conduitMesh);
  }

  augmentWeaponWithCarvedReliefGeometry(root, item);
  applyCarvedRelicSurfaceToGroup(root, 'forged-damascus-steel');

  const s = (spec.scaleLength || 1.0) * (isFirstPersonViewmodel ? 0.62 : 0.88);
  root.scale.setScalar(s);
  return root;
}

export type ReloadAnimationStyle =
  | 'tactical-combat-flip'
  | 'kinetic-stride-indexing'
  | 'acrobatic-sprint-spin'
  | 'aerial-zero-g-breech';

export type WeaponStrikeActionMode =
  | 'ranged-recoil'
  | 'melee-combo-1'
  | 'melee-combo-2'
  | 'melee-combo-3'
  | 'weapon-bash'
  | 'bare-punch';

export interface ActiveWeaponCombatState {
  currentAmmo: number;
  maxMagazine: number;
  isReloading: boolean;
  reloadProgress: number;
  reloadStyle: ReloadAnimationStyle;
  reloadStyleLabel: string;
  isSheathed: boolean;
  sheathBlend: number;
  clamberTimer: number;
  sprintBlend?: number;
  landingCompression?: number;
  meleeComboStage?: number;
  activeActionMode?: WeaponStrikeActionMode;
}

export function getWeaponMagazineCapacity(item: DimensionalItemDefinition): number {
  switch (item.weaponSubType) {
    case 'resonance-pistol':
      return 8;
    case 'void-arbalest':
      return 5;
    case 'spore-caster':
      return 12;
    case 'excavating-lance':
      return 6;
    case 'chrono-tuning-fork':
      return 10;
    case 'cleaver-halberd':
    case 'gravity-hammer':
    case 'prism-saber':
    default:
      return 6;
  }
}

export function isMagazineFedRangedWeapon(item: DimensionalItemDefinition): boolean {
  return (
    item.weaponSubType === 'resonance-pistol' ||
    item.weaponSubType === 'void-arbalest' ||
    item.weaponSubType === 'spore-caster' ||
    item.weaponSubType === 'excavating-lance' ||
    item.weaponSubType === 'chrono-tuning-fork'
  );
}

export function isTwoHandedWeapon(
  item: DimensionalItemDefinition | null | undefined
): boolean {
  if (!item) return false;
  return (
    item.weaponSubType === 'void-arbalest' ||
    item.weaponSubType === 'cleaver-halberd' ||
    item.weaponSubType === 'gravity-hammer' ||
    item.weaponSubType === 'excavating-lance' ||
    item.weaponSubType === 'spore-caster'
  );
}

const _springTargetPos = new THREE.Vector3();
const _springTargetRot = new THREE.Vector3();
const _springForcePos = new THREE.Vector3();
const _springForceRot = new THREE.Vector3();
const _impactTargetPos = new THREE.Vector3();
const _impactTargetRot = new THREE.Vector3();
const _impactForcePos = new THREE.Vector3();
const _impactForceRot = new THREE.Vector3();

/**
 * Cubic Hermite S-curve with smooth acceleration and deceleration
 */
function smoothCurve01(x: number): number {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Evaluates a realistic 3-phase FPS Landing Impact & Rebound Motion Curve:
 * - Phase 1 (0..0.24): Rapid downward mass compression & wrist cant
 * - Phase 2 (0.24..0.66): Elastic muscle/suspension overshoot rebound
 * - Phase 3 (0.66..1.0): Smooth critical settle back to neutral
 */
function evaluateLandingMotionCurve(u: number): {
  dipY: number;
  pushZ: number;
  pitchX: number;
  rollZ: number;
} {
  const t = THREE.MathUtils.clamp(u, 0, 1);
  if (t < 0.24) {
    const s = Math.sin((t / 0.24) * (Math.PI * 0.5));
    return {
      dipY: -1.0 * s,
      pushZ: 0.38 * s,
      pitchX: -1.0 * s,
      rollZ: -0.68 * s,
    };
  }
  if (t < 0.66) {
    const s = (t - 0.24) / 0.42;
    const h = smoothCurve01(s);
    return {
      dipY: THREE.MathUtils.lerp(-1.0, 0.28, h),
      pushZ: THREE.MathUtils.lerp(0.38, -0.12, h),
      pitchX: THREE.MathUtils.lerp(-1.0, 0.34, h),
      rollZ: THREE.MathUtils.lerp(-0.68, 0.18, h),
    };
  }
  const s = (t - 0.66) / 0.34;
  const inv = 1.0 - smoothCurve01(s);
  return {
    dipY: 0.28 * inv,
    pushZ: -0.12 * inv,
    pitchX: 0.34 * inv,
    rollZ: 0.18 * inv,
  };
}

/**
 * Dual-Channel Second-Order Spring-Mass-Damper First-Person Viewmodel Kinematics
 * Provides a modern AAA FPS feel:
 * - Channel 1 (Locomotion & Stance Spring, ωn = 15.5 rad/s, ζ = 0.74):
 *   Asymmetric Lissajous figure-8 walk bob, S-curve Tactical Sprint High-Port carry,
 *   strafe banking roll, and soft-saturated mouse look-sway lag.
 * - Channel 2 (Impact, Recoil & Micro-Shock Spring, ωn = 23.5 rad/s, ζ = 0.56):
 *   Multi-stage Landing Impact compression/rebound, Jump Takeoff inertial counter-dip,
 *   Footstep Heel-Strike micro-impulses, and Ballistic Muzzle Recoil.
 * - Weapon-Class Combat Animations:
 *   Ranged weapons use authentic rearward Z-kickback, muzzle climb, and reciprocating bolt/barrel blowback;
 *   Melee weapons use a 3-stage directional combo (Diagonal Cleave -> Reverse Horizontal Sweep -> Two-Handed Overhead Slam).
 */
export class FirstPersonActionSpringRig {
  // Channel 1: Primary Stance & Locomotion Spring
  public posOffset = new THREE.Vector3();
  public posVel = new THREE.Vector3();
  public rotOffset = new THREE.Vector3();
  public rotVel = new THREE.Vector3();

  // Channel 2: High-Frequency Impact, Recoil & Footstep Micro-Shock Spring
  public impactPosOffset = new THREE.Vector3();
  public impactPosVel = new THREE.Vector3();
  public impactRotOffset = new THREE.Vector3();
  public impactRotVel = new THREE.Vector3();

  private prevYaw = 0;
  private prevPitch = 0;
  private prevWalkSin = 0;
  private wasGrounded = true;
  private prevVertVel = 0;

  // Modern FPS Locomotion, Sprint & Landing Curve States
  public sprintBlend = 0;
  private airborneBlend = 0;
  private smoothedStrafe = 0;
  private smoothedForward = 0;
  private landingTimer = 0;
  private landingDuration = 0.48;
  private landingSeverity = 0;
  private jumpTakeoffTimer = 0;
  private jumpTakeoffDuration = 0.32;

  private drawTimer = 0;
  private inspectTimer = 0;
  private strikeTimer = 0;
  private strikeDuration = 0.42;
  public activeActionMode: WeaponStrikeActionMode = 'ranged-recoil';
  public meleeComboStage: 1 | 2 | 3 = 1;
  private lastMeleeStrikeAtMs = 0;

  // Magazine Ammo & Multi-Style Reload State
  private ammoByWeaponId = new Map<string, number>();
  public currentAmmo = 8;
  public maxMagazine = 8;
  public reloadTimer = 0;
  public reloadDuration = 1.25;
  public activeReloadStyle: ReloadAnimationStyle = 'tactical-combat-flip';
  public activeReloadLabel = 'Tactical Cell-Flip Reload';

  // Sheath / Bare-Handed Parkour & Clamber State
  public isSheathed = false;
  public sheathBlend = 0; // 0 = weapon drawn, 1 = weapon sheathed (bare hands active)
  public clamberTimer = 0;
  public clamberDuration = 0.55;
  public leftHandRaiseBlend = 0; // 0 = left hand stowed below viewport, 1 = raised in view for weapon/tool/animation/portal/menu

  private equippedItemId = '';
  private equippedItemRef: DimensionalItemDefinition | null = null;
  public activeWeaponMesh: THREE.Group | null = null;
  public activeTpWeaponMesh: THREE.Group | null = null;

  public equipWeaponOnHandRigs(
    item: DimensionalItemDefinition,
    fpRightHandGroup: THREE.Group | null,
    tpRightHandGroup?: THREE.Group | null
  ): void {
    const maxMag = getWeaponMagazineCapacity(item);
    this.maxMagazine = maxMag;
    if (!this.ammoByWeaponId.has(item.id)) {
      this.ammoByWeaponId.set(item.id, maxMag);
    }
    this.currentAmmo = this.ammoByWeaponId.get(item.id) ?? maxMag;
    this.equippedItemRef = item;

    if (this.equippedItemId === item.id && this.activeWeaponMesh) return;
    this.equippedItemId = item.id;
    this.reloadTimer = 0;
    this.triggerDrawFlourish();

    if (fpRightHandGroup) {
      const old = fpRightHandGroup.getObjectByName('equipped-composite-weapon');
      if (old) fpRightHandGroup.remove(old);
      const fpMesh = buildCompositeItem3DMesh(item, true);
      fpMesh.name = 'equipped-composite-weapon';
      // Align ranged receivers forward along sightline vs melee hilts angled in combat guard
      if (isMagazineFedRangedWeapon(item)) {
        fpMesh.position.set(-0.02, 0.06, -0.14);
        fpMesh.rotation.set(-0.22, 0.08, 0.04);
      } else {
        fpMesh.position.set(-0.02, 0.08, -0.12);
        fpMesh.rotation.set(-0.42, 0.14, 0.08);
      }
      fpMesh.visible = !this.isSheathed;
      fpRightHandGroup.add(fpMesh);
      this.activeWeaponMesh = fpMesh;
    }

    if (tpRightHandGroup) {
      const oldTp = tpRightHandGroup.getObjectByName(
        'equipped-composite-weapon-tp'
      );
      if (oldTp) tpRightHandGroup.remove(oldTp);
      const tpMesh = buildCompositeItem3DMesh(item, false);
      tpMesh.name = 'equipped-composite-weapon-tp';
      tpMesh.position.set(0, 0.08, -0.14);
      tpMesh.rotation.set(-0.55, 0, 0);
      tpMesh.visible = !this.isSheathed;
      tpRightHandGroup.add(tpMesh);
      this.activeTpWeaponMesh = tpMesh;
    }
  }

  public toggleSheathWeapon(): boolean {
    this.isSheathed = !this.isSheathed;
    this.reloadTimer = 0;
    if (this.isSheathed) {
      this.posVel.set(0.18, -0.95, 0.35);
      this.rotVel.set(4.5, -2.2, 1.8);
    } else {
      this.triggerDrawFlourish();
    }
    return this.isSheathed;
  }

  public setSheathed(sheathed: boolean): void {
    if (this.isSheathed === sheathed) return;
    this.toggleSheathWeapon();
  }

  public triggerClamberOrParkourImpulse(): void {
    this.clamberDuration = 0.52;
    this.clamberTimer = this.clamberDuration;
    this.posVel.set(0.0, 1.45, -1.25);
    this.rotVel.set(6.2, 0.0, 0.0);
    this.impactPosVel.set(0.0, 0.85, -0.65);
    this.impactRotVel.set(4.4, 0.0, 0.0);
  }

  /**
   * Triggers a realistic multi-stage FPS landing compression, bottom-out, and rebound impulse
   * scaled by downward impact speed (m/s).
   */
  public triggerLandingImpulse(impactSpeed: number): void {
    const clampedSpeed = Math.max(1.5, Math.abs(impactSpeed));
    const severity = Math.pow(
      THREE.MathUtils.clamp(clampedSpeed / 12.5, 0.14, 1.45),
      1.12
    );
    this.landingSeverity = severity;
    this.landingDuration = THREE.MathUtils.lerp(0.36, 0.56, Math.min(1, severity));
    this.landingTimer = this.landingDuration;

    // Immediate kinetic velocity shock into the high-response impact spring
    this.impactPosVel.x += (Math.random() - 0.5) * 0.22 * severity;
    this.impactPosVel.y -= 1.35 * severity;
    this.impactPosVel.z += 0.42 * severity;

    this.impactRotVel.x -= 5.8 * severity;
    this.impactRotVel.y += (Math.random() - 0.5) * 1.4 * severity;
    this.impactRotVel.z -= 3.6 * severity;
  }

  /**
   * Triggers an upward jump takeoff inertial counter-dip (weapon lags downward slightly
   * and pitches barrel up as legs launch the body skyward).
   */
  public triggerJumpTakeoffImpulse(jumpVelY: number = 9.5): void {
    const scale = THREE.MathUtils.clamp(jumpVelY / 10.5, 0.5, 1.4);
    this.jumpTakeoffDuration = 0.32;
    this.jumpTakeoffTimer = this.jumpTakeoffDuration;
    this.impactPosVel.y -= 0.78 * scale;
    this.impactPosVel.z += 0.26 * scale;
    this.impactRotVel.x += 3.4 * scale;
    this.impactRotVel.z += 1.25 * scale;
  }

  public consumeAmmoOnFire(): boolean {
    if (this.isSheathed || this.reloadTimer > 0) return false;
    if (this.currentAmmo <= 0) return false;
    this.currentAmmo = Math.max(0, this.currentAmmo - 1);
    if (this.equippedItemId) {
      this.ammoByWeaponId.set(this.equippedItemId, this.currentAmmo);
    }
    return true;
  }

  /**
   * Fires a ranged weapon with authentic ballistic rearward kickback, upward muzzle climb,
   * and reciprocating barrel/bolt blowback (never a fist punch or melee chop).
   */
  public triggerRangedFireRecoil(subType?: CompositeWeaponSubType): void {
    const effectiveSub =
      subType ?? this.equippedItemRef?.weaponSubType ?? 'resonance-pistol';
    const heavy =
      effectiveSub === 'void-arbalest' ||
      effectiveSub === 'gravity-hammer' ||
      effectiveSub === 'excavating-lance';
    this.activeActionMode = 'ranged-recoil';
    this.strikeDuration = heavy ? 0.34 : 0.22;
    this.strikeTimer = this.strikeDuration;

    // Split recoil across primary stance spring and snappy impact spring for crisp double-stage recovery
    this.posVel.set(
      (Math.random() - 0.5) * 0.18,
      heavy ? 0.48 : 0.28,
      heavy ? 1.65 : 1.05
    );
    this.rotVel.set(
      heavy ? 5.2 : 3.4,
      (Math.random() - 0.5) * 0.9,
      heavy ? -1.4 : -0.75
    );
    this.impactPosVel.set(
      (Math.random() - 0.5) * 0.22,
      heavy ? 0.68 : 0.42,
      heavy ? 2.15 : 1.45
    );
    this.impactRotVel.set(
      heavy ? 6.8 : 4.5,
      (Math.random() - 0.5) * 1.1,
      heavy ? -1.9 : -1.05
    );
  }

  /**
   * Starts a movement-adaptive smooth 3D reload animation based on player velocity and grounded state!
   */
  public triggerMovementAdaptiveReload(
    horizSpeed: number,
    grounded: boolean,
    isStealthCrouching: boolean
  ): { started: boolean; style: ReloadAnimationStyle; label: string } {
    if (this.isSheathed) {
      this.setSheathed(false);
    }
    if (this.reloadTimer > 0 || this.currentAmmo >= this.maxMagazine) {
      return {
        started: false,
        style: this.activeReloadStyle,
        label: this.activeReloadLabel,
      };
    }

    const subType = this.equippedItemRef?.weaponSubType ?? 'resonance-pistol';
    if (!grounded) {
      this.activeReloadStyle = 'aerial-zero-g-breech';
      this.activeReloadLabel =
        subType === 'void-arbalest'
          ? 'Aerial Zero-G Singularity Bolt Snap'
          : 'Aerial Zero-G Magnetic Breech Reload';
      this.reloadDuration = 0.96;
      this.posVel.set(0.15, 0.65, -0.4);
      this.rotVel.set(-3.5, 2.2, 8.5);
    } else if (horizSpeed >= 6.0) {
      this.activeReloadStyle = 'acrobatic-sprint-spin';
      this.activeReloadLabel =
        subType === 'resonance-pistol' || subType === 'chrono-tuning-fork'
          ? 'Sprint 360° Centrifugal Spin-Cock Reload'
          : 'High-Velocity Momentum Flip-Lock Reload';
      this.reloadDuration = 1.08;
      this.posVel.set(-0.22, 0.52, -0.35);
      this.rotVel.set(11.5, 1.8, -3.2);
    } else if (horizSpeed >= 1.25 || isStealthCrouching) {
      this.activeReloadStyle = 'kinetic-stride-indexing';
      this.activeReloadLabel = isStealthCrouching
        ? 'Stealth Low-Profile Tactile Cell Index'
        : 'Kinetic Stride-Synced Canted Reload';
      this.reloadDuration = 1.22;
      this.posVel.set(-0.35, -0.28, 0.22);
      this.rotVel.set(2.4, 4.8, -4.2);
    } else {
      this.activeReloadStyle = 'tactical-combat-flip';
      this.activeReloadLabel =
        subType === 'spore-caster'
          ? 'Bioluminescent Spore-Drum Eject & Slap-Lock'
          : 'Precision Tactical Chamber Eject & Rack';
      this.reloadDuration = 1.32;
      this.posVel.set(-0.28, 0.35, 0.18);
      this.rotVel.set(3.2, 5.2, 2.8);
    }

    this.reloadTimer = this.reloadDuration;
    return {
      started: true,
      style: this.activeReloadStyle,
      label: this.activeReloadLabel,
    };
  }

  public getCombatState(): ActiveWeaponCombatState {
    const reloadProgress =
      this.reloadTimer > 0
        ? THREE.MathUtils.clamp(
            1.0 - this.reloadTimer / Math.max(0.1, this.reloadDuration),
            0,
            1
          )
        : 0;
    return {
      currentAmmo: this.currentAmmo,
      maxMagazine: this.maxMagazine,
      isReloading: this.reloadTimer > 0,
      reloadProgress: Number(reloadProgress.toFixed(2)),
      reloadStyle: this.activeReloadStyle,
      reloadStyleLabel: this.activeReloadLabel,
      isSheathed: this.isSheathed,
      sheathBlend: Number(this.sheathBlend.toFixed(2)),
      clamberTimer: Number(this.clamberTimer.toFixed(2)),
      sprintBlend: Number(this.sprintBlend.toFixed(2)),
      landingCompression: Number(
        (this.landingTimer > 0 ? this.landingSeverity : 0).toFixed(2)
      ),
      meleeComboStage: this.meleeComboStage,
      activeActionMode: this.activeActionMode,
    };
  }

  public triggerDrawFlourish(): void {
    this.drawTimer = 0.55;
    this.posOffset.set(0.08, -0.22, 0.12);
    this.rotOffset.set(-0.85, 0.55, -0.35);
    this.impactPosVel.set(-0.12, 0.55, -0.35);
    this.impactRotVel.set(2.6, -1.4, 0.9);
  }

  public triggerInspectFlourish(): void {
    this.inspectTimer = 1.65;
    this.rotVel.y += 4.2;
    this.rotVel.z += 2.1;
    this.posVel.y += 0.45;
  }

  /**
   * Triggers a close-quarters rifle buttstroke / hilt bash when holding a ranged gun
   */
  public triggerWeaponBashImpulse(): void {
    this.activeActionMode = 'weapon-bash';
    this.strikeDuration = 0.36;
    this.strikeTimer = this.strikeDuration;
    this.posVel.set(-0.55, 0.28, -2.15);
    this.rotVel.set(-3.2, 4.8, 2.2);
    this.impactPosVel.set(-0.35, 0.18, -1.25);
    this.impactRotVel.set(-2.1, 2.6, 1.4);
  }

  /**
   * Triggers a 3-stage directional melee weapon combo (Diagonal Cleave -> Reverse Horizontal Sweep -> Two-Handed Overhead Slam)
   * or a bare-knuckle punch combo if the weapon is currently sheathed.
   */
  public triggerPrimaryStrikeImpulse(
    swingSpeedHz: number = 1.35,
    subTypeOverride?: CompositeWeaponSubType
  ): WeaponStrikeActionMode {
    const nowMs = performance.now();
    if (this.isSheathed) {
      this.activeActionMode = 'bare-punch';
      this.strikeDuration = 0.3;
      this.strikeTimer = this.strikeDuration;
      this.posVel.set(-0.45, 0.22, -2.25);
      this.rotVel.set(-4.2, 2.4, 1.8);
      this.impactPosVel.set(-0.25, 0.15, -1.35);
      this.impactRotVel.set(-2.5, 1.4, 1.1);
      return this.activeActionMode;
    }

    // Advance 3-stage directional melee combo if within 1.35s combo window
    if (nowMs - this.lastMeleeStrikeAtMs < 1350) {
      this.meleeComboStage =
        this.meleeComboStage === 1 ? 2 : this.meleeComboStage === 2 ? 3 : 1;
    } else {
      this.meleeComboStage = 1;
    }
    this.lastMeleeStrikeAtMs = nowMs;

    const subType =
      subTypeOverride ?? this.equippedItemRef?.weaponSubType ?? 'prism-saber';
    const isHeavyPolearm =
      subType === 'gravity-hammer' || subType === 'cleaver-halberd';

    this.strikeDuration = Math.max(
      0.26,
      Math.min(0.68, (isHeavyPolearm ? 0.58 : 0.44) / Math.max(0.6, swingSpeedHz))
    );
    this.strikeTimer = this.strikeDuration;

    if (this.meleeComboStage === 1) {
      this.activeActionMode = 'melee-combo-1'; // Diagonal High-to-Low Cleave
      this.posVel.set(-0.78, 0.42, -1.75);
      this.rotVel.set(-6.2, 4.4, 3.1);
      this.impactPosVel.set(-0.42, 0.25, -0.95);
      this.impactRotVel.set(-3.4, 2.2, 1.8);
    } else if (this.meleeComboStage === 2) {
      this.activeActionMode = 'melee-combo-2'; // Reverse Cross-Body Horizontal Sweep
      this.posVel.set(0.86, 0.18, -1.65);
      this.rotVel.set(-3.8, -5.6, -3.6);
      this.impactPosVel.set(0.48, 0.12, -0.88);
      this.impactRotVel.set(-2.1, -3.2, -2.2);
    } else {
      this.activeActionMode = 'melee-combo-3'; // Two-Handed Overhead Gravity Slam / Piercing Lunge
      this.posVel.set(-0.22, 0.92, -2.35);
      this.rotVel.set(-8.4, 1.2, 0.85);
      this.impactPosVel.set(-0.15, 0.48, -1.45);
      this.impactRotVel.set(-5.2, 0.8, 0.55);
    }

    return this.activeActionMode;
  }

  public isAnimatingAction(): boolean {
    return (
      this.reloadTimer > 0 ||
      this.inspectTimer > 0 ||
      this.drawTimer > 0 ||
      this.strikeTimer > 0 ||
      this.clamberTimer > 0
    );
  }

  public stepSpringKinematics(params: {
    dt: number;
    nowSec: number;
    yaw: number;
    pitch: number;
    horizSpeed: number;
    vertVel: number;
    walkCycle: number;
    grounded: boolean;
    isStealthCrouching: boolean;
    isSprinting?: boolean;
    strafeSpeed?: number;
    forwardSpeed?: number;
    shouldShowLeftHand?: boolean;
    isVoidHandOpen?: boolean;
    isFirstPersonMode?: boolean;
    fpRightHandGroup: THREE.Group | null;
    fpLeftHandGroup: THREE.Group | null;
    onReloadComplete?: (refilledAmmo: number, weaponName: string) => void;
  }): void {
    const {
      dt,
      nowSec,
      yaw,
      pitch,
      horizSpeed,
      vertVel,
      walkCycle,
      grounded,
      isStealthCrouching,
      isSprinting = horizSpeed > 6.5,
      strafeSpeed = 0,
      forwardSpeed = horizSpeed,
      shouldShowLeftHand = false,
      isVoidHandOpen = false,
      isFirstPersonMode = true,
      fpRightHandGroup,
      fpLeftHandGroup,
      onReloadComplete,
    } = params;

    const safeDt = Math.min(0.033, dt);

    // Automatic landing & takeoff edge detection if not already triggered externally
    if (!this.wasGrounded && grounded && this.landingTimer <= 0) {
      const impactVel = Math.max(2.4, Math.abs(this.prevVertVel));
      this.triggerLandingImpulse(impactVel);
    } else if (this.wasGrounded && !grounded && vertVel > 2.0 && this.jumpTakeoffTimer <= 0) {
      this.triggerJumpTakeoffImpulse(vertVel);
    }
    this.wasGrounded = grounded;
    if (!grounded) {
      this.prevVertVel = vertVel;
    } else {
      this.prevVertVel = 0;
    }

    // 1. Soft-Saturated Angular Look-Sway Lag (modern FPS deadzone + hyperbolic tangent curve)
    let rawDYaw = yaw - this.prevYaw;
    if (rawDYaw > Math.PI) rawDYaw -= Math.PI * 2;
    if (rawDYaw < -Math.PI) rawDYaw += Math.PI * 2;
    const dYaw = Math.tanh((rawDYaw / Math.max(0.004, safeDt)) * 0.14) * 0.18;
    const dPitch =
      Math.tanh(((pitch - this.prevPitch) / Math.max(0.004, safeDt)) * 0.14) *
      0.18;
    this.prevYaw = yaw;
    this.prevPitch = pitch;

    // Smoothly blend sheath state
    const targetSheath = this.isSheathed ? 1.0 : 0.0;
    this.sheathBlend +=
      (targetSheath - this.sheathBlend) * Math.min(1, safeDt * 12.0);

    // Smoothly blend Tactical Sprint state (canted high-port carry when sprinting on ground and not firing/reloading)
    const canTacticalSprint =
      grounded &&
      !isStealthCrouching &&
      (isSprinting || horizSpeed > 6.6) &&
      horizSpeed > 3.2 &&
      this.strikeTimer <= 0 &&
      this.reloadTimer <= 0;
    const targetSprint = canTacticalSprint ? 1.0 : 0.0;
    const prevSprintBlend = this.sprintBlend;
    this.sprintBlend +=
      (targetSprint - this.sprintBlend) *
      Math.min(1, safeDt * (canTacticalSprint ? 9.5 : 13.5));
    const sprintCurve = smoothCurve01(this.sprintBlend);

    // Subtle sprint-exit "shoulder settle" impulse when transitioning from sprint back to ready sights
    if (prevSprintBlend > 0.55 && this.sprintBlend <= 0.55 && this.strikeTimer <= 0) {
      this.impactPosVel.y -= 0.18;
      this.impactPosVel.z -= 0.22;
      this.impactRotVel.x += 0.95;
    }

    // Smoothly blend Airborne zero-G state & lateral/forward velocity signals
    const targetAirborne = grounded ? 0.0 : 1.0;
    this.airborneBlend +=
      (targetAirborne - this.airborneBlend) * Math.min(1, safeDt * 9.0);
    this.smoothedStrafe +=
      (strafeSpeed - this.smoothedStrafe) * Math.min(1, safeDt * 11.0);
    this.smoothedForward +=
      (forwardSpeed - this.smoothedForward) * Math.min(1, safeDt * 11.0);

    if (this.activeWeaponMesh) {
      this.activeWeaponMesh.visible = this.sheathBlend < 0.86;
    }
    if (this.activeTpWeaponMesh) {
      this.activeTpWeaponMesh.visible = !this.isSheathed;
    }

    // Feed angular look velocity & vertical jump/fall velocity into primary stance spring
    this.posVel.x += dYaw * 1.45;
    this.posVel.y +=
      dPitch * 1.25 - THREE.MathUtils.clamp(vertVel, -14, 14) * 0.032;
    this.rotVel.y += dYaw * 5.8;
    this.rotVel.x += dPitch * 5.2;
    this.rotVel.z -= dYaw * 3.8;

    // Detect Footstep Heel-Strike zero-crossings on walkCycle to inject tactile footfall micro-shocks
    const curWalkSin = Math.sin(walkCycle);
    if (
      grounded &&
      horizSpeed > 0.85 &&
      ((this.prevWalkSin < 0 && curWalkSin >= 0) ||
        (this.prevWalkSin > 0 && curWalkSin <= 0))
    ) {
      const stepSide = curWalkSin >= 0 ? 1 : -1;
      const stepStrength =
        THREE.MathUtils.clamp(horizSpeed / 8.5, 0.2, 1.35) *
        (1.0 + sprintCurve * 0.45) *
        (isStealthCrouching ? 0.42 : 1.0);
      this.impactPosVel.y -= 0.28 * stepStrength;
      this.impactPosVel.x += stepSide * 0.09 * stepStrength;
      this.impactRotVel.x -= 0.95 * stepStrength;
      this.impactRotVel.z += stepSide * 0.65 * stepStrength;
    }
    this.prevWalkSin = curWalkSin;

    if (this.drawTimer > 0) {
      this.drawTimer = Math.max(0, this.drawTimer - safeDt);
    }
    if (this.inspectTimer > 0) {
      this.inspectTimer = Math.max(0, this.inspectTimer - safeDt);
    }
    if (this.strikeTimer > 0) {
      this.strikeTimer = Math.max(0, this.strikeTimer - safeDt);
    }
    if (this.clamberTimer > 0) {
      this.clamberTimer = Math.max(0, this.clamberTimer - safeDt);
    }
    if (this.landingTimer > 0) {
      this.landingTimer = Math.max(0, this.landingTimer - safeDt);
    }
    if (this.jumpTakeoffTimer > 0) {
      this.jumpTakeoffTimer = Math.max(0, this.jumpTakeoffTimer - safeDt);
    }

    // Step Multi-Stage Reload Timer & Refill Magazine on Completion
    let reloadPosX = 0;
    let reloadPosY = 0;
    let reloadPosZ = 0;
    let reloadRotX = 0;
    let reloadRotY = 0;
    let reloadRotZ = 0;
    let reloadCoreDetachOffset = 0;

    if (this.reloadTimer > 0) {
      this.reloadTimer = Math.max(0, this.reloadTimer - safeDt);
      const u = 1.0 - this.reloadTimer / Math.max(0.1, this.reloadDuration);

      if (this.activeReloadStyle === 'acrobatic-sprint-spin') {
        const spinPhase = Math.sin(u * Math.PI);
        reloadPosX = -0.06 * spinPhase;
        reloadPosY = 0.09 * Math.sin(u * Math.PI * 2);
        reloadPosZ = -0.08 * spinPhase;
        reloadRotX = u * Math.PI * 2;
        reloadRotY = 0.35 * spinPhase;
        reloadRotZ = -0.45 * spinPhase;
        reloadCoreDetachOffset = Math.sin(u * Math.PI) * -0.14;
      } else if (this.activeReloadStyle === 'aerial-zero-g-breech') {
        const arc = Math.sin(u * Math.PI);
        reloadPosX = 0.05 * arc;
        reloadPosY = 0.08 * arc;
        reloadPosZ = -0.06 * arc;
        reloadRotX = -0.55 * arc;
        reloadRotY = 0.42 * arc;
        reloadRotZ = u * Math.PI * 2;
        reloadCoreDetachOffset = Math.sin(u * Math.PI) * 0.16;
      } else if (this.activeReloadStyle === 'kinetic-stride-indexing') {
        if (u < 0.35) {
          const s = smoothCurve01(u / 0.35);
          reloadPosX = -0.14 * s;
          reloadPosY = -0.08 * s;
          reloadPosZ = 0.05 * s;
          reloadRotX = 0.42 * s;
          reloadRotY = 0.68 * s;
          reloadRotZ = -0.78 * s;
          reloadCoreDetachOffset = -0.18 * s;
        } else if (u < 0.75) {
          const s = (u - 0.35) / 0.4;
          const slap = Math.sin(s * Math.PI);
          reloadPosX = -0.14 + 0.04 * s;
          reloadPosY = -0.08 + 0.14 * slap;
          reloadPosZ = 0.05 - 0.06 * slap;
          reloadRotX = 0.42 - 0.25 * slap;
          reloadRotY = 0.68 - 0.18 * s;
          reloadRotZ = -0.78 + 0.35 * s;
          reloadCoreDetachOffset = -0.18 * (1.0 - s);
        } else {
          const s = (u - 0.75) / 0.25;
          const inv = 1.0 - smoothCurve01(s);
          reloadPosX = -0.1 * inv;
          reloadPosY = 0.04 * Math.sin(s * Math.PI);
          reloadPosZ = 0.09 * Math.sin(s * Math.PI);
          reloadRotX = 0.17 * inv;
          reloadRotY = 0.5 * inv;
          reloadRotZ = -0.43 * inv;
        }
      } else {
        if (u < 0.32) {
          const s = smoothCurve01(u / 0.32);
          reloadPosX = -0.11 * s;
          reloadPosY = 0.06 * s;
          reloadPosZ = -0.04 * s;
          reloadRotX = 0.65 * s;
          reloadRotY = 0.75 * s;
          reloadRotZ = 0.55 * s;
          reloadCoreDetachOffset = -0.22 * s;
        } else if (u < 0.72) {
          const s = (u - 0.32) / 0.4;
          const slapImpulse = Math.sin(s * Math.PI);
          reloadPosX = -0.11 * (1 - s * 0.4);
          reloadPosY = 0.06 - 0.12 * slapImpulse;
          reloadPosZ = -0.04 - 0.05 * slapImpulse;
          reloadRotX = 0.65 - 0.85 * slapImpulse;
          reloadRotY = 0.75 * (1 - s * 0.5);
          reloadRotZ = 0.55 - 0.95 * s;
          reloadCoreDetachOffset = -0.22 * (1.0 - s);
        } else {
          const s = (u - 0.72) / 0.28;
          const rack = Math.sin(s * Math.PI);
          const inv = 1.0 - smoothCurve01(s);
          reloadPosX = -0.06 * inv;
          reloadPosY = 0.05 * rack;
          reloadPosZ = 0.11 * rack;
          reloadRotX = -0.25 * rack;
          reloadRotY = 0.37 * inv;
          reloadRotZ = -0.4 * inv;
        }
      }

      if (this.reloadTimer === 0) {
        this.currentAmmo = this.maxMagazine;
        if (this.equippedItemId) {
          this.ammoByWeaponId.set(this.equippedItemId, this.currentAmmo);
        }
        this.impactPosVel.set(0.08, 0.36, -0.72);
        this.impactRotVel.set(-2.6, 0.9, 1.5);
        onReloadComplete?.(
          this.currentAmmo,
          this.equippedItemRef?.name ?? 'Weapon'
        );
      }
    }

    // 2. Realistic FPS Locomotion Curves:
    // (a) Organic Idle Breathing Harmonic Curve
    const breathPhase = nowSec * (1.65 + sprintCurve * 1.8);
    const breathX =
      Math.cos(breathPhase * 0.5) * 0.0038 * (1.0 - sprintCurve * 0.5);
    const breathY =
      (Math.sin(breathPhase) + 0.32 * Math.sin(breathPhase * 2.0)) *
      0.0052 *
      (1.0 - sprintCurve * 0.4);
    const breathRotX = Math.cos(breathPhase) * 0.012;
    const breathRotZ = Math.sin(breathPhase * 0.5) * 0.008;

    // (b) Asymmetric Lissajous Figure-8 Walk & Run Bob Curve
    const speedNorm = THREE.MathUtils.clamp(horizSpeed / 8.2, 0, 1.35);
    const groundedFactor = 1.0 - this.airborneBlend * 0.82;
    const gaitAmpX =
      THREE.MathUtils.lerp(0.022, 0.044, sprintCurve) *
      speedNorm *
      groundedFactor;
    const gaitAmpY =
      THREE.MathUtils.lerp(0.024, 0.048, sprintCurve) *
      speedNorm *
      groundedFactor;
    const gaitAmpZ =
      THREE.MathUtils.lerp(0.01, 0.028, sprintCurve) *
      speedNorm *
      groundedFactor;

    const strideX =
      (Math.cos(walkCycle) + 0.16 * Math.cos(walkCycle * 2.0 + 0.4)) * gaitAmpX;
    // Sharp heel-strike trough + smooth push-off crest
    const strideY =
      (Math.abs(Math.sin(walkCycle)) -
        0.46 +
        0.24 * Math.sin(walkCycle * 2.0 - Math.PI * 0.35)) *
      gaitAmpY;
    const strideZ = Math.cos(walkCycle * 2.0 - 0.25) * gaitAmpZ;

    // (c) Tactical Sprint High-Port / Canted Carry Pose + Rhythmic Figure-8 Barrel Whip
    const sprintPoseX = -0.068 * sprintCurve;
    const sprintPoseY = -0.028 * sprintCurve;
    const sprintPoseZ = 0.042 * sprintCurve;
    const sprintRotX =
      (0.24 + Math.sin(walkCycle * 2.0 - 0.3) * 0.14) * sprintCurve;
    const sprintRotY =
      (0.46 + Math.cos(walkCycle - 0.2) * 0.18) * sprintCurve;
    const sprintRotZ =
      (-0.38 - Math.cos(walkCycle) * 0.15) * sprintCurve;

    // (d) Strafe Banking Roll & Forward/Aft Acceleration Pitch Tilt
    const strafeBankRoll = -Math.tanh(this.smoothedStrafe / 6.2) * 0.092;
    const strafeShiftX = -Math.tanh(this.smoothedStrafe / 6.8) * 0.024;
    const forwardAccelPitch = Math.tanh(this.smoothedForward / 8.0) * 0.042;
    const crouchY = isStealthCrouching ? -0.038 : 0;
    const crouchRoll = isStealthCrouching ? -0.14 : 0;

    // (e) Airborne Zero-G Apex Float Curve
    const airborneLiftY =
      THREE.MathUtils.clamp(-vertVel * 0.0085, -0.045, 0.045) *
      this.airborneBlend;
    const airbornePitchX =
      THREE.MathUtils.clamp(-vertVel * 0.028, -0.18, 0.22) *
      this.airborneBlend;

    // (f) Weapon-Class Action Keyframe Curves:
    // Distinct curves for Ranged Ballistic Recoil vs 3-Stage Directional Melee Slash Combo vs Weapon Bash vs Bare Punch
    let strikePosX = 0;
    let strikePosY = 0;
    let strikePosZ = 0;
    let strikeRotX = 0;
    let strikeRotY = 0;
    let strikeRotZ = 0;
    let barrelBlowbackOffset = 0;

    if (this.strikeTimer > 0) {
      const u = 1.0 - this.strikeTimer / Math.max(0.08, this.strikeDuration);

      if (this.activeActionMode === 'ranged-recoil') {
        // Crisp two-stage ballistic recoil: rapid rearward kick + muzzle flip, then smooth return to battery
        const kickEnv =
          u < 0.22
            ? Math.sin((u / 0.22) * (Math.PI * 0.5))
            : Math.pow(1.0 - (u - 0.22) / 0.78, 1.85);
        strikePosX = 0.015 * kickEnv;
        strikePosY = 0.055 * kickEnv;
        strikePosZ = 0.145 * kickEnv; // Rearward toward shoulder (+Z in viewmodel space)
        strikeRotX = 0.36 * kickEnv; // Muzzle climbs upward
        strikeRotY = -0.04 * kickEnv;
        strikeRotZ = -0.09 * kickEnv;
        barrelBlowbackOffset = 0.14 * kickEnv;
      } else if (this.activeActionMode === 'melee-combo-1') {
        // Stage 1: Diagonal High-Right to Low-Left Cleave
        if (u < 0.26) {
          const w = smoothCurve01(u / 0.26);
          strikePosX = 0.11 * w;
          strikePosY = 0.12 * w;
          strikePosZ = 0.09 * w;
          strikeRotX = 0.58 * w;
          strikeRotY = -0.48 * w;
          strikeRotZ = -0.42 * w;
        } else {
          const s = Math.sin(((u - 0.26) / 0.74) * Math.PI);
          strikePosX = -0.22 * s;
          strikePosY = -0.11 * s;
          strikePosZ = -0.24 * s;
          strikeRotX = -1.15 * s;
          strikeRotY = 0.82 * s;
          strikeRotZ = 0.68 * s;
        }
      } else if (this.activeActionMode === 'melee-combo-2') {
        // Stage 2: Reverse Cross-Body Horizontal Sweep (Left-to-Right Backhand Cleave)
        if (u < 0.24) {
          const w = smoothCurve01(u / 0.24);
          strikePosX = -0.24 * w;
          strikePosY = 0.02 * w;
          strikePosZ = 0.05 * w;
          strikeRotX = 0.22 * w;
          strikeRotY = 0.88 * w;
          strikeRotZ = 1.05 * w;
        } else {
          const s = Math.sin(((u - 0.24) / 0.76) * Math.PI);
          strikePosX = 0.26 * s;
          strikePosY = 0.04 * s;
          strikePosZ = -0.22 * s;
          strikeRotX = -0.68 * s;
          strikeRotY = -1.12 * s;
          strikeRotZ = -1.18 * s;
        }
      } else if (this.activeActionMode === 'melee-combo-3') {
        // Stage 3: Two-Handed Overhead Gravity Slam / Execution Cleave
        if (u < 0.34) {
          const w = smoothCurve01(u / 0.34);
          strikePosX = -0.06 * w;
          strikePosY = 0.22 * w;
          strikePosZ = 0.12 * w;
          strikeRotX = 0.92 * w;
          strikeRotY = 0.12 * w;
          strikeRotZ = 0.08 * w;
        } else {
          const s = Math.sin(((u - 0.34) / 0.66) * Math.PI);
          strikePosX = -0.08 * s;
          strikePosY = -0.24 * s;
          strikePosZ = -0.32 * s;
          strikeRotX = -1.55 * s;
          strikeRotY = 0.24 * s;
          strikeRotZ = 0.18 * s;
        }
      } else if (this.activeActionMode === 'weapon-bash') {
        // Close-quarters horizontal rifle/hilt buttstroke
        const s = Math.sin(u * Math.PI);
        strikePosX = -0.18 * s;
        strikePosY = 0.06 * s;
        strikePosZ = -0.28 * s;
        strikeRotX = -0.45 * s;
        strikeRotY = 0.95 * s;
        strikeRotZ = 0.55 * s;
      } else {
        // Bare-handed kinetic punch lunge
        const s = Math.sin(u * Math.PI);
        strikePosX = -0.12 * s;
        strikePosY = 0.04 * s;
        strikePosZ = -0.34 * s;
        strikeRotX = -0.65 * s;
        strikeRotY = 0.38 * s;
        strikeRotZ = 0.42 * s;
      }
    }

    // (g) Clamber / Parkour Vault 2-Handed Ledge Pull-Down Arc
    let clamberPosY = 0;
    let clamberPosZ = 0;
    let clamberRotX = 0;
    if (this.clamberTimer > 0) {
      const cu = 1.0 - this.clamberTimer / this.clamberDuration;
      const pullArc = Math.sin(cu * Math.PI);
      clamberPosY = (cu < 0.35 ? 0.16 : -0.18) * pullArc;
      clamberPosZ = -0.14 * pullArc;
      clamberRotX = (cu < 0.35 ? 0.65 : -0.85) * pullArc;
    }

    // (h) Multi-Stage Landing Compression & Rebound Motion Curve + Jump Takeoff Lift
    let landingPosY = 0;
    let landingPosZ = 0;
    let landingRotX = 0;
    let landingRotZ = 0;
    if (this.landingTimer > 0) {
      const lu = 1.0 - this.landingTimer / Math.max(0.1, this.landingDuration);
      const lCurve = evaluateLandingMotionCurve(lu);
      const sev = this.landingSeverity;
      landingPosY = lCurve.dipY * 0.088 * sev;
      landingPosZ = lCurve.pushZ * 0.065 * sev;
      landingRotX = lCurve.pitchX * 0.34 * sev;
      landingRotZ = lCurve.rollZ * 0.22 * sev;
    }

    let takeoffPosY = 0;
    let takeoffRotX = 0;
    if (this.jumpTakeoffTimer > 0) {
      const ju = 1.0 - this.jumpTakeoffTimer / this.jumpTakeoffDuration;
      const jArc = Math.sin(ju * Math.PI);
      takeoffPosY = -0.042 * jArc;
      takeoffRotX = 0.16 * jArc;
    }

    const inspectWave =
      this.inspectTimer > 0
        ? Math.sin((this.inspectTimer / 1.65) * Math.PI)
        : 0;

    // When sheathed, hands poise higher and closer in a nimble Parkour / Grapple stance
    const sheathStanceX = -0.05 * this.sheathBlend;
    const sheathStanceY = 0.045 * this.sheathBlend + clamberPosY;
    const sheathStanceZ = -0.04 * this.sheathBlend + clamberPosZ;
    const sheathRotX = (0.32 + clamberRotX) * this.sheathBlend;

    _springTargetPos.set(
      breathX +
        strideX +
        sprintPoseX +
        strafeShiftX +
        strikePosX +
        reloadPosX +
        sheathStanceX -
        inspectWave * 0.08,
      breathY +
        strideY +
        sprintPoseY +
        crouchY +
        airborneLiftY +
        strikePosY +
        reloadPosY +
        sheathStanceY +
        inspectWave * 0.06,
      strideZ +
        sprintPoseZ +
        strikePosZ +
        reloadPosZ +
        sheathStanceZ -
        inspectWave * 0.05
    );
    _springTargetRot.set(
      breathRotX +
        sprintRotX +
        forwardAccelPitch +
        airbornePitchX +
        strikeRotX +
        reloadRotX +
        sheathRotX +
        inspectWave * 0.35,
      sprintRotY +
        strikeRotY +
        reloadRotY -
        strideX * 1.15 +
        inspectWave * 0.95,
      breathRotZ +
        sprintRotZ +
        strafeBankRoll +
        crouchRoll +
        strikeRotZ +
        reloadRotZ -
        strideX * 1.85 +
        inspectWave * 0.45
    );

    _impactTargetPos.set(0, landingPosY + takeoffPosY, landingPosZ);
    _impactTargetRot.set(landingRotX + takeoffRotX, 0, landingRotZ);

    // 3A. Channel 1 Integration: Primary Stance & Locomotion Spring (ωn = 15.5 rad/s, ζ = 0.74)
    const omegaStance = 15.5;
    const zetaStance = 0.74;
    const kStance = omegaStance * omegaStance;
    const cStance = 2.0 * zetaStance * omegaStance;

    _springForcePos
      .copy(_springTargetPos)
      .sub(this.posOffset)
      .multiplyScalar(kStance)
      .addScaledVector(this.posVel, -cStance);
    this.posVel.addScaledVector(_springForcePos, safeDt);
    this.posOffset.addScaledVector(this.posVel, safeDt);

    _springForceRot
      .copy(_springTargetRot)
      .sub(this.rotOffset)
      .multiplyScalar(kStance)
      .addScaledVector(this.rotVel, -cStance);
    this.rotVel.addScaledVector(_springForceRot, safeDt);
    this.rotOffset.addScaledVector(this.rotVel, safeDt);

    // 3B. Channel 2 Integration: High-Frequency Impact, Landing & Recoil Spring (ωn = 23.5 rad/s, ζ = 0.56)
    const omegaImpact = 23.5;
    const zetaImpact = 0.56;
    const kImpact = omegaImpact * omegaImpact;
    const cImpact = 2.0 * zetaImpact * omegaImpact;

    _impactForcePos
      .copy(_impactTargetPos)
      .sub(this.impactPosOffset)
      .multiplyScalar(kImpact)
      .addScaledVector(this.impactPosVel, -cImpact);
    this.impactPosVel.addScaledVector(_impactForcePos, safeDt);
    this.impactPosOffset.addScaledVector(this.impactPosVel, safeDt);

    _impactForceRot
      .copy(_impactTargetRot)
      .sub(this.impactRotOffset)
      .multiplyScalar(kImpact)
      .addScaledVector(this.impactRotVel, -cImpact);
    this.impactRotVel.addScaledVector(_impactForceRot, safeDt);
    this.impactRotOffset.addScaledVector(this.impactRotVel, safeDt);

    const totalPosX = this.posOffset.x + this.impactPosOffset.x;
    const totalPosY = this.posOffset.y + this.impactPosOffset.y;
    const totalPosZ = this.posOffset.z + this.impactPosOffset.z;
    const totalRotX = this.rotOffset.x + this.impactRotOffset.x;
    const totalRotY = this.rotOffset.y + this.impactRotOffset.y;
    const totalRotZ = this.rotOffset.z + this.impactRotOffset.z;

    // 4. Apply Combined Dual-Channel Spring Output to 1st-Person Right-Hand Weapon Rig & Left-Hand Catalyst Rig
    if (fpRightHandGroup) {
      fpRightHandGroup.position.set(
        0.31 + totalPosX,
        -0.23 + totalPosY,
        -0.45 + totalPosZ
      );
      fpRightHandGroup.rotation.set(
        0.22 + totalRotX,
        -0.26 + totalRotY,
        0.1 + totalRotZ
      );

      // Animate spinning auger, reciprocating barrel/bolt blowback, or resonant magazine core on the weapon mesh itself
      if (this.activeWeaponMesh && this.activeWeaponMesh.visible) {
        this.activeWeaponMesh.traverse((ch) => {
          if (ch.userData.isSpinningAuger) {
            ch.rotation.y +=
              safeDt *
              (this.strikeTimer > 0 || this.reloadTimer > 0
                ? 28.0
                : 3.5 + sprintCurve * 6.5);
          }
          if (ch.userData.isReciprocatingBarrel) {
            ch.position.z =
              (ch.userData.baseZ ?? -0.22) + barrelBlowbackOffset;
          }
          if (ch.userData.isReciprocatingBolt) {
            ch.position.z =
              (ch.userData.baseZ ?? -0.24) + barrelBlowbackOffset * 1.45;
          }
          if (ch.userData.isTorsionLimb) {
            ch.scale.x = 1.0 - barrelBlowbackOffset * 0.65;
          }
          if (ch.userData.isReciprocatingCrown) {
            ch.position.y =
              (ch.userData.baseY ?? 0.7) - barrelBlowbackOffset * 0.85;
            ch.rotation.z += safeDt * (this.strikeTimer > 0 ? 14.0 : 1.8);
          }
          if (ch.userData.isResonantCore) {
            ch.rotation.y = nowSec * (2.8 + sprintCurve * 2.2);
            ch.rotation.z = Math.sin(nowSec * 3.2) * 0.35;
            if (this.reloadTimer > 0) {
              ch.position.y = 0.24 + reloadCoreDetachOffset;
            }
          }
        });
      }
    }

    // Two-handed weapons (arbalest, halberd, hammer, lance, spore-caster) naturally engage the left support hand on the foregrip/shaft!
    const isHoldingTwoHandedWeapon =
      !this.isSheathed &&
      !isVoidHandOpen &&
      isTwoHandedWeapon(this.equippedItemRef);

    // Smoothly interpolate Left-Hand Contextual Visibility & Raise/Stow Blend
    const effectiveLeftActive =
      shouldShowLeftHand ||
      isHoldingTwoHandedWeapon ||
      this.isAnimatingAction();
    const targetLeftRaise = effectiveLeftActive ? 1.0 : 0.0;
    this.leftHandRaiseBlend +=
      (targetLeftRaise - this.leftHandRaiseBlend) *
      Math.min(1, safeDt * (effectiveLeftActive ? 12.0 : 8.5));
    const raiseCurve = smoothCurve01(this.leftHandRaiseBlend);

    if (fpLeftHandGroup) {
      if (!isFirstPersonMode || raiseCurve <= 0.015) {
        fpLeftHandGroup.visible = false;
      } else {
        fpLeftHandGroup.visible = true;
        // During reload, tactical sprint, clamber, or two-handed foregrip bracing, the left hand actively assists!
        const reloadLeftAssistX =
          this.reloadTimer > 0 && this.activeReloadStyle !== 'acrobatic-sprint-spin'
            ? Math.sin((1.0 - this.reloadTimer / this.reloadDuration) * Math.PI) *
              0.18
            : 0;
        const reloadLeftAssistY =
          this.reloadTimer > 0 && this.activeReloadStyle !== 'acrobatic-sprint-spin'
            ? Math.sin(
                (1.0 - this.reloadTimer / this.reloadDuration) * Math.PI * 2
              ) * 0.09
            : 0;
        const sprintLeftPumpY =
          Math.sin(walkCycle + Math.PI * 0.5) * 0.032 * sprintCurve;
        const sprintLeftPumpZ = Math.cos(walkCycle) * 0.028 * sprintCurve;

        // When holding a two-handed weapon (and not casting the Void Ball), position the left hand forward & across to cradle the foregrip/shaft
        const useForegripStance =
          isHoldingTwoHandedWeapon &&
          this.reloadTimer <= 0 &&
          this.clamberTimer <= 0;

        const activeBaseX = isVoidHandOpen
          ? -0.22
          : useForegripStance
          ? 0.04
          : -0.32;
        const activeBaseY = isVoidHandOpen
          ? -0.14
          : useForegripStance
          ? -0.22
          : -0.21;
        const activeBaseZ = isVoidHandOpen
          ? -0.38
          : useForegripStance
          ? -0.54
          : -0.46;

        const coupleRatio = useForegripStance ? 0.94 : 0.68;

        const raisedX =
          activeBaseX +
          totalPosX * coupleRatio +
          reloadLeftAssistX +
          0.04 * this.sheathBlend +
          0.035 * sprintCurve;
        const raisedY =
          activeBaseY +
          totalPosY * coupleRatio +
          reloadLeftAssistY +
          sprintLeftPumpY +
          clamberPosY * 0.8;
        const raisedZ =
          activeBaseZ + totalPosZ * (useForegripStance ? 0.92 : 0.45) + sprintLeftPumpZ;

        const raisedRotX =
          (isVoidHandOpen ? 0.65 : useForegripStance ? 0.42 : 0.28) +
          totalRotX * (useForegripStance ? 0.88 : 0.52) +
          clamberRotX * 0.85 +
          0.18 * sprintCurve;
        const raisedRotY =
          (isVoidHandOpen ? 0.68 : useForegripStance ? -0.48 : 0.32) +
          totalRotY * (useForegripStance ? 0.85 : 0.48) -
          reloadLeftAssistX * 1.4 -
          0.22 * sprintCurve;
        const raisedRotZ =
          (isVoidHandOpen ? 0.35 : useForegripStance ? 0.58 : 0.0) +
          totalRotZ * (useForegripStance ? 0.82 : 0.45) +
          strafeBankRoll * 0.75;

        // Interpolate from stowed position below camera frustum up to active raised pose
        fpLeftHandGroup.position.set(
          THREE.MathUtils.lerp(-0.44, raisedX, raiseCurve),
          THREE.MathUtils.lerp(-0.68, raisedY, raiseCurve),
          THREE.MathUtils.lerp(-0.26, raisedZ, raiseCurve)
        );
        fpLeftHandGroup.rotation.set(
          THREE.MathUtils.lerp(-0.62, raisedRotX, raiseCurve),
          THREE.MathUtils.lerp(0.48, raisedRotY, raiseCurve),
          THREE.MathUtils.lerp(-0.38, raisedRotZ, raiseCurve)
        );
      }
    }
  }
}

export interface GroundingAnchorArchetypeSpec {
  id: string;
  name: string;
  boundary: DifferentialUniverseBoundaryId;
  taxonomyClass: GroundingTaxonomyClass;
  categoryLabel: string;
  interactionVerb: string;
  loreSummary: string;
  rewardCategory: 'relic' | 'weapon' | 'tool';
  collisionRadius: number;
  physicsAuraSummary: string;
  baseGravityEffect: number;      // e.g. 0.75 to 1.35 local multiplier
  baseTimeDilationEffect: number; // e.g. 0.45 to 1.65 local proper-time gamma
  baseUpdraftBuoyancy: number;    // m/s^2 upward or downward barometric lift
}

export const TAXONOMY_CLASS_LABELS: Record<
  GroundingTaxonomyClass,
  { title: string; badgeColor: string; physicsDomain: string }
> = {
  'gravity-inertial-anchor': {
    title: 'Gravity & Inertial Stability Anchor',
    badgeColor: '#f59e0b',
    physicsDomain: 'Gravitational Metric & Inertial Mass',
  },
  'temporal-causal-regulator': {
    title: 'Temporal Flow & Causal Phase Regulator',
    badgeColor: '#a855f7',
    physicsDomain: 'Relativistic Proper-Time Dilation (γ)',
  },
  'thermodynamic-pressure-pylon': {
    title: 'Thermodynamic & Atmospheric Pressure Pylon',
    badgeColor: '#06b6d4',
    physicsDomain: 'Barometric Buoyancy & Entropy Drag',
  },
};

export const DIMENSIONAL_GROUNDING_ARCHETYPES: Record<
  DifferentialUniverseBoundaryId,
  [
    GroundingAnchorArchetypeSpec,
    GroundingAnchorArchetypeSpec,
    GroundingAnchorArchetypeSpec,
  ]
> = {
  'planck-0d-point-singularity': [
    {
      id: 'grounding-planck-zero-point-plumb',
      name: 'Planck Zero-Point Graviton Plumb-Monolith',
      boundary: 'planck-0d-point-singularity',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Planck Gravity Anchor',
      interactionVerb: 'Quantize Inertial Mass & Claim Singularity Relic',
      loreSummary:
        'Pins pre-geometric quantum foam to a discrete inertial lattice so matter does not dissolve into probability waves.',
      rewardCategory: 'relic',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Stabilizes 0.52G Quantum-Foam Microgravity Well',
      baseGravityEffect: 0.65,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 2.5,
    },
    {
      id: 'grounding-planck-chronon-oscillator',
      name: '1D String-Chronon Phase Oscillator',
      boundary: 'planck-0d-point-singularity',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Planck Temporal Regulator',
      interactionVerb: 'Modulate Chronon Pulse & Draw String Weapon',
      loreSummary:
        'A vibrating 1D cosmic string stretched between two Planck horizons that ticks in discrete 10⁻⁴³s chronon intervals.',
      rewardCategory: 'weapon',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Dilates Local World Clock (γ = 0.34× Extreme Slow-Time)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 0.42,
      baseUpdraftBuoyancy: 0.0,
    },
    {
      id: 'grounding-planck-casimir-vacuum-pylon',
      name: 'Casimir Vacuum-Pressure Condenser Pylon',
      boundary: 'planck-0d-point-singularity',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Zero-Point Pressure Pylon',
      interactionVerb: 'Harvest Casimir Flux & Extract Vacuum Tool',
      loreSummary:
        'Parallel sub-nanometer plates harvesting negative Casimir vacuum energy to pressurize the local pocket continuum.',
      rewardCategory: 'tool',
      collisionRadius: 1.9,
      physicsAuraSummary: 'Generates Zero-Point Buoyant Lift (+4.2 m/s²)',
      baseGravityEffect: 0.85,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 4.2,
    },
  ],
  'flatland-2d-chromatic-ribbon': [
    {
      id: 'grounding-flatland-origami-cantilever',
      name: 'Euclidean Planar-Slice Counterweight Arch',
      boundary: 'flatland-2d-chromatic-ribbon',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Planar Gravity Anchor',
      interactionVerb: 'Fold Planar Metric & Claim Origami Relic',
      loreSummary:
        'Razor-thin folded titanium-glass planes that lock vertical gravity into a 2D sagittal cross-section.',
      rewardCategory: 'relic',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Flattens Lateral Shear & Locks 0.68G Planar Gravity',
      baseGravityEffect: 0.72,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 1.8,
    },
    {
      id: 'grounding-flatland-mobius-metronome',
      name: 'Möbius Ribbon Phase-Metronome Spire',
      boundary: 'flatland-2d-chromatic-ribbon',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Planar Temporal Regulator',
      interactionVerb: 'Invert Ribbon Twist & Draw Planar Blade',
      loreSummary:
        'A single-sided chromatic strip whose oscillating torsion wave accelerates local proper time along the plane.',
      rewardCategory: 'weapon',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Accelerates Local Temporal Flow (γ = 1.38× Fast-Phase)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.38,
      baseUpdraftBuoyancy: 0.0,
    },
    {
      id: 'grounding-flatland-lamina-bellows',
      name: 'Laminar Soap-Film Surface-Tension Pylon',
      boundary: 'flatland-2d-chromatic-ribbon',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Planar Surface-Tension Pylon',
      interactionVerb: 'Equalize Membrane Tension & Claim Slicer Tool',
      loreSummary:
        'Iridescent minimal-surface frames that regulate capillary pressure across the 2D membrane biosphere.',
      rewardCategory: 'tool',
      collisionRadius: 1.9,
      physicsAuraSummary: 'Reduces Aerodynamic Drag & Boosts Glide (+3.5 m/s²)',
      baseGravityEffect: 0.9,
      baseTimeDilationEffect: 1.1,
      baseUpdraftBuoyancy: 3.5,
    },
  ],
  'hadal-biodepth-abyss': [
    {
      id: 'grounding-hadal-bathyscaphe-bell',
      name: 'Bathyscaphe Ballast & Gravity Reliquary Bell',
      boundary: 'hadal-biodepth-abyss',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Abyssal Gravity & Ballast Anchor',
      interactionVerb: 'Equalize Ballast & Recover Trench Relic',
      loreSummary:
        'A riveted phosphor-bronze diving bell anchored to the seabed; its lead-graviton keel stabilizes abyssal buoyancy.',
      rewardCategory: 'relic',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Counteracts Abyssal Drift · 0.86G Pelagic Ballast',
      baseGravityEffect: 0.86,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 2.0,
    },
    {
      id: 'grounding-hadal-leviathan-rib-arch',
      name: 'Pelagic Sonar-Chronometer Rib Vault',
      boundary: 'hadal-biodepth-abyss',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Bathyal Temporal Regulator',
      interactionVerb: 'Attune Sonar Cadence & Claim Trench Armament',
      loreSummary:
        'Colossal calcified vertebrae wired with bronze bathymetric resonators that pace biological clocks in total darkness.',
      rewardCategory: 'weapon',
      collisionRadius: 2.5,
      physicsAuraSummary: 'Paces Bathyal Time Dilation (γ = 0.85× Deep-Trench Cadence)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 0.82,
      baseUpdraftBuoyancy: 0.5,
    },
    {
      id: 'grounding-hadal-luciferin-vent',
      name: 'Hydrothermal Luciferin Pressure Chimney',
      boundary: 'hadal-biodepth-abyss',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: '420 MPa Hydrothermal Pylon',
      interactionVerb: 'Vent Superheated Brine & Harvest Trench Tool',
      loreSummary:
        'Towering black-smoker mineral chimney encrusted with glowing cyan tube-worms that regulates 1,100 atm trench pressure.',
      rewardCategory: 'tool',
      collisionRadius: 1.95,
      physicsAuraSummary: 'Projects Hydrothermal Updraft Plume (+5.8 m/s²)',
      baseGravityEffect: 0.88,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 5.8,
    },
  ],
  'monolithic-brutalist-singularity': [
    {
      id: 'grounding-brutalist-pendulum-seismograph',
      name: 'Brutalist Foucault Pendulum Gravity Monolith',
      boundary: 'monolithic-brutalist-singularity',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Inertial Gravity Monument',
      interactionVerb: 'Lock Foucault Pendulum & Claim Keystone Relic',
      loreSummary:
        'Twin board-formed concrete pylons suspending a heavy brass Foucault pendulum that pins local 1.38G gravitational shear.',
      rewardCategory: 'relic',
      collisionRadius: 2.3,
      physicsAuraSummary: 'Enforces Heavy 1.38G Brutalist Inertial Lock',
      baseGravityEffect: 1.32,
      baseTimeDilationEffect: 0.9,
      baseUpdraftBuoyancy: -1.5,
    },
    {
      id: 'grounding-brutalist-scarpa-ziggurat',
      name: 'Scarpa Kerr-Horizon Time-Dilation Ziggurat',
      boundary: 'monolithic-brutalist-singularity',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Kerr Frame-Drag Regulator',
      interactionVerb: 'Sync Horizon Escapement & Draw Tensor Weapon',
      loreSummary:
        'Precision-notched obsidian and concrete ziggurat metering relativistic frame-dragging near the Kerr singularity.',
      rewardCategory: 'weapon',
      collisionRadius: 2.4,
      physicsAuraSummary: 'Compresses Proper Time via Kerr Gravity (γ = 0.58×)',
      baseGravityEffect: 1.15,
      baseTimeDilationEffect: 0.58,
      baseUpdraftBuoyancy: 0.0,
    },
    {
      id: 'grounding-brutalist-tensor-astrolabe',
      name: 'Cantilevered Sodium-Vapor Entropy Stack',
      boundary: 'monolithic-brutalist-singularity',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Megastructure Thermal Pylon',
      interactionVerb: 'Purge Shear Heat & Calibrate Core Tool',
      loreSummary:
        'Cyclopean concrete散热 radiator fins and brass barometric valves venting tidal friction heat into the void.',
      rewardCategory: 'tool',
      collisionRadius: 1.9,
      physicsAuraSummary: 'Vents Tidal Exhaust Updraft (+3.2 m/s²)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 3.2,
    },
  ],
  'cel-traced-chromatic-steppe': [
    {
      id: 'grounding-chromatic-sundial-obelisk',
      name: 'Refractive Vector-Glass Gyro-Anchor Obelisk',
      boundary: 'cel-traced-chromatic-steppe',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Spectral Gravity Anchor',
      interactionVerb: 'Align Prism Plumb & Claim Spectral Relic',
      loreSummary:
        'Tall vector-glass obelisk whose internal laser plumb-line locks horizon tilt and stabilizes low-friction steppe footing.',
      rewardCategory: 'relic',
      collisionRadius: 1.85,
      physicsAuraSummary: 'Stabilizes 0.88G Low-Friction Vector Traction',
      baseGravityEffect: 0.88,
      baseTimeDilationEffect: 1.05,
      baseUpdraftBuoyancy: 1.5,
    },
    {
      id: 'grounding-chromatic-wind-harp',
      name: 'Aeolian Cerenkov Phase-Frequency Harp',
      boundary: 'cel-traced-chromatic-steppe',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Photonic Temporal Regulator',
      interactionVerb: 'Harmonic-Tune Strings & Draw Spectral Blade',
      loreSummary:
        'Sweeping rhodium-and-glass parabolic ribs strung with optical fibers that beat at relativistic photon frequencies.',
      rewardCategory: 'weapon',
      collisionRadius: 2.2,
      physicsAuraSummary: 'Boosts Radiative Time Cadence (γ = 1.22×)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.25,
      baseUpdraftBuoyancy: 1.0,
    },
    {
      id: 'grounding-chromatic-vitrified-kiln',
      name: 'Solar-Lens Vitrification Thermal Crucible',
      boundary: 'cel-traced-chromatic-steppe',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Heliographic Pressure Pylon',
      interactionVerb: 'Vent Solar Convection & Extract Optical Lance',
      loreSummary:
        'A gimballed overhead Fresnel lens focusing steppe sunlight into a convective thermal column of molten dichroic quartz.',
      rewardCategory: 'tool',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Creates Solar Convection Thermal Lift (+4.8 m/s²)',
      baseGravityEffect: 0.9,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 4.8,
    },
  ],
  'mycelial-silicon-necropolis': [
    {
      id: 'grounding-mycelial-data-cathedral',
      name: 'Fossilized Silicon Root-Tension Monolith',
      boundary: 'mycelial-silicon-necropolis',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Biomechanical Gravity Anchor',
      interactionVerb: 'Anchor Hyphae Roots & Harvest Bio-Relic',
      loreSummary:
        'Ancient gold-traced silicon server monoliths bound to bedrock by high-tension ossified fungal root buttresses.',
      rewardCategory: 'relic',
      collisionRadius: 2.3,
      physicsAuraSummary: 'Grounds 0.96G Symbiotic Root-Tension Field',
      baseGravityEffect: 0.95,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 1.2,
    },
    {
      id: 'grounding-mycelial-amber-vat',
      name: 'Tachyon-Mycelium Retrocausal Synapse Vat',
      boundary: 'mycelial-silicon-necropolis',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Retrocausal Temporal Regulator',
      interactionVerb: 'Splice Tachyon Hyphae & Draw Bio-Weapon',
      loreSummary:
        'Translucent golden amber column suspended in a copper-hyphae cage that transmits neural signals backward across local time.',
      rewardCategory: 'weapon',
      collisionRadius: 1.95,
      physicsAuraSummary: 'Induces 0.92× Retrocausal Synaptic Phase Echo',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 0.88,
      baseUpdraftBuoyancy: 0.0,
    },
    {
      id: 'grounding-mycelial-spore-bellows',
      name: 'Respiring Bioluminescent Spore-Bellows Pylon',
      boundary: 'mycelial-silicon-necropolis',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Symbiotic Barometric Organ',
      interactionVerb: 'Synchronize Respiration & Claim Root-Auger Tool',
      loreSummary:
        'Rhythmically expanding chitinous bellows overgrown with emerald hyphae that exhale warm buoyant spore drafts.',
      rewardCategory: 'tool',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Exhales Rhythmic Spore-Thermal Buoyancy (+4.5 m/s²)',
      baseGravityEffect: 0.9,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 4.5,
    },
  ],
  'tesseractic-4d-reliquary': [
    {
      id: 'grounding-tesseractic-riemann-plinth',
      name: 'Riemannian 4D Metric-Lock Gravity Plinth',
      boundary: 'tesseractic-4d-reliquary',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: '4D Metric Gravity Anchor',
      interactionVerb: 'Lock W-Axis Geodesic & Claim Chronos Relic',
      loreSummary:
        'Precision quaternion brass instrument that pins local 3D elevation so explorers do not slide down the orthogonal W-slope.',
      rewardCategory: 'relic',
      collisionRadius: 1.95,
      physicsAuraSummary: 'Locks 0.78G 4D Hyper-Buoyant Elevation',
      baseGravityEffect: 0.76,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 2.8,
    },
    {
      id: 'grounding-tesseractic-chrono-sundial',
      name: 'Ouroboros Closed-Timelike Reliquary Vault',
      boundary: 'tesseractic-4d-reliquary',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Closed-Timelike Regulator',
      interactionVerb: 'Unseal Causality Ring & Draw 4D Phase Weapon',
      loreSummary:
        'Floating obsidian monolith split by a golden singularity ring that stabilizes closed timelike loops across W-space.',
      rewardCategory: 'weapon',
      collisionRadius: 2.2,
      physicsAuraSummary: 'Stabilizes 1.00× W-Phase Causal Equilibrium',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.05,
      baseUpdraftBuoyancy: 1.0,
    },
    {
      id: 'grounding-tesseractic-hyper-astrolabe',
      name: 'Folding 8-Cell Hyper-Convection Astrolabe',
      boundary: 'tesseractic-4d-reliquary',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: '4D Hyper-Pressure Pylon',
      interactionVerb: 'Phase-Vent 8-Cell Core & Claim Caliper Tool',
      loreSummary:
        'Nested gold-and-obsidian polyhedral frames that pump excess entropy into orthogonal 4D chambers.',
      rewardCategory: 'tool',
      collisionRadius: 2.4,
      physicsAuraSummary: 'Pumps 4D Orthogonal Updraft (+3.9 m/s²)',
      baseGravityEffect: 0.85,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 3.9,
    },
  ],
  'calabi-yau-6d-folded-garden': [
    {
      id: 'grounding-calabi-ricci-anchor',
      name: 'Ricci-Flat Holomorphic Gravity Rosette',
      boundary: 'calabi-yau-6d-folded-garden',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: '6D Holomorphic Gravity Anchor',
      interactionVerb: 'Balance Ricci Tensor & Claim Quintic Relic',
      loreSummary:
        'Six-fold symmetrical pearlescent manifold sculpture that cancels gravitational tidal forces via Ricci-flat curvature.',
      rewardCategory: 'relic',
      collisionRadius: 2.2,
      physicsAuraSummary: 'Establishes Low-G 0.64× Ricci-Flat Levitation',
      baseGravityEffect: 0.62,
      baseTimeDilationEffect: 1.1,
      baseUpdraftBuoyancy: 3.4,
    },
    {
      id: 'grounding-calabi-compact-chronometer',
      name: 'Compactified 6-Torus Winding Chronometer',
      boundary: 'calabi-yau-6d-folded-garden',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: '6D Winding-Mode Regulator',
      interactionVerb: 'Tune String Winding & Draw Holomorphic Weapon',
      loreSummary:
        'Interlocking rose-gold tori that count string winding numbers around curled sub-millimeter dimensions, accelerating time.',
      rewardCategory: 'weapon',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Accelerates Proper Time via 6D Winding (γ = 1.45×)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.45,
      baseUpdraftBuoyancy: 0.8,
    },
    {
      id: 'grounding-calabi-kahler-condenser',
      name: 'Kähler-Potential Harmonic Dew Pylon',
      boundary: 'calabi-yau-6d-folded-garden',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: '6D Kähler Pressure Pylon',
      interactionVerb: 'Condense Holomorphic Mist & Harvest Tool',
      loreSummary:
        'Petal-like dichroic condensers that breathe luminous Kähler vapor from compactified algebraic pockets.',
      rewardCategory: 'tool',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Emits Buoyant Kähler Petal Updraft (+4.4 m/s²)',
      baseGravityEffect: 0.8,
      baseTimeDilationEffect: 1.15,
      baseUpdraftBuoyancy: 4.4,
    },
  ],
  'penrose-twistor-lightcone': [
    {
      id: 'grounding-twistor-spinor-gyro',
      name: 'Null-Geodesic Spinor Inertial Gyroscope',
      boundary: 'penrose-twistor-lightcone',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Twistor Inertial Anchor',
      interactionVerb: 'Pin Null-Cone Frame & Claim Spinor Relic',
      loreSummary:
        'Twin counter-spiraling celestial light-ribbons that give rest-mass traction to explorers walking near the speed of light.',
      rewardCategory: 'relic',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Anchors 0.58G Relativistic Spinor Traction',
      baseGravityEffect: 0.58,
      baseTimeDilationEffect: 0.75,
      baseUpdraftBuoyancy: 2.6,
    },
    {
      id: 'grounding-twistor-lightcone-hourglass',
      name: 'Relativistic Light-Cone Lorentz Hourglass',
      boundary: 'penrose-twistor-lightcone',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Lorentz Dilation Regulator',
      interactionVerb: 'Invert Null-Cone & Draw Relativistic Lance',
      loreSummary:
        'Biconic Cherenkov glass hourglass where future and past light-cones touch at a glowing golden event-horizon waist.',
      rewardCategory: 'weapon',
      collisionRadius: 2.3,
      physicsAuraSummary: 'Deep Lorentz Time Dilation Field (γ = 0.42× Slow-World)',
      baseGravityEffect: 0.9,
      baseTimeDilationEffect: 0.42,
      baseUpdraftBuoyancy: 0.0,
    },
    {
      id: 'grounding-twistor-doppler-radiator',
      name: 'Synchrotron Blueshift Photon-Wind Pylon',
      boundary: 'penrose-twistor-lightcone',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Radiation-Pressure Pylon',
      interactionVerb: 'Harness Photon Sail & Claim Twistor Tool',
      loreSummary:
        'Focuses relativistic Doppler-blueshifted radiation pressure into a frictionless upward photon wind.',
      rewardCategory: 'tool',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Projects Relativistic Photon-Wind Lift (+5.2 m/s²)',
      baseGravityEffect: 0.75,
      baseTimeDilationEffect: 0.65,
      baseUpdraftBuoyancy: 5.2,
    },
  ],
  'banach-tarski-fractal-atoll': [
    {
      id: 'grounding-banach-menger-ballast',
      name: 'Menger-Sponge Non-Measurable Mass Monolith',
      boundary: 'banach-tarski-fractal-atoll',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Fractal Mass-Conservation Anchor',
      interactionVerb: 'Recombine Paradox Subsets & Claim Fractal Relic',
      loreSummary:
        'Infinitely perforated obsidian cube that maintains constant gravitational mass despite recursive volume duplication.',
      rewardCategory: 'relic',
      collisionRadius: 2.25,
      physicsAuraSummary: 'Locks Scale-Invariant 0.82G Fractal Gravity',
      baseGravityEffect: 0.82,
      baseTimeDilationEffect: 1.0,
      baseUpdraftBuoyancy: 1.9,
    },
    {
      id: 'grounding-banach-sierpinski-escapement',
      name: 'Sierpinski Recursive Octave Pendulum',
      boundary: 'banach-tarski-fractal-atoll',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Fractal Temporal Regulator',
      interactionVerb: 'Sync Sub-Octave Clocks & Draw Paradox Weapon',
      loreSummary:
        'A hierarchical tree of pendulums where each smaller child oscillates at twice the frequency of its parent.',
      rewardCategory: 'weapon',
      collisionRadius: 2.15,
      physicsAuraSummary: 'Multiplies Recursive Time Cadence (γ = 1.18×)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 1.22,
      baseUpdraftBuoyancy: 0.6,
    },
    {
      id: 'grounding-banach-cantor-venturi',
      name: 'Cantor-Dust Fractal Bifurcation Condenser',
      boundary: 'banach-tarski-fractal-atoll',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Fractal Alveolar Pressure Pylon',
      interactionVerb: 'Compress Fractal Airflow & Claim Tool',
      loreSummary:
        'Branching bronchial brass tubes that subdivide barometric pressure across infinite self-similar surface area.',
      rewardCategory: 'tool',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Generates Self-Similar Updraft Vortex (+4.1 m/s²)',
      baseGravityEffect: 0.88,
      baseTimeDilationEffect: 1.05,
      baseUpdraftBuoyancy: 4.1,
    },
  ],
  'ads-cft-holographic-bulk': [
    {
      id: 'grounding-adscft-rt-entanglement-anchor',
      name: 'Ryu-Takayanagi Entanglement Geodesic Anchor',
      boundary: 'ads-cft-holographic-bulk',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: 'Holographic Bulk Gravity Anchor',
      interactionVerb: 'Pin Entanglement Wedge & Claim Bulk Relic',
      loreSummary:
        'Synthesizes bulk gravitational attraction directly from quantum entanglement entropy on the sky boundary.',
      rewardCategory: 'relic',
      collisionRadius: 2.2,
      physicsAuraSummary: 'Sustains 0.72G Holographic Entanglement Gravity',
      baseGravityEffect: 0.72,
      baseTimeDilationEffect: 0.85,
      baseUpdraftBuoyancy: 2.4,
    },
    {
      id: 'grounding-adscft-conformal-clock',
      name: 'Conformal Boundary Redshift Synchronizer',
      boundary: 'ads-cft-holographic-bulk',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: 'Holographic Temporal Regulator',
      interactionVerb: 'Calibrate Bulk Redshift & Draw Hologram Weapon',
      loreSummary:
        'Translates ultraviolet boundary quantum oscillations into infrared bulk proper time via holographic renormalization.',
      rewardCategory: 'weapon',
      collisionRadius: 2.1,
      physicsAuraSummary: 'Regulates Bulk Redshift Time Dilation (γ = 0.72×)',
      baseGravityEffect: 1.0,
      baseTimeDilationEffect: 0.72,
      baseUpdraftBuoyancy: 0.5,
    },
    {
      id: 'grounding-adscft-hawking-page-pylon',
      name: 'Hawking-Page Thermal Phase-Transition Pylon',
      boundary: 'ads-cft-holographic-bulk',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: 'Holographic Thermal Pylon',
      interactionVerb: 'Stabilize Hawking Plasma & Claim Bulk Tool',
      loreSummary:
        'Balances the thermodynamic phase transition between thermal Anti-de Sitter gas and holographic black hole plasma.',
      rewardCategory: 'tool',
      collisionRadius: 2.0,
      physicsAuraSummary: 'Radiates Holographic Plasma Buoyancy (+4.6 m/s²)',
      baseGravityEffect: 0.82,
      baseTimeDilationEffect: 0.9,
      baseUpdraftBuoyancy: 4.6,
    },
  ],
  'm-theory-11d-brane-cathedral': [
    {
      id: 'grounding-mtheory-m2m5-brane-clamp',
      name: 'M2/M5 Supermembrane Tension Gravity Clamp',
      boundary: 'm-theory-11d-brane-cathedral',
      taxonomyClass: 'gravity-inertial-anchor',
      categoryLabel: '11D Supergravity Brane Anchor',
      interactionVerb: 'Harmonize Brane Tension & Claim Sovereign Relic',
      loreSummary:
        'Intersects a 2-dimensional M2 brane with a 5-dimensional M5 brane to weld 11D supergravity into a walkable floor.',
      rewardCategory: 'relic',
      collisionRadius: 2.5,
      physicsAuraSummary: 'Sustains 0.62G 11D Supermembrane Levitation',
      baseGravityEffect: 0.62,
      baseTimeDilationEffect: 1.25,
      baseUpdraftBuoyancy: 3.8,
    },
    {
      id: 'grounding-mtheory-e8-dual-time-crown',
      name: 'E8×E8 Heterotic Dual-Time Astrolabe Shrine',
      boundary: 'm-theory-11d-brane-cathedral',
      taxonomyClass: 'temporal-causal-regulator',
      categoryLabel: '11D/12D F-Theory Time Regulator',
      interactionVerb: 'Align Dual-Time Torus & Draw Sovereign Weapon',
      loreSummary:
        '248-faceted golden Lie-algebraic crown that couples two independent time axes into a hyper-accelerated causal stream.',
      rewardCategory: 'weapon',
      collisionRadius: 2.4,
      physicsAuraSummary: 'Elevates Dual-Time Harmonic Flow (γ = 1.65×)',
      baseGravityEffect: 0.9,
      baseTimeDilationEffect: 1.65,
      baseUpdraftBuoyancy: 1.5,
    },
    {
      id: 'grounding-mtheory-flux-compact-pylon',
      name: '4-Form C-Field Flux-Compactification Organ',
      boundary: 'm-theory-11d-brane-cathedral',
      taxonomyClass: 'thermodynamic-pressure-pylon',
      categoryLabel: '11D Flux-Pressure Cathedral Pylon',
      interactionVerb: 'Modulate 4-Form Flux & Claim Omniversal Tool',
      loreSummary:
        'Towering golden-violet cathedral organ pipes pulsing with quantized 4-form flux that prevents dimensional decompactification.',
      rewardCategory: 'tool',
      collisionRadius: 2.3,
      physicsAuraSummary: 'Projects 11D Harmonic Brane Updraft (+6.0 m/s²)',
      baseGravityEffect: 0.72,
      baseTimeDilationEffect: 1.35,
      baseUpdraftBuoyancy: 6.0,
    },
  ],
};

export interface GroundingWorldObjectInstance {
  id: string;
  spec: GroundingAnchorArchetypeSpec;
  group: THREE.Group;
  position: THREE.Vector3;
  attunedCount: number;
  cooldownSec: number;
  rewardItem: DimensionalItemDefinition;
  seedMorphVariantIndex: number;
  seedMorphTitle: string;
  localGravityTuning: number;
  localTimeGammaTuning: number;
  localBuoyancyTuning: number;
}

export interface FocusedGroundingObjectTelemetry {
  instanceId: string;
  name: string;
  taxonomyClass: GroundingTaxonomyClass;
  taxonomyClassTitle: string;
  seedMorphTitle: string;
  categoryLabel: string;
  originBoundaryName: string;
  interactionVerb: string;
  loreSummary: string;
  physicsAuraSummary: string;
  rewardItemName: string;
  rewardItemRarity: string;
  distanceMeters: number;
  cooldownSec: number;
  localGravityMultiplier: number;
  localTimeDilationGamma: number;
  localUpdraftBuoyancy: number;
  behaviorLayerMode: GroundingBehaviorLayerMode;
}

export interface LocalGroundingPhysicsFieldEvaluation {
  effectiveGravityMultiplier: number;
  effectiveTimeDilationGamma: number;
  effectiveUpdraftBuoyancy: number;
  activeAuraAnchorName: string | null;
  activeTaxonomyClass: GroundingTaxonomyClass | null;
  isInsideCustomVoidPocket: boolean;
  behaviorLayerMode: GroundingBehaviorLayerMode;
}

function seededUnitFloat(seed: number, salt: number): number {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Seed-Mutating Procedural 3D Grounding Monument Generator:
 * Completely changes the foundation architecture, primary kinetic mechanism,
 * structural silhouette, and material articulation between dimensional seeds
 * while visually expressing its physical Taxonomy Class:
 * - Class I: `gravity-inertial-anchor` (Gravity & Inertial Stability)
 * - Class II: `temporal-causal-regulator` (Temporal Flow & Causal Phase)
 * - Class III: `thermodynamic-pressure-pylon` (Thermodynamic & Atmospheric Pressure)
 */
function buildSeedMutatedGroundingObject3DMesh(
  spec: GroundingAnchorArchetypeSpec,
  boundarySpec: DifferentialUniverseBoundarySpec,
  worldSeed: number,
  instanceIndex: number,
  creativeSeedOffset: number = 0
): { group: THREE.Group; morphVariantIndex: number; morphTitle: string } {
  const group = new THREE.Group();
  group.name = `${spec.id}-seed-${worldSeed}-${instanceIndex}`;

  const combinedSeed =
    Math.abs(Math.floor(worldSeed)) * 131 +
    instanceIndex * 37 +
    creativeSeedOffset * 509 +
    spec.boundary.length * 19;

  const r1 = seededUnitFloat(combinedSeed, 1);
  const r2 = seededUnitFloat(combinedSeed, 2);
  const r3 = seededUnitFloat(combinedSeed, 3);
  const r4 = seededUnitFloat(combinedSeed, 4);

  // Hue-shift accent slightly per seed so each world seed has its own unmistakable harmonic patina
  const primaryCol = new THREE.Color(boundarySpec.primaryAccentHex);
  primaryCol.offsetHSL((r1 - 0.5) * 0.14, 0.05, (r2 - 0.5) * 0.08);

  const secondaryCol = new THREE.Color(boundarySpec.secondaryAccentHex);
  secondaryCol.offsetHSL((r2 - 0.5) * 0.14, 0.05, 0);

  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0f172a').lerp(primaryCol, 0.15),
    metalness: THREE.MathUtils.clamp(boundarySpec.terrainMetalness + 0.18, 0.35, 0.94),
    roughness: THREE.MathUtils.clamp(boundarySpec.terrainRoughness * 0.75, 0.14, 0.55),
    clearcoat: 0.65,
  });

  const brassAlloyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d97706').lerp(secondaryCol, 0.38),
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 0.85,
  });

  const glowMat = new THREE.MeshPhysicalMaterial({
    color: primaryCol,
    emissive: primaryCol,
    emissiveIntensity: 1.2,
    roughness: 0.14,
    metalness: 0.25,
    transmission: 0.48,
    transparent: true,
    opacity: 0.93,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: secondaryCol,
    emissive: secondaryCol,
    emissiveIntensity: 0.28,
    metalness: 0.62,
    roughness: 0.32,
  });

  // 1. Ground-Snapped Contact Shadow Disc & Physics Aura Field Perimeter Ring
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(spec.collisionRadius * 1.28, 28),
    new THREE.MeshBasicMaterial({
      color: '#020617',
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  group.add(shadowDisc);

  const auraBadgeHex = TAXONOMY_CLASS_LABELS[spec.taxonomyClass].badgeColor;
  const auraPerimeterRing = new THREE.Mesh(
    new THREE.RingGeometry(
      spec.collisionRadius * 1.45,
      spec.collisionRadius * 1.56,
      36
    ),
    new THREE.MeshBasicMaterial({
      color: auraBadgeHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    })
  );
  auraPerimeterRing.rotation.x = -Math.PI / 2;
  auraPerimeterRing.position.y = 0.04;
  auraPerimeterRing.userData.isGroundingAuraRing = true;
  group.add(auraPerimeterRing);

  // 2. Seed-Driven Foundation Plinth Architecture (4 completely different plinth styles per seed!)
  const plinthStyle = combinedSeed % 4;
  const baseRadius = spec.collisionRadius * (0.76 + r3 * 0.22);

  if (plinthStyle === 0) {
    // Stepped Scarpa Ziggurat Plinth
    for (let step = 0; step < 3; step++) {
      const w = baseRadius * (1.55 - step * 0.28);
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.22, w),
        step % 2 === 0 ? obsidianMat : brassAlloyMat
      );
      slab.position.y = 0.11 + step * 0.22;
      slab.rotation.y = step * (0.18 + r1 * 0.25);
      slab.castShadow = true;
      slab.receiveShadow = true;
      group.add(slab);
    }
  } else if (plinthStyle === 1) {
    // Tripod Cantilever Buttress Legs
    for (let leg = 0; leg < 3 + (combinedSeed % 3); leg++) {
      const count = 3 + (combinedSeed % 3);
      const a = (leg / count) * Math.PI * 2;
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.24, 1.05, 8),
        obsidianMat
      );
      strut.position.set(
        Math.cos(a) * baseRadius * 0.72,
        0.48,
        Math.sin(a) * baseRadius * 0.72
      );
      strut.rotation.z = Math.cos(a) * 0.35;
      strut.rotation.x = -Math.sin(a) * 0.35;
      strut.castShadow = true;
      group.add(strut);
    }
    const capRing = new THREE.Mesh(
      new THREE.TorusGeometry(baseRadius * 0.65, 0.08, 10, 24),
      brassAlloyMat
    );
    capRing.rotation.x = Math.PI / 2;
    capRing.position.y = 0.78;
    group.add(capRing);
  } else if (plinthStyle === 2) {
    // Lathe Hyperbolic Pedestal Column
    const lathePts: THREE.Vector2[] = [
      new THREE.Vector2(baseRadius * 1.05, 0.0),
      new THREE.Vector2(baseRadius * 0.52, 0.38),
      new THREE.Vector2(baseRadius * 0.84, 0.72),
      new THREE.Vector2(0.0, 0.76),
    ];
    const ped = new THREE.Mesh(
      new THREE.LatheGeometry(lathePts, 6 + (combinedSeed % 7) * 2),
      obsidianMat
    );
    ped.castShadow = true;
    group.add(ped);
  } else {
    // Hexagonal / Octagonal Fluted Altar Drum
    const sides = 5 + (combinedSeed % 5);
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(baseRadius * 0.82, baseRadius * 1.0, 0.64, sides),
      obsidianMat
    );
    drum.position.y = 0.32;
    drum.castShadow = true;
    group.add(drum);

    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(baseRadius * 0.86, 0.05, 8, sides * 3),
      brassAlloyMat
    );
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.64;
    group.add(trim);
  }

  // 3. Primary Physical Taxonomy Structure — Mutates Completely Across Seeds!
  const morphVariantIndex = Math.floor((combinedSeed / 4) % 4);
  let morphTitle = '';
  const heightScale = 0.88 + r4 * 0.34;

  if (spec.taxonomyClass === 'gravity-inertial-anchor') {
    // =========================================================================
    // CLASS I: GRAVITY & INERTIAL STABILITY ANCHORS (4 Seed-Mutated Geometries)
    // =========================================================================
    if (morphVariantIndex === 0) {
      morphTitle = 'Twin-Pylon Foucault Graviton Seismograph';
      const pylonSpan = 0.95 + r1 * 0.35;
      const pylonH = 4.2 * heightScale;
      for (const side of [-1, 1]) {
        const pylon = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, pylonH, 0.92),
          obsidianMat
        );
        pylon.position.set(side * pylonSpan, 0.6 + pylonH * 0.5, 0);
        pylon.rotation.z = side * -0.05;
        pylon.castShadow = true;
        group.add(pylon);
      }
      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(pylonSpan * 2.6, 0.52, 1.18),
        brassAlloyMat
      );
      lintel.position.set(0, 0.6 + pylonH, 0);
      group.add(lintel);

      const pendulumPivot = new THREE.Group();
      pendulumPivot.position.set(0, 0.5 + pylonH, 0);
      pendulumPivot.userData.isGroundingPendulum = true;

      const rodLen = pylonH * 0.68;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, rodLen, 8),
        brassAlloyMat
      );
      rod.position.y = -rodLen * 0.5;
      pendulumPivot.add(rod);

      const bob = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46, 1),
        glowMat
      );
      bob.position.y = -rodLen;
      pendulumPivot.add(bob);

      const eqRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.66, 0.045, 8, 24),
        obsidianMat
      );
      eqRing.position.y = -rodLen;
      pendulumPivot.add(eqRing);
      group.add(pendulumPivot);
    } else if (morphVariantIndex === 1) {
      morphTitle = 'Inverted Tensegrity Floating Mass-Obelisk';
      // Lower pyramid pointing UP + Upper suspended pyramid pointing DOWN held by taut glowing cables
      const lowerPyr = new THREE.Mesh(
        new THREE.ConeGeometry(0.85, 1.85 * heightScale, 4 + (combinedSeed % 3)),
        obsidianMat
      );
      lowerPyr.position.y = 0.65 + 0.9 * heightScale;
      lowerPyr.castShadow = true;
      group.add(lowerPyr);

      const floatingCluster = new THREE.Group();
      floatingCluster.position.y = 3.25 * heightScale;
      floatingCluster.userData.isGroundingFloatMass = true;

      const upperPyr = new THREE.Mesh(
        new THREE.ConeGeometry(0.95, 2.2 * heightScale, 4 + (combinedSeed % 3)),
        secondaryMat
      );
      upperPyr.rotation.x = Math.PI;
      upperPyr.castShadow = true;
      floatingCluster.add(upperPyr);

      const coreSingularity = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 1),
        glowMat
      );
      coreSingularity.position.y = -1.25 * heightScale;
      floatingCluster.add(coreSingularity);
      group.add(floatingCluster);

      // 4 Tensegrity Cable Struts
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2;
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.022, 3.1 * heightScale, 6),
          brassAlloyMat
        );
        cable.position.set(
          Math.cos(ca) * 0.78,
          2.2 * heightScale,
          Math.sin(ca) * 0.78
        );
        cable.rotation.z = Math.sin(ca) * 0.14;
        group.add(cable);
      }
    } else if (morphVariantIndex === 2) {
      morphTitle = '3-Axis Gimballed Graviton Singularity Gyroscope';
      const cradleArch = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.11, 10, 28, Math.PI),
        obsidianMat
      );
      cradleArch.position.y = 0.68;
      group.add(cradleArch);

      const centerY = 2.45 * heightScale;
      for (let g = 0; g < 3; g++) {
        const gimbal = new THREE.Mesh(
          new THREE.TorusGeometry(1.32 - g * 0.26, 0.055, 10, 32),
          g % 2 === 0 ? brassAlloyMat : secondaryMat
        );
        gimbal.position.y = centerY;
        gimbal.rotation.set(g * 0.7, g * 1.1, g * 0.4);
        gimbal.userData.isGroundingRotor = true;
        gimbal.userData.rotorAxis = g === 0 ? 'x' : g === 1 ? 'y' : 'z';
        group.add(gimbal);
      }

      const heavyCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.54, 20, 16),
        glowMat
      );
      heavyCore.position.y = centerY;
      heavyCore.userData.isGroundingFloatMass = true;
      group.add(heavyCore);
    } else {
      morphTitle = 'Centrifugal Toroidal Ballast Flywheel Rig';
      const centralSpine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.36, 4.1 * heightScale, 12),
        obsidianMat
      );
      centralSpine.position.y = 0.6 + 2.05 * heightScale;
      centralSpine.castShadow = true;
      group.add(centralSpine);

      for (let tier = 0; tier < 2; tier++) {
        const flywheelGroup = new THREE.Group();
        flywheelGroup.position.y = (1.65 + tier * 1.45) * heightScale;
        flywheelGroup.userData.isGroundingRotor = true;
        flywheelGroup.userData.rotorAxis = 'y';
        flywheelGroup.userData.rotorDir = tier === 0 ? 1 : -1.4;

        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(1.25 - tier * 0.22, 0.14, 12, 28),
          tier === 0 ? secondaryMat : glowMat
        );
        torus.rotation.x = Math.PI / 2;
        flywheelGroup.add(torus);

        for (let sp = 0; sp < 4; sp++) {
          const sa = (sp / 4) * Math.PI * 2;
          const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(1.15 - tier * 0.2, 0.08, 0.12),
            brassAlloyMat
          );
          spoke.rotation.y = sa;
          flywheelGroup.add(spoke);
        }
        group.add(flywheelGroup);
      }
    }
  } else if (spec.taxonomyClass === 'temporal-causal-regulator') {
    // =========================================================================
    // CLASS II: TEMPORAL FLOW & CAUSAL PHASE REGULATORS (4 Seed-Mutated Geometries)
    // =========================================================================
    if (morphVariantIndex === 0) {
      morphTitle = 'Relativistic Biconic Light-Cone Hourglass';
      const waistY = 2.45 * heightScale;
      const coneH = 1.65 * heightScale;
      const coneR = 1.1 + r1 * 0.25;

      const lowerCone = new THREE.Mesh(
        new THREE.ConeGeometry(coneR, coneH, 16, 1, true),
        glowMat
      );
      lowerCone.position.y = waistY - coneH * 0.5;
      group.add(lowerCone);

      const upperCone = new THREE.Mesh(
        new THREE.ConeGeometry(coneR, coneH, 16, 1, true),
        glowMat
      );
      upperCone.rotation.x = Math.PI;
      upperCone.position.y = waistY + coneH * 0.5;
      group.add(upperCone);

      const eventHorizonPinch = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.06, 12, 28),
        brassAlloyMat
      );
      eventHorizonPinch.rotation.x = Math.PI / 2;
      eventHorizonPinch.position.y = waistY;
      eventHorizonPinch.userData.isGroundingRotor = true;
      group.add(eventHorizonPinch);

      // 3 Stanchion Pillars framing the hourglass
      for (let p = 0; p < 3; p++) {
        const pa = (p / 3) * Math.PI * 2;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, coneH * 2.1, 8),
          obsidianMat
        );
        pillar.position.set(
          Math.cos(pa) * (coneR + 0.12),
          waistY,
          Math.sin(pa) * (coneR + 0.12)
        );
        group.add(pillar);
      }
    } else if (morphVariantIndex === 1) {
      morphTitle = 'Ouroboros Escapement Torsion Chronometer';
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 3.8 * heightScale, 0.42),
        obsidianMat
      );
      tower.position.y = 0.6 + 1.9 * heightScale;
      tower.castShadow = true;
      group.add(tower);

      // Giant Exposed Clockwork Escapement Gears
      for (let g = 0; g < 3; g++) {
        const gear = new THREE.Mesh(
          new THREE.TorusGeometry(0.88 - g * 0.18, 0.065, 8, 12 + g * 4),
          g === 1 ? glowMat : brassAlloyMat
        );
        gear.position.set(0, (1.5 + g * 0.95) * heightScale, 0.28 * (g % 2 === 0 ? 1 : -1));
        gear.userData.isGroundingRotor = true;
        gear.userData.rotorAxis = 'z';
        gear.userData.rotorDir = g % 2 === 0 ? 1.2 : -1.5;
        group.add(gear);
      }
    } else if (morphVariantIndex === 2) {
      morphTitle = 'Folding 8-Cell Hyper-Astrolabe Tesseract';
      const centerY = 2.65 * heightScale;
      const outerCube = new THREE.Mesh(
        new THREE.BoxGeometry(2.05, 2.05, 2.05),
        new THREE.MeshStandardMaterial({
          color: boundarySpec.primaryAccentHex,
          metalness: 0.9,
          roughness: 0.15,
          wireframe: true,
        })
      );
      outerCube.position.y = centerY;
      outerCube.userData.isGroundingRotor = true;
      outerCube.userData.rotorAxis = 'y';
      group.add(outerCube);

      const innerOct = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.82, 0),
        glowMat
      );
      innerOct.position.y = centerY;
      innerOct.userData.isGroundingRotor = true;
      innerOct.userData.rotorAxis = 'x';
      group.add(innerOct);

      for (let r = 0; r < 3; r++) {
        const armillary = new THREE.Mesh(
          new THREE.TorusGeometry(1.42 - r * 0.22, 0.045, 10, 32),
          brassAlloyMat
        );
        armillary.position.y = centerY;
        armillary.rotation.set(r * 0.85, r * 1.1, 0);
        armillary.userData.isGroundingRotor = true;
        group.add(armillary);
      }
    } else {
      morphTitle = 'Tachyon Tri-Prong Phase Tuning-Fork Array';
      const forkCount = 3 + (combinedSeed % 2);
      for (let f = 0; f < forkCount; f++) {
        const fa = (f / forkCount) * Math.PI * 2;
        const tine = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 3.6 * heightScale, 0.28),
          f % 2 === 0 ? brassAlloyMat : secondaryMat
        );
        tine.position.set(
          Math.cos(fa) * 0.68,
          0.7 + 1.8 * heightScale,
          Math.sin(fa) * 0.68
        );
        tine.rotation.y = -fa;
        tine.castShadow = true;
        group.add(tine);
      }
      // Oscillating Phase Wave Rings along the tuning forks
      for (let w = 0; w < 3; w++) {
        const waveRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.95 + w * 0.15, 0.04, 10, 28),
          glowMat
        );
        waveRing.rotation.x = Math.PI / 2;
        waveRing.position.y = (1.4 + w * 0.95) * heightScale;
        waveRing.userData.isGroundingBellows = true;
        group.add(waveRing);
      }
    }
  } else {
    // =========================================================================
    // CLASS III: THERMODYNAMIC & ATMOSPHERIC PRESSURE PYLONS (4 Seed-Mutated Geometries)
    // =========================================================================
    if (morphVariantIndex === 0) {
      morphTitle = 'Pressurized Bathyscaphe Bell & Luciferin Vent';
      const bellDomePoints: THREE.Vector2[] = [
        new THREE.Vector2(1.08, 0.55),
        new THREE.Vector2(1.18, 1.45 * heightScale),
        new THREE.Vector2(0.98, 2.6 * heightScale),
        new THREE.Vector2(0.58, 3.35 * heightScale),
        new THREE.Vector2(0.0, 3.65 * heightScale),
      ];
      const bellMesh = new THREE.Mesh(
        new THREE.LatheGeometry(bellDomePoints, 16),
        secondaryMat
      );
      bellMesh.castShadow = true;
      group.add(bellMesh);

      for (let w = 0; w < 4; w++) {
        const a = (w / 4) * Math.PI * 2;
        const porthole = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.055, 10, 20),
          brassAlloyMat
        );
        porthole.position.set(
          Math.cos(a) * 1.1,
          1.85 * heightScale,
          Math.sin(a) * 1.1
        );
        porthole.rotation.y = -a + Math.PI / 2;
        group.add(porthole);

        const glass = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 12, 12),
          glowMat
        );
        glass.position.set(
          Math.cos(a) * 1.05,
          1.85 * heightScale,
          Math.sin(a) * 1.05
        );
        group.add(glass);
      }
    } else if (morphVariantIndex === 1) {
      morphTitle = 'Peristaltic Spore-Bellows & Hyphae Condenser';
      const stele = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.52, 4.0 * heightScale, 10),
        obsidianMat
      );
      stele.position.y = 0.6 + 2.0 * heightScale;
      stele.castShadow = true;
      group.add(stele);

      const bellowsGroup = new THREE.Group();
      bellowsGroup.position.y = 2.2 * heightScale;
      bellowsGroup.userData.isGroundingBellows = true;
      const sacCount = 4 + (combinedSeed % 3);
      for (let b = 0; b < sacCount; b++) {
        const ang = (b / sacCount) * Math.PI * 2;
        const sac = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 14, 12),
          glowMat
        );
        sac.scale.set(1.15, 0.72, 1.15);
        sac.position.set(
          Math.cos(ang) * 0.76,
          (b % 3) * 0.48 - 0.45,
          Math.sin(ang) * 0.76
        );
        bellowsGroup.add(sac);
      }
      group.add(bellowsGroup);

      const canopyCap = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 0.75, 14),
        secondaryMat
      );
      canopyCap.position.y = 4.65 * heightScale;
      group.add(canopyCap);
    } else if (morphVariantIndex === 2) {
      morphTitle = 'Heliographic Solar-Sail Radiator & Wind-Harp';
      const coreSpire = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 4.5 * heightScale, 6),
        glowMat
      );
      coreSpire.position.y = 0.6 + 2.25 * heightScale;
      coreSpire.userData.isGroundingRotor = true;
      group.add(coreSpire);

      const finCount = 4 + (combinedSeed % 4);
      for (let h = 0; h < finCount; h++) {
        const harpArc = new THREE.Mesh(
          new THREE.TorusGeometry(1.42, 0.05, 8, 24, Math.PI * 0.8),
          brassAlloyMat
        );
        harpArc.rotation.z = Math.PI * 0.12;
        harpArc.rotation.y = (h / finCount) * Math.PI * 2;
        harpArc.position.y = 2.0 * heightScale;
        group.add(harpArc);
      }
    } else {
      morphTitle = 'Supercritical Stirling Piston & Venturi Tower';
      // Glass containment cylinder + reciprocating piston + 3 copper exhaust coils
      const glassTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 3.6 * heightScale, 16, 1, true),
        glowMat
      );
      glassTube.position.y = 0.65 + 1.8 * heightScale;
      group.add(glassTube);

      const pistonHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.66, 0.45, 16),
        brassAlloyMat
      );
      pistonHead.position.y = 2.3 * heightScale;
      pistonHead.userData.isGroundingFloatMass = true;
      group.add(pistonHead);

      for (let c = 0; c < 3; c++) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(0.96, 0.06, 8, 24),
          obsidianMat
        );
        coil.rotation.x = Math.PI / 2;
        coil.position.y = (1.2 + c * 1.1) * heightScale;
        group.add(coil);
      }
    }
  }

  return { group, morphVariantIndex, morphTitle };
}

function theforkCount(n: number): number {
  return n;
}

export class DimensionalGroundingWorldRig {
  public rootGroup = new THREE.Group();
  public customVoidPortalGroup = new THREE.Group();
  public instances: GroundingWorldObjectInstance[] = [];
  private activeBoundary: DifferentialUniverseBoundaryId =
    'hadal-biodepth-abyss';
  private lastWorldSeed: number = 408291;

  public customVoidState: CustomVoidPortalTuningState = {
    isOpen: false,
    isPlayerInsideCustomVoid: false,
    portalWorldPos: [0, 0, 0],
    customVoidSeed: 77742,
    tunedGravityMultiplier: 1.0,
    tunedTimeDilationGamma: 1.0,
    tunedPressureBuoyancy: 1.0,
    creativeSilhouetteSeedOffset: 0,
    behaviorLayerMode: 'base-survival-auras',
  };

  constructor() {
    this.rootGroup.name = 'dimensional-grounding-world-rig';
    this.customVoidPortalGroup.name = 'player-custom-void-ball-portal-rig';
    this.customVoidPortalGroup.visible = false;
    this.buildCustomVoidPortal3DMesh();
  }

  private buildCustomVoidPortal3DMesh(): void {
    while (this.customVoidPortalGroup.children.length > 0) {
      this.customVoidPortalGroup.remove(this.customVoidPortalGroup.children[0]);
    }

    // Outer 4D Singing Obsidian-Gold Stargate Ring for Player-Cast Custom Void Portals
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.14, 14, 48),
      new THREE.MeshPhysicalMaterial({
        color: '#0f172a',
        emissive: '#a855f7',
        emissiveIntensity: 0.9,
        metalness: 0.92,
        roughness: 0.15,
        clearcoat: 1.0,
      })
    );
    outerRing.position.y = 2.25;
    outerRing.userData.isCustomPortalRing = true;
    this.customVoidPortalGroup.add(outerRing);

    const innerHarmonicRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.06, 12, 40),
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
      })
    );
    innerHarmonicRing.position.y = 2.25;
    innerHarmonicRing.userData.isCustomPortalInner = true;
    this.customVoidPortalGroup.add(innerHarmonicRing);

    const eventHorizonDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.82, 40),
      new THREE.MeshBasicMaterial({
        color: '#1e1b4b',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.76,
      })
    );
    eventHorizonDisc.position.y = 2.25;
    this.customVoidPortalGroup.add(eventHorizonDisc);

    // Ground Physics Tuning Pedestal Pad beneath the Custom Void Portal
    const groundPad = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.6, 36),
      new THREE.MeshBasicMaterial({
        color: '#f59e0b',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      })
    );
    groundPad.rotation.x = -Math.PI / 2;
    groundPad.position.y = 0.05;
    this.customVoidPortalGroup.add(groundPad);
  }

  public castOrMoveCustomVoidPortal(
    playerPos: THREE.Vector3,
    playerYaw: number,
    evalHeight: (x: number, z: number) => number,
    newCustomSeed?: number
  ): CustomVoidPortalTuningState {
    const forwardDist = 5.2;
    const px = Number((playerPos.x - Math.sin(playerYaw) * forwardDist).toFixed(2));
    const pz = Number((playerPos.z - Math.cos(playerYaw) * forwardDist).toFixed(2));
    const py = evalHeight(px, pz);

    this.customVoidState.isOpen = true;
    this.customVoidState.portalWorldPos = [px, py, pz];
    this.customVoidState.behaviorLayerMode = 'custom-void-portal-tuning';
    if (newCustomSeed !== undefined) {
      this.customVoidState.customVoidSeed = newCustomSeed;
    } else {
      this.customVoidState.customVoidSeed =
        (this.customVoidState.customVoidSeed * 1664525 + 1013904223) % 999999;
    }

    this.customVoidPortalGroup.position.set(px, py, pz);
    this.customVoidPortalGroup.rotation.y = playerYaw;
    this.customVoidPortalGroup.visible = true;

    // Ensure customVoidPortalGroup is attached to rootGroup so it renders in the world
    if (this.customVoidPortalGroup.parent !== this.rootGroup) {
      this.rootGroup.add(this.customVoidPortalGroup);
    }

    // Mutate Grounding Objects to reflect the custom Void seed!
    this.rebuildForBoundary(
      this.activeBoundary,
      this.lastWorldSeed + this.customVoidState.customVoidSeed,
      evalHeight
    );

    return { ...this.customVoidState };
  }

  public setBehaviorLayerMode(
    mode: GroundingBehaviorLayerMode,
    evalHeight: (x: number, z: number) => number
  ): CustomVoidPortalTuningState {
    this.customVoidState.behaviorLayerMode = mode;
    if (mode === 'creative-silhouette-mutation') {
      this.customVoidState.creativeSilhouetteSeedOffset += 1;
      this.rebuildForBoundary(this.activeBoundary, this.lastWorldSeed, evalHeight);
    }
    return { ...this.customVoidState };
  }

  public cycleCreativeSilhouetteSeed(
    evalHeight: (x: number, z: number) => number
  ): CustomVoidPortalTuningState {
    this.customVoidState.creativeSilhouetteSeedOffset += 1;
    this.rebuildForBoundary(this.activeBoundary, this.lastWorldSeed, evalHeight);
    return { ...this.customVoidState };
  }

  public updateCustomVoidPhysicsTuning(
    partial: Partial<
      Pick<
        CustomVoidPortalTuningState,
        | 'tunedGravityMultiplier'
        | 'tunedTimeDilationGamma'
        | 'tunedPressureBuoyancy'
      >
    >
  ): CustomVoidPortalTuningState {
    Object.assign(this.customVoidState, partial);
    return { ...this.customVoidState };
  }

  public rebuildForBoundary(
    boundaryId: DifferentialUniverseBoundaryId,
    worldSeed: number,
    evalHeight: (x: number, z: number) => number
  ): void {
    this.activeBoundary = boundaryId;
    this.lastWorldSeed = worldSeed;

    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    if (this.customVoidState.isOpen) {
      this.rootGroup.add(this.customVoidPortalGroup);
    }
    this.instances = [];

    const boundarySpec =
      DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] ??
      DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];
    const archetypes =
      DIMENSIONAL_GROUNDING_ARCHETYPES[boundaryId] ??
      DIMENSIONAL_GROUNDING_ARCHETYPES['hadal-biodepth-abyss'];

    const matchingCompendiumItems = BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (item) => item.originBoundary === boundaryId
    );

    // Spawn 12 well-spaced Signature Dimensional Grounding Objects around the playable terrain
    // (4 Gravity & Inertial Anchors, 4 Temporal Flow Regulators, 4 Thermodynamic Pressure Pylons)
    const count = 12;
    for (let i = 0; i < count; i++) {
      const arch = archetypes[i % archetypes.length];
      const seedJitter = seededUnitFloat(worldSeed + i * 19, 7) * 0.28;
      const angle = (i / count) * Math.PI * 2 + ((worldSeed % 97) * 0.04) + seedJitter;
      const radius = 16 + (i % 3) * 14 + seededUnitFloat(worldSeed, i) * 3.5;
      const gx = Number((Math.cos(angle) * radius).toFixed(2));
      const gz = Number((Math.sin(angle) * radius).toFixed(2));
      const gy = evalHeight(gx, gz);

      const { group: meshGroup, morphVariantIndex, morphTitle } =
        buildSeedMutatedGroundingObject3DMesh(
          arch,
          boundarySpec,
          worldSeed,
          i,
          this.customVoidState.creativeSilhouetteSeedOffset
        );
      meshGroup.position.set(gx, gy, gz);
      meshGroup.rotation.y = -angle + Math.PI * 0.5;

      const rewardPool = matchingCompendiumItems.filter(
        (it) => it.category === arch.rewardCategory
      );
      const rewardItem =
        rewardPool[(i + Math.abs(worldSeed)) % Math.max(1, rewardPool.length)] ??
        matchingCompendiumItems[i % Math.max(1, matchingCompendiumItems.length)] ??
        BETHESDA_SCALE_COMPENDIUM_CATALOG[0];

      this.rootGroup.add(meshGroup);
      this.instances.push({
        id: `${arch.id}-${i}`,
        spec: arch,
        group: meshGroup,
        position: new THREE.Vector3(gx, gy, gz),
        attunedCount: 0,
        cooldownSec: 0,
        rewardItem,
        seedMorphVariantIndex: morphVariantIndex,
        seedMorphTitle: morphTitle,
        localGravityTuning: arch.baseGravityEffect,
        localTimeGammaTuning: arch.baseTimeDilationEffect,
        localBuoyancyTuning: arch.baseUpdraftBuoyancy,
      });
    }
  }

  /**
   * Evaluates the real-time Grounding Object physics field at the player's position:
   * - Layer 1 (`base-survival-auras`): Blends the boundary's base physics with nearby Grounding Object auras.
   * - Layer 2 (`creative-silhouette-mutation`): Pure visual silhouette mutation without perturbing 1.0G / 1.0x time unless desired.
   * - Layer 3 (`custom-void-portal-tuning`): Applies the player's interactive Custom Void Ball Portal physics sliders & anchor tuning.
   */
  public evaluateLocalPhysicsField(
    playerPos: THREE.Vector3
  ): LocalGroundingPhysicsFieldEvaluation {
    const bSpec =
      DIFFERENTIAL_UNIVERSE_BOUNDARIES[this.activeBoundary] ??
      DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];
    const mode = this.customVoidState.behaviorLayerMode;

    const isInsideCustomVoid =
      this.customVoidState.isOpen &&
      Math.hypot(
        playerPos.x - this.customVoidState.portalWorldPos[0],
        playerPos.z - this.customVoidState.portalWorldPos[2]
      ) <= 18.0;
    this.customVoidState.isPlayerInsideCustomVoid = isInsideCustomVoid;

    if (mode === 'creative-silhouette-mutation' && !isInsideCustomVoid) {
      return {
        effectiveGravityMultiplier: bSpec.gravityScale,
        effectiveTimeDilationGamma: bSpec.timeDilationGamma,
        effectiveUpdraftBuoyancy: 0,
        activeAuraAnchorName: null,
        activeTaxonomyClass: null,
        isInsideCustomVoidPocket: false,
        behaviorLayerMode: mode,
      };
    }

    let gravMult = bSpec.gravityScale;
    let timeGamma = bSpec.timeDilationGamma;
    let updraft = 0;
    let activeAuraAnchorName: string | null = null;
    let activeTaxonomyClass: GroundingTaxonomyClass | null = null;
    let closestDist = Infinity;

    for (let i = 0; i < this.instances.length; i++) {
      const inst = this.instances[i];
      const dist = Math.hypot(
        inst.position.x - playerPos.x,
        inst.position.z - playerPos.z
      );
      const auraRadius = inst.spec.collisionRadius * 5.2;
      if (dist < auraRadius) {
        const weight = Math.pow(1.0 - dist / auraRadius, 1.5);
        gravMult = THREE.MathUtils.lerp(
          gravMult,
          inst.localGravityTuning,
          weight * 0.75
        );
        timeGamma = THREE.MathUtils.lerp(
          timeGamma,
          inst.localTimeGammaTuning,
          weight * 0.8
        );
        updraft += inst.localBuoyancyTuning * weight;

        if (dist < closestDist) {
          closestDist = dist;
          activeAuraAnchorName = inst.spec.name;
          activeTaxonomyClass = inst.spec.taxonomyClass;
        }
      }
    }

    if (mode === 'custom-void-portal-tuning' || isInsideCustomVoid) {
      gravMult *= this.customVoidState.tunedGravityMultiplier;
      timeGamma *= this.customVoidState.tunedTimeDilationGamma;
      updraft += (this.customVoidState.tunedPressureBuoyancy - 1.0) * 5.5;
    }

    return {
      effectiveGravityMultiplier: Number(
        THREE.MathUtils.clamp(gravMult, 0.15, 3.0).toFixed(2)
      ),
      effectiveTimeDilationGamma: Number(
        THREE.MathUtils.clamp(timeGamma, 0.2, 2.5).toFixed(2)
      ),
      effectiveUpdraftBuoyancy: Number(
        THREE.MathUtils.clamp(updraft, -6.0, 12.0).toFixed(2)
      ),
      activeAuraAnchorName,
      activeTaxonomyClass,
      isInsideCustomVoidPocket: isInsideCustomVoid,
      behaviorLayerMode: mode,
    };
  }

  public updateAndFindFocusedAnchor(params: {
    dt: number;
    nowSec: number;
    playerPos: THREE.Vector3;
    playerYaw: number;
    evalHeight: (x: number, z: number) => number;
  }): FocusedGroundingObjectTelemetry | null {
    const { dt, nowSec, playerPos, playerYaw, evalHeight } = params;
    const lookDirX = -Math.sin(playerYaw);
    const lookDirZ = -Math.cos(playerYaw);

    // Animate Custom Void Ball Portal ring if open
    if (this.customVoidState.isOpen && this.customVoidPortalGroup.visible) {
      const [px, , pz] = this.customVoidState.portalWorldPos;
      const py = evalHeight(px, pz);
      this.customVoidPortalGroup.position.y = py;
      this.customVoidPortalGroup.traverse((ch) => {
        if (ch.userData.isCustomPortalRing) {
          ch.rotation.z = nowSec * 0.9;
        }
        if (ch.userData.isCustomPortalInner) {
          ch.rotation.z = -nowSec * 1.65;
        }
      });
    }

    let bestInst: GroundingWorldObjectInstance | null = null;
    let bestScore = Infinity;

    for (let i = 0; i < this.instances.length; i++) {
      const inst = this.instances[i];
      if (inst.cooldownSec > 0) {
        inst.cooldownSec = Math.max(0, inst.cooldownSec - dt);
      }

      // Keep grounded if terrain was excavated near it
      const gy = evalHeight(inst.position.x, inst.position.z);
      inst.position.y = gy;
      inst.group.position.y = gy;

      // Animate seed-mutated kinetic sub-parts
      inst.group.traverse((ch) => {
        if (ch.userData.isGroundingPendulum) {
          ch.rotation.z = Math.sin(nowSec * 2.1 + i) * 0.3;
        }
        if (ch.userData.isGroundingRotor) {
          const dir = ch.userData.rotorDir ?? 1;
          const axis = ch.userData.rotorAxis ?? 'y';
          if (axis === 'x') ch.rotation.x = nowSec * 0.9 * dir + i;
          else if (axis === 'z') ch.rotation.z = nowSec * 0.9 * dir + i;
          else ch.rotation.y = nowSec * 0.9 * dir + i;
        }
        if (ch.userData.isGroundingBellows) {
          const s = 1.0 + Math.sin(nowSec * 2.8 + i) * 0.14;
          ch.scale.set(s, 1 / Math.sqrt(s), s);
        }
        if (ch.userData.isGroundingFloatMass) {
          ch.position.y += Math.sin(nowSec * 2.4 + i) * 0.0025;
        }
      });

      const dx = inst.position.x - playerPos.x;
      const dz = inst.position.z - playerPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= 7.2) {
        const dot = (dx * lookDirX + dz * lookDirZ) / Math.max(0.001, dist);
        if (dot > 0.22 || dist < 3.5) {
          const score = dist * (1.3 - dot * 0.5);
          if (score < bestScore) {
            bestScore = score;
            bestInst = inst;
          }
        }
      }
    }

    if (!bestInst) return null;
    const bSpec =
      DIFFERENTIAL_UNIVERSE_BOUNDARIES[this.activeBoundary] ??
      DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];
    const taxMeta = TAXONOMY_CLASS_LABELS[bestInst.spec.taxonomyClass];

    return {
      instanceId: bestInst.id,
      name: bestInst.spec.name,
      taxonomyClass: bestInst.spec.taxonomyClass,
      taxonomyClassTitle: taxMeta.title,
      seedMorphTitle: bestInst.seedMorphTitle,
      categoryLabel: bestInst.spec.categoryLabel,
      originBoundaryName: bSpec.name,
      interactionVerb: bestInst.spec.interactionVerb,
      loreSummary: bestInst.spec.loreSummary,
      physicsAuraSummary: bestInst.spec.physicsAuraSummary,
      rewardItemName: bestInst.rewardItem.name,
      rewardItemRarity: bestInst.rewardItem.rarity,
      distanceMeters: Number(
        Math.hypot(
          bestInst.position.x - playerPos.x,
          bestInst.position.z - playerPos.z
        ).toFixed(1)
      ),
      cooldownSec: Number(bestInst.cooldownSec.toFixed(1)),
      localGravityMultiplier: Number(bestInst.localGravityTuning.toFixed(2)),
      localTimeDilationGamma: Number(bestInst.localTimeGammaTuning.toFixed(2)),
      localUpdraftBuoyancy: Number(bestInst.localBuoyancyTuning.toFixed(2)),
      behaviorLayerMode: this.customVoidState.behaviorLayerMode,
    };
  }

  public attuneAndHarvestAnchor(
    instanceId: string
  ): {
    anchor: GroundingWorldObjectInstance;
    rewardedItems: DimensionalItemDefinition[];
    physicsTuningMessage: string;
  } | null {
    const inst = this.instances.find((x) => x.id === instanceId);
    if (!inst || inst.cooldownSec > 0) return null;

    inst.cooldownSec = 6.0;
    inst.attunedCount += 1;

    // Interactive Physics Modulation when attuning Grounding Objects!
    let physicsTuningMessage = '';
    if (inst.spec.taxonomyClass === 'gravity-inertial-anchor') {
      const gravityPresets = [0.45, 0.72, 1.0, 1.45, 0.32];
      inst.localGravityTuning =
        gravityPresets[inst.attunedCount % gravityPresets.length];
      if (this.customVoidState.behaviorLayerMode === 'custom-void-portal-tuning') {
        this.customVoidState.tunedGravityMultiplier = inst.localGravityTuning;
      }
      physicsTuningMessage = `Gravity Anchor Tuned to ${inst.localGravityTuning.toFixed(2)}G`;
    } else if (inst.spec.taxonomyClass === 'temporal-causal-regulator') {
      const gammaPresets = [0.38, 0.65, 1.0, 1.42, 1.85];
      inst.localTimeGammaTuning =
        gammaPresets[inst.attunedCount % gammaPresets.length];
      if (this.customVoidState.behaviorLayerMode === 'custom-void-portal-tuning') {
        this.customVoidState.tunedTimeDilationGamma = inst.localTimeGammaTuning;
      }
      physicsTuningMessage = `Temporal Regulator Tuned to γ = ${inst.localTimeGammaTuning.toFixed(2)}× Proper Time`;
    } else {
      const buoyancyPresets = [2.5, 5.5, 8.5, 0.0, -2.0];
      inst.localBuoyancyTuning =
        buoyancyPresets[inst.attunedCount % buoyancyPresets.length];
      if (this.customVoidState.behaviorLayerMode === 'custom-void-portal-tuning') {
        this.customVoidState.tunedPressureBuoyancy =
          1.0 + inst.localBuoyancyTuning * 0.15;
      }
      physicsTuningMessage = `Pressure Pylon Updraft Tuned to ${inst.localBuoyancyTuning >= 0 ? '+' : ''}${inst.localBuoyancyTuning.toFixed(1)} m/s²`;
    }

    // Also award a matching dimensional reagent alongside the primary relic/weapon/tool!
    const reagents = BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (i) =>
        i.originBoundary === inst.spec.boundary && i.category === 'reagent'
    );
    const bonusReagent =
      reagents[inst.attunedCount % Math.max(1, reagents.length)];

    const rewardedItems = bonusReagent
      ? [inst.rewardItem, bonusReagent]
      : [inst.rewardItem];

    return { anchor: inst, rewardedItems, physicsTuningMessage };
  }
}

/**
 * Builds and synchronizes the 24 Physical 3D Museum Display Plinths & Weapon Racks
 * inside the walkable 36m × 36m Square Portal Room (`PORTAL_ROOM_ORIGIN`).
 */
export class PortalRoomMuseumGalleryRig {
  public galleryRootGroup = new THREE.Group();
  private plinthMountGroups: Map<number, THREE.Group> = new Map();
  private lastMountedSignature = '';

  constructor() {
    this.galleryRootGroup.name = 'portal-room-bethesda-museum-gallery';
    this.galleryRootGroup.position.copy(PORTAL_ROOM_ORIGIN);
    this.build24GalleryPedestals();
  }

  private build24GalleryPedestals(): void {
    const plinthMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0f172a'),
      metalness: 0.78,
      roughness: 0.25,
      clearcoat: 0.6,
    });
    const brassPlaqueMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f59e0b'),
      metalness: 0.9,
      roughness: 0.2,
    });
    const ringGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#06b6d4'),
    });

    // Arrange 12 plinths along the West Gallery Colonnade (x = -15.2 & -11.2)
    // and 12 plinths along the East Gallery Colonnade (x = +11.2 & +15.2)
    for (let slot = 0; slot < 24; slot++) {
      const isEast = slot >= 12;
      const localIdx = slot % 12;
      const row = localIdx % 6; // 6 along Z from -10m to +10m
      const col = Math.floor(localIdx / 6); // inner vs outer aisle

      const px = isEast
        ? 10.6 + col * 4.2
        : -10.6 - col * 4.2;
      const pz = -10.0 + row * 4.0;

      const pedestalGroup = new THREE.Group();
      pedestalGroup.position.set(px, 0, pz);

      const column = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.15, 0.95),
        plinthMat
      );
        column.position.y = 0.575;
      column.castShadow = true;
      column.receiveShadow = true;
      pedestalGroup.add(column);

      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.22, 0.06),
        brassPlaqueMat
      );
      plaque.position.set(0, 0.82, isEast ? -0.49 : 0.49);
      plaque.rotation.x = isEast ? 0.25 : -0.25;
      pedestalGroup.add(plaque);

      const emitterRing = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.42, 20),
        ringGlowMat
      );
      emitterRing.rotation.x = -Math.PI / 2;
      emitterRing.position.y = 1.16;
      pedestalGroup.add(emitterRing);

      const mountSocket = new THREE.Group();
      mountSocket.position.set(0, 1.65, 0);
      pedestalGroup.add(mountSocket);

      this.plinthMountGroups.set(slot, mountSocket);
      this.galleryRootGroup.add(pedestalGroup);
    }
  }

  public syncMountedItems(state: CompendiumLoadoutAndMuseumState): void {
    const sig = JSON.stringify(state.mountedMuseumPlinths);
    if (sig === this.lastMountedSignature) return;
    this.lastMountedSignature = sig;

    for (let slot = 0; slot < 24; slot++) {
      const socket = this.plinthMountGroups.get(slot);
      if (!socket) continue;
      while (socket.children.length > 0) {
        socket.remove(socket.children[0]);
      }

      const itemId = state.mountedMuseumPlinths[slot];
      if (!itemId) continue;

      const item = resolveCompendiumItemById(itemId, state);
      const itemMesh = buildCompositeItem3DMesh(item, false);
      itemMesh.scale.multiplyScalar(1.15);
      socket.add(itemMesh);
    }
  }

  public animateDisplays(nowSec: number): void {
    this.plinthMountGroups.forEach((socket, slot) => {
      if (socket.children.length > 0) {
        socket.rotation.y = nowSec * 0.95 + slot * 0.4;
        socket.position.y = 1.68 + Math.sin(nowSec * 2.2 + slot) * 0.08;
      }
    });
  }
}
