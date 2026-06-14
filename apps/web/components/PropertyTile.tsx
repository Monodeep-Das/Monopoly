'use client';

import React from 'react';
import PlayerToken from './PlayerToken';

interface PropertyTileProps {
  id: number;
  name: string;
  icon?: string;
  flag?: string;
  price?: number;
  color?: string;
  type: 'property' | 'special' | 'corner';
  owner?: number;
  ownerColor?: string;
  houses?: number;
  hotels?: number;
  playersOnSpace?: Array<{ id: number; name: string; position: number; color: string; cash: number }>;
  rotation?: number;
}

// Vibrant gradient color bands per property group
const COLOR_GRADIENTS: Record<string, { gradient: string; glow: string; text: string }> = {
  'brown':     { gradient: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)', glow: 'rgba(120,53,15,0.8)',   text: '#fde68a' },
  'light-blue':{ gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', glow: 'rgba(14,165,233,0.8)', text: '#e0f2fe' },
  'pink':      { gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', glow: 'rgba(236,72,153,0.8)', text: '#fce7f3' },
  'orange':    { gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', glow: 'rgba(234,88,12,0.8)',  text: '#ffedd5' },
  'red':       { gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)', glow: 'rgba(220,38,38,0.8)',  text: '#fee2e2' },
  'yellow':    { gradient: 'linear-gradient(135deg, #fde047 0%, #ca8a04 100%)', glow: 'rgba(202,138,4,0.8)',  text: '#1a1200' },
  'green':     { gradient: 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)', glow: 'rgba(21,128,61,0.8)',  text: '#dcfce7' },
  'dark-blue': { gradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)', glow: 'rgba(29,78,216,0.8)',  text: '#dbeafe' },
  'railroad':  { gradient: 'linear-gradient(135deg, #94a3b8 0%, #374151 100%)', glow: 'rgba(55,65,81,0.8)',   text: '#f1f5f9' },
  'utility':   { gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)', glow: 'rgba(15,118,110,0.8)', text: '#ccfbf1' },
};

// Special tile accent colors
const SPECIAL_ACCENTS: Record<string, { bg: string; icon: string }> = {
  'Earnings Tax':  { bg: 'rgba(251,191,36,0.12)',  icon: '💰' },
  'Surprise':      { bg: 'rgba(139,92,246,0.12)',   icon: '❓' },
  'Free Parking':  { bg: 'rgba(34,197,94,0.10)',    icon: '🅿️' },
  'Jackpot':       { bg: 'rgba(236,72,153,0.12)',   icon: '🎁' },
  'Chance':        { bg: 'rgba(245,158,11,0.12)',   icon: '🎲' },
  'Luxury Tax':    { bg: 'rgba(239,68,68,0.12)',    icon: '💸' },
};

// Player ownership glow colors
const OWNER_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#3b82f6',
  3: '#eab308',
  4: '#22c55e',
};

function DiceFace({ value }: { value: number }) {
  const dots: boolean[][] = [
    [false, false, false, false, false, false, false, false, false], // 0-indexed, grid 3x3
  ];

  // positions: [0]=TL [1]=TC [2]=TR [3]=ML [4]=MC [5]=MR [6]=BL [7]=BC [8]=BR
  const dotPatterns: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const active = dotPatterns[value] || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, width: '65%', height: '65%' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: '50%',
            background: active.includes(i) ? '#1e293b' : 'transparent',
            boxShadow: active.includes(i) ? 'inset 0 1px 2px rgba(0,0,0,0.4)' : 'none',
            aspectRatio: '1',
          }}
        />
      ))}
    </div>
  );
}

