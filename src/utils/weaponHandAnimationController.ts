import * as THREE from 'three';
import { PlayerInteractionTool } from '../types/manifold';
import {
  CompositeWeaponSubType,
  DimensionalItemDefinition,
} from './bethesdaScaleCompendiumEngine';

export type WeaponHandPoseArchetype =
  | 'pistol-recoil-flick-grip'
  | 'two-handed-arbalest-foregrip'
  | 'two-handed-heavy-cleave-grip'
  | 'duelist-saber-fencing-grip'
  | 'two-handed-lance-auger-brace'
  | 'harmonic-tether-weaver-mudra'
  | 'architectural-bim-caliper-mudra'
  | 'grapple-launcher-gauntlet-stance'
  | 'unarmed-brawler-grapple-stance';

export interface FingerCurlSpec {
  proximalX: number;
  intermediateX: number;
  distalX: number;
  splayZ: number;
}

export interface WeaponHandPoseProfile {
  archetype: WeaponHandPoseArchetype;
  label: string;
  requiresTwoHandedGrip: boolean;
  rightWristBasePos: [number, number, number];
  rightWristBaseEuler: [number, number, number];
  leftForegripPos: [number, number, number];
  leftForegripEuler: [number, number, number];
  weaponMountPos: [number, number, number];
  weaponMountEuler: [number, number, number];
  // 5 fingers: [Thumb, Index, Middle, Ring, Pinky]
  rightFingers: [
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
  ];
  leftFingers: [
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
    FingerCurlSpec,
  ];
}

export interface WeaponHandAnimationTelemetry {
  activePoseArchetype: WeaponHandPoseArchetype;
  activePoseLabel: string;
  isTwoHandedGripActive: boolean;
  recoilFlickIntensity: number;
  meleeImpactRebound: number;
  triggerSqueezeRatio: number;
}

interface FingerChainNode {
  proximal: THREE.Group;
  intermediate: THREE.Group;
  distal: THREE.Group;
  baseFlare: number;
}

const POSE_PROFILE_CATALOG: Record<
  WeaponHandPoseArchetype,
  WeaponHandPoseProfile
