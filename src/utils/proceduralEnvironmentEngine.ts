import * as THREE from 'three';
import {
  AbsurdTimelineSpec,
  TimelineAtmospherePreset,
  TimelineLandformArchetype,
} from '../types/portalAndBiodepth';

export interface TimelineNoiseLayerConfig {
  seedHash: number;
  landformArchetype: TimelineLandformArchetype;
  // Layer 0: Anisotropic Domain Warp & Off-Center Tectonic Epicenter
  epicenterOffsetX: number;
  epicenterOffsetZ: number;
  tectonicAzimuthRad: number;
  anisotropyScaleX: number;
  anisotropyScaleZ: number;
  warpFrequency: number;
  warpAmplitudeM: number;
  // Layer 1 & 2: Macro & Mesoscale Multifractal Parameters
  macroFrequency: number;
  macroAmplitudeM: number;
  octaves: number;
  lacunarity: number;
  persistence: number;
  ridgeSharpness: number;
  // Layer 3: Terrace Quantization & Canyon Fault Carving
  terraceStepHeightM: number;
  terraceBlendWeight: number;
  canyonMeanderFreq: number;
  canyonDepthM: number;
  canyonWidthNorm: number;
  // Spawn Perch Radius (tight 4.2m local pad so dramatic cliffs/canyons surround the player immediately)
  spawnPerchRadiusM: number;
  spawnBaseElevationM: number;
}

export interface TimelineBiomeColorPalette {
  abyssalTrenchHex: string;
  lowlandBasinHex: string;
  midslopePrimaryHex: string;
  escarpmentCliffHex: string;
  highlandPlateauHex: string;
  apexSummitCrestHex: string;
  subsurfaceExcavationHex: string;
  mineralVeinEmissiveHex: string;
  shaderWaveTintA: string;
  shaderWaveTintB: string;
  shaderContourHex: string;
  shaderContourScale: number;
}

export interface TimelineAtmosphereConfig {
  preset: TimelineAtmospherePreset;
  label: string;
  skyZenithHex: string;
  skyMidDomeHex: string;
  skyHorizonHex: string;
  fogTintHex: string;
  fogDensity: number;
  sunDiscHex: string;
  sunCoronaHex: string;
  sunDirection: [number, number, number];
  keyLightIntensity: number;
  hemiLightIntensity: number;
  rimLightHex: string;
  zenithLightHex: string;
}

export interface TimelineEnvironmentProfile {
  coordinateCode: string;
  seedHash: number;
  geographySummary: string;
  noiseConfig: TimelineNoiseLayerConfig;
  colorPalette: TimelineBiomeColorPalette;
  atmosphere: TimelineAtmosphereConfig;
}

// Pre-allocated scratch colors for zero-GC vertex coloring in the 181x181 terrain loop
const _cAbyss = new THREE.Color();
const _cLow = new THREE.Color();
const _cMid = new THREE.Color();
const _cCliff = new THREE.Color();
const _cHigh = new THREE.Color();
const _cApex = new THREE.Color();
const _cSubsoil = new THREE.Color();
const _cVein = new THREE.Color();

function seededFloat(seed: number, salt: number): number {
  let t = (seed + Math.imul(salt, 0x9e3779b9)) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}

function shiftHexHSL(
  hex: string,
  hueShift: number,
  satDelta: number,
  lightDelta: number
): string {
  const c = new THREE.Color(hex || '#38bdf8');
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  hsl.h = (((hsl.h + hueShift) % 1) + 1) % 1;
  hsl.s = THREE.MathUtils.clamp(hsl.s + satDelta, 0.12, 0.98);
  hsl.l = THREE.MathUtils.clamp(hsl.l + lightDelta, 0.08, 0.92);
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return `#${c.getHexString()}`;
}

/**
 * Fast 2D Value-Simplex Hybrid Hash Noise in [-1, 1] parameterized by seed
 */
