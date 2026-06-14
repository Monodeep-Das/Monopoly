'use client';

import React from 'react';
import PlayerToken from './PlayerToken';
import { Home } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  cash: number;
  properties: number;
  isBankrupt?: boolean;
  isActive?: boolean;
}

interface PlayersPanelProps {
  players: Player[];
  currentPlayerId: number;
}

export default function PlayersPanel({ players, currentPlayerId }: PlayersPanelProps) {
  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto">
      {players.map((player) => (
        <div
          key={player.id}
          className={`glassmorphism p-3 transition-all ${
            currentPlayerId === player.id
              ? 'ring-2 ring-primary border-primary/50 bg-primary/10'
              : ''
          } ${player.isBankrupt ? 'opacity-50' : ''}`}
        >
          {/* Player header */}
          <div className="flex items-center gap-2 mb-2">
            <PlayerToken player={player} size="md" />
            <div className="flex-1">
              <div className="font-bold text-foreground text-sm">
                {player.name}
                {currentPlayerId === player.id && (
                  <span className="ml-2 text-xs bg-primary/30 px-2 py-0.5 rounded">
                    Your Turn
                  </span>
                )}
              </div>
              {player.isBankrupt && (
                <div className="text-xs text-destructive font-semibold">Bankrupt</div>
              )}
            </div>
          </div>

          {/* Player stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Cash */}
            <div className="bg-white/5 rounded px-2 py-1.5 border border-white/10">
              <div className="text-muted-foreground text-xs mb-0.5">Cash</div>
              <div className="font-bold text-green-400">
                ${player.cash.toLocaleString()}
              </div>
            </div>

            {/* Properties */}
            <div className="bg-white/5 rounded px-2 py-1.5 border border-white/10">
              <div className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                <Home size={12} />
                Properties
              </div>
              <div className="font-bold text-primary">{player.properties}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