> = {
  'pistol-recoil-flick-grip': {
    archetype: 'pistol-recoil-flick-grip',
    label: 'One-Handed Ballistic Grip & Recoil Flick',
    requiresTwoHandedGrip: false,
    rightWristBasePos: [0.3, -0.22, -0.44],
    rightWristBaseEuler: [0.2, -0.22, 0.08],
    leftForegripPos: [-0.26, -0.26, -0.42],
    leftForegripEuler: [0.28, 0.32, -0.18],
    weaponMountPos: [-0.02, 0.06, -0.14],
    weaponMountEuler: [-0.22, 0.08, 0.04],
    rightFingers: [
      // Thumb locked high along receiver frame
      { proximalX: 0.38, intermediateX: 0.42, distalX: 0.35, splayZ: -0.28 },
      // Index finger poised forward on trigger guard (squeezes on fire)
      { proximalX: 0.24, intermediateX: 0.52, distalX: 0.38, splayZ: -0.04 },
      // Middle, Ring, Pinky wrapped firmly around pistol grip
      { proximalX: 0.82, intermediateX: 0.95, distalX: 0.78, splayZ: 0.02 },
      { proximalX: 0.88, intermediateX: 0.98, distalX: 0.84, splayZ: 0.06 },
      { proximalX: 0.92, intermediateX: 1.02, distalX: 0.88, splayZ: 0.1 },
    ],
    leftFingers: [
      { proximalX: 0.32, intermediateX: 0.38, distalX: 0.3, splayZ: 0.22 },
      { proximalX: 0.45, intermediateX: 0.55, distalX: 0.42, splayZ: 0.08 },
      { proximalX: 0.52, intermediateX: 0.62, distalX: 0.48, splayZ: 0.0 },
      { proximalX: 0.58, intermediateX: 0.68, distalX: 0.52, splayZ: -0.08 },
      { proximalX: 0.64, intermediateX: 0.72, distalX: 0.56, splayZ: -0.14 },
    ],
  },
  'two-handed-arbalest-foregrip': {
    archetype: 'two-handed-arbalest-foregrip',
    label: 'Two-Handed C-Clamp Foregrip & Stock Brace',
    requiresTwoHandedGrip: true,
    rightWristBasePos: [0.27, -0.23, -0.42],
    rightWristBaseEuler: [0.18, -0.28, 0.06],
    // Left hand reaches across & forward to cradle the barrel shroud / foregrip
    leftForegripPos: [0.05, -0.2, -0.54],
    leftForegripEuler: [0.42, 0.64, -0.36],
    weaponMountPos: [-0.03, 0.06, -0.15],
    weaponMountEuler: [-0.2, 0.1, 0.03],
    rightFingers: [
      { proximalX: 0.44, intermediateX: 0.48, distalX: 0.38, splayZ: -0.24 },
      { proximalX: 0.28, intermediateX: 0.56, distalX: 0.44, splayZ: -0.04 },
      { proximalX: 0.86, intermediateX: 0.96, distalX: 0.82, splayZ: 0.02 },
      { proximalX: 0.9, intermediateX: 1.0, distalX: 0.86, splayZ: 0.06 },
      { proximalX: 0.94, intermediateX: 1.04, distalX: 0.9, splayZ: 0.1 },
    ],
    // Left hand C-clamp foregrip wrap around forward shroud
    leftFingers: [
      { proximalX: 0.52, intermediateX: 0.46, distalX: 0.38, splayZ: 0.34 },
      { proximalX: 0.68, intermediateX: 0.78, distalX: 0.64, splayZ: 0.1 },
      { proximalX: 0.76, intermediateX: 0.84, distalX: 0.7, splayZ: 0.02 },
      { proximalX: 0.82, intermediateX: 0.88, distalX: 0.74, splayZ: -0.05 },
      { proximalX: 0.86, intermediateX: 0.92, distalX: 0.78, splayZ: -0.12 },
    ],
  },
  'two-handed-heavy-cleave-grip': {
    archetype: 'two-handed-heavy-cleave-grip',
    label: 'Two-Handed Polearm & Maul Fulcrum Grip',
    requiresTwoHandedGrip: true,
    rightWristBasePos: [0.28, -0.21, -0.43],
    rightWristBaseEuler: [0.28, -0.3, 0.14],
    // Left hand grips lower pommel/shaft as lever fulcrum
    leftForegripPos: [0.08, -0.27, -0.39],
    leftForegripEuler: [0.34, 0.52, -0.28],
    weaponMountPos: [-0.02, 0.08, -0.12],
    weaponMountEuler: [-0.38, 0.14, 0.08],
    rightFingers: [
      { proximalX: 0.62, intermediateX: 0.68, distalX: 0.56, splayZ: -0.22 },
      { proximalX: 0.84, intermediateX: 0.94, distalX: 0.82, splayZ: -0.04 },
      { proximalX: 0.88, intermediateX: 0.98, distalX: 0.86, splayZ: 0.02 },
      { proximalX: 0.92, intermediateX: 1.02, distalX: 0.9, splayZ: 0.06 },
      { proximalX: 0.96, intermediateX: 1.05, distalX: 0.92, splayZ: 0.11 },
    ],
    leftFingers: [
      { proximalX: 0.58, intermediateX: 0.64, distalX: 0.52, splayZ: 0.24 },
      { proximalX: 0.8, intermediateX: 0.9, distalX: 0.78, splayZ: 0.05 },
      { proximalX: 0.85, intermediateX: 0.95, distalX: 0.82, splayZ: 0.0 },
      { proximalX: 0.89, intermediateX: 0.98, distalX: 0.86, splayZ: -0.05 },
      { proximalX: 0.93, intermediateX: 1.02, distalX: 0.88, splayZ: -0.1 },
    ],
  },
  'duelist-saber-fencing-grip': {
    archetype: 'duelist-saber-fencing-grip',
    label: 'Duelist Saber Thumb-Spine Guard',
    requiresTwoHandedGrip: false,
    rightWristBasePos: [0.29, -0.21, -0.46],
    rightWristBaseEuler: [0.26, -0.24, 0.12],
    leftForegripPos: [-0.28, -0.24, -0.38],
    leftForegripEuler: [0.22, 0.28, -0.22],
    weaponMountPos: [-0.01, 0.08, -0.12],
    weaponMountEuler: [-0.42, 0.12, 0.06],
    rightFingers: [
      // Thumb aligned up the back of the saber hilt for point control
      { proximalX: 0.25, intermediateX: 0.28, distalX: 0.2, splayZ: -0.16 },
      { proximalX: 0.68, intermediateX: 0.82, distalX: 0.72, splayZ: -0.04 },
      { proximalX: 0.78, intermediateX: 0.9, distalX: 0.8, splayZ: 0.02 },
      { proximalX: 0.86, intermediateX: 0.96, distalX: 0.86, splayZ: 0.06 },
      { proximalX: 0.92, intermediateX: 1.0, distalX: 0.9, splayZ: 0.1 },
    ],
    leftFingers: [
      { proximalX: 0.24, intermediateX: 0.3, distalX: 0.22, splayZ: 0.26 },
      { proximalX: 0.34, intermediateX: 0.44, distalX: 0.34, splayZ: 0.1 },
      { proximalX: 0.4, intermediateX: 0.5, distalX: 0.38, splayZ: 0.0 },
      { proximalX: 0.46, intermediateX: 0.56, distalX: 0.42, splayZ: -0.08 },
      { proximalX: 0.52, intermediateX: 0.62, distalX: 0.48, splayZ: -0.15 },
    ],
  },
  'two-handed-lance-auger-brace': {
    archetype: 'two-handed-lance-auger-brace',
    label: 'Two-Handed Geotechnical Auger Brace',
    requiresTwoHandedGrip: true,
    rightWristBasePos: [0.28, -0.24, -0.42],
    rightWristBaseEuler: [0.16, -0.26, 0.06],
    leftForegripPos: [0.03, -0.19, -0.53],
    leftForegripEuler: [0.46, 0.68, -0.4],
    weaponMountPos: [-0.03, 0.06, -0.15],
    weaponMountEuler: [-0.24, 0.09, 0.04],
    rightFingers: [
      { proximalX: 0.52, intermediateX: 0.58, distalX: 0.46, splayZ: -0.24 },
      { proximalX: 0.34, intermediateX: 0.62, distalX: 0.52, splayZ: -0.04 },
      { proximalX: 0.84, intermediateX: 0.94, distalX: 0.84, splayZ: 0.02 },
      { proximalX: 0.88, intermediateX: 0.98, distalX: 0.88, splayZ: 0.06 },
      { proximalX: 0.92, intermediateX: 1.02, distalX: 0.92, splayZ: 0.1 },
    ],
    leftFingers: [
      { proximalX: 0.56, intermediateX: 0.52, distalX: 0.44, splayZ: 0.32 },
      { proximalX: 0.74, intermediateX: 0.84, distalX: 0.72, splayZ: 0.08 },
      { proximalX: 0.8, intermediateX: 0.88, distalX: 0.76, splayZ: 0.01 },
      { proximalX: 0.84, intermediateX: 0.92, distalX: 0.8, splayZ: -0.05 },
      { proximalX: 0.88, intermediateX: 0.96, distalX: 0.84, splayZ: -0.11 },
    ],
  },
  'harmonic-tether-weaver-mudra': {
    archetype: 'harmonic-tether-weaver-mudra',
    label: '4D Harmonic Tether Conducting Mudra',
    requiresTwoHandedGrip: false,
    rightWristBasePos: [0.27, -0.2, -0.44],
    rightWristBaseEuler: [0.28, -0.18, 0.16],
    leftForegripPos: [-0.24, -0.18, -0.43],
    leftForegripEuler: [0.3, 0.24, -0.2],
    weaponMountPos: [-0.02, 0.06, -0.13],
    weaponMountEuler: [-0.32, 0.1, 0.05],
    // Thumb, Index, Middle extended to weave harmonic strings; Ring & Pinky folded
    rightFingers: [
      { proximalX: -0.18, intermediateX: 0.12, distalX: 0.08, splayZ: -0.36 },
      { proximalX: -0.24, intermediateX: 0.08, distalX: 0.05, splayZ: -0.16 },
      { proximalX: -0.18, intermediateX: 0.12, distalX: 0.08, splayZ: 0.04 },
      { proximalX: 0.72, intermediateX: 0.86, distalX: 0.74, splayZ: 0.12 },
      { proximalX: 0.82, intermediateX: 0.92, distalX: 0.82, splayZ: 0.2 },
    ],
    leftFingers: [
      { proximalX: -0.16, intermediateX: 0.14, distalX: 0.1, splayZ: 0.34 },
      { proximalX: -0.2, intermediateX: 0.1, distalX: 0.06, splayZ: 0.14 },
      { proximalX: -0.14, intermediateX: 0.14, distalX: 0.08, splayZ: -0.02 },
      { proximalX: 0.64, intermediateX: 0.78, distalX: 0.68, splayZ: -0.1 },
      { proximalX: 0.74, intermediateX: 0.84, distalX: 0.74, splayZ: -0.18 },
    ],
  },
  'architectural-bim-caliper-mudra': {
    archetype: 'architectural-bim-caliper-mudra',
    label: 'Architectural BIM Caliper & Holo-Table Projection',
    requiresTwoHandedGrip: true,
    rightWristBasePos: [0.25, -0.19, -0.43],
    rightWristBaseEuler: [0.32, -0.22, 0.18],
    leftForegripPos: [-0.21, -0.16, -0.42],
    leftForegripEuler: [0.48, 0.22, -0.12],
    weaponMountPos: [-0.02, 0.07, -0.13],
    weaponMountEuler: [-0.35, 0.12, 0.06],
    rightFingers: [
      { proximalX: 0.42, intermediateX: 0.38, distalX: 0.32, splayZ: -0.22 },
      { proximalX: 0.46, intermediateX: 0.42, distalX: 0.34, splayZ: -0.08 },
      { proximalX: 0.12, intermediateX: 0.22, distalX: 0.18, splayZ: 0.04 },
      { proximalX: 0.18, intermediateX: 0.28, distalX: 0.22, splayZ: 0.12 },
      { proximalX: 0.24, intermediateX: 0.34, distalX: 0.28, splayZ: 0.2 },
    ],
    // Open palm-up holo-table projection
    leftFingers: [
      { proximalX: -0.28, intermediateX: 0.08, distalX: 0.04, splayZ: 0.38 },
      { proximalX: -0.24, intermediateX: 0.1, distalX: 0.06, splayZ: 0.18 },
      { proximalX: -0.22, intermediateX: 0.1, distalX: 0.06, splayZ: 0.0 },
      { proximalX: -0.2, intermediateX: 0.12, distalX: 0.08, splayZ: -0.16 },
      { proximalX: -0.18, intermediateX: 0.14, distalX: 0.1, splayZ: -0.32 },
    ],
  },
  'grapple-launcher-gauntlet-stance': {
    archetype: 'grapple-launcher-gauntlet-stance',
    label: 'Wrist-Gauntlet Grapple Launcher & Rangefinder Aim',
    requiresTwoHandedGrip: false,
    rightWristBasePos: [0.27, -0.18, -0.45],
    rightWristBaseEuler: [0.14, -0.18, 0.08],
    leftForegripPos: [-0.24, -0.2, -0.44],
    leftForegripEuler: [0.26, 0.28, -0.16],
    weaponMountPos: [-0.02, 0.06, -0.14],
    weaponMountEuler: [-0.18, 0.08, 0.04],
    // Index & Middle extended along rangefinder vector, Ring & Pinky bracing winch trigger
    rightFingers: [
      { proximalX: 0.22, intermediateX: 0.28, distalX: 0.18, splayZ: -0.28 },
      { proximalX: -0.12, intermediateX: 0.12, distalX: 0.08, splayZ: -0.06 },
      { proximalX: -0.08, intermediateX: 0.16, distalX: 0.1, splayZ: 0.02 },
      { proximalX: 0.84, intermediateX: 0.96, distalX: 0.84, splayZ: 0.08 },
      { proximalX: 0.9, intermediateX: 1.02, distalX: 0.9, splayZ: 0.14 },
    ],
    leftFingers: [
      { proximalX: 0.28, intermediateX: 0.34, distalX: 0.26, splayZ: 0.24 },
      { proximalX: 0.36, intermediateX: 0.44, distalX: 0.34, splayZ: 0.08 },
      { proximalX: 0.44, intermediateX: 0.54, distalX: 0.42, splayZ: 0.0 },
      { proximalX: 0.52, intermediateX: 0.62, distalX: 0.5, splayZ: -0.08 },
      { proximalX: 0.6, intermediateX: 0.68, distalX: 0.56, splayZ: -0.14 },
    ],
  },
  'unarmed-brawler-grapple-stance': {
    archetype: 'unarmed-brawler-grapple-stance',
    label: 'Bare-Handed Parkour & Grapple Guard',
    requiresTwoHandedGrip: false,
    rightWristBasePos: [0.26, -0.19, -0.41],
    rightWristBaseEuler: [0.48, -0.32, 0.22],
    leftForegripPos: [-0.26, -0.2, -0.41],
    leftForegripEuler: [0.46, 0.32, -0.22],
    weaponMountPos: [-0.02, 0.06, -0.12],
    weaponMountEuler: [-0.35, 0.1, 0.05],
    rightFingers: [
      { proximalX: 0.65, intermediateX: 0.78, distalX: 0.68, splayZ: -0.18 },
      { proximalX: 0.88, intermediateX: 1.04, distalX: 0.92, splayZ: -0.03 },
      { proximalX: 0.92, intermediateX: 1.08, distalX: 0.96, splayZ: 0.01 },
      { proximalX: 0.95, intermediateX: 1.1, distalX: 0.98, splayZ: 0.05 },
      { proximalX: 0.98, intermediateX: 1.12, distalX: 1.0, splayZ: 0.09 },
    ],
    leftFingers: [
      { proximalX: 0.58, intermediateX: 0.68, distalX: 0.58, splayZ: 0.18 },
      { proximalX: 0.78, intermediateX: 0.92, distalX: 0.82, splayZ: 0.03 },
      { proximalX: 0.82, intermediateX: 0.96, distalX: 0.86, splayZ: -0.01 },
      { proximalX: 0.86, intermediateX: 0.98, distalX: 0.88, splayZ: -0.05 },
      { proximalX: 0.9, intermediateX: 1.02, distalX: 0.92, splayZ: -0.09 },
    ],
  },
};

