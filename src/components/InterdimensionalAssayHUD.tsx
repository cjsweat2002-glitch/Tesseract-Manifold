import React from 'react';
import {
  getSoilPropertiesForDimension,
  DIMENSION_BRANCH_REGISTRY,
} from '../utils/interdimensionalChemistry';
import { resolveCosmologyForDimension } from '../utils/celestialCosmologyEngine';

interface InterdimensionalAssayHUDProps {
  dimIndex: number;
  onChangeDimension: (newDim: number) => void;
  onShiftRandomDimension: () => void;
}

export const InterdimensionalAssayHUD: React.FC<InterdimensionalAssayHUDProps> = ({
  dimIndex,
  onChangeDimension,
  onShiftRandomDimension,
}) => {
  const soilProps = getSoilPropertiesForDimension(dimIndex);
  const currentElem = soilProps.element;
  const cosmoSpec = resolveCosmologyForDimension(dimIndex);
  const branchIter = currentElem.branchIteration;

  const presets = [
    { dim: 1.0, label: 'D1: Planck 0D', icon: '⚛️' },
    { dim: 2.0, label: 'D2: Flatland', icon: '📐' },
    { dim: 3.0, label: 'D3: Pelagic', icon: '🌊' },
    { dim: 4.0, label: 'D4: Euclidean', icon: '🏛️' },
    { dim: 5.0, label: 'D5: Hyperbolic', icon: '🌀' },
    { dim: 6.0, label: 'D6: Tachyon', icon: '🌿' },
    { dim: 7.0, label: 'D7: Relativistic', icon: '⏳' },
    { dim: 8.0, label: 'D8: Acoustic', icon: '🔊' },
    { dim: 9.0, label: 'D9: Magma Core', icon: '🌋' },
    { dim: 10.0, label: 'D10: Calabi-Yau', icon: '💎' },
    { dim: 11.0, label: 'D11: Akashic', icon: '👁️' },
    { dim: 12.0, label: 'D12: Omega', icon: '🌌' },
  ];

  return (
    <div className="bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white max-w-sm font-sans shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Interdimensional Periodic Assay
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span>DIM {dimIndex.toFixed(2)}</span>
          {branchIter > 1 && (
            <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
              BR-{branchIter}
            </span>
          )}
        </div>
      </div>

      {/* Spectrum Slider */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>DIMENSIONAL SPECTRUM RANGE</span>
          <span className="text-cyan-400 font-bold">{dimIndex.toFixed(2)} / 12.00</span>
        </div>
        <input
          type="range"
          min={1.0}
          max={12.0}
          step={0.05}
          value={dimIndex}
          onChange={(e) => onChangeDimension(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        {/* Preset quick buttons */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {presets.map((p) => (
            <button
              key={p.dim}
              onClick={() => onChangeDimension(p.dim)}
              className={`text-[9px] font-mono py-1 px-1.5 rounded border transition-colors ${
                Math.abs(dimIndex - p.dim) < 0.25
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 font-bold'
                  : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
          <button
            onClick={onShiftRandomDimension}
            className="text-[9px] font-mono py-1 px-1.5 rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition-colors col-span-4 font-bold"
            title="Quantum Shift to Random Dimension (D1-D12)"
          >
            🎲 QUANTUM SHIFT ACROSS 12D SPECTRUM
          </button>
        </div>
      </div>

      {/* Active Chemical Element Assay Card */}
      <div className="bg-slate-900/90 rounded border border-white/5 p-2.5 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Isotopic Designation
            </div>
            <div className="text-sm font-mono font-bold text-cyan-200">
              {currentElem.name}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-extrabold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              {currentElem.symbol}
            </span>
          </div>
        </div>

        {/* State of matter badge & fracture style */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">STATE:</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold border border-white/10 uppercase">
              {currentElem.stateOfMatter.replace(/-/g, ' ')}
            </span>
          </div>
          <span className="text-slate-400 italic">
            {soilProps.excavationTextureStyle.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Physical ground interaction parameters */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10px] font-mono">
          <div>
            <span className="text-slate-400">Bulk Density:</span>
            <div className="font-semibold text-slate-200">
              {soilProps.bulkDensityGcm3.toFixed(2)} g/cm³
            </div>
          </div>
          <div>
            <span className="text-slate-400">Mohs Hardness:</span>
            <div className="font-semibold text-amber-300">
              {soilProps.effectiveHardnessMohs.toFixed(1)} / 10.0
            </div>
          </div>
          <div>
            <span className="text-slate-400">Grain Diameter:</span>
            <div className="font-semibold text-slate-200">
              {currentElem.grainSizeMicrons >= 1 ? `${currentElem.grainSizeMicrons} µm` : `${(currentElem.grainSizeMicrons * 1000).toFixed(0)} nm`}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Ground Friction:</span>
            <div className="font-semibold text-cyan-300">
              μ = {currentElem.frictionCoefficient.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Scientific Lore */}
        <p className="text-[10px] text-slate-300 italic leading-snug border-t border-white/5 pt-1.5">
          {currentElem.lore}
        </p>
      </div>

      {/* Coupled Celestial Planetary Geometry & Outer Space Body */}
      <div className="mt-2 bg-slate-900/90 rounded border border-purple-500/20 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Celestial Planetary Topology
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50 uppercase font-semibold">
            {cosmoSpec.celestialShape.replace(/-/g, ' ')}
          </span>
        </div>
        <div className="text-xs font-mono font-bold text-purple-100">
          {cosmoSpec.title}
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Domain: <span className="text-slate-200">{cosmoSpec.outerSpaceTitle}</span> | Lensing: <span className="text-purple-300">{(cosmoSpec.gravitationalLensing * 100).toFixed(0)}%</span>
        </div>
        <p className="text-[9.5px] text-slate-300 italic leading-snug border-t border-white/5 pt-1">
          {cosmoSpec.lore}
        </p>
      </div>
    </div>
  );
};