function evaluateSeeded2DNoise(x: number, z: number, seed: number): number {
  const s1 = (seed % 997) * 0.173;
  const s2 = ((seed >> 4) % 991) * 0.219;
  const u = x + s1;
  const v = z - s2;
  const n1 = Math.sin(u * 1.0 + Math.cos(v * 1.13 + s1) * 0.85);
  const n2 = Math.cos(v * 1.07 - Math.sin(u * 0.93 - s2) * 0.85);
  const n3 = Math.sin((u + v) * 0.78 + Math.cos((u - v) * 0.84 + s1));
  return (n1 * 0.42 + n2 * 0.38 + n3 * 0.2);
}

/**
 * Authoritative Procedural Environment Engine.
 * Generates vastly distinct 3D geography, domain-warped multi-octave heightmaps,
 * 7-band geological strata palettes, and vibrant non-black atmospheric lighting
 * for each timeline seed.
 */
export class ProceduralEnvironmentEngine {
  private profileCache = new Map<string, TimelineEnvironmentProfile>();
  private activeProfile: TimelineEnvironmentProfile | null = null;
  private cachedPaletteKey = '';

  public synthesizeProfileForTimeline(
    timeline: AbsurdTimelineSpec
  ): TimelineEnvironmentProfile {
    const cacheKey = `${timeline.coordinateCode}-${timeline.seedHash}-${timeline.landformArchetype}-${timeline.atmospherePreset}`;
    const existing = this.profileCache.get(cacheKey);
    if (existing) return existing;

    const seed = timeline.seedHash || 137;
    const r0 = seededFloat(seed, 1);
    const r1 = seededFloat(seed, 2);
    const r2 = seededFloat(seed, 3);
    const r3 = seededFloat(seed, 4);
    const r4 = seededFloat(seed, 5);
    const r5 = seededFloat(seed, 6);
    const r6 = seededFloat(seed, 7);
    const r7 = seededFloat(seed, 8);
    const r8 = seededFloat(seed, 9);

    // 1. Build Seed-Unique Multi-Layer Noise Configuration
    // Shift tectonic epicenter away from (0,0) so every timeline has asymmetric vistas right from spawn
    const epicenterOffsetX = Number(((r0 - 0.5) * 92).toFixed(2));
    const epicenterOffsetZ = Number(((r1 - 0.5) * 92).toFixed(2));
    const tectonicAzimuthRad = Number((r2 * Math.PI * 2).toFixed(4));
    const anisotropyScaleX = Number((0.68 + r3 * 0.95).toFixed(3));
    const anisotropyScaleZ = Number((0.68 + (1.0 - r3) * 0.95).toFixed(3));
    const warpFrequency = Number((0.018 + r4 * 0.036).toFixed(4));
    const warpAmplitudeM = Number((8.5 + r5 * 24.0).toFixed(2));

    const macroFrequency = Number((0.022 + r6 * 0.044).toFixed(4));
    const macroAmplitudeM = Number((12.0 + r7 * 18.5).toFixed(2));
    const octaves = 3 + (seed % 3); // 3 to 5 octaves
    const lacunarity = Number((1.92 + r8 * 0.45).toFixed(3));
    const persistence = Number((0.44 + r0 * 0.16).toFixed(3));
    const ridgeSharpness = Number((0.22 + r1 * 0.72).toFixed(3));

    const terraceStepHeightM = Number((1.8 + r2 * 4.4).toFixed(2));
    const terraceBlendWeight =
      timeline.landformArchetype === 'spiral-nautilus-terraces' ||
      timeline.landformArchetype === 'voronoi-shattered-mesas' ||
      timeline.landformArchetype === 'hex-basalt-organ-pipes'
        ? Number((0.58 + r3 * 0.34).toFixed(2))
        : Number((0.12 + r3 * 0.35).toFixed(2));

    const canyonMeanderFreq = Number((0.026 + r4 * 0.038).toFixed(4));
    const canyonDepthM = Number((9.5 + r5 * 14.0).toFixed(2));
    const canyonWidthNorm = Number((0.18 + r6 * 0.24).toFixed(3));
    const spawnBaseElevationM = Number(((r7 - 0.42) * 8.5).toFixed(2));

    const noiseConfig: TimelineNoiseLayerConfig = {
      seedHash: seed,
      landformArchetype: timeline.landformArchetype,
      epicenterOffsetX,
      epicenterOffsetZ,
      tectonicAzimuthRad,
      anisotropyScaleX,
      anisotropyScaleZ,
      warpFrequency,
      warpAmplitudeM,
      macroFrequency,
      macroAmplitudeM,
      octaves,
      lacunarity,
      persistence,
      ridgeSharpness,
      terraceStepHeightM,
      terraceBlendWeight,
      canyonMeanderFreq,
      canyonDepthM,
      canyonWidthNorm,
      spawnPerchRadiusM: 4.5,
      spawnBaseElevationM,
    };

    // 2. Build Seed-Unique 7-Band Geological & Biome Color Palette
    const hueJitter = (r8 - 0.5) * 0.14;
    const baseLow = shiftHexHSL(
      timeline.terrainLowHex || '#0f766e',
      hueJitter,
      0.06,
      0.0
    );
    const baseMid = shiftHexHSL(
      timeline.terrainMidHex || '#14b8a6',
      hueJitter * 0.8,
      0.08,
      0.02
    );
    const baseHigh = shiftHexHSL(
      timeline.terrainHighHex || '#fef08a',
      -hueJitter * 0.6,
      0.05,
      0.04
    );

    const colorPalette: TimelineBiomeColorPalette = {
      abyssalTrenchHex: shiftHexHSL(baseLow, -0.05, 0.12, -0.14),
      lowlandBasinHex: baseLow,
      midslopePrimaryHex: baseMid,
      escarpmentCliffHex: shiftHexHSL(
        timeline.portalFluidSecondaryHex || baseMid,
        0.08,
        -0.08,
        -0.08
      ),
      highlandPlateauHex: baseHigh,
      apexSummitCrestHex: shiftHexHSL(
        timeline.sunDiscHex || baseHigh,
        0.04,
        0.15,
        0.16
      ),
      subsurfaceExcavationHex: shiftHexHSL(baseLow, 0.11, 0.14, -0.1),
      mineralVeinEmissiveHex:
        timeline.portalFluidPrimaryHex || '#38bdf8',
      shaderWaveTintA: baseMid,
      shaderWaveTintB: timeline.portalFluidPrimaryHex || '#a855f7',
      shaderContourHex: timeline.sunDiscHex || '#fde047',
      shaderContourScale: Number((0.65 + r2 * 1.15).toFixed(2)),
    };

    // 3. Build Seed-Unique Multi-Band Atmosphere & Celestial Lighting
    const sunElevRad = THREE.MathUtils.degToRad(22 + r3 * 52);
    const sunAzimRad = r4 * Math.PI * 2;
    const sunDir: [number, number, number] = [
      Number((Math.cos(sunElevRad) * Math.cos(sunAzimRad) * 68).toFixed(2)),
      Number((Math.sin(sunElevRad) * 74).toFixed(2)),
      Number((Math.cos(sunElevRad) * Math.sin(sunAzimRad) * 68).toFixed(2)),
    ];

    const skyZenith = shiftHexHSL(
      timeline.skyZenithHex || '#0284c7',
      hueJitter * 0.5,
      0.05,
      0.02
    );
    const skyHorizon = shiftHexHSL(
      timeline.skyHorizonHex || '#bae6fd',
      -hueJitter * 0.4,
      0.06,
      0.03
    );
    const skyMid = new THREE.Color(skyZenith)
      .lerp(new THREE.Color(skyHorizon), 0.52)
      .getStyle();

    const atmosphere: TimelineAtmosphereConfig = {
      preset: timeline.atmospherePreset,
      label: timeline.atmosphereLabel,
      skyZenithHex: skyZenith,
      skyMidDomeHex: `#${new THREE.Color(skyMid).getHexString()}`,
      skyHorizonHex: skyHorizon,
      fogTintHex: shiftHexHSL(
        timeline.fogTintHex || skyHorizon,
        hueJitter * 0.3,
        0.04,
        0.0
      ),
      fogDensity: Number((0.0042 + r5 * 0.0045).toFixed(5)),
      sunDiscHex: timeline.sunDiscHex || '#fef08a',
      sunCoronaHex: timeline.portalFluidPrimaryHex || '#38bdf8',
      sunDirection: sunDir,
      keyLightIntensity: Number((1.18 + r6 * 0.42).toFixed(2)),
      hemiLightIntensity: Number((0.68 + r7 * 0.28).toFixed(2)),
      rimLightHex: timeline.portalFluidPrimaryHex || '#38bdf8',
      zenithLightHex: timeline.portalFluidSecondaryHex || '#a855f7',
    };

    const geographySummary = `${timeline.landformLabel} (${octaves}-Octave Domain-Warped Relief · ${Math.round(
      macroAmplitudeM
    )}m Amp · ${timeline.atmosphereLabel})`;

    const profile: TimelineEnvironmentProfile = {
      coordinateCode: timeline.coordinateCode,
      seedHash: seed,
      geographySummary,
      noiseConfig,
      colorPalette,
      atmosphere,
    };

    if (this.profileCache.size > 48) {
      const firstKey = this.profileCache.keys().next().value;
      if (firstKey) this.profileCache.delete(firstKey);
    }
    this.profileCache.set(cacheKey, profile);
    return profile;
  }

