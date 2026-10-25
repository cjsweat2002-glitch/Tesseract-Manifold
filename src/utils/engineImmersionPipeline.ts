import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { IS_SOFTWARE_WEBGL } from './graphicsMeshAndCollisionEngine';

export interface PhotorealisticTerrainTextures {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
}

let cachedTerrainTextures: PhotorealisticTerrainTextures | null = null;

/**
 * Procedural Fractional Brownian Motion (FBM) & Multi-Octave Perlin-Style Noise
 * Generates seamless 256x256 tangent-space normal, roughness, and ambient occlusion maps.
 */
function generateSeamlessNoiseHeightfield(width: number, height: number): Float32Array {
  const data = new Float32Array(width * height);
  const octaves = 4;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;

      // 4D torus mapping for seamless 2D tiling (seamless in both X and Y)
      const u = nx * Math.PI * 2;
      const v = ny * Math.PI * 2;
      const x1 = Math.cos(u);
      const y1 = Math.sin(u);
      const x2 = Math.cos(v);
      const y2 = Math.sin(v);

      let value = 0;
      let amp = 0.55;
      let freq = 1.0;

      for (let o = 0; o < octaves; o++) {
        // Multi-frequency harmonic combination + rock fracture ridges
        const n1 = Math.sin(x1 * freq * 1.8 + y2 * freq * 1.2 + o * 1.7);
        const n2 = Math.cos(y1 * freq * 1.6 + x2 * freq * 1.9 + o * 2.3);
        const n3 = Math.sin((x1 + y1) * freq * 2.1 + (x2 - y2) * freq * 1.7);
        const ridge = 1.0 - Math.abs(n3);
        value += (n1 * 0.36 + n2 * 0.36 + ridge * 0.28) * amp;

        amp *= 0.5;
        freq *= 2.05;
      }

      data[y * width + x] = (value + 1.0) * 0.5;
    }
  }

  return data;
}

/**
 * Builds high-resolution 256x256 seamless PBR normal, roughness, and AO maps for natural rock strata and soil.
 */
export function getProceduralPhotorealisticTerrainTextures(
  maxAnisotropy = 8
): PhotorealisticTerrainTextures {
  if (cachedTerrainTextures) {
    if (maxAnisotropy > cachedTerrainTextures.normalMap.anisotropy) {
      cachedTerrainTextures.normalMap.anisotropy = maxAnisotropy;
      cachedTerrainTextures.roughnessMap.anisotropy = maxAnisotropy;
      cachedTerrainTextures.aoMap.anisotropy = maxAnisotropy;
      cachedTerrainTextures.normalMap.needsUpdate = true;
      cachedTerrainTextures.roughnessMap.needsUpdate = true;
      cachedTerrainTextures.aoMap.needsUpdate = true;
    }
    return cachedTerrainTextures;
  }

  const size = 256;
  const heightfield = generateSeamlessNoiseHeightfield(size, size);

  // 1. Tangent-Space Normal Map (Sobel gradient filter on FBM heightfield)
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);

  // 2. Micro-Roughness Map
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(size, size);

  // 3. Cavity & Ambient Occlusion Map
  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = size;
  aoCanvas.height = size;
  const aoCtx = aoCanvas.getContext('2d')!;
  const aoImg = aoCtx.createImageData(size, size);

  const bumpStrength = 4.2;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const idx = y * size + x;
      const hCenter = heightfield[idx];

      // Sobel kernel filter for smooth, high-fidelity surface gradients
      const hLeft = heightfield[y * size + xPrev];
      const hRight = heightfield[y * size + xNext];
      const hTop = heightfield[yPrev * size + x];
      const hBottom = heightfield[yNext * size + x];

      const dx = (hRight - hLeft) * bumpStrength;
      const dy = (hBottom - hTop) * bumpStrength;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      const pIdx = idx * 4;

      // Normal map encoding: [-1, 1] -> [0, 255]
      nImg.data[pIdx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 3] = 255;

      // Roughness map: crevices (low height) are rougher matte dirt, ridges are slightly polished
      const roughVal = Math.floor(THREE.MathUtils.clamp((0.92 - hCenter * 0.42) * 255, 60, 245));
      rImg.data[pIdx] = roughVal;
      rImg.data[pIdx + 1] = roughVal;
      rImg.data[pIdx + 2] = roughVal;
      rImg.data[pIdx + 3] = 255;

      // Cavity/AO map: depressions accumulate contact shadow
      const aoVal = Math.floor(THREE.MathUtils.clamp((0.45 + hCenter * 0.55) * 255, 90, 255));
      aoImg.data[pIdx] = aoVal;
      aoImg.data[pIdx + 1] = aoVal;
      aoImg.data[pIdx + 2] = aoVal;
      aoImg.data[pIdx + 3] = 255;
    }
  }

  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  aoCtx.putImageData(aoImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(16, 16);
  normalMap.anisotropy = maxAnisotropy;
  normalMap.colorSpace = THREE.NoColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(16, 16);
  roughnessMap.anisotropy = maxAnisotropy;
  roughnessMap.colorSpace = THREE.NoColorSpace;

  const aoMap = new THREE.CanvasTexture(aoCanvas);
  aoMap.wrapS = THREE.RepeatWrapping;
  aoMap.wrapT = THREE.RepeatWrapping;
  aoMap.repeat.set(16, 16);
  aoMap.anisotropy = maxAnisotropy;
  aoMap.colorSpace = THREE.NoColorSpace;

  cachedTerrainTextures = { normalMap, roughnessMap, aoMap };
  return cachedTerrainTextures;
}

export const terrainPhaseUniforms = {
  uPhaseTime: { value: 0.0 },
  uWDimension: { value: 0.0 },
  uBiomeTintA: { value: new THREE.Color('#0ea5e9') },
  uBiomeTintB: { value: new THREE.Color('#a855f7') },
  uContourTint: { value: new THREE.Color('#fde047') },
  uContourScale: { value: 1.05 },
};

/**
 * Creates a photorealistic PBR material for terrain with smooth vertex normals,
 * 256x256 anisotropic normal/roughness strata, World-Space Triplanar Cliff Shading
 * (zero UV stretching on steep cliffs), and Timeline-Adaptive Phase Harmonics.
 */
