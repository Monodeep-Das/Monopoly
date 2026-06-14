"use client";

import { memo } from "react";
import React from 'react';
import { Plane, Gift, Home, Building } from 'lucide-react';
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
        if (gameState) {
          const propState = gameState.properties.find(p => p.tileIndex === i);
          if (propState) {
            houseCount = propState.houses || 0;
            if (propState.ownerId) {
              const owner = gameState.players.find(p => p.id === propState.ownerId);
              if (owner) {
                tileFill = (owner.color || "#cbd5e1") + "22";
                borderColor = (owner.color || "#cbd5e1") + "66";
                ownerColor = owner.color || "#cbd5e1";
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
                      <g>
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
                          className="font-bold fill-slate-300 uppercase"
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

                        {/* Price at bottom */}
                        {price && (
                          <text
                            x={0}
                            y={logicalH / 2 - 14}
                            textAnchor="middle"
                            className="font-bold fill-emerald-400"
                            style={{ fontFamily: 'monospace', fontSize: '13px' }}
                          >
                            {price}$
                          </text>
                        )}
                      </>
                    )}

                    {/* Corner tiles */}
                    {isCorner && (
                      <>
                        <text
                          x={0}
                          y={-10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ fontSize: '28px' }}
                        >
                          {icon}
                        </text>
                        <text
                          x={0}
                          y={18}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-black fill-slate-400 uppercase"
                          style={{ fontFamily: 'sans-serif', fontSize: '14px', letterSpacing: '0.5px' }}
                        >
                          {tile.name.split(" ").map((word: string, lineIdx: number) => (
                            <tspan x={0} dy={lineIdx === 0 ? 0 : 14} key={lineIdx}>{word}</tspan>
                          ))}
                        </text>
                      </>
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
