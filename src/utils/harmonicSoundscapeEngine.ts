import {
  DamageGoreModality,
  PainPleasureNodeId,
} from '../types/manifold';

/**
 * Generative Polyphonic Resonance, Ambient Soundscape & Somatic Pain/Pleasure Vocalization Engine
 * Synthesizes real-time Web Audio harmonics AND organic formant-filtered monster vocalizations
 * for every Pain/Pleasure Gradient Node (-1.0 Agonal Trauma/Gore to +1.0 Predatory Satiation / Symbiotic Ecstasy).
 */

// Just-intonation pentatonic & Lydian harmonic ratios (grounded on D3 = 146.83 Hz)
const HARMONIC_RATIOS = [
  1.0, // Root (1/1)
  1.125, // Major Second (9/8)
  1.25, // Major Third (5/4)
  1.40625, // Augmented Fourth / Lydian 4th (45/32)
  1.5, // Perfect Fifth (3/2)
  1.6875, // Major Sixth (27/16)
  1.875, // Major Seventh (15/8)
  2.0, // Octave (2/1)
  2.25, // Ninth (9/4)
  2.5, // Tenth (5/2)
  3.0, // Twelfth (3/1)
];

export interface PainPleasureVocalNodeSpec {
  id: PainPleasureNodeId;
  label: string;
  gradientRange: [number, number]; // [-1.0, +1.0]
  acousticDescription: string;
  formantFreqs: [number, number];
}

export const PAIN_PLEASURE_VOCAL_NODES: Record<
  PainPleasureNodeId,
  PainPleasureVocalNodeSpec
> = {
  'agonal-hemorrhage-scream': {
    id: 'agonal-hemorrhage-scream',
    label: 'Agonal Hemorrhage Scream (Deep Trauma)',
    gradientRange: [-1.0, -0.65],
    acousticDescription:
      'High-tension dissonant laryngeal shriek with sub-harmonic arterial gurgle and downward pitch collapse.',
    formantFreqs: [920, 2450],
  },
  'marrow-fracture-stridor': {
    id: 'marrow-fracture-stridor',
    label: 'Calcified Marrow-Fracture Stridor',
    gradientRange: [-0.65, -0.32],
    acousticDescription:
      'Brittle chitin-cracking transient followed by raspy bronchial wheezing and ribcage resonance.',
    formantFreqs: [540, 1680],
  },
  'corrosive-viscera-spasm': {
    id: 'corrosive-viscera-spasm',
    label: 'Hydrostatic Viscera-Rupture Spasm',
    gradientRange: [-0.32, -0.08],
    acousticDescription:
      'Wet peristaltic bubbling and low-frequency visceral groan under internal organ pressure.',
    formantFreqs: [310, 880],
  },
  'homeostatic-purr-cadence': {
    id: 'homeostatic-purr-cadence',
    label: 'Homeostatic Resonant Respiration',
    gradientRange: [-0.08, 0.32],
    acousticDescription:
      'Calm, rhythmic sub-bassthoracic purr synchronized with balanced stride cadence.',
    formantFreqs: [240, 720],
  },
  'predatory-satiation-thrill': {
    id: 'predatory-satiation-thrill',
    label: 'Predatory Satiation & Feeding Thrill',
    gradientRange: [0.32, 0.68],
    acousticDescription:
      'Deep, resonant polyphonic growl-hum ascending into a triumphant fifth-interval harmonic swell during feeding.',
    formantFreqs: [380, 1320],
  },
  'ecstatic-symbiotic-choir': {
    id: 'ecstatic-symbiotic-choir',
    label: 'Ecstatic Symbiotic Choir Harmonics',
    gradientRange: [0.68, 1.0],
    acousticDescription:
      'Crystalline dual-formant overtone singing and celestial glass-harp resonance at peak pleasure.',
    formantFreqs: [660, 1980],
  },
};

