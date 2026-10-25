import * as THREE from 'three';
import { WorldTopologyArchetype } from '../types/manifold';

/**
 * Complete Specification for Dimensional Atmosphere, Cinematic Lighting, and Hyperbolic Geometry.
 */
export interface DimensionalAtmosphereLightingSpec {
  dimensionIndex: number;
  title: string;
  sunColor: string;
  sunIntensity: number;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  rimColor: string;
  rimIntensity: number;
  zenithColor: string;
  zenithIntensity: number;
  fogColor: string;
  fogDensity: number;
  exposure: number;
  bloomThreshold: number;
  bloomStrength: number;
  hyperbolicCurvatureK: number; // Negative curvature parameter for non-Euclidean saddle geometry
  skyGradientTop: string;
  skyGradientHorizon: string;
  skyGradientBottom: string;
  sunCoronaSize: number;
  atmosphereDescription: string;
}

/**
 * 7 Vastly Different Dimensional Atmospheric & Cinematic Lighting Profiles (D1 to D7+)
 */
export const DIMENSIONAL_LIGHTING_PROFILES: DimensionalAtmosphereLightingSpec[] = [
  {
    dimensionIndex: 1,
    title: 'Crystalline Hyperbolic Prism',
    sunColor: '#e0f2fe', // Brilliant cold A-class white-blue
    sunIntensity: 2.4,
    sunElevationDeg: 55,
    sunAzimuthDeg: 40,
    hemiSkyColor: '#bae6fd',
    hemiGroundColor: '#0c4a6e',
    hemiIntensity: 0.95,
    rimColor: '#38bdf8',
    rimIntensity: 1.1,
    zenithColor: '#7dd3fc',
    zenithIntensity: 0.8,
    fogColor: '#082f49',
    fogDensity: 0.0035, // Crisp, crystalline clarity
    exposure: 1.15,
    bloomThreshold: 0.55,
    bloomStrength: 0.85,
    hyperbolicCurvatureK: -0.00045, // Saddle-point hyperbolic curvature
    skyGradientTop: '#030712',
    skyGradientHorizon: '#0369a1',
    skyGradientBottom: '#082f49',
    sunCoronaSize: 4.8,
    atmosphereDescription: 'High-altitude diamond-dust atmosphere illuminated by a piercing blue-white sun with sharp crystalline specular glare.',
  },
  {
    dimensionIndex: 2,
    title: 'Viscous Ferro-Superfluid Twilight',
    sunColor: '#fdba74', // Muted amber-bronze filtered sun
    sunIntensity: 1.45,
    sunElevationDeg: 22, // Low raking sun angle creating long dramatic chiaroscuro shadows
    sunAzimuthDeg: 130,
    hemiSkyColor: '#475569',
    hemiGroundColor: '#0f172a',
    hemiIntensity: 0.72,
    rimColor: '#94a3b8',
    rimIntensity: 1.4, // High metallic rim highlight for mirror fluids
    zenithColor: '#cbd5e1',
    zenithIntensity: 0.6,
    fogColor: '#1e293b',
    fogDensity: 0.0095, // Dense metallic mist
    exposure: 0.95,
    bloomThreshold: 0.65,
    bloomStrength: 0.55,
    hyperbolicCurvatureK: -0.00015,
    skyGradientTop: '#090d16',
    skyGradientHorizon: '#78350f',
    skyGradientBottom: '#1e293b',
    sunCoronaSize: 6.2,
    atmosphereDescription: 'Heavy colloidal mercury twilight with long chiaroscuro shadows reflecting across mirror-chrome ferro-superfluid pools.',
  },
  {
    dimensionIndex: 3,
    title: 'Aether-Zeolite Golden Aerogel',
    sunColor: '#fef08a', // Radiant golden solar halo
    sunIntensity: 2.1,
    sunElevationDeg: 68,
    sunAzimuthDeg: 80,
    hemiSkyColor: '#fef3c7',
    hemiGroundColor: '#78350f',
    hemiIntensity: 1.25,
    rimColor: '#f59e0b',
    rimIntensity: 0.95,
    zenithColor: '#fbbf24',
    zenithIntensity: 1.2,
    fogColor: '#451a03',
    fogDensity: 0.006,
    exposure: 1.22,
    bloomThreshold: 0.42,
    bloomStrength: 1.15, // Radiant golden blooming
    hyperbolicCurvatureK: -0.00065, // Pronounced negative curvature
    skyGradientTop: '#172554',
    skyGradientHorizon: '#b45309',
    skyGradientBottom: '#451a03',
    sunCoronaSize: 8.5,
    atmosphereDescription: 'Ultra-diffuse golden sun shafts slicing through suspended aerogel spore clouds and low-gravity floating pumice monoliths.',
  },
  {
    dimensionIndex: 4,
    title: 'Quantum Fermion Cryo-Void',
    sunColor: '#c084fc', // Cold sub-atomic Cherenkov violet
    sunIntensity: 1.2,
    sunElevationDeg: 35,
    sunAzimuthDeg: 210,
    hemiSkyColor: '#581c87',
    hemiGroundColor: '#1e1b4b',
    hemiIntensity: 0.65,
    rimColor: '#a855f7',
    rimIntensity: 1.6, // Intense Cherenkov rim silhouette
    zenithColor: '#e9d5ff',
    zenithIntensity: 1.4,
    fogColor: '#0f051d',
    fogDensity: 0.0028, // Near-vacuum clarity
    exposure: 0.88,
    bloomThreshold: 0.35,
    bloomStrength: 1.35,
    hyperbolicCurvatureK: -0.00085, // Strong hyperbolic horocycle distortion
    skyGradientTop: '#000000',
    skyGradientHorizon: '#3b0764',
    skyGradientBottom: '#0f051d',
    sunCoronaSize: 3.5,
    atmosphereDescription: 'Sub-kelvin near-vacuum void illuminated by pale violet Cherenkov radiation with non-Euclidean horizon curvature.',
  },
  {
    dimensionIndex: 5,
    title: 'Basaltic Heavy Sandstorm Regolith',
    sunColor: '#ea580c', // Harsh orange-red stellar flare
    sunIntensity: 2.6,
    sunElevationDeg: 18, // Harsh low raking desert sun
    sunAzimuthDeg: 280,
    hemiSkyColor: '#7c2d12',
    hemiGroundColor: '#1c1917',
    hemiIntensity: 0.85,
    rimColor: '#f97316',
    rimIntensity: 1.3,
    zenithColor: '#fdba74',
    zenithIntensity: 0.7,
    fogColor: '#291811',
    fogDensity: 0.012, // Heavy atmospheric sandstorm haze
    exposure: 1.05,
    bloomThreshold: 0.58,
    bloomStrength: 0.75,
    hyperbolicCurvatureK: -0.00025,
    skyGradientTop: '#180d08',
    skyGradientHorizon: '#c2410c',
    skyGradientBottom: '#291811',
    sunCoronaSize: 5.4,
    atmosphereDescription: 'Violent atmospheric dust storm with harsh low-angle orange sunlight casting stark, chiseled shadows across basaltic dunes.',
  },
  {
    dimensionIndex: 6,
    title: 'Fulgurite Vitreous Magma Core',
    sunColor: '#f59e0b', // Deep incandescent solar ember
    sunIntensity: 1.8,
    sunElevationDeg: 45,
    sunAzimuthDeg: 330,
    hemiSkyColor: '#18181b',
    hemiGroundColor: '#450a0a',
    hemiIntensity: 0.6,
    rimColor: '#ef4444',
    rimIntensity: 1.5,
    zenithColor: '#fbbf24',
    zenithIntensity: 1.1,
    fogColor: '#09090b',
    fogDensity: 0.0055,
    exposure: 1.18,
    bloomThreshold: 0.45,
    bloomStrength: 1.25,
    hyperbolicCurvatureK: -0.00035,
    skyGradientTop: '#000000',
    skyGradientHorizon: '#991b1b',
    skyGradientBottom: '#09090b',
    sunCoronaSize: 7.0,
    atmosphereDescription: 'Vitrified obsidian crust with superheated magma fissures coursing beneath lightning-charged atmospheric plasma skies.',
  },
  {
    dimensionIndex: 7,
    title: 'Void Singularity & Inverted Event Horizon',
    sunColor: '#818cf8', // Gravitational Einstein-ring light
    sunIntensity: 1.6,
    sunElevationDeg: 80,
    sunAzimuthDeg: 0,
    hemiSkyColor: '#1e1b4b',
    hemiGroundColor: '#020617',
    hemiIntensity: 0.75,
    rimColor: '#c7d2fe',
    rimIntensity: 1.8,
    zenithColor: '#6366f1',
    zenithIntensity: 1.5,
    fogColor: '#03030d',
    fogDensity: 0.002, // Crystalline vacuum with gravitational light bending
    exposure: 1.05,
    bloomThreshold: 0.38,
    bloomStrength: 1.45,
    hyperbolicCurvatureK: -0.0012, // Extreme hyperbolic space metric inversion
    skyGradientTop: '#020208',
    skyGradientHorizon: '#312e81',
    skyGradientBottom: '#03030d',
    sunCoronaSize: 9.2,
    atmosphereDescription: 'Spacetime metric inversion where gravitational geodesics warp the horizon into a black-hole Einstein ring above an abyss.',
  },
  {
    dimensionIndex: 8,
    title: 'E8 Quasicrystal 8D Polytope Vault',
    sunColor: '#60a5fa',
    sunIntensity: 1.75,
    sunElevationDeg: 58,
    sunAzimuthDeg: 75,
    hemiSkyColor: '#1e3a8a',
    hemiGroundColor: '#0f172a',
    hemiIntensity: 0.82,
    rimColor: '#93c5fd',
    rimIntensity: 1.65,
    zenithColor: '#3b82f6',
    zenithIntensity: 1.4,
    fogColor: '#050b18',
    fogDensity: 0.0022,
    exposure: 1.12,
    bloomThreshold: 0.36,
    bloomStrength: 1.38,
    hyperbolicCurvatureK: -0.00075,
    skyGradientTop: '#020617',
    skyGradientHorizon: '#1d4ed8',
    skyGradientBottom: '#050b18',
    sunCoronaSize: 8.4,
    atmosphereDescription: '240-root E8 Lie-algebraic quasicrystal lattice refracting 8-dimensional Bragg diffraction beams across an aperiodic sky.',
  },
  {
    dimensionIndex: 9,
    title: 'Bianchi Type-IX Mixmaster Chaotic Continuum',
    sunColor: '#f43f5e',
    sunIntensity: 1.95,
    sunElevationDeg: 32,
    sunAzimuthDeg: 145,
    hemiSkyColor: '#4c0519',
    hemiGroundColor: '#090206',
    hemiIntensity: 0.78,
    rimColor: '#fb7185',
    rimIntensity: 1.7,
    zenithColor: '#e11d48',
    zenithIntensity: 1.35,
    fogColor: '#110309',
    fogDensity: 0.0038,
    exposure: 1.15,
    bloomThreshold: 0.4,
    bloomStrength: 1.42,
    hyperbolicCurvatureK: -0.00095,
    skyGradientTop: '#050103',
    skyGradientHorizon: '#9f1239',
    skyGradientBottom: '#110309',
    sunCoronaSize: 9.6,
    atmosphereDescription: 'Anisotropic relativistic Kasner expansion-contraction cycles stretching crimson gravitational wave caustics across the zenith.',
  },
  {
    dimensionIndex: 10,
    title: 'AdS5 × S5 String Holographic Bulk',
    sunColor: '#f472b6',
    sunIntensity: 1.68,
    sunElevationDeg: 64,
    sunAzimuthDeg: 225,
    hemiSkyColor: '#500724',
    hemiGroundColor: '#020617',
    hemiIntensity: 0.85,
    rimColor: '#38bdf8',
    rimIntensity: 1.85,
    zenithColor: '#ec4899',
    zenithIntensity: 1.55,
    fogColor: '#080312',
    fogDensity: 0.0018,
    exposure: 1.18,
    bloomThreshold: 0.34,
    bloomStrength: 1.48,
    hyperbolicCurvatureK: -0.0011,
    skyGradientTop: '#020108',
    skyGradientHorizon: '#831843',
    skyGradientBottom: '#080312',
    sunCoronaSize: 10.4,
    atmosphereDescription: 'Anti-de Sitter 10D superstring bulk where every 3D structure is dual to a conformal quantum interference hologram on the sky boundary.',
  },
  {
    dimensionIndex: 11,
    title: 'M-Theory 11D Supermembrane Cathedral',
    sunColor: '#fde047',
    sunIntensity: 2.05,
    sunElevationDeg: 72,
    sunAzimuthDeg: 300,
    hemiSkyColor: '#3b0764',
    hemiGroundColor: '#0f0720',
    hemiIntensity: 0.9,
    rimColor: '#eab308',
    rimIntensity: 1.9,
    zenithColor: '#a855f7',
    zenithIntensity: 1.65,
    fogColor: '#080412',
    fogDensity: 0.002,
    exposure: 1.24,
    bloomThreshold: 0.32,
    bloomStrength: 1.55,
    hyperbolicCurvatureK: -0.00125,
    skyGradientTop: '#030108',
    skyGradientHorizon: '#6b21a8',
    skyGradientBottom: '#080412',
    sunCoronaSize: 11.5,
    atmosphereDescription: 'Non-perturbative 11D M2/M5 supermembrane worldvolume resonating with golden-violet 4-form C-field cathedral harmonics.',
  },
  {
    dimensionIndex: 12,
    title: '12D F-Theory Elliptic Fibrations & Omniversal Crown',
    sunColor: '#ffffff',
    sunIntensity: 2.25,
    sunElevationDeg: 85,
    sunAzimuthDeg: 0,
    hemiSkyColor: '#312e81',
    hemiGroundColor: '#090d16',
    hemiIntensity: 0.95,
    rimColor: '#22d3ee',
    rimIntensity: 2.0,
    zenithColor: '#f59e0b',
    zenithIntensity: 1.75,
    fogColor: '#04060e',
    fogDensity: 0.0015,
    exposure: 1.28,
    bloomThreshold: 0.3,
    bloomStrength: 1.6,
    hyperbolicCurvatureK: -0.00135,
    skyGradientTop: '#010206',
    skyGradientHorizon: '#1e1b4b',
    skyGradientBottom: '#04060e',
    sunCoronaSize: 12.8,
    atmosphereDescription: 'The 12D F-Theory SL(2,Z) S-duality apex where all lower dimensional timelines and gauge symmetries converge into a prismatic crown.',
  },
];

