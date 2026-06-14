'use client';

import React from 'react';
import { Copy, Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';

interface TopBarProps {
  roomCode: string;
  currentPlayer: string;
  isConnected: boolean;
  onSettings?: () => void;
  onLeave?: () => void;
}

export default function TopBar({
  roomCode,
  currentPlayer,
  isConnected,
  onSettings,
  onLeave,
}: TopBarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-16 glassmorphism flex items-center justify-between px-6 gap-4">
      {/* Left side - Room code */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/30">
          <div className="text-xs text-muted-foreground mb-1">Room Code</div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary text-lg">{roomCode}</span>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
              title="Copy code"
            >
              <Copy size={16} className="text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Center - Current turn */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Current Turn</div>
          <div className="font-bold text-primary text-sm">{currentPlayer}</div>
        </div>
      </div>

      {/* Right side - Status and actions */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-green-500" />
              <span className="text-xs text-green-500 font-semibold">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-red-500" />
              <span className="text-xs text-red-500 font-semibold">Disconnected</span>
            </>
          )}
        </div>

        {/* Settings button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSettings}
          className="hover:bg-primary/20"
        >
          <Settings size={18} />
        </Button>

        {/* Leave game button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onLeave}
          className="hover:bg-destructive/20"
        >
          <LogOut size={18} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}