export function createPhotorealisticTerrainMaterial(roughness = 0.68, metalness = 0.14): THREE.MeshStandardMaterial {
  const textures = getProceduralPhotorealisticTerrainTextures();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness,
    metalness,
    normalMap: textures.normalMap,
    normalScale: new THREE.Vector2(1.95, 1.95),
    roughnessMap: textures.roughnessMap,
    aoMap: textures.aoMap,
    aoMapIntensity: 0.92,
    flatShading: false,
    envMapIntensity: 0.68,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPhaseTime = terrainPhaseUniforms.uPhaseTime;
    shader.uniforms.uWDimension = terrainPhaseUniforms.uWDimension;
    shader.uniforms.uBiomeTintA = terrainPhaseUniforms.uBiomeTintA;
    shader.uniforms.uBiomeTintB = terrainPhaseUniforms.uBiomeTintB;
    shader.uniforms.uContourTint = terrainPhaseUniforms.uContourTint;
    shader.uniforms.uContourScale = terrainPhaseUniforms.uContourScale;

    shader.vertexShader =
      `varying vec3 vPhaseWorldPos;\nvarying vec3 vPhaseWorldNormal;\n` +
      shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vPhaseWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vPhaseWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader =
      `uniform float uPhaseTime;\nuniform float uWDimension;\nuniform vec3 uBiomeTintA;\nuniform vec3 uBiomeTintB;\nuniform vec3 uContourTint;\nuniform float uContourScale;\nvarying vec3 vPhaseWorldPos;\nvarying vec3 vPhaseWorldNormal;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        // 1. World-Space Triplanar Cliff Strata & Crevice Weathering (eliminates UV stretch on vertical cliffs!)
        vec3 triWeights = abs(normalize(vPhaseWorldNormal));
        triWeights = max(triWeights - 0.2, 0.001);
        triWeights /= (triWeights.x + triWeights.y + triWeights.z);
        float cliffSlopeFactor = smoothstep(0.32, 0.78, 1.0 - abs(vPhaseWorldNormal.y));

        float strataXY = sin(vPhaseWorldPos.y * 3.6 + sin(vPhaseWorldPos.x * 1.1) * 1.4) * 0.5 + 0.5;
        float strataZY = sin(vPhaseWorldPos.y * 3.6 + cos(vPhaseWorldPos.z * 1.1) * 1.4) * 0.5 + 0.5;
        float triplanarCliffStrata = strataXY * triWeights.z + strataZY * triWeights.x;
        float cliffCreviceShade = mix(1.0, 0.64 + 0.52 * triplanarCliffStrata, cliffSlopeFactor);
        diffuseColor.rgb *= cliffCreviceShade;

        // 2. Timeline-Adaptive Stepped Topographic Contour Lines & Mineral Veins
        float elevWave = fract(vPhaseWorldPos.y * uContourScale - uPhaseTime * 0.06);
        float contourLine = smoothstep(0.055, 0.0, abs(elevWave - 0.5));
        float fineGridX = smoothstep(0.035, 0.0, abs(fract(vPhaseWorldPos.x * 0.38) - 0.5));
        float fineGridZ = smoothstep(0.035, 0.0, abs(fract(vPhaseWorldPos.z * 0.38) - 0.5));
        float sacredLattice = max(fineGridX, fineGridZ) * 0.22;

        // 3. Dynamic Timeline Biome Wavefront Ring sweeping across the manifold
        float radialDist = length(vPhaseWorldPos.xz);
        float phaseWave = sin(radialDist * 0.12 - uPhaseTime * 0.95 + sin(vPhaseWorldPos.x * 0.07 + vPhaseWorldPos.z * 0.07) * 2.2) * 0.5 + 0.5;
        vec3 phaseTint = mix(uBiomeTintA, uBiomeTintB, smoothstep(0.2, 0.8, phaseWave));

        // Preserve rich 7-band vertex & triplanar cliff strata colors while weaving timeline phase harmonics
        diffuseColor.rgb = mix(diffuseColor.rgb, phaseTint, 0.13);
        diffuseColor.rgb = mix(diffuseColor.rgb, uContourTint, (contourLine * 0.30 + sacredLattice * 0.14));`
      );
  };

  return mat;
}

/**
 * Bakes per-vertex Ambient Occlusion (AO) and Indirect Cavity Lightmap irradiance directly into
 * environment mesh vertex attributes (`aBakedAoLightmap` and native hardware `color` shading)
 * with zero per-mesh WebGL shader recompilation overhead.
 * Also clamps excessive emissive/albedo intensities so non-Euclidean structures never wash out or over-expose.
 */
