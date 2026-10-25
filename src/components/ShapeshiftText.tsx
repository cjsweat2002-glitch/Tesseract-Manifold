import React, { useEffect, useState } from 'react';
import { GameOptionsConfig } from '../types/manifold';

const GIF_FONT_FRAMES = [
  { family: "'Chakra Petch', sans-serif", style: 'normal', weight: 700, skew: 0 },
  { family: "'Cinzel', serif", style: 'normal', weight: 700, skew: -3 },
  { family: "'Syne', sans-serif", style: 'normal', weight: 800, skew: 2 },
  { family: "'Cormorant Garamond', serif", style: 'italic', weight: 700, skew: -4 },
  { family: "'Orbitron', sans-serif", style: 'normal', weight: 700, skew: 3 },
  { family: "'Fraunces', serif", style: 'italic', weight: 600, skew: -2 },
  { family: "'JetBrains Mono', monospace", style: 'normal', weight: 600, skew: 0 },
];

interface ShapeshiftTextProps {
  text: string;
  options: GameOptionsConfig;
  fallbackFont?: string;
  className?: string;
  phaseSeed?: number;
}

export const ShapeshiftText: React.FC<ShapeshiftTextProps> = ({
  text,
  options,
  fallbackFont = "'Chakra Petch', sans-serif",
  className = '',
  phaseSeed = 0,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (options.gifTypographyStyle === 'calm-static') return;
    const intervalMs = Math.max(85, Math.round(1000 / Math.max(1, options.gifFrameRateFps)));
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 700);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [options.gifTypographyStyle, options.gifFrameRateFps]);

  if (options.gifTypographyStyle === 'calm-static') {
    return (
      <span style={{ fontFamily: fallbackFont }} className={className}>
        {text}
      </span>
    );
  }

  const chromaticClass = options.gifChromaticSplit ? 'gif-chromatic-text' : '';

  if (options.gifTypographyStyle === 'whole-phrase-gif') {
    const frame =
      GIF_FONT_FRAMES[(tick + phaseSeed) % GIF_FONT_FRAMES.length];
    return (
      <span
        style={{
          fontFamily: frame.family,
          fontStyle: frame.style,
          fontWeight: frame.weight,
          display: 'inline-block',
          transform: options.gifSkewMorph
            ? `skewX(${frame.skew}deg)`
            : undefined,
        }}
        className={`${className} ${chromaticClass}`}
      >
        {text}
      </span>
    );
  }

  if (options.gifTypographyStyle === 'per-word-gif') {
    const words = text.split(' ');
    return (
      <span className={`${className} ${chromaticClass}`}>
        {words.map((word, wIdx) => {
          const frame =
            GIF_FONT_FRAMES[
              (tick + wIdx * 2 + phaseSeed) % GIF_FONT_FRAMES.length
            ];
          return (
            <React.Fragment key={wIdx}>
              <span
                style={{
                  fontFamily: frame.family,
                  fontStyle: frame.style,
                  fontWeight: frame.weight,
                  display: 'inline-block',
                  transform: options.gifSkewMorph
                    ? `skewX(${frame.skew}deg)`
                    : undefined,
                }}
              >
                {word}
              </span>
              {wIdx < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </span>
    );
  }

  // 'per-char-gif': Each character shapeshifts across the 7 fonts like a living kinetic GIF
  const chars = Array.from(text);
  return (
    <span className={`${className} ${chromaticClass}`}>
      {chars.map((ch, cIdx) => {
        if (ch === ' ') {
          return <span key={cIdx}>&nbsp;</span>;
        }
        const frame =
          GIF_FONT_FRAMES[
            (tick + cIdx + phaseSeed) % GIF_FONT_FRAMES.length
          ];
        return (
          <span
            key={cIdx}
            style={{
              fontFamily: frame.family,
              fontStyle: frame.style,
              fontWeight: frame.weight,
              display: 'inline-block',
              transform: options.gifSkewMorph
                ? `skewX(${frame.skew}deg)`
                : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