/**
 * Authoritative First-Person & Third-Person Weapon/Tool Hand Animation Controller.
 * Maps equipped weapon subtypes and active tools to articulated 5-finger 3-phalanx hand poses,
 * ballistic wrist recoil flicking, two-handed C-clamp/pommel foregrips, and melee swing impact rebounds
 * so the player's hand never punches blindly when firing guns or swinging weapons.
 */
export class WeaponHandAnimationController {
  public activeArchetype: WeaponHandPoseArchetype = 'pistol-recoil-flick-grip';
  private currentRightFingers: FingerCurlSpec[] = POSE_PROFILE_CATALOG[
    'pistol-recoil-flick-grip'
  ].rightFingers.map((f) => ({ ...f }));
  private currentLeftFingers: FingerCurlSpec[] = POSE_PROFILE_CATALOG[
    'pistol-recoil-flick-grip'
  ].leftFingers.map((f) => ({ ...f }));

  // Dynamic Recoil Flick, Trigger Squeeze, Melee Impact Hit-Stop & Excavation Vibration States
  private recoilFlickTimer = 0;
  private recoilFlickDuration = 0.24;
  private recoilFlickSeverity = 1.0;

  private triggerSqueezeTimer = 0;
  private triggerSqueezeDuration = 0.16;

  private meleeSwingTimer = 0;
  private meleeSwingDuration = 0.42;
  private meleeComboStage: 1 | 2 | 3 = 1;