export function bakeVertexAmbientOcclusionAndLightmap(
  rootObject: THREE.Object3D,
  dimIndex = 1
): void {
  const sunAngle = dimIndex * 0.85;
  const keyDir = new THREE.Vector3(
    Math.cos(sunAngle) * 0.6,
    0.78,
    Math.sin(sunAngle) * 0.6
  ).normalize();

  rootObject.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj instanceof THREE.InstancedMesh) return;
    const geo = obj.geometry as THREE.BufferGeometry | undefined;
    if (!geo || !geo.attributes.position) return;

    const posAttr = geo.attributes.position;
    const count = posAttr.count;
    // Skip ultra-dense terrain mesh (already has custom shader & vertex colors) or trivial particles
    if (count < 8 || count > 8500 || obj.userData.skipAoShader) return;

    // 1. Compute Vertex-Baked Ambient Occlusion & Indirect Lightmap Attribute (`aBakedAoLightmap` + native vertex color modulation)
    if (!geo.attributes.aBakedAoLightmap) {
      if (!geo.attributes.normal) {
        geo.computeVertexNormals();
      }
      if (!geo.boundingBox) {
        geo.computeBoundingBox();
      }
      const bbox =
        geo.boundingBox ??
        new THREE.Box3(
          new THREE.Vector3(-1, -1, -1),
          new THREE.Vector3(1, 1, 1)
        );
      const minY = bbox.min.y;
      const spanY = Math.max(0.05, bbox.max.y - minY);
      const cx = (bbox.min.x + bbox.max.x) * 0.5;
      const cy = (bbox.min.y + bbox.max.y) * 0.5;
      const cz = (bbox.min.z + bbox.max.z) * 0.5;
      const maxRadius = Math.max(0.1, bbox.min.distanceTo(bbox.max) * 0.5);

      const normAttr = geo.attributes.normal;
      const aoLightArray = new Float32Array(count * 2);
      const hasExistingColor = Boolean(geo.attributes.color);
      const vertexColorArray = hasExistingColor
        ? null
        : new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);
        const nx = normAttr ? normAttr.getX(i) : 0;
        const ny = normAttr ? normAttr.getY(i) : 1;
        const nz = normAttr ? normAttr.getZ(i) : 0;

        // Vertical foundation & overhang cavity occlusion (0 at base/crevice -> 1 at crown)
        const normHeight = THREE.MathUtils.clamp((vy - minY) / spanY, 0, 1);
        const verticalAO = 0.44 + 0.56 * Math.sqrt(normHeight);

        // Concavity / interior fold occlusion for non-Euclidean gyroids, Calabi-Yau rosettes & Escher steps
        const radialDist = Math.hypot(vx - cx, vy - cy, vz - cz);
        const radialNorm = THREE.MathUtils.clamp(radialDist / maxRadius, 0, 1);
        const cavityAO = 0.5 + 0.5 * Math.sqrt(radialNorm);

        // Hemisphere sky occlusion from surface normal
        const skyHemi = THREE.MathUtils.clamp(ny * 0.5 + 0.5, 0, 1);
        const normalAO = 0.48 + 0.52 * skyHemi;

        // Final Vertex-Baked Ambient Occlusion [0.28 .. 1.0]
        const bakedAO = THREE.MathUtils.clamp(
          verticalAO * 0.42 + cavityAO * 0.3 + normalAO * 0.28,
          0.28,
          1.0
        );

        // Baked Indirect Lightmap irradiance (grazing directional bounce + sky dome gradient)
        const nDotL = Math.max(0, nx * keyDir.x + ny * keyDir.y + nz * keyDir.z);
        const bakedLightmap = THREE.MathUtils.clamp(
          0.46 + nDotL * 0.4 + skyHemi * 0.16,
          0.4,
          1.0
        );

        aoLightArray[i * 2] = bakedAO;
        aoLightArray[i * 2 + 1] = bakedLightmap;

        if (vertexColorArray) {
          const combinedShade = THREE.MathUtils.clamp(
            bakedAO * (0.58 + bakedLightmap * 0.42),
            0.32,
            1.0
          );
          // Subtle cool shadow tint in crevices, warm neutral at crown
          vertexColorArray[i * 3] = combinedShade * 0.98;
          vertexColorArray[i * 3 + 1] = combinedShade * 0.99;
          vertexColorArray[i * 3 + 2] = Math.min(1.0, combinedShade * 1.03);
        }
      }

      geo.setAttribute(
        'aBakedAoLightmap',
        new THREE.BufferAttribute(aoLightArray, 2)
      );

      if (vertexColorArray) {
        geo.setAttribute(
          'color',
          new THREE.BufferAttribute(vertexColorArray, 3)
        );
      }
    }

    // 2. Enable Zero-Cost Hardware Vertex-Color AO/Lightmap Shading + Clamp Over-Bright Materials
    const materials = Array.isArray(obj.material)
      ? obj.material
      : [obj.material];

    for (const mat of materials) {
      if (!mat) continue;

      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        if (mat.emissiveIntensity > 0.52) {
          mat.emissiveIntensity = 0.42 + (mat.emissiveIntensity - 0.52) * 0.2;
        }
        mat.envMapIntensity = Math.min(mat.envMapIntensity ?? 0.5, 0.5);
        mat.roughness = Math.max(0.22, mat.roughness);

        if (
          geo.attributes.color &&
          !mat.vertexColors &&
          !mat.userData?.isSharedPooledMaterial
        ) {
          mat.vertexColors = true;
          mat.needsUpdate = true;
        }
      } else if (mat instanceof THREE.MeshBasicMaterial) {
        const hsl = { h: 0, s: 0, l: 0 };
        mat.color.getHSL(hsl);
        if (hsl.l > 0.78 && !mat.wireframe) {
          mat.color.setHSL(hsl.h, hsl.s, 0.72);
        }
      }
    }
  });
}

/**
 * Post-Processing Depth-of-Field (Bokeh Circle-of-Confusion) & Anti-Overexposure Highlight-Compression Shader:
 * 1. Soft-knee filmic highlight compression prevents over-exposure and washed-out whites across all dimensions.
 * 2. Golden-angle spiral Bokeh Depth-of-Field blurs out-of-focus background/peripheral regions based on
 *    focal distance and depth cues while keeping the central focal plane and character/architecture crisp.
 */
export const DepthOfFieldAndExposureGuardShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
    focusDistanceNorm: { value: 0.46 },
    focalRange: { value: 0.34 },
    bokehRadius: { value: 2.1 },
    highlightCompression: { value: 0.36 },
    maxLuminanceCap: { value: 0.92 },
    chromaticAberration: { value: 0.0008 },
    impactFringe: { value: 0.0 },
    ssaoStrength: { value: 0.42 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float focusDistanceNorm;
    uniform float focalRange;
    uniform float bokehRadius;
    uniform float highlightCompression;
    uniform float maxLuminanceCap;
    uniform float chromaticAberration;
    uniform float impactFringe;
    uniform float ssaoStrength;
    varying vec2 vUv;

    // Soft-knee filmic tone compression to prevent over-exposure
    vec3 compressHighlights(vec3 col) {
      vec3 compressed = col / (vec3(1.0) + col * highlightCompression);
      float lum = dot(compressed, vec3(0.2126, 0.7152, 0.0722));
      if (lum > maxLuminanceCap) {
        compressed *= maxLuminanceCap / max(0.001, lum);
      }
      return compressed;
    }

    void main() {
      vec2 centerRel = vUv - 0.5;
      float r2 = dot(centerRel, centerRel);

      // Subtle optical vignette
      float vignette = clamp(1.0 - r2 * 0.42, 0.62, 1.0);

      // 4-Tap Screen-Space Cavity Ambient Occlusion (SSAO micro-crevice darkening)
      vec3 centerCol = texture2D(tDiffuse, vUv).rgb;
      vec2 aoStep = resolution * 1.65;
      vec3 n1 = texture2D(tDiffuse, clamp(vUv + vec2(aoStep.x, aoStep.y), 0.002, 0.998)).rgb;
      vec3 n2 = texture2D(tDiffuse, clamp(vUv + vec2(-aoStep.x, -aoStep.y), 0.002, 0.998)).rgb;
      vec3 n3 = texture2D(tDiffuse, clamp(vUv + vec2(-aoStep.x, aoStep.y), 0.002, 0.998)).rgb;
      vec3 n4 = texture2D(tDiffuse, clamp(vUv + vec2(aoStep.x, -aoStep.y), 0.002, 0.998)).rgb;
      vec3 avgSurround = (n1 + n2 + n3 + n4) * 0.25;
      float centerLum = dot(centerCol, vec3(0.299, 0.587, 0.114));
      float surroundLum = dot(avgSurround, vec3(0.299, 0.587, 0.114));
      float cavityDelta = max(0.0, surroundLum - centerLum);
      float ssaoFactor = clamp(1.0 - cavityDelta * ssaoStrength * 2.4, 0.68, 1.0);
      centerCol *= ssaoFactor;

      // Estimate normalized screen-space depth cue from vertical horizon perspective + radial peripheral falloff
      vec2 rel = vUv - vec2(0.5, 0.46);
      float radialDist = length(rel * vec2(1.0, 1.25));
      float verticalDepthCue = abs(vUv.y - focusDistanceNorm);

      // Circle of Confusion (CoC): 0 inside the central focal zone, smoothly increasing toward far horizon & edges
      float rawCoc = max(0.0, max(verticalDepthCue - focalRange * 0.58, radialDist - 0.36));
      float coc = smoothstep(0.0, 0.55, rawCoc) * bokehRadius;

      if (coc <= 0.14) {
        gl_FragColor = vec4(compressHighlights(centerCol) * vignette, 1.0);
        return;
      }

      // Fast 4-Tap Rotated Poisson Bokeh Kernel utilizing hardware bilinear filtering
      vec2 stepUV = resolution * coc;
      vec3 s1 = texture2D(tDiffuse, clamp(vUv + vec2(0.866, 0.5) * stepUV, 0.002, 0.998)).rgb;
      vec3 s2 = texture2D(tDiffuse, clamp(vUv + vec2(-0.866, -0.5) * stepUV, 0.002, 0.998)).rgb;
      vec3 s3 = texture2D(tDiffuse, clamp(vUv + vec2(-0.5, 0.866) * stepUV, 0.002, 0.998)).rgb;
      vec3 s4 = texture2D(tDiffuse, clamp(vUv + vec2(0.5, -0.866) * stepUV, 0.002, 0.998)).rgb;

      vec3 dofColor = (centerCol * 1.5 + s1 + s2 + s3 + s4) / 5.5;
      gl_FragColor = vec4(compressHighlights(dofColor) * vignette, 1.0);
    }
  `,
};

/**
 * Dynamic Optical Immersion Shader (retained for backwards compatibility)
 */
export const OpticalImmersionShader = DepthOfFieldAndExposureGuardShader;

export interface PhotorealisticPostProcessingPipeline {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  dofPass: ShaderPass;
  vignettePass: ShaderPass;
  opticalPass: ShaderPass;
  fxaaPass: ShaderPass;
  updateSize: (width: number, height: number, pixelRatio: number) => void;
  updateImmersionEffects: (speedRatio: number, impactMagnitude: number, nowSec: number) => void;
}

/**
 * Initializes the high-FPS photorealistic cinematic rendering pipeline:
 * 1. PMREMGenerator + RoomEnvironment for indirect PBR specular reflections
 * 2. Streamlined EffectComposer with RenderPass -> Half-Res UnrealBloomPass -> Unified SSAO + DepthOfFieldAndExposureGuardPass
 */
export function setupPhotorealisticRendererAndPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
  initialBloom = 1.0
): PhotorealisticPostProcessingPipeline {
  const isHeadless =
    IS_SOFTWARE_WEBGL ||
    (typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent)));

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  getProceduralPhotorealisticTerrainTextures(maxAniso);

  const targetPixelRatio = isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(targetPixelRatio);
  renderer.shadowMap.enabled = !isHeadless;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 1. Controlled Studio Environment Reflections via PMREMGenerator & RoomEnvironment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environment = envTexture;
  (scene as unknown as { environmentIntensity?: number }).environmentIntensity = 0.18;
  pmremGenerator.dispose();

  // 2. Streamlined High-Performance EffectComposer (3 total passes instead of 6!)
  const composer = new EffectComposer(renderer);

  // Pass 1: HDR Scene Render
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Pass 2: Half-Resolution Calibrated UnrealBloomPass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(Math.max(1, Math.floor(width * 0.5)), Math.max(1, Math.floor(height * 0.5))),
    Math.min(0.22, initialBloom * 0.14),
    0.3,
    0.94
  );
  composer.addPass(bloomPass);

  // Pass 3: Unified Post-Processing Depth-of-Field (Bokeh CoC), Anti-Overexposure Highlight Compression & Vignette Pass
  const dofPass = new ShaderPass(DepthOfFieldAndExposureGuardShader);
  const pixelRatio = renderer.getPixelRatio();
  dofPass.material.uniforms['resolution'].value.set(
    1 / (width * pixelRatio),
    1 / (height * pixelRatio)
  );
  composer.addPass(dofPass);

  const updateSize = (w: number, h: number, pr: number) => {
    const cappedPr = Math.min(pr, 1.25);
    renderer.setPixelRatio(cappedPr);
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
    dofPass.material.uniforms['resolution'].value.set(1 / (w * cappedPr), 1 / (h * cappedPr));
  };

  let impactDecay = 0;
  const updateImmersionEffects = (speedRatio: number, impactMagnitude: number, nowSec: number) => {
    if (impactMagnitude > impactDecay) {
      impactDecay = Math.min(1.0, impactMagnitude);
    } else {
      impactDecay = Math.max(0, impactDecay - 0.045);
    }

    terrainPhaseUniforms.uPhaseTime.value = nowSec;
    dofPass.material.uniforms.bokehRadius.value = 1.95 + speedRatio * 0.65 + impactDecay * 0.9;
    dofPass.material.uniforms.chromaticAberration.value = 0.0008 + speedRatio * 0.0025;
    dofPass.material.uniforms.impactFringe.value = impactDecay;
  };

  return {
    composer,
    bloomPass,
    dofPass,
    vignettePass: dofPass,
    opticalPass: dofPass,
    fxaaPass: dofPass,
    updateSize,
    updateImmersionEffects,
  };
}

/**
 * Atmospheric Volumetric Sun Shaft Rig:
 * Provides physical sun rays, atmospheric sun disc, and drifting sunlit airborne spore motes
 * that react to the directional sun position and 5D wind vector.
 */
export class AtmosphericSunShaftRig {
  public root: THREE.Group;
  public sunDisc: THREE.Mesh;
  public lightShaftCone: THREE.Mesh;
  public dustMotes: THREE.Points;
  private motePositions: Float32Array;
  private moteSpeeds: Float32Array;
  private moteCount = 380;

  constructor(sunDir: THREE.Vector3, sunColorHex: string) {
    this.root = new THREE.Group();
    this.root.name = 'atmospheric-sun-shaft-rig';

    // 1. High-Atmosphere Sun Disc with Subtle Corona
    const discGeo = new THREE.CircleGeometry(3.4, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(sunColorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sunDisc = new THREE.Mesh(discGeo, discMat);
    this.sunDisc.position.copy(sunDir).multiplyScalar(155);
    this.sunDisc.lookAt(0, 0, 0);
    this.root.add(this.sunDisc);

    // 2. Subtle High-Altitude Atmospheric Light-Shaft Beam Cone (FrontSide & low opacity so it never washes out foreground 3D geometry)
    const coneGeo = new THREE.CylinderGeometry(1.2, 26, 90, 20, 1, true);
    coneGeo.rotateX(Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(sunColorHex),
      transparent: true,
      opacity: 0.012,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    this.lightShaftCone = new THREE.Mesh(coneGeo, coneMat);
    this.lightShaftCone.position.copy(sunDir).multiplyScalar(115);
    this.lightShaftCone.lookAt(0, 0, 0);
    this.root.add(this.lightShaftCone);

    // 3. Floating Airborne Spore / Dust Motes
    const moteGeo = new THREE.BufferGeometry();
    this.motePositions = new Float32Array(this.moteCount * 3);
    this.moteSpeeds = new Float32Array(this.moteCount);

    for (let i = 0; i < this.moteCount; i++) {
      this.motePositions[i * 3] = (Math.random() - 0.5) * 60;
      this.motePositions[i * 3 + 1] = Math.random() * 24 + 0.5;
      this.motePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      this.moteSpeeds[i] = 0.4 + Math.random() * 0.8;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(this.motePositions, 3));

    const moteMat = new THREE.PointsMaterial({
      color: new THREE.Color(sunColorHex),
      size: 0.12,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.dustMotes = new THREE.Points(moteGeo, moteMat);
    this.root.add(this.dustMotes);
  }

  public update(playerPos: THREE.Vector3, windVec: THREE.Vector3, dt: number, nowSec: number) {
    // Keep sun motes centered around player
    const posAttr = this.dustMotes.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.moteCount; i++) {
      const idx = i * 3;
      array[idx] += (windVec.x * 0.6 + Math.sin(nowSec * 1.2 + i) * 0.35) * dt;
      array[idx + 1] += (Math.sin(nowSec * 0.8 + i * 2) * 0.2 - 0.08) * dt;
      array[idx + 2] += (windVec.z * 0.6 + Math.cos(nowSec * 1.2 + i) * 0.35) * dt;

      // Wrap around player box
      const dx = array[idx] - playerPos.x;
      const dy = array[idx + 1] - playerPos.y;
      const dz = array[idx + 2] - playerPos.z;

      if (dx > 30) array[idx] -= 60;
      if (dx < -30) array[idx] += 60;
      if (dy > 20) array[idx + 1] -= 22;
      if (dy < -2) array[idx + 1] += 22;
      if (dz > 30) array[idx + 2] -= 60;
      if (dz < -30) array[idx + 2] += 60;
    }

    posAttr.needsUpdate = true;

    // Atmospheric light shaft subtle breathing
    const coneMat = this.lightShaftCone.material as THREE.MeshBasicMaterial;
    coneMat.opacity = 0.01 + Math.sin(nowSec * 0.75) * 0.005;
  }

  public setAtmosphericProfile(
    sunDir: THREE.Vector3,
    sunColorHex: string,
    shaftOpacity = 0.012
  ) {
    const col = new THREE.Color(sunColorHex);
    this.sunDisc.position.copy(sunDir).multiplyScalar(155);
    this.sunDisc.lookAt(0, 0, 0);
    (this.sunDisc.material as THREE.MeshBasicMaterial).color.copy(col);

    this.lightShaftCone.position.copy(sunDir).multiplyScalar(115);
    this.lightShaftCone.lookAt(0, 0, 0);
    const coneMat = this.lightShaftCone.material as THREE.MeshBasicMaterial;
    coneMat.color.copy(col);
    coneMat.opacity = Math.min(0.018, shaftOpacity);

    (this.dustMotes.material as THREE.PointsMaterial).color.copy(col);
  }
}

/**
 * Procedural Dynamic Micro-Ground Foliage/Moss Cover:
 * Dense, ground-aligned instanced grass/moss blades that cluster around the explorer,
 * sway physically with wind, and provide tactile micro-scale depth to the terrain.
 */
export class MicroGroundCoverRig {
  public mesh: THREE.InstancedMesh;
  private instanceCount = 240;
  private dummy = new THREE.Object3D();
  private basePositions: [number, number][] = [];
  private lastUpdateSec = -1;

  constructor(accentColorHex: string) {
    // Curved tapered blade geometry
    const bladeGeo = new THREE.ConeGeometry(0.06, 0.45, 4, 1);
    bladeGeo.translate(0, 0.225, 0);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColorHex).lerp(new THREE.Color('#10b981'), 0.45),
      roughness: 0.55,
      metalness: 0.08,
      flatShading: false,
    });

    this.mesh = new THREE.InstancedMesh(bladeGeo, bladeMat, this.instanceCount);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    for (let i = 0; i < this.instanceCount; i++) {
      const r = Math.sqrt(Math.random()) * 24.0;
      const theta = Math.random() * Math.PI * 2;
      const lx = Math.cos(theta) * r;
      const lz = Math.sin(theta) * r;
      this.basePositions.push([lx, lz]);
    }
  }

  public update(
    playerPos: THREE.Vector3,
    evaluateHeightFn: (x: number, z: number) => number,
    windVec: THREE.Vector3,
    nowSec: number
  ) {
    // Throttle instanced foliage matrix updates to ~20Hz to save CPU/GPU bus bandwidth
    if (this.lastUpdateSec >= 0 && nowSec - this.lastUpdateSec < 0.048) {
      return;
    }
    this.lastUpdateSec = nowSec;

    const windAngle = Math.atan2(windVec.z, windVec.x);
    const windStrength = Math.min(1.5, windVec.length() * 0.1);

    for (let i = 0; i < this.instanceCount; i++) {
      const [ox, oz] = this.basePositions[i];
      const wx = playerPos.x + ox;
      const wz = playerPos.z + oz;
      const wy = evaluateHeightFn(wx, wz);

      const sway = Math.sin(nowSec * 4.0 + wx * 0.8 + wz * 0.8) * 0.35 * (1.0 + windStrength);

      this.dummy.position.set(wx, wy - 0.02, wz);
      this.dummy.rotation.set(
        Math.sin(windAngle) * (0.2 + sway * 0.4),
        ox + oz,
        Math.cos(windAngle) * (0.2 + sway * 0.4)
      );
      const scaleH = 0.75 + Math.sin(wx * 2.1 + wz * 3.3) * 0.35;
      this.dummy.scale.set(1.0, scaleH, 1.0);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/**
 * Physically Calibrated Dimensional Lighting & Atmospheric Rig Specification
 * Integrates:
 * 1. Cinematic ACESFilmic PBR Lighting with calibrated directional sun irradiance and normal-biased soft shadow mapping
 * 2. Volumetric Chiaroscuro with atmospheric Mie light shafts and floating particulate motes
 * 3. Deep Space Photorealism with high-contrast rim silhouettes, celestial bounce, and ground caustics
 * 4. Hyperbolic Non-Euclidean Riemannian metric saddle geometry factor (hyperbolicK)
 */
export interface DimensionalLightingSpec {
  dimIndex: number;
  name: string;
  sunColor: string;
  sunIntensity: number;
  sunDir: [number, number, number];
  skyColor: string;
  groundHemiColor: string;
  hemiIntensity: number;
  rimColor: string;
  rimIntensity: number;
  causticZenithColor: string;
  causticIntensity: number;
  fogColor: string;
  fogDensity: number;
  hyperbolicK: number; // Curvature factor for non-Euclidean saddle geometry
  volumetricShaftOpacity: number;
  volumetricShaftColor: string;
  exposure: number;
  description: string;
}

export const DIMENSIONAL_LIGHTING_CATALOG: Record<number, DimensionalLightingSpec> = {
  1: {
    dimIndex: 1,
    name: 'Crystalline Hyperbolic Mesa',
    sunColor: '#e2e8f0',
    sunIntensity: 1.25,
    sunDir: [42, 64, 28],
    skyColor: '#070c16', // Deep obsidian-azure night sky so geometry silhouettes pop
    groundHemiColor: '#0f172a',
    hemiIntensity: 0.44,
    rimColor: '#38bdf8',
    rimIntensity: 0.65,
    causticZenithColor: '#38bdf8',
    causticIntensity: 0.45,
    fogColor: '#070c16',
    fogDensity: 0.007,
    hyperbolicK: -0.0065,
    volumetricShaftOpacity: 0.012,
    volumetricShaftColor: '#7dd3fc',
    exposure: 0.88,
    description: 'Crisp directional chiaroscuro lighting, deep obsidian-azure sky dome, and hyperbolic saddle ridges',
  },
  2: {
    dimIndex: 2,
    name: 'Viscous Ferro-Superfluid',
    sunColor: '#f59e0b',
    sunIntensity: 1.18,
    sunDir: [28, 44, 48],
    skyColor: '#110a06',
    groundHemiColor: '#1e293b',
    hemiIntensity: 0.42,
    rimColor: '#fbbf24',
    rimIntensity: 0.62,
    causticZenithColor: '#d97706',
    causticIntensity: 0.42,
    fogColor: '#140b06',
    fogDensity: 0.011,
    hyperbolicK: -0.0022,
    volumetricShaftOpacity: 0.014,
    volumetricShaftColor: '#f59e0b',
    exposure: 0.88,
    description: 'Deep furnace-bronze twilight dome, controlled metallic reflections, and crisp geometric shadow relief',
  },
  3: {
    dimIndex: 3,
    name: 'Aether-Zeolite Aerogel',
    sunColor: '#fde68a',
    sunIntensity: 1.22,
    sunDir: [35, 62, 30],
    skyColor: '#090f0a',
    groundHemiColor: '#1c1917',
    hemiIntensity: 0.46,
    rimColor: '#eab308',
    rimIntensity: 0.58,
    causticZenithColor: '#ca8a04',
    causticIntensity: 0.45,
    fogColor: '#0b120c',
    fogDensity: 0.009,
    hyperbolicK: -0.0008,
    volumetricShaftOpacity: 0.012,
    volumetricShaftColor: '#fde047',
    exposure: 0.88,
    description: 'Warm amber-gold directional rays cutting through dark biodepth spore mist',
  },
  4: {
    dimIndex: 4,
    name: 'Quantum Fermion Condensate',
    sunColor: '#c084fc',
    sunIntensity: 1.15,
    sunDir: [18, 55, -35],
    skyColor: '#04060f',
    groundHemiColor: '#1e1b4b',
    hemiIntensity: 0.38,
    rimColor: '#a855f7',
    rimIntensity: 0.72,
    causticZenithColor: '#c084fc',
    causticIntensity: 0.48,
    fogColor: '#060412',
    fogDensity: 0.0045,
    hyperbolicK: -0.0095,
    volumetricShaftOpacity: 0.01,
    volumetricShaftColor: '#c084fc',
    exposure: 0.86,
    description: 'Sub-kelvin dark void lit by crisp violet Cherenkov rays and quantum horizon geodesics',
  },
  5: {
    dimIndex: 5,
    name: 'Basaltic Heavy Regolith',
    sunColor: '#fb923c',
    sunIntensity: 1.28,
    sunDir: [50, 46, 20],
    skyColor: '#120707',
    groundHemiColor: '#1c1917',
    hemiIntensity: 0.42,
    rimColor: '#f97316',
    rimIntensity: 0.68,
    causticZenithColor: '#ea580c',
    causticIntensity: 0.45,
    fogColor: '#140808',
    fogDensity: 0.012,
    hyperbolicK: -0.0072,
    volumetricShaftOpacity: 0.014,
    volumetricShaftColor: '#ea580c',
    exposure: 0.88,
    description: 'Deep crimson-iron twilight, jagged basalt spires, and stark charcoal shadow contrast',
  },
  6: {
    dimIndex: 6,
    name: 'Fulgurite Vitreous Core',
    sunColor: '#fed7aa',
    sunIntensity: 1.32,
    sunDir: [30, 68, 15],
    skyColor: '#07070b',
    groundHemiColor: '#27272a',
    hemiIntensity: 0.44,
    rimColor: '#fb923c',
    rimIntensity: 0.75,
    causticZenithColor: '#f97316',
    causticIntensity: 0.52,
    fogColor: '#09090f',
    fogDensity: 0.01,
    hyperbolicK: -0.0085,
    volumetricShaftOpacity: 0.014,
    volumetricShaftColor: '#fb923c',
    exposure: 0.88,
    description: 'Obsidian volcanic ash sky with furnace-amber grazing rim light and clear geometric relief',
  },
  7: {
    dimIndex: 7,
    name: 'Void Singularity & Hyperbolic Event Horizon',
    sunColor: '#818cf8',
    sunIntensity: 1.12,
    sunDir: [20, 72, 18],
    skyColor: '#03050c',
    groundHemiColor: '#0f172a',
    hemiIntensity: 0.36,
    rimColor: '#6366f1',
    rimIntensity: 0.78,
    causticZenithColor: '#818cf8',
    causticIntensity: 0.48,
    fogColor: '#03050c',
    fogDensity: 0.005,
    hyperbolicK: -0.0145,
    volumetricShaftOpacity: 0.01,
    volumetricShaftColor: '#6366f1',
    exposure: 0.86,
    description: 'Gravitational light-bending ring, deep indigo event horizon, and hyperbolic Riemannian geodesic collapse',
  },
};

/**
 * Resolves or synthesizes a DimensionalLightingSpec for any dimIndex (including unbounded branched dimensions D8+)
 */
export function resolveDimensionalLightingSpec(dimIndex: number): DimensionalLightingSpec {
  const intDim = Math.round(dimIndex);
  if (DIMENSIONAL_LIGHTING_CATALOG[intDim]) {
    return DIMENSIONAL_LIGHTING_CATALOG[intDim];
  }

  // Procedural Synthesis for Unbounded Higher Dimensions D8+
  const seed = intDim * 8191;
  const hue = (seed % 360);
  const sunCol = new THREE.Color().setHSL(hue / 360, 0.65, 0.72).getHexString();
  const skyCol = new THREE.Color().setHSL((hue + 140) % 360 / 360, 0.6, 0.05).getHexString();
  const groundCol = new THREE.Color().setHSL(hue / 360, 0.4, 0.12).getHexString();
  const rimCol = new THREE.Color().setHSL((hue + 60) % 360 / 360, 0.8, 0.58).getHexString();

  const curvature = -0.005 - ((seed % 100) / 100) * 0.01;

  return {
    dimIndex,
    name: `Branched Horizon Omniverse D${intDim}`,
    sunColor: `#${sunCol}`,
    sunIntensity: 1.2,
    sunDir: [
      30 + Math.sin(intDim) * 20,
      54 + Math.cos(intDim) * 16,
      25 + Math.sin(intDim * 1.5) * 20,
    ],
    skyColor: `#${skyCol}`,
    groundHemiColor: `#${groundCol}`,
    hemiIntensity: 0.42,
    rimColor: `#${rimCol}`,
    rimIntensity: 0.68,
    causticZenithColor: `#${sunCol}`,
    causticIntensity: 0.45,
    fogColor: `#${skyCol}`,
    fogDensity: 0.007,
    hyperbolicK: curvature,
    volumetricShaftOpacity: 0.012,
    volumetricShaftColor: `#${sunCol}`,
    exposure: 0.88,
    description: `Procedurally branched multidimensional horizon with custom hyperbolic curvature (K = ${curvature.toFixed(4)})`,
  };
}