export function resolvePainPleasureVocalNode(
  gradient: number,
  goreType?: DamageGoreModality | 'intact-homeostasis'
): PainPleasureVocalNodeSpec {
  if (gradient <= -0.62) {
    return PAIN_PLEASURE_VOCAL_NODES['agonal-hemorrhage-scream'];
  }
  if (gradient <= -0.3) {
    if (
      goreType === 'hydrostatic-viscera-rupture' ||
      goreType === 'corrosive-ichor-dissolution'
    ) {
      return PAIN_PLEASURE_VOCAL_NODES['corrosive-viscera-spasm'];
    }
    return PAIN_PLEASURE_VOCAL_NODES['marrow-fracture-stridor'];
  }
  if (gradient < -0.06) {
    return PAIN_PLEASURE_VOCAL_NODES['corrosive-viscera-spasm'];
  }
  if (gradient < 0.32) {
    return PAIN_PLEASURE_VOCAL_NODES['homeostatic-purr-cadence'];
  }
  if (gradient < 0.68) {
    return PAIN_PLEASURE_VOCAL_NODES['predatory-satiation-thrill'];
  }
  return PAIN_PLEASURE_VOCAL_NODES['ecstatic-symbiotic-choir'];
}

class HarmonicSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscA: OscillatorNode | null = null;
  private droneOscB: OscillatorNode | null = null;
  private voidSanctuaryOsc: OscillatorNode | null = null;
  private voidSanctuaryGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private enabled: boolean = false;
  private baseRootHz: number = 146.83; // D3 warm resonant fundamental
  private lastVocalTriggerTime: number = 0;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    if (this.enabled) {
      this.setEnabled(false);
    } else {
      this.setEnabled(true);
    }
    return this.enabled;
  }

  public setEnabled(enable: boolean): void {
    this.enabled = enable;
    if (enable) {
      this.ensureInitialized();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.24, this.ctx.currentTime, 0.35);
      }
      this.triggerChime(4, 0.7);
    } else if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
    }
  }

  private ensureInitialized(): void {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      this.ctx = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(ctx.destination);
      this.masterGain = masterGain;

      // Low-pass resonant filter modulated by 4D W-coordinate and wind speed
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      filter.Q.value = 2.4;
      filter.connect(masterGain);
      this.droneFilter = filter;

      // Generative Ambient Drone Oscillator A (Root)
      const oscA = ctx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.value = this.baseRootHz * 0.5; // D2 sub-harmonic
      const gainA = ctx.createGain();
      gainA.gain.value = 0.22;
      oscA.connect(gainA);
      gainA.connect(filter);
      oscA.start();
      this.droneOscA = oscA;

      // Generative Ambient Drone Oscillator B (Fifth interval with slow phase beating)
      const oscB = ctx.createOscillator();
      oscB.type = 'triangle';
      oscB.frequency.value = this.baseRootHz * 0.75 + 0.35; // A2 + binaural beat
      const gainB = ctx.createGain();
      gainB.gain.value = 0.12;
      oscB.connect(gainB);
      gainB.connect(filter);
      oscB.start();
      this.droneOscB = oscB;

      // Walk-In Void Sphere Sanctuary Warm Cathedral Pad (Swells when player steps inside Void Sphere)
      const voidOsc = ctx.createOscillator();
      voidOsc.type = 'sine';
      voidOsc.frequency.value = this.baseRootHz * 1.25; // F#3 warm third
      const voidGain = ctx.createGain();
      voidGain.gain.value = 0.0001;
      voidOsc.connect(voidGain);
      voidGain.connect(masterGain);
      voidOsc.start();
      this.voidSanctuaryOsc = voidOsc;
      this.voidSanctuaryGain = voidGain;
    } catch {
      // Ignore if Web Audio is blocked
    }
  }

  /**
   * Continuously modulates the generative ambient drone according to the 4D W-coordinate,
   * wind speed, world seed, and whether the player is inside the Walk-In Void Sphere.
   */
  public updateWorldResonance(params: {
    worldSeed: number;
    wCoord: number;
    windSpeed: number;
    isInsideVoidBall: boolean;
    coherence: number;
  }): void {
    if (!this.enabled || !this.ctx || !this.droneFilter) return;

    const now = this.ctx.currentTime;
    const seedRoots = [130.81, 146.83, 164.81, 174.61, 196.0];
    this.baseRootHz = seedRoots[params.worldSeed % seedRoots.length];

    if (this.droneOscA && this.droneOscB) {
      const wPitchShift = 1 + params.wCoord * 0.08;
      this.droneOscA.frequency.setTargetAtTime(
        this.baseRootHz * 0.5 * wPitchShift,
        now,
        0.2
      );
      this.droneOscB.frequency.setTargetAtTime(
        this.baseRootHz * 0.75 * wPitchShift + 0.4,
        now,
        0.2
      );
    }

    const cutoff =
      260 +
      Math.abs(params.wCoord) * 380 +
      Math.min(400, params.windSpeed * 28) +
      params.coherence * 240;
    this.droneFilter.frequency.setTargetAtTime(cutoff, now, 0.25);

    if (this.voidSanctuaryGain && this.voidSanctuaryOsc) {
      this.voidSanctuaryOsc.frequency.setTargetAtTime(
        this.baseRootHz * 1.25,
        now,
        0.3
      );
      this.voidSanctuaryGain.gain.setTargetAtTime(
        params.isInsideVoidBall ? 0.16 : 0.0001,
        now,
        0.45
      );
    }
  }

  /**
   * Plays a bowed glass-harmonica / crystalline harp chime (e.g., when weaving a Harmonic Tether,
   * crafting a recipe in the Void Crucible, or shifting dimensions).
   */
  public triggerChime(degreeIndex: number = 4, intensity: number = 0.6): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const ratio =
      HARMONIC_RATIOS[Math.abs(degreeIndex) % HARMONIC_RATIOS.length];
    const freq = this.baseRootHz * ratio;

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.0, now);

    const peakGain = Math.min(0.35, 0.18 * intensity);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.85);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.value = 0.25;

    osc.connect(env);
    overtone.connect(overtoneGain);
    overtoneGain.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 1.9);
    overtone.stop(now + 1.9);
  }

  /**
   * Synthesizes a cinematic Monster / Creature Vocalization & Visceral Gore Sound
   * mapped directly to the entity's Pain/Pleasure Gradient Node (-1.0 to +1.0) and Gore Modality!
   */
  public triggerPainPleasureVocalization(params: {
    painPleasureGradient: number; // -1.0 (Agonal Pain) to +1.0 (Ecstatic Pleasure / Predatory Satiation)
    goreType?: DamageGoreModality | 'intact-homeostasis';
    creatureMass?: number; // 40 to 120 kg (scales laryngeal pitch)
    distanceToListener?: number;
  }): void {
    if (!this.enabled) return;
    this.ensureInitialized();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    if (now - this.lastVocalTriggerTime < 0.14) return;
    this.lastVocalTriggerTime = now;

    const dist = params.distanceToListener ?? 8.0;
    if (dist > 52) return;
    const distAttenuation = Math.max(0.08, Math.min(1.0, 1.0 - dist / 55));

    const node = resolvePainPleasureVocalNode(
      params.painPleasureGradient,
      params.goreType
    );
    const massFactor = Math.max(
      0.65,
      Math.min(1.45, 78 / (params.creatureMass ?? 78))
    );

    // Carrier Laryngeal Oscillator + FM Growl/Shriek Modulator + Dual Formant Filters
    const carrier = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const fmMod = this.ctx.createOscillator();
    const fmGain = this.ctx.createGain();

    const formantA = this.ctx.createBiquadFilter();
    const formantB = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    formantA.type = 'bandpass';
    formantA.frequency.setValueAtTime(node.formantFreqs[0] * massFactor, now);
    formantA.Q.value = 3.8;

    formantB.type = 'bandpass';
    formantB.frequency.setValueAtTime(node.formantFreqs[1] * massFactor, now);
    formantB.Q.value = 4.5;

    let duration = 0.75;

    if (params.painPleasureGradient < -0.55) {
      // AGONAL HEMORRHAGE SCREAM: High-tension sawtooth laryngeal shriek pitching downward with harsh FM rasp
      carrier.type = 'sawtooth';
      subOsc.type = 'square';
      const startPitch = this.baseRootHz * 2.15 * massFactor;
      const endPitch = this.baseRootHz * 0.72 * massFactor;
      carrier.frequency.setValueAtTime(startPitch, now);
      carrier.frequency.exponentialRampToValueAtTime(endPitch, now + 0.65);

      subOsc.frequency.setValueAtTime(startPitch * 0.5, now);
      subOsc.frequency.exponentialRampToValueAtTime(endPitch * 0.48, now + 0.65);

      fmMod.type = 'sawtooth';
      fmMod.frequency.setValueAtTime(42, now);
      fmGain.gain.setValueAtTime(85, now);
      duration = 0.72;
    } else if (params.painPleasureGradient < -0.08) {
      // MARROW FRACTURE STRIDOR OR VISCERA RUPTURE SPASM: Sub-harmonic crunch + wet bubbling formant sweep
      carrier.type = 'sawtooth';
      subOsc.type = 'triangle';
      const basePitch = this.baseRootHz * 0.85 * massFactor;
      carrier.frequency.setValueAtTime(basePitch * 1.35, now);
      carrier.frequency.exponentialRampToValueAtTime(basePitch * 0.62, now + 0.55);

      subOsc.frequency.setValueAtTime(basePitch * 0.5, now);

      fmMod.type = 'sine';
      fmMod.frequency.setValueAtTime(
        params.goreType === 'hydrostatic-viscera-rupture' ? 19 : 64,
        now
      );
      fmGain.gain.setValueAtTime(58, now);
      formantA.frequency.exponentialRampToValueAtTime(
        node.formantFreqs[0] * 0.55,
        now + 0.52
      );
      duration = 0.58;
    } else if (params.painPleasureGradient > 0.62) {
      // ECSTATIC SYMBIOTIC CHOIR: Warm harmonic fifth + octave overtone swell
      carrier.type = 'triangle';
      subOsc.type = 'sine';
      const rootPitch = this.baseRootHz * 1.5 * massFactor;
      carrier.frequency.setValueAtTime(rootPitch, now);
      carrier.frequency.linearRampToValueAtTime(rootPitch * 1.25, now + 0.85);

      subOsc.frequency.setValueAtTime(rootPitch * 0.5, now);
      fmMod.type = 'sine';
      fmMod.frequency.setValueAtTime(6.5, now); // Gentle vibrato
      fmGain.gain.setValueAtTime(9, now);
      duration = 0.95;
    } else {
      // PREDATORY SATIATION THRILL / HOMEOSTATIC PURR: Deep resonant chest purr ascending on a feeding strike
      carrier.type = 'triangle';
      subOsc.type = 'sine';
      const purrPitch = this.baseRootHz * 0.66 * massFactor;
      carrier.frequency.setValueAtTime(purrPitch, now);
      carrier.frequency.exponentialRampToValueAtTime(
        purrPitch * 1.33,
        now + 0.65
      );
      subOsc.frequency.setValueAtTime(purrPitch * 0.5, now);

      fmMod.type = 'sine';
      fmMod.frequency.setValueAtTime(24, now); // Deep feline/leviathan purr flutter
      fmGain.gain.setValueAtTime(22, now);
      duration = 0.7;
    }

    const peakVol = Math.min(0.32, 0.24 * distAttenuation);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakVol, now + 0.035);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    fmMod.connect(fmGain);
    fmGain.connect(carrier.frequency);

    carrier.connect(formantA);
    carrier.connect(formantB);
    subOsc.connect(formantA);

    formantA.connect(env);
    formantB.connect(env);
    env.connect(this.masterGain);

    carrier.start(now);
    subOsc.start(now);
    fmMod.start(now);

    carrier.stop(now + duration + 0.05);
    subOsc.stop(now + duration + 0.05);
    fmMod.stop(now + duration + 0.05);
  }

  /**
   * Plays a polyphonic triad arpeggio when sintering a 5-System BIM Building or shifting dimensions.
   */
  public triggerArchitecturalChord(seedOffset: number = 0): void {
    if (!this.enabled) return;
    const degrees = [0, 2, 4, 7, 9];
    degrees.forEach((deg, idx) => {
      setTimeout(() => {
        this.triggerChime(deg + seedOffset, 0.65 - idx * 0.08);
      }, idx * 95);
    });
  }
}

export const harmonicSoundscape = new HarmonicSoundscapeEngine();
