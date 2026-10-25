import React from 'react';
import { InterconnectednessTelemetry } from '../types/manifold';

interface InterconnectednessWebOverlayProps {
  telemetry: InterconnectednessTelemetry | null;
  wCoord: number;
  explorerSpeed: number;
  voidOrbColor: string;
  accentColor: string;
  hudOpacity: number;
}

/**
 * Renders a calm, ultra-clean Perimeter Symbiotic Frame along the outer viewport edges
 * so the 3D world in the center remains 100% pure and unobstructed while subtle
 * harmonic filaments breathe around the outer margin.
 */
export const InterconnectednessWebOverlay: React.FC<
  InterconnectednessWebOverlayProps
> = ({
  telemetry,
  wCoord,
  explorerSpeed,
  voidOrbColor,
  accentColor,
  hudOpacity,
}) => {
  const coherence = telemetry?.entrainmentCoherence ?? 0.35;
  const tethers = telemetry?.activePlayerTethers ?? 2;

  const curveShift = Math.round(wCoord * 12);
  const pulseDurationSec = Math.max(
    2.4,
    5.5 - coherence * 2.0 - Math.min(1.2, explorerSpeed * 0.06)
  ).toFixed(2);

  const filamentOpacity = Math.min(
    0.32,
    (0.1 + coherence * 0.16) * hudOpacity
  );

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] w-full h-full overflow-hidden"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="synaptic-grad-perimeter"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={voidOrbColor} stopOpacity="0.65" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={voidOrbColor} stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* Left Perimeter Margin Filament (Never crosses center viewport) */}
      <path
        d={`M 14 80 Q ${22 + curveShift} 500 14 920`}
        fill="none"
        stroke="url(#synaptic-grad-perimeter)"
        strokeWidth={1}
        strokeOpacity={filamentOpacity}
      />

      {/* Right Perimeter Margin Filament (Never crosses center viewport) */}
      <path
        d={`M 986 80 Q ${978 - curveShift} 500 986 920`}
        fill="none"
        stroke="url(#synaptic-grad-perimeter)"
        strokeWidth={1}
        strokeOpacity={filamentOpacity}
      />

      {/* Subtle Travelling Perimeter Pulse */}
      {tethers > 0 && (
        <>
          <circle r="2.2" fill={voidOrbColor} opacity={0.45 * hudOpacity}>
            <animateMotion
              dur={`${pulseDurationSec}s`}
              repeatCount="indefinite"
              path={`M 14 80 Q ${22 + curveShift} 500 14 920`}
            />
          </circle>
          <circle r="2.2" fill={accentColor} opacity={0.45 * hudOpacity}>
            <animateMotion
              dur={`${pulseDurationSec}s`}
              begin="1.2s"
              repeatCount="indefinite"
              path={`M 986 920 Q ${978 - curveShift} 500 986 80`}
            />
          </circle>
        </>
      )}
    </svg>
  );
};