  public setActiveTimelineSpec(
    timeline: AbsurdTimelineSpec
  ): TimelineEnvironmentProfile {
    const profile = this.synthesizeProfileForTimeline(timeline);
    this.activeProfile = profile;
    this.syncScratchColors(profile.colorPalette);
    return profile;
  }

  public getActiveProfile(): TimelineEnvironmentProfile | null {
    return this.activeProfile;
  }

  private syncScratchColors(pal: TimelineBiomeColorPalette): void {
    const key = `${pal.abyssalTrenchHex}-${pal.midslopePrimaryHex}-${pal.apexSummitCrestHex}`;
    if (this.cachedPaletteKey === key) return;
    this.cachedPaletteKey = key;
    _cAbyss.set(pal.abyssalTrenchHex);
    _cLow.set(pal.lowlandBasinHex);
    _cMid.set(pal.midslopePrimaryHex);
    _cCliff.set(pal.escarpmentCliffHex);
    _cHigh.set(pal.highlandPlateauHex);
    _cApex.set(pal.apexSummitCrestHex);
    _cSubsoil.set(pal.subsurfaceExcavationHex);
    _cVein.set(pal.mineralVeinEmissiveHex);
  }

  /**
   * Evaluates the multi-layered, domain-warped procedural heightmap at (x, z) for the active timeline seed.
   * Completely replaces shared circular/bowl geography with seed-unique tectonic architecture.
   */
  public evaluateHeightAt(
    x: number,
    z: number,
    customProfile?: TimelineEnvironmentProfile | null
  ): number {
    const profile = customProfile ?? this.activeProfile;
    if (!profile) return 0;

    const cfg = profile.noiseConfig;
    const seed = cfg.seedHash;

    // 1. Layer 0: Off-Center Translation, Tectonic Azimuth Rotation & Anisotropic Domain Warp
    const tx = x - cfg.epicenterOffsetX;
    const tz = z - cfg.epicenterOffsetZ;
    const cosA = Math.cos(cfg.tectonicAzimuthRad);
    const sinA = Math.sin(cfg.tectonicAzimuthRad);
    const rx = (tx * cosA - tz * sinA) * cfg.anisotropyScaleX;
    const rz = (tx * sinA + tz * cosA) * cfg.anisotropyScaleZ;

    // Curl / Domain Warp displacement
    const warpX =
      evaluateSeeded2DNoise(
        rx * cfg.warpFrequency,
        rz * cfg.warpFrequency,
        seed + 17
      ) * cfg.warpAmplitudeM;
    const warpZ =
      evaluateSeeded2DNoise(
        rx * cfg.warpFrequency + 3.7,
        rz * cfg.warpFrequency - 2.9,
        seed + 53
      ) * cfg.warpAmplitudeM;

    const wx = rx + warpX;
    const wz = rz + warpZ;
    const r = Math.hypot(wx, wz);
    const theta = Math.atan2(wz, wx);

    // 2. Layer 1: Seed-Parameterized Macro-Tectonic Basis Function
    let macroH = 0;
    const f = cfg.macroFrequency;
    const amp = cfg.macroAmplitudeM;

    switch (cfg.landformArchetype) {
      case 'sky-atoll-archipelago': {
        // Multi-center floating island tablelands with deep oceanic trenches and narrow stone causeways
        const cellA =
          Math.cos(wx * f * 1.45) * Math.cos(wz * f * 1.35) +
          0.45 * Math.sin(wx * f * 2.1 - wz * f * 1.8);
        if (cellA > 0.08) {
          const plateau = Math.round(cellA * 3.6) * (amp * 0.24);
          macroH = plateau + Math.sin(wx * 0.18) * 1.2;
        } else {
          const isCauseway =
            Math.abs(Math.sin(wx * 0.035 + wz * 0.028)) < 0.14;
          macroH = isCauseway
            ? 1.8 + Math.cos(r * 0.12) * 0.6
            : -amp * 0.82 + cellA * 5.5;
        }
        break;
      }
      case 'spiral-nautilus-terraces': {
        // Off-center Fibonacci logarithmic spiral canyons and stepped golden-ratio ziggurat shelves
        const spiralTwist = Math.sin(
          r * (f * 2.4) - theta * (2.0 + (seed % 4)) + (seed % 11)
        );
        const shelf = Math.round(spiralTwist * 3.8) * (amp * 0.21);
        const harmonicBasin = Math.cos(r * f * 0.95) * (amp * 0.36);
        macroH = shelf + harmonicBasin;
        break;
      }
      case 'twisted-mobius-canyons': {
        // Deep braided river-gorges flanked by soaring overhanging canyon walls and hoodoo needles
        const meander = Math.sin(
          wx * cfg.canyonMeanderFreq +
            Math.cos(wz * cfg.canyonMeanderFreq * 1.15) * 2.6
        );
        const absM = Math.abs(meander);
        if (absM < cfg.canyonWidthNorm) {
          const normTrench = 1.0 - absM / cfg.canyonWidthNorm;
          macroH = -cfg.canyonDepthM * Math.pow(normTrench, 1.35);
        } else {
          const wallRise = Math.min(
            1.45,
            (absM - cfg.canyonWidthNorm) / (1.0 - cfg.canyonWidthNorm)
          );
          macroH = Math.pow(wallRise, 0.72) * amp * 0.95;
        }
        // Add isolated hoodoo pillars
        const hoodoo =
          evaluateSeeded2DNoise(wx * 0.14, wz * 0.14, seed + 99);
        if (hoodoo > 0.56) {
          macroH += Math.pow((hoodoo - 0.56) / 0.44, 1.4) * amp * 1.15;
        }
        break;
      }
      case 'hex-basalt-organ-pipes': {
        // Giant hexagonal columnar basalt towers and sunken geothermal caldera pools
        const scale = f * 2.8;
        const k1 = wx * scale;
        const k2 = (wx * 0.5 + wz * 0.866025) * scale;
        const k3 = (wx * 0.5 - wz * 0.866025) * scale;
        const hexSignal = (Math.cos(k1) + Math.cos(k2) + Math.cos(k3)) / 3.0;
        const secondaryMod = evaluateSeeded2DNoise(
          wx * 0.04,
          wz * 0.04,
          seed + 31
        );
        macroH =
          Math.round((hexSignal + secondaryMod * 0.45) * 4.2) *
          (amp * 0.22);
        break;
      }
      case 'inverted-crater-caldera': {
        // Multi-ring volcanic impact craters with a towering central levitating peak and radial ridges
        const ringSpacing = 28 + (seed % 22);
        const ringWave = Math.cos((r / ringSpacing) * Math.PI * 2);
        const ringHeight =
          ringWave > 0
            ? Math.pow(ringWave, 1.5) * amp * 0.88
            : ringWave * amp * 0.52;
        const centralPeak = Math.exp(-(r * r) / 340.0) * amp * 1.25;
        const radialSpokes =
          Math.sin(theta * (3 + (seed % 5))) *
          Math.min(1, r / 24.0) *
          (amp * 0.25);
        macroH = ringHeight + centralPeak + radialSpokes;
        break;
      }
      case 'colossal-ribcage-badlands': {
        // Sinuous spine ridge with periodic sweeping rib-arches and eroded marrow badlands
        const spineCurve = wx + Math.sin(wz * 0.032) * 22.0;
        const spineDist = Math.abs(spineCurve);
        const ribArch =
          Math.cos(wz * (f * 3.6)) *
          Math.exp(-spineDist * 0.026) *
          (amp * 1.05);
        const marrowTrench =
          spineDist < 11.0 ? -amp * 0.35 : Math.sin(spineDist * 0.08) * 4.8;
        macroH = ribArch + marrowTrench;
        break;
      }
      case 'voronoi-shattered-mesas': {
        // Tectonic flat-topped mesas separated by glowing fissure chasms
        const nA = evaluateSeeded2DNoise(wx * f * 1.4, wz * f * 1.4, seed + 7);
        const nB = evaluateSeeded2DNoise(
          wx * f * 2.1 + 5.2,
          wz * f * 2.1 - 4.1,
          seed + 19
        );
        const plate = nA * 0.7 + nB * 0.3;
        if (Math.abs(plate) < 0.14) {
          // Deep tectonic fault fissure
          macroH = -cfg.canyonDepthM * 0.88;
        } else {
          const mesaLevel = Math.sign(plate) * (amp * 0.55);
          const steppedTop =
            Math.round(plate * 3.0) * cfg.terraceStepHeightM;
          macroH = mesaLevel + steppedTop;
        }
        break;
      }
      case 'crystalline-harmonic-dunes':
      default: {
        // Interference barchan megadunes punctuated by towering crystal needle clusters
        const dunePhase =
          wx * f * 1.65 + Math.sin(wz * f * 1.15) * 1.85;
        const duneCrest =
          Math.pow(Math.abs(Math.sin(dunePhase)), 1.65) * (amp * 0.85) -
          amp * 0.32;
        const crystalCluster = evaluateSeeded2DNoise(
          wx * 0.16,
          wz * 0.16,
          seed + 73
        );
        const spireAdd =
          crystalCluster > 0.62
            ? Math.pow((crystalCluster - 0.62) / 0.38, 1.5) * amp * 1.3
            : 0;
        macroH = duneCrest + spireAdd;
        break;
      }
    }

    // 3. Layer 2: Multi-Octave Ridged Multifractal Detail Layer
    let detailH = 0;
    let curAmp = amp * 0.38;
    let curFreq = f * 1.75;
    let weight = 1.0;

    for (let o = 0; o < cfg.octaves; o++) {
      const n = evaluateSeeded2DNoise(
        wx * curFreq + o * 11.3,
        wz * curFreq - o * 7.9,
        seed + o * 131
      );
      const ridge = 1.0 - Math.abs(n);
      const signal = THREE.MathUtils.lerp(
        n,
        ridge * ridge * 2.0 - 1.0,
        cfg.ridgeSharpness
      );
      detailH += signal * curAmp * weight;
      weight = THREE.MathUtils.clamp(ridge * 1.15, 0.25, 1.0);
      curAmp *= cfg.persistence;
      curFreq *= cfg.lacunarity;
    }

    let combinedH = macroH + detailH + cfg.spawnBaseElevationM;

    // 4. Layer 3: Seed-Specific Terrace Quantization
    if (cfg.terraceBlendWeight > 0.05 && cfg.terraceStepHeightM > 0.5) {
      const terraced =
        Math.round(combinedH / cfg.terraceStepHeightM) *
        cfg.terraceStepHeightM;
      combinedH = THREE.MathUtils.lerp(
        combinedH,
        terraced,
        cfg.terraceBlendWeight
      );
    }

    // Keep only a tight 4.5m perch right under the initial spawn pad (0, 14) so the player never spawns embedded in a spike,
    // while preserving 100% of the unique timeline mountains/canyons everywhere else!
    const distFromSpawnPad = Math.hypot(x - 0, z - 14);
    if (distFromSpawnPad < cfg.spawnPerchRadiusM * 2.2) {
      const padBlend = THREE.MathUtils.smoothstep(
        distFromSpawnPad,
        cfg.spawnPerchRadiusM * 0.5,
        cfg.spawnPerchRadiusM * 2.2
      );
      combinedH = THREE.MathUtils.lerp(
        cfg.spawnBaseElevationM * 0.4,
        combinedH,
        padBlend
      );
    }

    return combinedH;
  }