/**
 * Resolves continuous dimensional lighting specification across continuous slider values (0.0 to 12.0+).
 */
export function resolveDimensionalLighting(dimIndex: number): DimensionalAtmosphereLightingSpec {
  const maxDim = DIMENSIONAL_LIGHTING_PROFILES.length;
  const clamped = Math.max(1, Math.min(maxDim, dimIndex));
  const floorIdx = Math.floor(clamped);
  const ceilIdx = Math.min(maxDim, floorIdx + 1);
  const t = clamped - floorIdx;

  const a = DIMENSIONAL_LIGHTING_PROFILES[floorIdx - 1] ?? DIMENSIONAL_LIGHTING_PROFILES[0];
  const b = DIMENSIONAL_LIGHTING_PROFILES[ceilIdx - 1] ?? a;

  if (t === 0 || floorIdx === ceilIdx) return a;

  // Smooth lerp between adjacent dimensional specs
  const sunCol = new THREE.Color(a.sunColor).lerp(new THREE.Color(b.sunColor), t);
  const hemiSky = new THREE.Color(a.hemiSkyColor).lerp(new THREE.Color(b.hemiSkyColor), t);
  const hemiGnd = new THREE.Color(a.hemiGroundColor).lerp(new THREE.Color(b.hemiGroundColor), t);
  const rimCol = new THREE.Color(a.rimColor).lerp(new THREE.Color(b.rimColor), t);
  const zenithCol = new THREE.Color(a.zenithColor).lerp(new THREE.Color(b.zenithColor), t);
  const fogCol = new THREE.Color(a.fogColor).lerp(new THREE.Color(b.fogColor), t);
  const skyTop = new THREE.Color(a.skyGradientTop).lerp(new THREE.Color(b.skyGradientTop), t);
  const skyHrz = new THREE.Color(a.skyGradientHorizon).lerp(new THREE.Color(b.skyGradientHorizon), t);
  const skyBtm = new THREE.Color(a.skyGradientBottom).lerp(new THREE.Color(b.skyGradientBottom), t);

  return {
    dimensionIndex: dimIndex,
    title: t < 0.5 ? a.title : b.title,
    sunColor: '#' + sunCol.getHexString(),
    sunIntensity: THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t),
    sunElevationDeg: THREE.MathUtils.lerp(a.sunElevationDeg, b.sunElevationDeg, t),
    sunAzimuthDeg: THREE.MathUtils.lerp(a.sunAzimuthDeg, b.sunAzimuthDeg, t),
    hemiSkyColor: '#' + hemiSky.getHexString(),
    hemiGroundColor: '#' + hemiGnd.getHexString(),
    hemiIntensity: THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, t),
    rimColor: '#' + rimCol.getHexString(),
    rimIntensity: THREE.MathUtils.lerp(a.rimIntensity, b.rimIntensity, t),
    zenithColor: '#' + zenithCol.getHexString(),
    zenithIntensity: THREE.MathUtils.lerp(a.zenithIntensity, b.zenithIntensity, t),
    fogColor: '#' + fogCol.getHexString(),
    fogDensity: THREE.MathUtils.lerp(a.fogDensity, b.fogDensity, t),
    exposure: THREE.MathUtils.lerp(a.exposure, b.exposure, t),
    bloomThreshold: THREE.MathUtils.lerp(a.bloomThreshold, b.bloomThreshold, t),
    bloomStrength: THREE.MathUtils.lerp(a.bloomStrength, b.bloomStrength, t),
    hyperbolicCurvatureK: THREE.MathUtils.lerp(a.hyperbolicCurvatureK, b.hyperbolicCurvatureK, t),
    skyGradientTop: '#' + skyTop.getHexString(),
    skyGradientHorizon: '#' + skyHrz.getHexString(),
    skyGradientBottom: '#' + skyBtm.getHexString(),
    sunCoronaSize: THREE.MathUtils.lerp(a.sunCoronaSize, b.sunCoronaSize, t),
    atmosphereDescription: a.atmosphereDescription,
  };
}

