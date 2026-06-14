"use client";

import { useGameStore } from "../store/game-store";
import { BoardLayout } from "./BoardLayout";
import { PlayerToken } from "./PlayerToken";
import { getTokenPositionsForTile } from "../utils/board-math";
import { useMemo } from "react";

export function GameBoard({ onTileClick }: { onTileClick?: (index: number) => void }) {
  const { gameState } = useGameStore();

  // Compute where each player should be
  const playerPositions = useMemo(() => {
    if (!gameState) return [];

    // Group players by tile to avoid overlapping
    const tileOccupants: Record<number, string[]> = {};
    
    gameState.players.forEach(p => {
      if (!tileOccupants[p.position]) {
        tileOccupants[p.position] = [];
      }
      tileOccupants[p.position].push(p.id);
    });

    // Assign absolute SVG coordinates
    const positions: { id: string; name: string; color: string; position: number; x: number; y: number; isTurn: boolean }[] = [];
    
    gameState.players.forEach(p => {
      const occupants = tileOccupants[p.position];
      const indexInTile = occupants.indexOf(p.id);
      const totalInTile = occupants.length;
      
      const posArray = getTokenPositionsForTile(p.position, totalInTile);
      const pos = posArray[indexInTile];
      
      if (pos) {
        positions.push({
          id: p.id,
          name: p.name,
          color: p.color || "#cbd5e1",
          position: p.position,
          x: pos.x,
          y: pos.y,
          isTurn: gameState.players[gameState.currentPlayerIndex]?.id === p.id,
        });
      }
    });

    return positions;
  }, [gameState]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{
          height: '100%',
          maxHeight: '100%',
          maxWidth: '100%',
          aspectRatio: '1 / 1',
        }}
      >
        <BoardLayout onTileClick={onTileClick} />

        <svg viewBox="0 0 990 990" className="absolute inset-0 pointer-events-none z-10 w-full h-full">
          {playerPositions.map(p => (
            <PlayerToken 
              key={p.id}
              id={p.id}
              name={p.name}
              color={p.color}
              position={{ x: p.x, y: p.y }}
              tileIndex={p.position}
              isTurn={p.isTurn}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