  /**
   * Evaluates the 7-band geological strata, slope cliff escarpment, and mineral vein vertex color
   * for any terrain vertex (vx, vz) in the active timeline.
   */
  public evaluateSlopeAndStrataColorAt(
    vx: number,
    vz: number,
    baseVy: number,
    vy: number,
    slopeGradient: number,
    outColor: THREE.Color
  ): void {
    const profile = this.activeProfile;
    if (!profile) {
      outColor.set('#14b8a6');
      return;
    }
    this.syncScratchColors(profile.colorPalette);

    const maxAmp = Math.max(8, profile.noiseConfig.macroAmplitudeM * 1.15);
    const normH = THREE.MathUtils.clamp(
      (vy - profile.noiseConfig.spawnBaseElevationM + maxAmp) / (maxAmp * 2.0),
      0,
      1
    );

    // 1. Elevation Band Interpolation (Abyssal Trench -> Lowland Basin -> Midslope -> Highland Plateau -> Apex Summit)
    if (normH < 0.22) {
      outColor.copy(_cAbyss).lerp(_cLow, normH / 0.22);
    } else if (normH < 0.52) {
      outColor.copy(_cLow).lerp(_cMid, (normH - 0.22) / 0.3);
    } else if (normH < 0.8) {
      outColor.copy(_cMid).lerp(_cHigh, (normH - 0.52) / 0.28);
    } else {
      outColor.copy(_cHigh).lerp(_cApex, (normH - 0.8) / 0.2);
    }

    // 2. Geological Sedimentary Strata Banding & Steep Cliff Escarpment Coloring
    const strataWave = Math.sin(
      vy * 1.45 +
        (vx * 0.08 - vz * 0.08) +
        (profile.seedHash % 71) * 0.2
    );
    const cliffFactor = THREE.MathUtils.clamp(
      (slopeGradient - 0.35) / 0.85,
      0,
      0.88
    );
    if (cliffFactor > 0.02) {
      outColor.lerp(_cCliff, cliffFactor);
      if (strataWave > 0.55) {
        outColor.lerp(_cHigh, (strataWave - 0.55) * 0.45 * cliffFactor);
      }
    }

    // 3. Seed-Specific Surface Vein & Fault-Line Luminescence
    const veinNoise = Math.abs(
      Math.sin(vx * 0.24 + (profile.seedHash % 29)) *
        Math.cos(vz * 0.24 - (profile.seedHash % 37))
    );
    if (veinNoise > 0.84) {
      outColor.lerp(_cVein, (veinNoise - 0.84) * 3.2);
    }

    // 4. Excavated Crater Subsoil & Glowing Mineral Veins
    const dugDelta = baseVy - vy;
    if (dugDelta > 0.04) {
      const dugBlend = THREE.MathUtils.clamp(dugDelta / 1.1, 0.35, 0.92);
      outColor.lerp(_cSubsoil, dugBlend);
      if (dugDelta > 0.85 && Math.abs(Math.sin(vx * 3.1) * Math.cos(vz * 3.1)) > 0.65) {
        outColor.lerp(_cVein, 0.78);
      }
    } else if (dugDelta < -0.02) {
      outColor.lerp(_cSubsoil, 0.65);
    }
  }