/**
 * Procedural Dynamic Sky Dome Mesh Generator:
 * Generates an inverted hemisphere sky dome with smooth vertical atmospheric Rayleigh-Mie color gradients.
 */
export function createAtmosphericSkyDome(radius = 480): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 32, 24);
  geo.scale(-1, 1, 1); // Invert normals for sky dome interior

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    varying vec3 vWorldPosition;
    uniform vec3 u_topColor;
    uniform vec3 u_horizonColor;
    uniform vec3 u_bottomColor;
    uniform vec3 u_sunDirection;
    uniform vec3 u_sunColor;
    uniform float u_sunSize;

    void main() {
      vec3 norm = normalize(vWorldPosition);
      float elevation = norm.y;

      vec3 skyColor;
      if (elevation > 0.0) {
        float t = pow(elevation, 0.45);
        skyColor = mix(u_horizonColor, u_topColor, t);
      } else {
        float t = pow(abs(elevation), 0.65);
        skyColor = mix(u_horizonColor, u_bottomColor, t);
      }

      // Mie atmospheric sun disc & forward scattering corona
      float cosTheta = dot(norm, u_sunDirection);
      if (cosTheta > 0.0) {
        // Core disc
        float disc = smoothstep(0.9996 - (u_sunSize * 0.00015), 0.9999, cosTheta);
        // Soft corona halo
        float corona = pow(cosTheta, 64.0) * 0.65;
        // Broad atmospheric forward scatter
        float scatter = pow(cosTheta, 12.0) * 0.25;

        skyColor += u_sunColor * (disc * 3.5 + corona * 1.8 + scatter);
      }

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_topColor: { value: new THREE.Color('#030712') },
      u_horizonColor: { value: new THREE.Color('#0369a1') },
      u_bottomColor: { value: new THREE.Color('#082f49') },
      u_sunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
      u_sunColor: { value: new THREE.Color('#e0f2fe') },
      u_sunSize: { value: 4.8 },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'atmospheric-sky-dome';
  return mesh;
}

