'use client';

import React, { useEffect, useState } from 'react';

interface Dice3DProps {
  value: number;
  rollId?: string;
  glowColor?: string;
}

/* ─── Face dot layout ─── */
const DOT_PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/* ─── Final orientation per value ─── */
const TARGET_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0,    y: 0   },
  2: { x: 0,    y: -90 },
  3: { x: -90,  y: 0   },
  4: { x: 90,   y: 0   },
  5: { x: 0,    y: 90  },
  6: { x: 180,  y: 0   },
};

/* shared face wrapper style — no border, backface hidden */
const faceWrapper = (transform: string): React.CSSProperties => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transform,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  border: 'none',
  outline: 'none',
});

function Face({ dots, shade = '#f8fafc' }: { dots: number[]; shade?: string }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: `linear-gradient(145deg, #ffffff 0%, ${shade} 60%, #c8d4e0 100%)`,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      outline: 'none',
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.12)',
      overflow: 'hidden',
    }}>
      {/* Gloss overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)',
        borderRadius: '10px 10px 60% 60%',
        pointerEvents: 'none',
      }} />
      {/* Dot grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 5,
        width: '66%',
        height: '66%',
        position: 'relative',
        zIndex: 1,
      }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            borderRadius: '50%',
            border: 'none',
            outline: 'none',
            background: dots.includes(i)
              ? 'radial-gradient(circle at 35% 30%, #64748b, #1e293b)'
              : 'transparent',
            boxShadow: dots.includes(i)
              ? 'inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.15)'
              : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function Dice3D({ value, rollId, glowColor = 'rgba(99,102,241,0.5)' }: Dice3DProps) {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!rollId) return;

    setIsRolling(true);

    const { x: targetX, y: targetY } = TARGET_ROTATION[value] ?? { x: 0, y: 0 };
    const extraSpinsX = (Math.floor(Math.random() * 2) + 3) * 360;
    const extraSpinsY = (Math.floor(Math.random() * 2) + 3) * 360;

    setRotX(prev => {
      let mod = prev % 360;
      if (mod < 0) mod += 360;
      let diff = targetX - mod;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return prev + diff + extraSpinsX;
    });

    setRotY(prev => {
      let mod = prev % 360;
      if (mod < 0) mod += 360;
      let diff = targetY - mod;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return prev + diff + extraSpinsY;
    });

    const t = setTimeout(() => setIsRolling(false), 900);
    return () => clearTimeout(t);
  }, [rollId, value]);

  const S = 58; // cube side length in px
  const half = S / 2;

  return (
    <div style={{
      width: S, height: S,
      position: 'relative',
      perspective: 320,
      perspectiveOrigin: '50% 50%',
      border: 'none',
      outline: 'none',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: -8,
        borderRadius: '50%',
        background: glowColor,
        filter: 'blur(14px)',
        opacity: isRolling ? 0.25 : 0.7,
        transition: 'opacity 0.9s',
        pointerEvents: 'none',
        border: 'none',
        zIndex: 0,
      }} />

      {/* 3-D cube */}
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transition: isRolling
          ? 'transform 0.9s cubic-bezier(0.15, 0.85, 0.25, 1)'
          : 'transform 0.9s cubic-bezier(0.15, 0.85, 0.25, 1)',
        zIndex: 1,
        border: 'none',
        outline: 'none',
      }}>
        {/* Front  → shows 1 */}
        <div style={faceWrapper(`translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[1]} />
        </div>
        {/* Back   → shows 6 */}
        <div style={faceWrapper(`rotateY(180deg) translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[6]} shade="#dde8f2" />
        </div>
        {/* Right  → shows 5 */}
        <div style={faceWrapper(`rotateY(90deg) translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[5]} shade="#e8f0f8" />
        </div>
        {/* Left   → shows 2 */}
        <div style={faceWrapper(`rotateY(-90deg) translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[2]} shade="#e0ecf6" />
        </div>
        {/* Top    → shows 4 */}
        <div style={faceWrapper(`rotateX(90deg) translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[4]} shade="#e4eef8" />
        </div>
        {/* Bottom → shows 3 */}
        <div style={faceWrapper(`rotateX(-90deg) translateZ(${half}px)`)}>
          <Face dots={DOT_PATTERNS[3]} shade="#d8e6f0" />
        </div>
      </div>
    </div>
  );
}