  private meleeImpactTimer = 0;
  private meleeImpactDuration = 0.28;
  private meleeImpactSeverity = 0;

  private toolPulseTimer = 0;
  private toolPulseDuration = 0.45;
  private activeToolDuringPulse: PlayerInteractionTool = 'kinetic-impulse';

  // Smoothed wrist pose offsets
  private smoothedRightWristEuler = new THREE.Vector3();
  private smoothedLeftForegripPos = new THREE.Vector3(-0.26, -0.24, -0.42);
  private smoothedLeftForegripEuler = new THREE.Vector3(0.28, 0.32, -0.18);

  /**
   * Resolves the exact biomechanical hand pose profile from the equipped item, tool, and sheath state.
   */
  public resolvePoseProfile(
    equippedItem: DimensionalItemDefinition | null | undefined,
    activeTool: PlayerInteractionTool,
    isSheathed: boolean
  ): WeaponHandPoseProfile {
    if (isSheathed) {
      return POSE_PROFILE_CATALOG['unarmed-brawler-grapple-stance'];
    }
    if (activeTool === 'grapple-hook') {
      return POSE_PROFILE_CATALOG['grapple-launcher-gauntlet-stance'];
    }
    if (activeTool === 'harmonic-tether') {
      return POSE_PROFILE_CATALOG['harmonic-tether-weaver-mudra'];
    }
    if (activeTool === 'place-building') {
      return POSE_PROFILE_CATALOG['architectural-bim-caliper-mudra'];
    }
    if (activeTool === 'mine-terrain') {
      return POSE_PROFILE_CATALOG['two-handed-lance-auger-brace'];
    }

    const subType: CompositeWeaponSubType =
      equippedItem?.weaponSubType ?? 'resonance-pistol';

    switch (subType) {
      case 'void-arbalest':
      case 'spore-caster':
        return POSE_PROFILE_CATALOG['two-handed-arbalest-foregrip'];
      case 'excavating-lance':
        return POSE_PROFILE_CATALOG['two-handed-lance-auger-brace'];
      case 'cleaver-halberd':
      case 'gravity-hammer':
        return POSE_PROFILE_CATALOG['two-handed-heavy-cleave-grip'];
      case 'prism-saber':
        return POSE_PROFILE_CATALOG['duelist-saber-fencing-grip'];
      case 'resonance-pistol':
      case 'chrono-tuning-fork':
      default:
        return POSE_PROFILE_CATALOG['pistol-recoil-flick-grip'];
    }
  }

