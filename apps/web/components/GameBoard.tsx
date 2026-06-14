'use client';

import React from 'react';
import PlayerToken from './PlayerToken';
import PropertyTile from './PropertyTile';
import Dice3D from './Dice3D';

interface BoardProperty {
  id: number;
  name: string;
  type: 'property' | 'special' | 'corner';
  color?: string;
  owner?: number;
  ownerColor?: string;
  houses?: number;
  hotels?: number;
  price?: number;
  icon?: string;
  flag?: string;
}

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  cash: number;
  isActive?: boolean;
}

interface GameBoardProps {
  players: Player[];
  currentPlayerId?: number;
  lastRoll?: { die1: number; die2: number; total: number; timestamp: Date } | null;
}

const BOARD_PROPERTIES: BoardProperty[] = [
  { id: 0,  name: 'START',         type: 'corner',   icon: '🎮' },
  { id: 1,  name: 'Salvador',      type: 'property', color: 'brown',     price: 60,  icon: '🏺', flag: '🇧🇷' },
  { id: 2,  name: 'Earnings Tax',  type: 'special',  icon: '📊' },
  { id: 3,  name: 'Rio',           type: 'property', color: 'brown',     price: 60,  icon: '🏔️', flag: '🇧🇷' },
  { id: 4,  name: 'Earnings Tax',  type: 'special',  icon: '📋' },
  { id: 5,  name: 'TLV Airport',   type: 'property', color: 'railroad',  price: 200, icon: '✈️', flag: '🇮🇱' },
  { id: 6,  name: 'Tel Aviv',      type: 'property', color: 'light-blue',price: 100, icon: '🏙️', flag: '🇮🇱' },
  { id: 7,  name: 'Surprise',      type: 'special',  icon: '❓' },
  { id: 8,  name: 'Haifa',         type: 'property', color: 'light-blue',price: 100, icon: '⛵', flag: '🇮🇱' },
  { id: 9,  name: 'Jerusalem',     type: 'property', color: 'light-blue',price: 120, icon: '⛪', flag: '🇮🇱' },
  { id: 10, name: 'Go to Jail',    type: 'corner',   icon: '⚠️' },
  { id: 11, name: 'Haifa',         type: 'property', color: 'pink',      price: 140, icon: '🏛️', flag: '🇮🇱' },
  { id: 12, name: 'Electric Plant',type: 'property', color: 'utility',   price: 150, icon: '⚡' },
  { id: 13, name: 'Main',          type: 'property', color: 'pink',      price: 140, icon: '🏢', flag: '🇦🇹' },
  { id: 14, name: 'Rome',          type: 'property', color: 'pink',      price: 160, icon: '🏛️', flag: '🇮🇹' },
  { id: 15, name: 'My Airport',    type: 'property', color: 'railroad',  price: 200, icon: '✈️', flag: '🇩🇪' },
  { id: 16, name: 'Frankfurt',     type: 'property', color: 'orange',    price: 180, icon: '🏢', flag: '🇩🇪' },
  { id: 17, name: 'Free Parking',  type: 'special',  icon: '🅿️' },
  { id: 18, name: 'London',        type: 'property', color: 'orange',    price: 180, icon: '🎡', flag: '🇬🇧' },
  { id: 19, name: 'Paris',         type: 'property', color: 'orange',    price: 200, icon: '🗼', flag: '🇫🇷' },
  { id: 20, name: 'Free Parking',  type: 'corner',   icon: '🅿️' },
  { id: 21, name: 'Shanghai',      type: 'property', color: 'red',       price: 220, icon: '🏙️', flag: '🇨🇳' },
  { id: 22, name: 'Surprise',      type: 'special',  icon: '❓' },
  { id: 23, name: 'Beijing',       type: 'property', color: 'red',       price: 220, icon: '🏰', flag: '🇨🇳' },
  { id: 24, name: 'Shenzhen',      type: 'property', color: 'red',       price: 240, icon: '🌆', flag: '🇨🇳' },
  { id: 25, name: 'CDG Airport',   type: 'property', color: 'railroad',  price: 200, icon: '✈️', flag: '🇫🇷' },
  { id: 26, name: 'Toulouse',      type: 'property', color: 'yellow',    price: 260, icon: '🏛️', flag: '🇫🇷' },
  { id: 27, name: 'Lyon',          type: 'property', color: 'yellow',    price: 260, icon: '🍷', flag: '🇫🇷' },
  { id: 28, name: 'Water Company', type: 'property', color: 'utility',   price: 150, icon: '💧' },
  { id: 29, name: 'Versailles',    type: 'property', color: 'yellow',    price: 280, icon: '⛲', flag: '🇫🇷' },
  { id: 30, name: 'Go to Jail',    type: 'corner',   icon: '⚠️' },
  { id: 31, name: 'Munich',        type: 'property', color: 'green',     price: 300, icon: '🍺', flag: '🇩🇪' },
  { id: 32, name: 'Berlin',        type: 'property', color: 'green',     price: 300, icon: '🏛️', flag: '🇩🇪' },
  { id: 33, name: 'Jackpot',       type: 'special',  icon: '🎁' },
  { id: 34, name: 'Amsterdam',     type: 'property', color: 'green',     price: 320, icon: '🌷', flag: '🇳🇱' },
  { id: 35, name: 'Schiphol',      type: 'property', color: 'railroad',  price: 200, icon: '✈️', flag: '🇳🇱' },
  { id: 36, name: 'Chance',        type: 'special',  icon: '🎲' },
  { id: 37, name: 'Vienna',        type: 'property', color: 'dark-blue', price: 350, icon: '🏰', flag: '🇦🇹' },
  { id: 38, name: 'Luxury Tax',    type: 'special',  icon: '💰' },
  { id: 39, name: 'Treasure',      type: 'property', color: 'dark-blue', price: 400, icon: '🏺' },
];

