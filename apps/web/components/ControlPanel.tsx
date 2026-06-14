'use client';

import React from 'react';
import { Dices, Flag, Shuffle, Home, MessageSquare, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

interface DiceResult {
  die1: number;
  die2: number;
  total: number;
  timestamp: Date;
}

interface ControlPanelProps {
  isPlayerTurn: boolean;
  hasRolled?: boolean;
  lastRoll?: DiceResult;
  onRoll?: () => void;
  onEndTurn?: () => void;
  onTrade?: () => void;
  onProperties?: () => void;
  onChat?: () => void;
}

export default function ControlPanel({
  isPlayerTurn,
  hasRolled = false,
  lastRoll,
  onRoll,
  onEndTurn,
  onTrade,
  onProperties,
  onChat,
}: ControlPanelProps) {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Dice section */}
      {lastRoll && (
        <div className="glassmorphism p-4 border-primary/40 bg-primary/5">
          <div className="text-xs text-muted-foreground mb-3 font-semibold">
            Last Roll
          </div>
          <div className="flex gap-3 items-center justify-center">
            {/* Dice 1 */}
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 text-black rounded-lg flex items-center justify-center font-bold text-2xl border-2 border-white/50 shadow-lg glow-accent animate-bounce-in">
              {lastRoll.die1}
            </div>
            <span className="text-primary font-bold animate-bounce-in" style={{ animationDelay: '0.1s' }}>+</span>
            {/* Dice 2 */}
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 text-black rounded-lg flex items-center justify-center font-bold text-2xl border-2 border-white/50 shadow-lg glow-accent animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              {lastRoll.die2}
            </div>
            <span className="text-primary font-bold text-xl ml-2 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
              = {lastRoll.total}
            </span>
          </div>
        </div>
      )}

      {/* Main action buttons */}
      <div className="glassmorphism p-4 flex flex-col gap-3 border-primary/40">
        {/* Roll Dice Button */}
        <Button
          onClick={onRoll}
          disabled={!isPlayerTurn || hasRolled}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground font-bold gap-2 hover-lift shadow-lg shadow-primary/20 active:shadow-primary/40 transition-all duration-300"
        >
          <Dices size={20} className="animate-spin" style={{ animationDuration: '4s' }} />
          Roll Dice
        </Button>

        {/* End Turn Button */}
        <Button
          onClick={onEndTurn}
          disabled={!isPlayerTurn || !hasRolled}
          variant="outline"
          size="lg"
          className="w-full gap-2 hover-lift border-primary/40 bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <Flag size={20} />
          End Turn
        </Button>
      </div>

      {/* Secondary action buttons */}
      <div className="glassmorphism p-4 flex flex-col gap-2 border-accent/40">
        <div className="grid grid-cols-2 gap-2">
          {/* Trade Button */}
          <Button
            onClick={onTrade}
            variant="outline"
            className="gap-2 h-10 hover-lift border-accent/40 bg-white/5 hover:bg-accent/10 transition-all duration-300"
          >
            <Shuffle size={16} />
            Trade
          </Button>

          {/* Properties Button */}
          <Button
            onClick={onProperties}
            variant="outline"
            className="gap-2 h-10 hover-lift border-accent/40 bg-white/5 hover:bg-accent/10 transition-all duration-300"
          >
            <Home size={16} />
            Properties
          </Button>
        </div>

        {/* Chat Button */}
        <Button
          onClick={onChat}
          variant="outline"
          className="w-full gap-2 hover-lift border-accent/40 bg-white/5 hover:bg-accent/10 transition-all duration-300"
        >
          <MessageSquare size={16} />
          Chat
        </Button>
      </div>

      {/* Game info */}
      <div className={`glassmorphism-sm p-3 text-xs text-center font-semibold transition-all duration-300 ${
        isPlayerTurn 
          ? 'border-primary/60 bg-primary/10 text-primary glow-accent' 
          : 'text-muted-foreground border-muted/40'
      }`}>
        {isPlayerTurn ? (
          <span>It&apos;s your turn! 🎲</span>
        ) : (
          <span>Waiting for another player...</span>
        )}
      </div>
    </div>
  );
}