  /**
   * Triggers a crisp ballistic wrist recoil flick and articulated index trigger-finger pull.
   */
  public triggerWeaponRecoilFlick(
    subType?: CompositeWeaponSubType,
    isHeavyAlt: boolean = false
  ): void {
    const heavy =
      isHeavyAlt ||
      subType === 'void-arbalest' ||
      subType === 'excavating-lance' ||
      subType === 'spore-caster';
    this.recoilFlickDuration = heavy ? 0.3 : 0.21;
    this.recoilFlickTimer = this.recoilFlickDuration;
    this.recoilFlickSeverity = heavy ? 1.38 : 1.0;

    this.triggerSqueezeDuration = 0.16;
    this.triggerSqueezeTimer = this.triggerSqueezeDuration;
  }

  /**
   * Triggers a weapon-specific directional melee swing arc (cleave, cross-sweep, or overhead slam).
   */
  public triggerMeleeWeaponSwing(
    subType?: CompositeWeaponSubType,
    comboStage: 1 | 2 | 3 = 1,
    swingSpeedHz: number = 1.35
  ): void {
    const heavy =
      subType === 'gravity-hammer' || subType === 'cleaver-halberd';
    this.meleeComboStage = comboStage;
    this.meleeSwingDuration = Math.max(
      0.26,
      Math.min(0.66, (heavy ? 0.56 : 0.42) / Math.max(0.6, swingSpeedHz))
    );
    this.meleeSwingTimer = this.meleeSwingDuration;
  }

  /**
   * Triggers a physical melee swing impact rebound & hit-stop wrist shudder when a melee strike
   * connects with an entity or solid world surface.
   */
  public triggerMeleeSwingImpactRebound(severity: number = 1.0): void {
    this.meleeImpactSeverity = THREE.MathUtils.clamp(severity, 0.35, 1.65);
    this.meleeImpactDuration = 0.28;
    this.meleeImpactTimer = this.meleeImpactDuration;
  }

  /**
   * Triggers a tool-specific hand animation (geotechnical auger torque, harmonic tether pluck, or BIM projection).
   */
  public triggerToolActionAnimation(tool: PlayerInteractionTool): void {
    this.activeToolDuringPulse = tool;
    this.toolPulseDuration = tool === 'mine-terrain' ? 0.52 : 0.42;
    this.toolPulseTimer = this.toolPulseDuration;
  }