export interface DimensionalLightRigRefs {
  hemiLight: THREE.HemisphereLight | null;
  keyLight: THREE.DirectionalLight | null;
  rimLight: THREE.DirectionalLight | null;
  zenithCausticLight: THREE.PointLight | null;
}

/**
 * Applies complete, cinematic studio lighting, volumetric shafts, sky background, and exponential fog
 * matching the target dimension.
 */
export function applyDimensionalLightingAndAtmosphere(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  lights: DimensionalLightRigRefs,
  sunShaftRig: AtmosphericSunShaftRig | null,
  dimIndex: number
): DimensionalLightingSpec {
  const spec = resolveDimensionalLightingSpec(dimIndex);

  // 1. Sky Background & Exponential Atmospheric Fog
  scene.background = new THREE.Color(spec.skyColor);
  scene.fog = new THREE.FogExp2(spec.fogColor, spec.fogDensity);

  // 2. Physical ACESFilmic Exposure Calibration
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = spec.exposure;

  // 3. Directional Key Sunlight with PCFSoftShadowMap
  if (lights.keyLight) {
    lights.keyLight.color.set(spec.sunColor);
    lights.keyLight.intensity = spec.sunIntensity;
    lights.keyLight.position.set(spec.sunDir[0], spec.sunDir[1], spec.sunDir[2]);
    lights.keyLight.castShadow = true;
    lights.keyLight.shadow.bias = -0.0003;
    lights.keyLight.shadow.normalBias = 0.025;
  }

  // 4. Two-Tone Ambient Fill Hemisphere Light
  if (lights.hemiLight) {
    lights.hemiLight.color.set(spec.skyColor);
    lights.hemiLight.groundColor.set(spec.groundHemiColor);
    lights.hemiLight.intensity = spec.hemiIntensity;
  }

  // 5. High-Contrast Deep Space Photorealistic Rim Light
  if (lights.rimLight) {
    lights.rimLight.color.set(spec.rimColor);
    lights.rimLight.intensity = spec.rimIntensity;
    // Position rim light opposite to sun direction for dramatic grazing silhouettes
    lights.rimLight.position.set(
      -spec.sunDir[0] * 0.8,
      spec.sunDir[1] * 0.45,
      -spec.sunDir[2] * 0.8
    );
  }

  // 6. Localized Ground Caustic & Zenith Energy Light
  if (lights.zenithCausticLight) {
    lights.zenithCausticLight.color.set(spec.causticZenithColor);
    lights.zenithCausticLight.intensity = spec.causticIntensity;
    lights.zenithCausticLight.position.set(0, 48, 0);
  }

  // 7. Volumetric Atmospheric Sun Shaft Beam & Floating Particulate Motes
  if (sunShaftRig) {
    const sunVector = new THREE.Vector3(
      spec.sunDir[0],
      spec.sunDir[1],
      spec.sunDir[2]
    ).normalize();
    sunShaftRig.setAtmosphericProfile(
      sunVector,
      spec.volumetricShaftColor,
      spec.volumetricShaftOpacity
    );
  }

  terrainPhaseUniforms.uWDimension.value = dimIndex;

  return spec;
}