/**
 * Applies the dimensional lighting profile to the active Three.js scene, renderer, and lights:
 * - Dynamically centers the directional sun and shadow map cascade onto the player so soft shadows never disappear.
 * - Updates ACESFilmic exposure and tonemapping.
 * - Updates atmosphere sky dome, fog, and light colors.
 */
export function applyDimensionalLightingToScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  keyLight: THREE.DirectionalLight | null,
  hemiLight: THREE.HemisphereLight | null,
  rimLight: THREE.DirectionalLight | null,
  zenithLight: THREE.PointLight | null,
  skyDome: THREE.Mesh | null,
  dimIndex: number,
  playerPos: THREE.Vector3
) {
  const spec = resolveDimensionalLighting(dimIndex);

  // 1. Calculate Sun Direction Vector from Elevation and Azimuth
  const phi = THREE.MathUtils.degToRad(90 - spec.sunElevationDeg);
  const theta = THREE.MathUtils.degToRad(spec.sunAzimuthDeg);
  const sunDir = new THREE.Vector3(
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.cos(theta)
  ).normalize();

  // 2. Update Directional Sun Light & Shadow Frustum (Locked to Player!)
  if (keyLight) {
    keyLight.color.set(spec.sunColor);
    keyLight.intensity = spec.sunIntensity;

    // Follow player position so soft shadows are ALWAYS sharp and never culled
    const sunDistance = 75;
    keyLight.position.set(
      playerPos.x + sunDir.x * sunDistance,
      playerPos.y + sunDir.y * sunDistance,
      playerPos.z + sunDir.z * sunDistance
    );
    keyLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
    keyLight.target.updateMatrixWorld();

    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.035; // Eliminates shadow acne on anatomical joints
  }

  // 3. Update Hemisphere Sky/Ground Light
  if (hemiLight) {
    hemiLight.color.set(spec.hemiSkyColor);
    hemiLight.groundColor.set(spec.hemiGroundColor);
    hemiLight.intensity = spec.hemiIntensity;
  }

  // 4. Update Rim Light
  if (rimLight) {
    rimLight.color.set(spec.rimColor);
    rimLight.intensity = spec.rimIntensity;
    rimLight.position.set(
      playerPos.x - sunDir.x * 55,
      playerPos.y + 28,
      playerPos.z - sunDir.z * 55
    );
  }

  // 5. Update Zenith Caustic Light
  if (zenithLight) {
    zenithLight.color.set(spec.zenithColor);
    zenithLight.intensity = spec.zenithIntensity;
    zenithLight.position.set(playerPos.x, playerPos.y + 36, playerPos.z);
  }

  // 6. Update Scene Fog
  if (!scene.fog || !(scene.fog instanceof THREE.FogExp2)) {
    scene.fog = new THREE.FogExp2(spec.fogColor, spec.fogDensity);
  } else {
    scene.fog.color.set(spec.fogColor);
    // Keep baseline fog density matching dimension, attenuated by altitude in flight
    const altitudeFactor = Math.max(0, Math.min(1.0, (playerPos.y - 20) / 90));
    scene.fog.density = spec.fogDensity * (1.0 - altitudeFactor * 0.88);
  }

  // 7. Update Sky Dome Shader Uniforms
  if (skyDome && skyDome.material instanceof THREE.ShaderMaterial) {
    skyDome.position.set(playerPos.x, playerPos.y * 0.1, playerPos.z);
    const u = skyDome.material.uniforms;
    u.u_topColor.value.set(spec.skyGradientTop);
    u.u_horizonColor.value.set(spec.skyGradientHorizon);
    u.u_bottomColor.value.set(spec.skyGradientBottom);
    u.u_sunDirection.value.copy(sunDir);
    u.u_sunColor.value.set(spec.sunColor);
    u.u_sunSize.value = spec.sunCoronaSize;
  }

  // 8. Update Renderer ACESFilmic Exposure
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = spec.exposure;
}