  /**
   * Steps all hand/finger/wrist timers and applies weapon-matched biomechanical poses
   * to both 1st-person and 3rd-person hand rigs.
   */
  public updateHandAndWeaponPoses(params: {
    dt: number;
    nowSec: number;
    equippedItem: DimensionalItemDefinition | null | undefined;
    activeTool: PlayerInteractionTool;
    isSheathed: boolean;
    voidOpenBlend: number;
    isReloading: boolean;
    reloadProgress: number;
    squallIntensity: number;
    isGrapplingEnemy: boolean;
    fpRightHandGroup: THREE.Group | null;
    fpLeftHandGroup: THREE.Group | null;
    tpRightHandGroup?: THREE.Group | null;
    tpLeftHandGroup?: THREE.Group | null;
  }): WeaponHandAnimationTelemetry {
    const {
      dt,
      nowSec,
      equippedItem,
      activeTool,
      isSheathed,
      voidOpenBlend,
      isReloading,
      reloadProgress,
      squallIntensity,
      isGrapplingEnemy,
      fpRightHandGroup,
      fpLeftHandGroup,
      tpRightHandGroup,
      tpLeftHandGroup,
    } = params;

    const safeDt = Math.min(0.05, Math.max(0.001, dt));

    if (this.recoilFlickTimer > 0) {
      this.recoilFlickTimer = Math.max(0, this.recoilFlickTimer - safeDt);
    }
    if (this.triggerSqueezeTimer > 0) {
      this.triggerSqueezeTimer = Math.max(0, this.triggerSqueezeTimer - safeDt);
    }
    if (this.meleeSwingTimer > 0) {
      this.meleeSwingTimer = Math.max(0, this.meleeSwingTimer - safeDt);
    }
    if (this.meleeImpactTimer > 0) {
      this.meleeImpactTimer = Math.max(0, this.meleeImpactTimer - safeDt);
    }
    if (this.toolPulseTimer > 0) {
      this.toolPulseTimer = Math.max(0, this.toolPulseTimer - safeDt);
    }

    const effectiveTool =
      this.toolPulseTimer > 0 ? this.activeToolDuringPulse : activeTool;
    const profile = this.resolvePoseProfile(
      equippedItem,
      effectiveTool,
      isSheathed
    );
    this.activeArchetype = profile.archetype;

    // 1. Evaluate Normalized Action Curves
    const recoilProgress =
      this.recoilFlickTimer > 0
        ? 1.0 - this.recoilFlickTimer / Math.max(0.05, this.recoilFlickDuration)
        : 0;
    // Fast upward wrist snap (0..0.22) followed by damped spring return (0.22..1.0)
    const recoilFlickEnvelope =
      this.recoilFlickTimer > 0
        ? (recoilProgress < 0.22
            ? Math.sin((recoilProgress / 0.22) * (Math.PI * 0.5))
            : Math.pow(1.0 - (recoilProgress - 0.22) / 0.78, 1.85)) *
          this.recoilFlickSeverity
        : 0;

    const triggerSqueezeRatio =
      this.triggerSqueezeTimer > 0
        ? Math.sin(
            (1.0 -
              this.triggerSqueezeTimer /
                Math.max(0.04, this.triggerSqueezeDuration)) *
              Math.PI
          )
        : 0;

    const meleeSwingProgress =
      this.meleeSwingTimer > 0
        ? 1.0 - this.meleeSwingTimer / Math.max(0.08, this.meleeSwingDuration)
        : 0;
    const meleeSwingArc =
      this.meleeSwingTimer > 0 ? Math.sin(meleeSwingProgress * Math.PI) : 0;

    const impactProgress =
      this.meleeImpactTimer > 0
        ? 1.0 - this.meleeImpactTimer / Math.max(0.05, this.meleeImpactDuration)
        : 0;
    // Sharp elastic rebound + high-frequency hit-stop vibration on melee impact
    const meleeImpactEnvelope =
      this.meleeImpactTimer > 0
        ? Math.exp(-impactProgress * 3.5) *
          Math.cos(impactProgress * Math.PI * 4.5) *
          this.meleeImpactSeverity
        : 0;

    const toolPulseEnv =
      this.toolPulseTimer > 0
        ? Math.sin(
            (1.0 -
              this.toolPulseTimer / Math.max(0.05, this.toolPulseDuration)) *
              Math.PI
          )
        : 0;

    // 2. Interpolate & Drive 5-Finger 3-Phalanx Articulated Chains on Right & Left Hands
    const blendRate = Math.min(1, safeDt * 18.0);

    for (let i = 0; i < 5; i++) {
      const targetR = profile.rightFingers[i];
      const curR = this.currentRightFingers[i];

      // Add dynamic finger modulations:
      // - Index finger (i === 1) pulls trigger during ranged discharge
      // - Middle/Ring/Pinky (i >= 2) tighten grip on recoil flick or melee impact
      // - Excavation tool adds high-frequency hydraulic chatter
      const isTriggerFinger =
        i === 1 &&
        (profile.archetype === 'pistol-recoil-flick-grip' ||
          profile.archetype === 'two-handed-arbalest-foregrip' ||
          profile.archetype === 'two-handed-lance-auger-brace');
      const triggerPullAdd = isTriggerFinger ? triggerSqueezeRatio * 0.58 : 0;
      const gripClenchAdd =
        i >= 2
          ? recoilFlickEnvelope * 0.16 +
            Math.abs(meleeImpactEnvelope) * 0.24 +
            meleeSwingArc * 0.14
          : 0;
      const augerJitter =
        this.toolPulseTimer > 0 && this.activeToolDuringPulse === 'mine-terrain'
          ? Math.sin(nowSec * 48.0 + i * 1.4) * 0.08 * toolPulseEnv
          : 0;
      const grappleClawOpen =
        isSheathed && isGrapplingEnemy ? -0.48 : 0;

      curR.proximalX = THREE.MathUtils.lerp(
        curR.proximalX,
        targetR.proximalX +
          triggerPullAdd * 0.65 +
          gripClenchAdd +
          augerJitter +
          grappleClawOpen,
        blendRate
      );
      curR.intermediateX = THREE.MathUtils.lerp(
        curR.intermediateX,
        targetR.intermediateX +
          triggerPullAdd * 0.95 +
          gripClenchAdd +
          augerJitter * 0.8 +
          grappleClawOpen * 0.6,
        blendRate
      );
      curR.distalX = THREE.MathUtils.lerp(
        curR.distalX,
        targetR.distalX +
          triggerPullAdd * 0.85 +
          gripClenchAdd +
          grappleClawOpen * 0.5,
        blendRate
      );
      curR.splayZ = THREE.MathUtils.lerp(
        curR.splayZ,
        targetR.splayZ,
        blendRate
      );

      // Left hand fingers: blend between weapon foregrip curl and open Void Ball cast
      const targetL = profile.leftFingers[i];
      const curL = this.currentLeftFingers[i];
      const voidOpenOverride = THREE.MathUtils.clamp(voidOpenBlend, 0, 1);

      const desiredLeftProx = THREE.MathUtils.lerp(
        targetL.proximalX + gripClenchAdd * 0.8 + augerJitter,
        -0.38,
        voidOpenOverride
      );
      const desiredLeftInter = THREE.MathUtils.lerp(
        targetL.intermediateX + gripClenchAdd * 0.8,
        0.08,
        voidOpenOverride
      );
      const desiredLeftDist = THREE.MathUtils.lerp(
        targetL.distalX + gripClenchAdd * 0.7,
        0.05,
        voidOpenOverride
      );

      curL.proximalX = THREE.MathUtils.lerp(
        curL.proximalX,
        desiredLeftProx,
        blendRate
      );
      curL.intermediateX = THREE.MathUtils.lerp(
        curL.intermediateX,
        desiredLeftInter,
        blendRate
      );
      curL.distalX = THREE.MathUtils.lerp(
        curL.distalX,
        desiredLeftDist,
        blendRate
      );
      curL.splayZ = THREE.MathUtils.lerp(
        curL.splayZ,
        targetL.splayZ * (1.0 + voidOpenOverride * 0.45),
        blendRate
      );
    }

    const applyFingerPosesToRig = (
      handGroup: THREE.Group | null | undefined,
      fingers: FingerCurlSpec[],
      isLeftHand: boolean
    ) => {
      if (!handGroup) return;
      const chains = handGroup.userData.fingerChains as
        | FingerChainNode[]
        | undefined;
      if (!chains) return;

      for (let idx = 0; idx < chains.length && idx < 5; idx++) {
        const chain = chains[idx];
        const f = fingers[idx];
        const microBreath =
          Math.sin(nowSec * 3.4 + idx * 0.95) *
          0.025 *
          (1 + squallIntensity * 0.6);
        chain.proximal.rotation.x = f.proximalX + microBreath;
        chain.proximal.rotation.z = chain.baseFlare + f.splayZ;
        chain.intermediate.rotation.x = f.intermediateX + microBreath * 0.6;
        chain.distal.rotation.x = f.distalX + microBreath * 0.4;
      }

      if (isLeftHand) {
        const voidBall = handGroup.userData.voidBallGroup as
          | THREE.Group
          | undefined;
        if (voidBall) {
          // Dim/compact the palm Void Ball when using a 2-handed foregrip so it doesn't clip through the barrel shroud
          const foregripSuppress =
            profile.requiresTwoHandedGrip && voidOpenBlend < 0.15 ? 0.45 : 1.0;
          const scalePulse =
            (0.32 + voidOpenBlend * 1.35 + Math.sin(nowSec * 6.0) * 0.05) *
            foregripSuppress;
          voidBall.scale.setScalar(scalePulse);
          voidBall.position.y = 0.065 + voidOpenBlend * 0.085;
          voidBall.rotation.y += safeDt * (1.8 + voidOpenBlend * 4.5);
          voidBall.rotation.z += safeDt * (1.1 + voidOpenBlend * 2.5);
        }
      } else {
        const crystal = handGroup.userData.focusCrystal as
          | THREE.Mesh
          | undefined;
        const ring = handGroup.userData.emitterRing as THREE.Mesh | undefined;
        const pulse = Math.max(
          recoilFlickEnvelope,
          meleeSwingArc,
          toolPulseEnv
        );
        if (crystal) {
          crystal.rotation.y += safeDt * (2.5 + pulse * 8.5);
          crystal.rotation.x += safeDt * 1.8;
          crystal.scale.setScalar(1.0 + pulse * 0.42);
        }
        if (ring) {
          ring.rotation.z -= safeDt * (2.2 + pulse * 5.0);
          ring.scale.setScalar(1.0 + pulse * 0.32);
        }
      }
    };

    applyFingerPosesToRig(fpRightHandGroup, this.currentRightFingers, false);
    applyFingerPosesToRig(fpLeftHandGroup, this.currentLeftFingers, true);
    applyFingerPosesToRig(tpRightHandGroup, this.currentRightFingers, false);
    applyFingerPosesToRig(tpLeftHandGroup, this.currentLeftFingers, true);

    // 3. Apply Weapon-Specific Wrist Recoil Flick, Melee Impact Rebound & Two-Handed Foregrip Coupling
    const wristFlickPitch =
      recoilFlickEnvelope * 0.34 +
      meleeImpactEnvelope * 0.28 +
      (this.meleeSwingTimer > 0
        ? this.meleeComboStage === 3
          ? -meleeSwingArc * 0.42
          : -meleeSwingArc * 0.24
        : 0);
    const wristFlickYaw =
      recoilFlickEnvelope * -0.06 +
      meleeImpactEnvelope * 0.14 +
      (this.meleeSwingTimer > 0
        ? this.meleeComboStage === 2
          ? -meleeSwingArc * 0.38
          : meleeSwingArc * 0.28
        : 0);
    const wristFlickRoll =
      recoilFlickEnvelope * -0.14 +
      meleeImpactEnvelope * -0.22 +
      (this.meleeSwingTimer > 0 &&
      profile.archetype === 'duelist-saber-fencing-grip'
        ? Math.cos(meleeSwingProgress * Math.PI * 2) * 0.36
        : 0);

    this.smoothedRightWristEuler.x = THREE.MathUtils.lerp(
      this.smoothedRightWristEuler.x,
      profile.rightWristBaseEuler[0] + wristFlickPitch,
      blendRate
    );
    this.smoothedRightWristEuler.y = THREE.MathUtils.lerp(
      this.smoothedRightWristEuler.y,
      profile.rightWristBaseEuler[1] + wristFlickYaw,
      blendRate
    );
    this.smoothedRightWristEuler.z = THREE.MathUtils.lerp(
      this.smoothedRightWristEuler.z,
      profile.rightWristBaseEuler[2] + wristFlickRoll,
      blendRate
    );

    if (fpRightHandGroup) {
      // Layer the weapon-specific wrist flick & melee impact rebound on top of the spring rig's stance rotation
      fpRightHandGroup.rotation.x +=
        this.smoothedRightWristEuler.x - 0.22;
      fpRightHandGroup.rotation.y +=
        this.smoothedRightWristEuler.y - -0.26;
      fpRightHandGroup.rotation.z +=
        this.smoothedRightWristEuler.z - 0.1;
      // Add melee impact hit-stop pushback along Z
      fpRightHandGroup.position.z += meleeImpactEnvelope * 0.085;
    }

    // Couple Left Hand into Two-Handed Foregrip / Pommel Fulcrum when holding a 2-handed weapon and not casting Void Ball
    if (fpLeftHandGroup && fpLeftHandGroup.visible) {
      const useTwoHandedForegrip =
        profile.requiresTwoHandedGrip &&
        voidOpenBlend < 0.25 &&
        !isReloading;

      if (useTwoHandedForegrip) {
        this.smoothedLeftForegripPos.set(
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripPos.x,
            profile.leftForegripPos[0],
            blendRate
          ),
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripPos.y,
            profile.leftForegripPos[1],
            blendRate
          ),
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripPos.z,
            profile.leftForegripPos[2],
            blendRate
          )
        );
        this.smoothedLeftForegripEuler.set(
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripEuler.x,
            profile.leftForegripEuler[0] + wristFlickPitch * 0.85,
            blendRate
          ),
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripEuler.y,
            profile.leftForegripEuler[1] + wristFlickYaw * 0.85,
            blendRate
          ),
          THREE.MathUtils.lerp(
            this.smoothedLeftForegripEuler.z,
            profile.leftForegripEuler[2] + wristFlickRoll * 0.85,
            blendRate
          )
        );

        // Couple left foregrip hand to right-hand weapon recoil/swing trajectory so both hands move as one locked unit
        const rightDeltaX = fpRightHandGroup
          ? fpRightHandGroup.position.x - 0.31
          : 0;
        const rightDeltaY = fpRightHandGroup
          ? fpRightHandGroup.position.y - -0.23
          : 0;
        const rightDeltaZ = fpRightHandGroup
          ? fpRightHandGroup.position.z - -0.45
          : 0;

        fpLeftHandGroup.position.set(
          this.smoothedLeftForegripPos.x + rightDeltaX * 0.88,
          this.smoothedLeftForegripPos.y + rightDeltaY * 0.88,
          this.smoothedLeftForegripPos.z + rightDeltaZ * 0.88
        );
        fpLeftHandGroup.rotation.set(
          this.smoothedLeftForegripEuler.x,
          this.smoothedLeftForegripEuler.y,
          this.smoothedLeftForegripEuler.z
        );
      } else if (isReloading) {
        // Left hand reaches across to rack bolt / slap magazine drum during reload
        const slapArc = Math.sin(reloadProgress * Math.PI);
        fpLeftHandGroup.position.x += slapArc * 0.16;
        fpLeftHandGroup.position.y += Math.sin(reloadProgress * Math.PI * 2) * 0.06;
        fpLeftHandGroup.rotation.y += slapArc * 0.38;
      }
    }

    return {
      activePoseArchetype: profile.archetype,
      activePoseLabel: profile.label,
      isTwoHandedGripActive:
        profile.requiresTwoHandedGrip && voidOpenBlend < 0.25,
      recoilFlickIntensity: Number(recoilFlickEnvelope.toFixed(2)),
      meleeImpactRebound: Number(Math.abs(meleeImpactEnvelope).toFixed(2)),
      triggerSqueezeRatio: Number(triggerSqueezeRatio.toFixed(2)),
    };
  }
}
