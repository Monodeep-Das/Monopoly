'use client';

import React from 'react';

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  cash: number;
}

interface PlayerTokenProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

const PLAYER_TOKEN_COLORS: Record<string, { bg: string; glow: string; ring: string; text: string }> = {
  red:    { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ef4444 50%, #b91c1c 100%)', glow: 'rgba(239,68,68,0.75)', ring: '#ef4444', text: '#fff' },
  blue:   { bg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)', glow: 'rgba(59,130,246,0.75)', ring: '#3b82f6', text: '#fff' },
  yellow: { bg: 'linear-gradient(135deg, #fde68a 0%, #eab308 50%, #a16207 100%)', glow: 'rgba(234,179,8,0.75)',  ring: '#eab308', text: '#1a1a00' },
  green:  { bg: 'linear-gradient(135deg, #6ee7b7 0%, #22c55e 50%, #15803d 100%)', glow: 'rgba(34,197,94,0.75)',  ring: '#22c55e', text: '#fff' },
  purple: { bg: 'linear-gradient(135deg, #c4b5fd 0%, #a855f7 50%, #6d28d9 100%)', glow: 'rgba(168,85,247,0.75)', ring: '#a855f7', text: '#fff' },
  orange: { bg: 'linear-gradient(135deg, #fdba74 0%, #f97316 50%, #c2410c 100%)', glow: 'rgba(249,115,22,0.75)', ring: '#f97316', text: '#fff' },
};

const FALLBACK_TOKEN = { bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #334155 100%)', glow: 'rgba(100,116,139,0.75)', ring: '#64748b', text: '#fff' };

export default function PlayerToken({ player, size = 'md', isActive = false }: PlayerTokenProps) {
  const sizeMap = {
    xs: { outer: 18, font: 8,  border: 1.5, gloss: 8  },
    sm: { outer: 24, font: 10, border: 2,   gloss: 10 },
    md: { outer: 32, font: 12, border: 2,   gloss: 14 },
    lg: { outer: 40, font: 15, border: 2.5, gloss: 18 },
  };

  const dim = sizeMap[size];
  const token = PLAYER_TOKEN_COLORS[player.color] || FALLBACK_TOKEN;

  const outerStyle: React.CSSProperties = {
    width:  dim.outer,
    height: dim.outer,
    borderRadius: '50%',
    position: 'relative',
    flexShrink: 0,
    boxShadow: isActive
      ? `0 0 0 ${dim.border + 1}px ${token.ring}, 0 0 ${dim.outer * 0.6}px ${token.glow}, 0 0 ${dim.outer * 1.2}px ${token.glow.replace('0.75', '0.3')}`
      : `0 0 0 ${dim.border}px ${token.ring}55, 0 0 ${dim.outer * 0.35}px ${token.glow.replace('0.75', '0.4')}`,
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    animation: isActive ? 'token-pulse 2s ease-in-out infinite' : undefined,
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: token.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: dim.font,
    fontWeight: 900,
    color: token.text,
    letterSpacing: '-0.02em',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    position: 'relative',
    overflow: 'hidden',
  };

  // Glossy specular highlight
  const glossStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '55%',
    height: '40%',
    borderRadius: '50%',
    background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
    pointerEvents: 'none',
  };

  return (
    <div style={outerStyle} title={`${player.name}${isActive ? ' (your turn)' : ''}`}>
      <div style={innerStyle}>
        <div style={glossStyle} />
        {player.name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