  /**
   * Applies the active timeline's atmospheric sky, fog density, directional sun angle,
   * and custom GLSL terrain shader uniforms to the live Three.js scene.
   */
  public applyAtmosphereAndShaderToScene(params: {
    scene: THREE.Scene | null;
    hemiLight: THREE.HemisphereLight | null;
    keyLight: THREE.DirectionalLight | null;
    rimLight: THREE.DirectionalLight | null;
    zenithLight?: THREE.PointLight | null;
    shaderUniforms?: {
      uBiomeTintA?: { value: THREE.Color };
      uBiomeTintB?: { value: THREE.Color };
      uContourTint?: { value: THREE.Color };
      uContourScale?: { value: number };
    };
  }): void {
    const profile = this.activeProfile;
    if (!profile) return;

    const { atm, pal } = {
      atm: profile.atmosphere,
      pal: profile.colorPalette,
    };

    if (params.scene) {
      params.scene.background = new THREE.Color(atm.skyHorizonHex);
      if (params.scene.fog instanceof THREE.FogExp2) {
        params.scene.fog.color.set(atm.fogTintHex);
        params.scene.fog.density = atm.fogDensity;
      }
    }

    if (params.hemiLight) {
      params.hemiLight.color.set(atm.skyZenithHex);
      params.hemiLight.groundColor.set(pal.midslopePrimaryHex);
      params.hemiLight.intensity = atm.hemiLightIntensity;
    }

    if (params.keyLight) {
      params.keyLight.color.set(atm.sunDiscHex);
      params.keyLight.intensity = atm.keyLightIntensity;
      params.keyLight.position.set(
        atm.sunDirection[0],
        atm.sunDirection[1],
        atm.sunDirection[2]
      );
    }

    if (params.rimLight) {
      params.rimLight.color.set(atm.rimLightHex);
      params.rimLight.position.set(
        -atm.sunDirection[0] * 0.75,
        32,
        -atm.sunDirection[2] * 0.75
      );
    }

    if (params.zenithLight) {
      params.zenithLight.color.set(atm.zenithLightHex);
    }

    if (params.shaderUniforms) {
      if (params.shaderUniforms.uBiomeTintA) {
        params.shaderUniforms.uBiomeTintA.value.set(pal.shaderWaveTintA);
      }
      if (params.shaderUniforms.uBiomeTintB) {
        params.shaderUniforms.uBiomeTintB.value.set(pal.shaderWaveTintB);
      }
      if (params.shaderUniforms.uContourTint) {
        params.shaderUniforms.uContourTint.value.set(pal.shaderContourHex);
      }
      if (params.shaderUniforms.uContourScale) {
        params.shaderUniforms.uContourScale.value = pal.shaderContourScale;
      }
    }
  }
}

export const proceduralEnvironmentEngine = new ProceduralEnvironmentEngine();