export interface DimensionalPlaceArchitectureRig {
  group: THREE.Group;
  rotors: THREE.Object3D[];
  colliders: { x: number; z: number; radius: number }[];
}

/**
 * Builds Dimension-Specific 3D Non-Euclidean Place Architecture & Megastructures
 * so shifting dimensions transforms the physical 3D place, skyline, monuments, and spatial geometry —
 * not just surface textures! Automatically bakes per-vertex Ambient Occlusion & Lightmaps across all meshes.
 */
export function buildDimensionalPlaceArchitecture(
  dimIndex: number,
  evalHeight: (x: number, z: number) => number
): DimensionalPlaceArchitectureRig {
  const group = new THREE.Group();
  group.name = `dimensional-place-architecture-d${Math.round(dimIndex)}`;
  const rotors: THREE.Object3D[] = [];
  const colliders: { x: number; z: number; radius: number }[] = [];

  const intDim = Math.round(dimIndex);
  const mode = ((Math.abs(intDim - 1) % 7) + 7) % 7;
  const spec = resolveDimensionalLightingSpec(dimIndex);

  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.rimColor).lerp(new THREE.Color('#1e293b'), 0.55),
    emissive: new THREE.Color(spec.rimColor),
    emissiveIntensity: 0.18,
    roughness: 0.38,
    metalness: 0.62,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.sunColor).lerp(new THREE.Color('#0f172a'), 0.65),
    emissive: new THREE.Color(spec.causticZenithColor),
    emissiveIntensity: 0.22,
    roughness: 0.3,
    metalness: 0.74,
  });

  const darkStoneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0f172a').lerp(new THREE.Color(spec.groundHemiColor), 0.5),
    roughness: 0.65,
    metalness: 0.28,
  });

  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + mode * 0.42;
    const dist = 19 + (i % 2) * 11;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = evalHeight(x, z);

    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(x, y - 0.2, z);
    nodeGroup.rotation.y = -angle + Math.PI * 0.5;

    if (mode === 0) {
      // D1: Crystalline Hyper-Mesa Hexagonal Colonnade & Sky-Bridge Pylons
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.45, 9.5, 6),
        darkStoneMat
      );
      pillar.position.y = 4.75;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      nodeGroup.add(pillar);

      const archBeam = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.85, 1.4),
        primaryMat
      );
      archBeam.position.set(0, 9.2, 0);
      archBeam.castShadow = true;
      archBeam.receiveShadow = true;
      nodeGroup.add(archBeam);

      const crystalCrown = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.35, 0),
        secondaryMat
      );
      crystalCrown.position.set(0, 11.4, 0);
      crystalCrown.userData.isKineticRotor = true;
      crystalCrown.userData.spinAxis = 'y';
      nodeGroup.add(crystalCrown);
      rotors.push(crystalCrown);
    } else if (mode === 1) {
      // D2: Ferro-Superfluid Toroidal Flux Arches & Suspended Meniscus Gyroscopes
      const torusArch = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.55, 12, 32, Math.PI),
        primaryMat
      );
      torusArch.position.y = 0.2;
      torusArch.castShadow = true;
      torusArch.receiveShadow = true;
      nodeGroup.add(torusArch);

      const gyroRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.85, 0.22, 10, 28),
        secondaryMat
      );
      gyroRing.position.set(0, 4.2, 0);
      gyroRing.userData.isKineticRotor = true;
      gyroRing.userData.spinAxis = 'x';
      nodeGroup.add(gyroRing);
      rotors.push(gyroRing);
    } else if (mode === 2) {
      // D3: Aether-Zeolite Cathedral Rib-Vault Needles & Spore Thuribles
      for (let r = -1; r <= 1; r += 2) {
        const rib = new THREE.Mesh(
          new THREE.ConeGeometry(0.95, 13.5, 5),
          darkStoneMat
        );
        rib.position.set(r * 1.8, 6.5, 0);
        rib.rotation.z = -r * 0.22;
        rib.castShadow = true;
        rib.receiveShadow = true;
        nodeGroup.add(rib);
      }
      const lantern = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2, 0),
        secondaryMat
      );
      lantern.position.set(0, 8.2, 0);
      lantern.userData.isKineticRotor = true;
      lantern.userData.spinAxis = 'y';
      nodeGroup.add(lantern);
      rotors.push(lantern);
    } else if (mode === 3) {
      // D4: Quantum Fermion Escher Impossible Stairways & Penrose Sky-Cages
      for (let s = 0; s < 6; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.45, 1.2),
          s % 2 === 0 ? primaryMat : darkStoneMat
        );
        step.position.set(
          Math.cos(s * 0.65) * 1.8,
          1.2 + s * 1.35,
          Math.sin(s * 0.65) * 1.8
        );
        step.rotation.y = s * 0.65;
        step.castShadow = true;
        step.receiveShadow = true;
        nodeGroup.add(step);
      }
      const tesseractCage = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.4, 2.4),
        secondaryMat
      );
      tesseractCage.position.set(0, 10.5, 0);
      tesseractCage.userData.isKineticRotor = true;
      tesseractCage.userData.spinAxis = 'z';
      nodeGroup.add(tesseractCage);
      rotors.push(tesseractCage);
    } else if (mode === 4) {
      // D5: Basaltic Subduction Brutalist Viaduct Pylons & Tectonic Monoliths
      const monolithL = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 11.0, 2.4),
        darkStoneMat
      );
      monolithL.position.set(-1.9, 5.5, 0);
      monolithL.castShadow = true;
      monolithL.receiveShadow = true;
      nodeGroup.add(monolithL);

      const monolithR = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 11.0, 2.4),
        darkStoneMat
      );
      monolithR.position.set(1.9, 5.5, 0);
      monolithR.castShadow = true;
      monolithR.receiveShadow = true;
      nodeGroup.add(monolithR);

      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 1.5, 2.8),
        primaryMat
      );
      lintel.position.set(0, 10.6, 0);
      lintel.castShadow = true;
      lintel.receiveShadow = true;
      nodeGroup.add(lintel);
    } else if (mode === 5) {
      // D6: Fulgurite Vitreous Helical Lightning Towers & Corona Coils
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 1.6, 12.5, 8),
        darkStoneMat
      );
      tower.position.y = 6.25;
      tower.castShadow = true;
      tower.receiveShadow = true;
      nodeGroup.add(tower);

      for (let c = 0; c < 3; c++) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(1.9 - c * 0.3, 0.16, 10, 24),
          secondaryMat
        );
        coil.position.set(0, 5.0 + c * 2.6, 0);
        coil.rotation.x = Math.PI * 0.5 + (c - 1) * 0.25;
        coil.userData.isKineticRotor = true;
        coil.userData.spinAxis = 'z';
        nodeGroup.add(coil);
        rotors.push(coil);
      }
    } else {
      // D7+: Singularity Event-Horizon Inverted Floating Ziggurat & Accretion Rings
      const invertedZiggurat = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 6.5, 4),
        darkStoneMat
      );
      invertedZiggurat.position.set(0, 7.5, 0);
      invertedZiggurat.rotation.x = Math.PI;
      invertedZiggurat.castShadow = true;
      invertedZiggurat.receiveShadow = true;
      nodeGroup.add(invertedZiggurat);

      const accretionHalo = new THREE.Mesh(
        new THREE.TorusGeometry(3.4, 0.24, 12, 36),
        secondaryMat
      );
      accretionHalo.position.set(0, 7.5, 0);
      accretionHalo.rotation.x = 1.1;
      accretionHalo.userData.isKineticRotor = true;
      accretionHalo.userData.spinAxis = 'y';
      nodeGroup.add(accretionHalo);
      rotors.push(accretionHalo);
    }

    colliders.push({ x, z, radius: 2.1 });
    group.add(nodeGroup);
  }

  // Central Overarching Dimensional Sky-Vault Ring that morphs its geometry per dimension
  const skyVaultGroup = new THREE.Group();
  skyVaultGroup.position.set(0, 24 + (mode % 3) * 4, 0);
  const skyRing = new THREE.Mesh(
    new THREE.TorusGeometry(28 + mode * 2.5, 0.65, 12, 48),
    primaryMat
  );
  skyRing.rotation.x = Math.PI * 0.5 + (mode - 3) * 0.18;
  skyRing.userData.isKineticRotor = true;
  skyRing.userData.spinAxis = 'z';
  skyVaultGroup.add(skyRing);
  rotors.push(skyRing);
  group.add(skyVaultGroup);

  // Bake per-vertex Ambient Occlusion & Lightmap across all meshes in this dimensional place
  bakeVertexAmbientOcclusionAndLightmap(group, dimIndex);

  return { group, rotors, colliders };
}

