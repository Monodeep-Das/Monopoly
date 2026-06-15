"use client";

import { memo } from "react";
import React from 'react';
import { Plane, Gift, Home, Building, CarFront, Siren, Lock, Rocket } from 'lucide-react';
import { getTileRect } from "../utils/board-math";
import { BOARD_TILES } from "@richup/game-engine";
import { useGameStore } from "../store/game-store";

const FLAG_CODES: Record<string, string> = {
  '🇧🇷': 'br',
  '🇮🇱': 'il',
  '🇮🇹': 'it',
  '🇩🇪': 'de',
  '🇬🇧': 'gb',
  '🇫🇷': 'fr',
  '🇨🇳': 'cn',
  '🇳🇱': 'nl',
  '🇲🇨': 'mc',
  '🇦🇪': 'ae',
  '🇦🇹': 'at',
  '🇺🇸': 'us',
};



export const BoardLayout = memo(function BoardLayout({ onTileClick }: { onTileClick?: (index: number) => void }) {
  const { gameState } = useGameStore();
  return (
    <svg viewBox="0 0 990 990" className="w-full h-full">
      {/* Board Background — dark purple */}
      <rect width="990" height="990" fill="#1a1a2e" rx="12" />

      {/* Draw all tiles */}
      {BOARD_TILES.map((tile, i) => {
        const { x, y, w, h } = getTileRect(i);
        const isCorner = i % 10 === 0;

        // Determine tile side for text rotation
        let rotation = 0;
        if (i > 0 && i < 10) rotation = 0;     // bottom row
        if (i > 10 && i < 20) rotation = 90;   // right column
        if (i > 20 && i < 30) rotation = 180;  // top row
        if (i > 30 && i < 40) rotation = -90;  // left column

        // Get ownership color tint
        let tileFill = "#16213e";
        let borderColor = "#2d2b55";
        let ownerColor: string | null = null;
        let houseCount = 0;
        let isMortgaged = false;
        if (gameState) {
          const propState = gameState.properties.find(p => p.tileIndex === i);
          if (propState) {
            houseCount = propState.houses || 0;
            isMortgaged = propState.isMortgaged || false;
            if (propState.ownerId) {
              const owner = gameState.players.find(p => p.id === propState.ownerId);
              if (owner) {
                tileFill = isMortgaged ? "#0a0a10" : (owner.color || "#cbd5e1") + "22";
                borderColor = isMortgaged ? "#333344" : (owner.color || "#cbd5e1") + "66";
                ownerColor = isMortgaged ? "#475569" : (owner.color || "#cbd5e1");
              }
            }
          }
        }

        // Get tile metadata
        const tileAny = tile as any;
        const hasGroup = tile.type === 'property' && 'group' in tile;
        const groupColor = hasGroup ? getColorCode(tileAny.group) : null;
        const price = tileAny.price;
        const flag = tileAny.flag || '';
        const icon = tileAny.icon || '';

        return (
          <g
            key={i}
            transform={`translate(${x + w / 2}, ${y + h / 2})`}
            onClick={() => onTileClick?.(i)}
            className={onTileClick ? "cursor-pointer" : ""}
          >
            {/* Tile Background */}
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              fill={tileFill}
              stroke={borderColor}
              strokeWidth="1.5"
              rx="4"
            />

            {/* Hover highlight */}
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              fill="transparent"
              rx="4"
              className="hover:fill-white/5 transition-colors"
            />

            <g transform={`rotate(${rotation})`}>
              {(() => {
                const logicalW = isCorner ? 135 : 80;
                const logicalH = 135;

                return (
                  <>
                    {/* Property Color Header Bar */}
                    {groupColor && !isCorner && (
                      <g style={{ opacity: isMortgaged ? 0.3 : 1 }}>
                        <rect
                          x={-logicalW / 2 + 3}
                          y={-logicalH / 2 + 3}
                          width={logicalW - 6}
                          height="22"
                          fill={groupColor}
                          rx="3"
                        />
                        {houseCount > 0 && houseCount < 5 && (
                          Array.from({ length: houseCount }).map((_, idx) => {
                            const totalWidth = houseCount * 14 + (houseCount - 1) * 2;
                            const startX = -totalWidth / 2;
                            const xPos = startX + idx * 16;
                            return (
                              <Home
                                key={idx}
                                x={xPos}
                                y={-logicalH / 2 + 7}
                                size={14}
                                className="text-emerald-500 drop-shadow-md"
                                fill="currentColor"
                                stroke="white"
                                strokeWidth={1.5}
                              />
                            );
                          })
                        )}
                        {houseCount === 5 && (
                          <Building
                            x={-9}
                            y={-logicalH / 2 + 5}
                            size={18}
                            className="text-red-600 drop-shadow-md"
                            fill="currentColor"
                            stroke="white"
                            strokeWidth={1.5}
                          />
                        )}
                      </g>
                    )}

                    {/* Explicit Ownership Indicator Bar (Outer Edge) */}
                    {ownerColor && !isCorner && (
                      <rect
                        x={-logicalW / 2 + 4}
                        y={logicalH / 2 - 7}
                        width={logicalW - 8}
                        height="7"
                        fill={ownerColor}
                        rx="3"
                      />
                    )}

                    {/* Tile Content */}
                    {!isCorner && (
                      <>
                        {/* Property name */}
                        <text
                          x={0}
                          y={(() => {
                            if (tile.type === 'chance' || tile.type === 'community-chest' || tile.type === 'tax') return 20;
                            return hasGroup ? -logicalH / 2 + 40 : -logicalH / 2 + 24;
                          })()}
                          textAnchor="middle"
                          className={`font-bold uppercase ${isMortgaged ? 'fill-slate-600' : 'fill-slate-300'}`}
                          style={{ fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '1px' }}
                        >
                          {(() => {
                            let words = tile.name.length > 12 ? tile.name.split(" ") : [tile.name];
                            if (tile.name === 'Rio de Janeiro') {
                              words = ['Rio de', 'Janeiro'];
                            } else if (tile.name === 'Water Works') {
                              words = ['Water', 'Works'];
                            } else if (tile.name === 'Luxury Tax') {
                              words = ['Luxury', 'Tax'];
                            } else if (tile.name === 'CDG Airport') {
                              words = ['CDG', 'Airport'];
                            } else if (tile.name === 'TLV Airport') {
                              words = ['TLV', 'Airport'];
                            }
                            return words.map((word: string, lineIdx: number) => (
                              <tspan x={0} dy={lineIdx === 0 ? 0 : 15} key={lineIdx}>{word}</tspan>
                            ));
                          })()}
                        </text>

                        {/* Flag + Icon in center */}
                        <g style={{ opacity: isMortgaged ? 0.3 : 1, filter: isMortgaged ? 'grayscale(100%)' : 'none' }}>
                          {tile.type === 'community-chest' ? (
                            <Gift
                              className="text-amber-400"
                              size={32}
                              x={-16}
                              y={-31}
                            />
                          ) : icon === '✈️' ? (
                            <Plane
                              className="text-slate-300"
                              size={32}
                              x={-16}
                              y={hasGroup ? -8 : -6}
                            />
                          ) : flag && FLAG_CODES[flag] ? (
                            <image
                              href={`https://flagcdn.com/w40/${FLAG_CODES[flag]}.png`}
                              x={-14}
                              y={hasGroup ? -1 : 1}
                              width={28}
                              height={18}
                              preserveAspectRatio="xMidYMid slice"
                              className="rounded-sm shadow-sm"
                            />
                          ) : (
                            <text
                              x={0}
                              y={(() => {
                                if (tile.type === 'chance' || tile.type === 'community-chest' || tile.type === 'tax') return -15;
                                return hasGroup ? 8 : 10;
                              })()}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fontSize: '28px' }}
                            >
                              {flag || icon}
                            </text>
                          )}
                        </g>

                        {/* Price at bottom */}
                        {price && (
                          <text
                            x={0}
                            y={logicalH / 2 - 12}
                            textAnchor="middle"
                            className={`font-black ${isMortgaged ? 'fill-slate-600' : 'fill-emerald-400'}`}
                            style={{ 
                              fontFamily: 'sans-serif', 
                              fontSize: '12px', 
                              letterSpacing: '1px',
                              textShadow: isMortgaged ? 'none' : '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)'
                            }}
                          >
                            ${price}
                          </text>
                        )}

                        {/* Mortgaged Stamp Overlay */}
                        {isMortgaged && (
                          <g transform="rotate(-30) translate(0, 5)">
                            <rect x="-38" y="-12" width="76" height="24" fill="rgba(15, 14, 26, 0.85)" stroke="#e11d48" strokeWidth="2" rx="4" />
                            <text
                              x="0"
                              y="1"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="font-black fill-rose-600 uppercase"
                              style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '1px' }}
                            >
                              MORTGAGED
                            </text>
                          </g>
                        )}
                      </>
                    )}

                    {/* Corner tiles */}
                    {/* Corner tiles */}
                    {isCorner && (
                      <g>
                        {i === 0 ? ( // GO
                          <g>
                            <text x="0" y="-5" textAnchor="middle" dominantBaseline="middle" className="font-black fill-transparent uppercase" stroke="white" strokeWidth="2" style={{ fontFamily: 'sans-serif', fontSize: '60px', letterSpacing: '4px', textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)' }}>GO</text>
                            
                            <rect x="-40" y="30" width="80" height="20" fill="rgba(52, 211, 153, 0.15)" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.5" rx="10" />
                            <text x="0" y="40" textAnchor="middle" dominantBaseline="central" className="font-bold fill-emerald-300 uppercase drop-shadow-sm" style={{ fontSize: '9px', letterSpacing: '1px' }}>COLLECT $200</text>
                          </g>
                        ) : i === 10 ? ( // Jail
                          <g transform="translate(0, -15)">
                            <Lock size={40} x={-20} y={-35} className="text-orange-400 drop-shadow-md" strokeWidth={2.5} />
                            <text x="0" y="25" textAnchor="middle" className="font-black fill-slate-200 uppercase" style={{ fontFamily: 'sans-serif', fontSize: '16px', letterSpacing: '1px' }}>IN JAIL</text>
                            <text x="0" y="45" textAnchor="middle" className="font-bold fill-slate-500" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>JUST VISITING</text>
                          </g>
                        ) : i === 20 ? ( // Free Parking
                          <g transform="translate(0, -15)">
                            <CarFront size={44} x={-22} y={-35} className="text-blue-400 drop-shadow-md" strokeWidth={2} />
                            <text x="0" y="25" textAnchor="middle" className="font-black fill-blue-400 uppercase drop-shadow-md" style={{ fontFamily: 'sans-serif', fontSize: '18px', letterSpacing: '1px' }}>FREE</text>
                            <text x="0" y="45" textAnchor="middle" className="font-black fill-slate-300 uppercase" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>PARKING</text>
                          </g>
                        ) : i === 30 ? ( // Go To Jail
                          <g transform="translate(0, -15)">
                            <Siren size={44} x={-22} y={-35} className="text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" strokeWidth={2.5} />
                            <text x="0" y="25" textAnchor="middle" className="font-black fill-rose-400 uppercase drop-shadow-md" style={{ fontFamily: 'sans-serif', fontSize: '16px', letterSpacing: '0.5px' }}>GO TO</text>
                            <text x="0" y="45" textAnchor="middle" className="font-black fill-slate-300 uppercase" style={{ fontSize: '16px', letterSpacing: '1px' }}>JAIL</text>
                          </g>
                        ) : null}
                      </g>
                    )}
                  </>
                );
              })()}
            </g>
          </g>
        );
      })}
    </svg>
  );
});

function getColorCode(group: string) {
  const map: Record<string, string> = {
    "brown": "#8b4513",
    "light-blue": "#87ceeb",
    "pink": "#ff69b4",
    "orange": "#ffa500",
    "red": "#ef4444",
    "yellow": "#a855f7",
    "green": "#22c55e",
    "dark-blue": "#3b82f6",
  };
  return map[group] || "#cbd5e1";
}
