'use client';

import React from 'react';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button';

interface Player {
  id: number;
  name: string;
  color: string;
}

interface Property {
  id: number;
  name: string;
  color: string;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  otherPlayers: Player[];
  availableProperties: Property[];
  onProposeTrade?: (targetPlayerId: number, offer: any) => void;
}

export default function TradeModal({
  isOpen,
  onClose,
  currentPlayer,
  otherPlayers,
  availableProperties,
  onProposeTrade,
}: TradeModalProps) {
  const [selectedPlayer, setSelectedPlayer] = React.useState<number | null>(null);
  const [offerProperties, setOfferProperties] = React.useState<number[]>([]);
  const [offerCash, setOfferCash] = React.useState<number>(0);
  const [requestProperties, setRequestProperties] = React.useState<number[]>([]);
  const [requestCash, setRequestCash] = React.useState<number>(0);

  if (!isOpen) return null;

  const handleToggleProperty = (
    propertyId: number,
    isOffer: boolean
  ) => {
    if (isOffer) {
      setOfferProperties((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    } else {
      setRequestProperties((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    }
  };

  const handlePropose = () => {
    if (selectedPlayer) {
      onProposeTrade?.(selectedPlayer, {
        offerProperties,
        offerCash,
        requestProperties,
        requestCash,
      });
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedPlayer(null);
    setOfferProperties([]);
    setOfferCash(0);
    setRequestProperties([]);
    setRequestCash(0);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-white/20 rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full glassmorphism">
          {/* Header */}
          <div className="sticky top-0 h-16 border-b border-white/20 flex items-center justify-between px-6 bg-card/90 backdrop-blur-sm">
            <h2 className="font-bold text-lg">Propose Trade</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Select player */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Trade with:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {otherPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPlayer === player.id
                        ? 'border-primary bg-primary/20'
                        : 'border-white/20 bg-white/5 hover:border-primary/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mb-2 ${
                        {
                          red: 'bg-red-500',
                          blue: 'bg-blue-500',
                          yellow: 'bg-yellow-500',
                          green: 'bg-green-500',
                        }[player.color] || 'bg-gray-500'
                      }`}
                    />
                    <div className="text-xs font-semibold text-foreground">
                      {player.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedPlayer && (
              <>
                {/* Trade content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* What you offer */}
                  <div className="glassmorphism p-4">
                    <h3 className="font-bold text-foreground mb-4">
                      You Offer:
                    </h3>

                    {/* Cash input */}
                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Cash
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={offerCash}
                        onChange={(e) =>
                          setOfferCash(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                        placeholder="0"
                      />
                    </div>

                    {/* Properties */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Properties
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableProperties.map((prop) => (
                          <button
                            key={prop.id}
                            onClick={() =>
                              handleToggleProperty(prop.id, true)
                            }
                            className={`text-xs px-2 py-1 rounded border transition-all ${
                              offerProperties.includes(prop.id)
                                ? 'bg-primary/30 border-primary'
                                : 'bg-white/5 border-white/20 hover:border-primary/50'
                            }`}
                          >
                            {prop.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* What you request */}
                  <div className="glassmorphism p-4">
                    <h3 className="font-bold text-foreground mb-4">
                      You Request:
                    </h3>

                    {/* Cash input */}
                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Cash
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={requestCash}
                        onChange={(e) =>
                          setRequestCash(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                        placeholder="0"
                      />
                    </div>

                    {/* Properties */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Properties
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableProperties.map((prop) => (
                          <button
                            key={prop.id}
                            onClick={() =>
                              handleToggleProperty(prop.id, false)
                            }
                            className={`text-xs px-2 py-1 rounded border transition-all ${
                              requestProperties.includes(prop.id)
                                ? 'bg-accent/30 border-accent'
                                : 'bg-white/5 border-white/20 hover:border-primary/50'
                            }`}
                          >
                            {prop.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleReset}>
                    Clear
                  </Button>
                  <Button
                    onClick={handlePropose}
                    disabled={
                      offerProperties.length === 0 &&
                      offerCash === 0 &&
                      requestProperties.length === 0 &&
                      requestCash === 0
                    }
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Send size={16} />
                    Propose Trade
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
