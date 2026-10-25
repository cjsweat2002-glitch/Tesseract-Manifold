import React from 'react';
import { GravityVehicleState } from '../types/manifold';

interface GravityVehicleFlightHUDProps {
  vehicleState: GravityVehicleState;
  onMountToggle: () => void;
  onTriggerCosmicShift: () => void;
  activeCosmologyTitle: string;
}

export const GravityVehicleFlightHUD: React.FC<GravityVehicleFlightHUDProps> = ({
  vehicleState,
  onMountToggle,
  onTriggerCosmicShift,
  activeCosmologyTitle,
}) => {
  const {
    isMounted,
    closedLoopPowerMW,
    closedLoopEnergyCharge,
    gravitationalCompression,
    airspeedKmh,
    altitudeM,
    flightMode,
    spaceShiftCooldown,
    rotation,
  } = vehicleState;

  const machSpeed = (airspeedKmh / 1234.8).toFixed(2);
  const [pitchRad, yawRad, rollRad] = rotation;
  const pitchDeg = Math.round((pitchRad * 180) / Math.PI);
  const rollDeg = Math.round((rollRad * 180) / Math.PI);

  const modeBadgeColor =
    flightMode === 'orbital-vacuum'
      ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
      : flightMode === 'atmospheric-glide'
      ? 'bg-sky-950/80 text-sky-300 border-sky-500/50'
      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';

  return (
    <div className="pointer-events-none select-none font-mono">
      {/* Flight Cockpit Reticle & Artificial Horizon Ladder (Visible only when mounted) */}
      {isMounted && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          {/* Artificial Horizon Pitch Lines */}
          <div
            className="w-48 h-32 relative border-x border-cyan-500/30 flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `rotate(${-rollDeg}deg) translateY(${pitchDeg * 1.5}px)`,
            }}
          >
            {/* Center Boresight Pip */}
            <div className="w-3 h-3 border border-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-cyan-300 rounded-full" />
            </div>
            {/* Left and Right Horizon Bars */}
            <div className="absolute left-0 w-8 h-[1px] bg-cyan-400/60" />
            <div className="absolute right-0 w-8 h-[1px] bg-cyan-400/60" />

            {/* Pitch rung ladder */}
            <div className="absolute -top-6 w-16 h-[1px] bg-cyan-400/40 text-[8px] text-cyan-300 text-center">
              +10°
            </div>
            <div className="absolute -bottom-6 w-16 h-[1px] bg-cyan-400/40 text-[8px] text-cyan-300 text-center">
              -10°
            </div>
          </div>
        </div>
      )}

      {/* Primary Flight Telemetry Instrument Panel (Top-Right or Floating) */}
      <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 text-white max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isMounted ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
              5D Aether-Rider
            </span>
          </div>

          {/* Mount / Dismount Button */}
          <button
            onClick={onMountToggle}
            className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
              isMounted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
            }`}
          >
            {isMounted ? 'DISMOUNT [G]' : 'PILOT VEHICLE [G]'}
          </button>
        </div>

        {/* Flight Mode & Target Celestial Body */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${modeBadgeColor}`}
          >
            {flightMode.replace('-', ' ')}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-[170px]" title={activeCosmologyTitle}>
            🪐 {activeCosmologyTitle}
          </span>
        </div>

        {/* Core Kinematic Telemetry */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5 bg-slate-900/70 p-2 rounded border border-white/5">
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Airspeed / Mach</div>
            <div className="text-base font-bold text-cyan-200">
              {airspeedKmh}{' '}
              <span className="text-xs font-normal text-slate-400">km/h</span>{' '}
              <span className="text-xs font-semibold text-amber-400">
                (M {machSpeed})
              </span>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-slate-400 uppercase">Orbital Altitude</div>
            <div className="text-base font-bold text-emerald-300">
              {altitudeM.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-slate-400 uppercase">Closed-Loop Power</div>
            <div className="font-semibold text-cyan-300">
              {closedLoopPowerMW}{' '}
              <span className="text-[10px] text-slate-400">MW</span>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-slate-400 uppercase">G-Compression (Gc)</div>
            <div className="font-semibold text-purple-300">
              {gravitationalCompression}x
            </div>
          </div>
        </div>

        {/* Closed-Loop Storage Charge Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>CLOSED-LOOP FLUX CHARGE</span>
            <span className="text-cyan-400 font-bold">
              {closedLoopEnergyCharge.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${closedLoopEnergyCharge}%` }}
            />
          </div>
        </div>

        {/* Cosmic Shift Mass Driver Trigger */}
        <div className="border-t border-white/10 pt-2 flex items-center justify-between">
          <div className="text-[10px] text-slate-300">
            Cosmic Shift Emitter
          </div>
          <button
            onClick={onTriggerCosmicShift}
            disabled={spaceShiftCooldown > 0}
            className={`text-[10px] font-bold px-2.5 py-1 rounded border transition-colors ${
              spaceShiftCooldown <= 0
                ? 'bg-purple-950/70 border-purple-500/60 text-purple-200 hover:bg-purple-900/80 cursor-pointer'
                : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            {spaceShiftCooldown <= 0
              ? 'PULSE EMITTER [R]'
              : `RECHARGING (${spaceShiftCooldown.toFixed(1)}s)`}
          </button>
        </div>

        {/* Flight Controls Legend when Mounted */}
        {isMounted && (
          <div className="border-t border-white/10 pt-2 mt-2 text-[9px] text-slate-400 space-y-0.5">
            <div className="text-cyan-400 font-semibold mb-0.5">PILOT CONTROLS:</div>
            <div>• W / S : Pitch down / up & linear thrust</div>
            <div>• A / D : Bank roll & lateral strafe</div>
            <div>• SPACE / SHIFT : Vertical VTOL heave</div>
            <div>• Q / E : Yaw steering</div>
            <div>• TAB : Closed-Loop Warp Boost</div>
            <div>• R : Cosmic Shift Mass Driver</div>
            <div>• G : Dismount Vehicle</div>
          </div>
        )}
      </div>
    </div>
  );
};