const PROPERTY_POSITIONS: Record<number, { row: string; col: string; rotation?: number }> = {
  0:  { row: 'row-start-11', col: 'col-start-1'  },
  1:  { row: 'row-start-11', col: 'col-start-2',  rotation: 0 },
  2:  { row: 'row-start-11', col: 'col-start-3',  rotation: 0 },
  3:  { row: 'row-start-11', col: 'col-start-4',  rotation: 0 },
  4:  { row: 'row-start-11', col: 'col-start-5',  rotation: 0 },
  5:  { row: 'row-start-11', col: 'col-start-6',  rotation: 0 },
  6:  { row: 'row-start-11', col: 'col-start-7',  rotation: 0 },
  7:  { row: 'row-start-11', col: 'col-start-8',  rotation: 0 },
  8:  { row: 'row-start-11', col: 'col-start-9',  rotation: 0 },
  9:  { row: 'row-start-11', col: 'col-start-10', rotation: 0 },
  10: { row: 'row-start-11', col: 'col-start-11' },
  11: { row: 'row-start-10', col: 'col-start-11', rotation: 90 },
  12: { row: 'row-start-9',  col: 'col-start-11', rotation: 90 },
  13: { row: 'row-start-8',  col: 'col-start-11', rotation: 90 },
  14: { row: 'row-start-7',  col: 'col-start-11', rotation: 90 },
  15: { row: 'row-start-6',  col: 'col-start-11', rotation: 90 },
  16: { row: 'row-start-5',  col: 'col-start-11', rotation: 90 },
  17: { row: 'row-start-4',  col: 'col-start-11', rotation: 90 },
  18: { row: 'row-start-3',  col: 'col-start-11', rotation: 90 },
  19: { row: 'row-start-2',  col: 'col-start-11', rotation: 90 },
  20: { row: 'row-start-1',  col: 'col-start-11' },
  21: { row: 'row-start-1',  col: 'col-start-10', rotation: 180 },
  22: { row: 'row-start-1',  col: 'col-start-9',  rotation: 180 },
  23: { row: 'row-start-1',  col: 'col-start-8',  rotation: 180 },
  24: { row: 'row-start-1',  col: 'col-start-7',  rotation: 180 },
  25: { row: 'row-start-1',  col: 'col-start-6',  rotation: 180 },
  26: { row: 'row-start-1',  col: 'col-start-5',  rotation: 180 },
  27: { row: 'row-start-1',  col: 'col-start-4',  rotation: 180 },
  28: { row: 'row-start-1',  col: 'col-start-3',  rotation: 180 },
  29: { row: 'row-start-1',  col: 'col-start-2',  rotation: 180 },
  30: { row: 'row-start-1',  col: 'col-start-1'  },
  31: { row: 'row-start-2',  col: 'col-start-1',  rotation: 270 },
  32: { row: 'row-start-3',  col: 'col-start-1',  rotation: 270 },
  33: { row: 'row-start-4',  col: 'col-start-1',  rotation: 270 },
  34: { row: 'row-start-5',  col: 'col-start-1',  rotation: 270 },
  35: { row: 'row-start-6',  col: 'col-start-1',  rotation: 270 },
  36: { row: 'row-start-7',  col: 'col-start-1',  rotation: 270 },
  37: { row: 'row-start-8',  col: 'col-start-1',  rotation: 270 },
  38: { row: 'row-start-9',  col: 'col-start-1',  rotation: 270 },
  39: { row: 'row-start-10', col: 'col-start-1',  rotation: 270 },
};