export default function PropertyTile({
  id,
  name,
  icon,
  flag,
  price,
  color,
  type,
  owner,
  ownerColor,
  houses = 0,
  hotels = 0,
  playersOnSpace = [],
  rotation = 0,
}: PropertyTileProps) {
  const colorInfo = color ? COLOR_GRADIENTS[color] : null;
  const ownerGlow = owner !== undefined ? (OWNER_COLORS[owner] || '#6366f1') : null;
  const specialAccent = SPECIAL_ACCENTS[name];

  const tileBase: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'default',
    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
    background: type === 'corner'
      ? 'linear-gradient(135deg, #1e1b4b 0%, #0f0e1f 60%, #1a1533 100%)'
      : type === 'special'
      ? `linear-gradient(135deg, #151926 0%, #0d1117 100%)`
      : 'linear-gradient(180deg, #1a1f35 0%, #0f1220 100%)',
    border: ownerGlow
      ? `1px solid ${ownerGlow}55`
      : '1px solid rgba(255,255,255,0.08)',
    boxShadow: ownerGlow
      ? `inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 8px ${ownerGlow}40`
      : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)',
  };

  // Corner tile
  if (type === 'corner') {
    return (
      <div style={{ width: '100%', height: '100%', transform: rotation ? `rotate(${rotation}deg)` : undefined, transformOrigin: 'center' }}>
        <div
          className="group tile-shimmer-sweep"
          style={{
            ...tileBase,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #13111f 50%, #1a1533 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 16px rgba(99,102,241,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {/* Corner radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 22, lineHeight: 1, position: 'relative', zIndex: 1 }}>{icon}</div>
          <div style={{
            fontSize: 9, fontWeight: 800, textAlign: 'center', color: '#c7d2fe',
            textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2,
            padding: '0 4px', position: 'relative', zIndex: 1,
          }}>
            {name}
          </div>
          {playersOnSpace.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              {playersOnSpace.map((p) => <PlayerToken key={p.id} player={p} size="xs" />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Special tile
  if (type === 'special') {
    return (
      <div style={{ width: '100%', height: '100%', transform: rotation ? `rotate(${rotation}deg)` : undefined, transformOrigin: 'center' }}>
        <div
          className="group tile-shimmer-sweep"
          style={{
            ...tileBase,
            background: 'linear-gradient(135deg, #151926 0%, #0d1117 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: specialAccent ? specialAccent.bg : 'transparent', borderRadius: 8, pointerEvents: 'none' }} />
          <div style={{ fontSize: 14, lineHeight: 1, position: 'relative', zIndex: 1 }}>{icon}</div>
          <div style={{
            fontSize: 7.5, fontWeight: 700, textAlign: 'center', color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.25,
            padding: '0 3px', position: 'relative', zIndex: 1,
          }}>
            {name}
          </div>
          {playersOnSpace.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              {playersOnSpace.map((p) => <PlayerToken key={p.id} player={p} size="xs" />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Property tile
  const bandHeight = '22%';

  return (
    <div style={{ width: '100%', height: '100%', transform: rotation ? `rotate(${rotation}deg)` : undefined, transformOrigin: 'center' }}>
      <div
        className="group tile-shimmer-sweep"
        style={tileBase}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.07) translateY(-1px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = ownerGlow
            ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.5), 0 0 16px ${ownerGlow}55`
            : `inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${colorInfo?.glow || 'rgba(99,102,241,0.3)'}`;
          (e.currentTarget as HTMLDivElement).style.zIndex = '10';
          (e.currentTarget as HTMLDivElement).style.borderColor = colorInfo?.glow ? colorInfo.glow.replace('0.8)', '0.5)') : 'rgba(255,255,255,0.18)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = ownerGlow
            ? `inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 8px ${ownerGlow}40`
            : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)';
          (e.currentTarget as HTMLDivElement).style.zIndex = '';
          (e.currentTarget as HTMLDivElement).style.borderColor = ownerGlow ? `${ownerGlow}55` : 'rgba(255,255,255,0.08)';
        }}
      >
        {/* Color band */}
        {colorInfo && (
          <div style={{
            width: '100%',
            height: bandHeight,
            background: colorInfo.gradient,
            flexShrink: 0,
            position: 'relative',
            boxShadow: `0 2px 8px ${colorInfo.glow}`,
          }}>
            {/* Gloss highlight on band */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
              borderRadius: '8px 8px 0 0',
            }} />
            {/* Houses / Hotels */}
            {(houses > 0 || hotels > 0) && (
              <div style={{
                position: 'absolute', bottom: 2, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 1,
              }}>
                {hotels > 0
                  ? <span style={{ fontSize: 8 }}>🏨</span>
                  : Array.from({ length: houses }).map((_, i) => (
                    <span key={i} style={{ fontSize: 7 }}>🏠</span>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* Content area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '3px 2px 2px',
          minHeight: 0,
          position: 'relative',
        }}>
          {/* Flag + icon row */}
          {(flag || icon) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 1, lineHeight: 1 }}>
              {flag && <span style={{ fontSize: 9 }}>{flag}</span>}
              {icon && <span style={{ fontSize: 9 }}>{icon}</span>}
            </div>
          )}

          {/* Property name */}
          <div style={{
            fontSize: 7.5,
            fontWeight: 800,
            textAlign: 'center',
            color: '#e2e8f0',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            lineHeight: 1.2,
            padding: '0 2px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {name}
          </div>

          {/* Price */}
          {price !== undefined && (
            <div style={{
              fontSize: 7,
              fontWeight: 700,
              color: colorInfo?.text || '#94a3b8',
              background: colorInfo ? colorInfo.gradient : 'rgba(255,255,255,0.05)',
              borderRadius: 3,
              padding: '1px 4px',
              lineHeight: 1,
            }}>
              ${price}
            </div>
          )}

          {/* Player tokens */}
          {playersOnSpace.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {playersOnSpace.map((p) => <PlayerToken key={p.id} player={p} size="xs" />)}
            </div>
          )}
        </div>

        {/* Ownership strip at bottom */}
        {ownerGlow && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: ownerGlow,
            boxShadow: `0 0 6px ${ownerGlow}, 0 0 12px ${ownerGlow}80`,
            borderRadius: '0 0 7px 7px',
          }} />
        )}

        {/* Inner highlight (top gloss) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
          borderRadius: '8px 8px 0 0',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