const PLAYER_COLORS_MAP: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e',
  purple: '#a855f7', orange: '#f97316',
};

// Particle data (static to avoid hydration issues)
const PARTICLES = [
  { size: 3, color: '#6366f1', x: '20%', y: '30%', dx: '40px', dy: '-80px', delay: '0s',    dur: '6s'  },
  { size: 2, color: '#ec4899', x: '75%', y: '60%', dx: '-30px', dy: '-60px', delay: '1.5s', dur: '5s'  },
  { size: 4, color: '#8b5cf6', x: '50%', y: '80%', dx: '20px',  dy: '-90px', delay: '3s',   dur: '7s'  },
  { size: 2, color: '#06b6d4', x: '10%', y: '70%', dx: '60px',  dy: '-50px', delay: '0.8s', dur: '5.5s'},
  { size: 3, color: '#f59e0b', x: '85%', y: '20%', dx: '-50px', dy: '-40px', delay: '2.2s', dur: '6.5s'},
  { size: 2, color: '#10b981', x: '40%', y: '15%', dx: '-20px', dy: '-70px', delay: '4s',   dur: '4.5s'},
];



export default function GameBoard({ players, currentPlayerId = 1, lastRoll }: GameBoardProps) {
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const playerGlow = currentPlayer ? (PLAYER_COLORS_MAP[currentPlayer.color] || '#6366f1') : '#6366f1';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Board outer glow wrapper */}
      <div
        className="w-full aspect-square relative board-ambient-glow"
        style={{
          maxWidth: 'min(calc(100vh - 5rem), calc(100vw - 34rem))',
          borderRadius: 18,
          padding: 3,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 50%, rgba(236,72,153,0.2) 100%)',
        }}
      >
        {/* Inner board surface */}
        <div
          style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0d1117 0%, #0a0d1a 50%, #0d1020 100%)',
            borderRadius: 15,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Board inner radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Main 11×11 grid */}
          <div className="grid grid-cols-11 grid-rows-11 w-full h-full gap-0" style={{ position: 'relative', zIndex: 1 }}>

            {/* ─── CENTER AREA ─── */}
            <div
              className="col-start-2 col-end-11 row-start-2 row-end-11"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0d1320 0%, #080d18 40%, #0a0f1e 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
              }}
            >
              {/* Center radial glow background */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Floating particles */}
              {PARTICLES.map((p, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: p.x, top: p.y,
                    width: p.size, height: p.size,
                    borderRadius: '50%',
                    background: p.color,
                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    animation: `particle-drift ${p.dur} ease-out ${p.delay} infinite`,
                    ['--drift-x' as string]: p.dx,
                    ['--drift-y' as string]: p.dy,
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* Center content — floating */}
              <div
                className="center-float"
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                  position: 'relative', zIndex: 2,
                  padding: '12px 16px',
                }}
              >
                {/* Logo */}
                <div style={{ textAlign: 'center', lineHeight: 1 }}>
                  <div style={{
                    fontSize: 'clamp(22px, 3.5vw, 42px)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 80%, #818cf8 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.04em',
                    animation: 'gradient-shift 4s ease infinite',
                    textShadow: 'none',
                  }}>
                    RICHUP
                  </div>
                  <div style={{
                    fontSize: 'clamp(7px, 0.9vw, 10px)',
                    color: '#475569',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    marginTop: 2,
                  }}>
                    Multiplayer Board Game
                  </div>
                </div>

                {/* Dice pair */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', border: 'none', outline: 'none' }}>
                  <div className="dice-bounce" style={{ animationDelay: '0s', padding: 10, border: 'none', outline: 'none' }}>
                    <Dice3D value={lastRoll?.die1 ?? 1} rollId={lastRoll?.timestamp.toISOString()} glowColor="rgba(99,102,241,0.6)" />
                  </div>
                  <div style={{
                    fontSize: 'clamp(10px, 1.5vw, 16px)', fontWeight: 900,
                    color: '#6366f1', textShadow: '0 0 12px rgba(99,102,241,0.6)',
                    border: 'none', outline: 'none',
                  }}>
                    {lastRoll ? lastRoll.total : '?'}
                  </div>
                  <div className="dice-bounce" style={{ animationDelay: '0.4s', padding: 10, border: 'none', outline: 'none' }}>
                    <Dice3D value={lastRoll?.die2 ?? 6} rollId={lastRoll?.timestamp.toISOString()} glowColor="rgba(236,72,153,0.6)" />
                  </div>
                </div>

                {/* Turn indicator */}
                <div
                  className="turn-pulse"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: `linear-gradient(135deg, ${playerGlow}18 0%, ${playerGlow}08 100%)`,
                    border: `1px solid ${playerGlow}50`,
                    borderRadius: 999,
                    padding: '5px 14px 5px 8px',
                    boxShadow: `0 0 16px ${playerGlow}30`,
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: playerGlow,
                    boxShadow: `0 0 8px ${playerGlow}`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 'clamp(8px, 1vw, 11px)',
                    fontWeight: 700,
                    color: '#e2e8f0',
                    letterSpacing: '0.04em',
                  }}>
                    {currentPlayer?.name ?? 'Player'}&apos;s Turn
                  </span>
                </div>

                {/* Game status */}
                <div style={{
                  fontSize: 'clamp(7px, 0.85vw, 10px)',
                  color: '#334155',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}>
                  {lastRoll
                    ? (lastRoll.die1 === lastRoll.die2 ? 'Rolled doubles! Roll again' : `Rolled ${lastRoll.die1} + ${lastRoll.die2} — End your turn`)
                    : 'Roll the dice to play'}
                </div>
              </div>

              {/* Decorative corner accents */}
              {[
                { top: 8, left: 8 },
                { top: 8, right: 8 },
                { bottom: 8, left: 8 },
                { bottom: 8, right: 8 },
              ].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', ...pos,
                  width: 16, height: 16,
                  border: '1.5px solid rgba(99,102,241,0.2)',
                  borderRadius: 3,
                  pointerEvents: 'none',
                }} />
              ))}
            </div>

            {/* ─── BOARD TILES ─── */}
            {BOARD_PROPERTIES.map((prop) => {
              const pos = PROPERTY_POSITIONS[prop.id];
              if (!pos) return null;
              const playersOnSpace = players.filter((p) => p.position === prop.id);

              return (
                <div
                  key={prop.id}
                  className={`${pos.row} ${pos.col} relative`}
                  style={{ padding: '1.5px' }}
                >
                  <PropertyTile
                    id={prop.id}
                    name={prop.name}
                    type={prop.type}
                    color={prop.color}
                    price={prop.price}
                    icon={prop.icon}
                    flag={prop.flag}
                    owner={prop.owner}
                    ownerColor={prop.ownerColor}
                    houses={prop.houses}
                    hotels={prop.hotels}
                    playersOnSpace={playersOnSpace}
                    rotation={pos.rotation}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
