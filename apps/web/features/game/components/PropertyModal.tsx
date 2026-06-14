"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BOARD_TILES } from "@richup/game-engine";
import { useGameStore } from "../store/game-store";
import { useAuthStore } from "@/lib/store/auth";

interface PropertyModalProps {
  tileIndex: number | null;
  onClose: () => void;
}

export function PropertyModal({ tileIndex, onClose }: PropertyModalProps) {
  const { gameState, dispatchAction } = useGameStore();
  const { user } = useAuthStore();

  if (tileIndex === null || !gameState) return null;

  const definition = BOARD_TILES[tileIndex];
  if (definition.type !== 'property' && definition.type !== 'railroad' && definition.type !== 'utility') {
    return null;
  }

  const propertyState = gameState.properties.find((p) => p.tileIndex === tileIndex);
  
  // Find owner name
  const owner = propertyState?.ownerId 
    ? gameState.players.find(p => p.id === propertyState.ownerId)
    : null;

  const isOwner = propertyState?.ownerId === user?.id;

  const handleAction = (type: any) => {
    dispatchAction({ type, tileIndex });
    // Don't close immediately so they can see the state change
  };

  // --- Validate Monopoly & Even Build Rules ---
  let hasMonopoly = false;
  let canBuildEvenly = true;
  let buildWarning = "";

  if (definition.type === 'property' && 'group' in definition && isOwner) {
    const groupTiles = BOARD_TILES.map((t, idx) => ({ t, idx }))
      .filter(({ t }) => t.type === 'property' && 'group' in t && (t as any).group === (definition as any).group);
      
    const ownedGroupTiles = groupTiles.filter(({ idx }) => {
      const pState = gameState.properties.find(p => p.tileIndex === idx);
      return pState?.ownerId === user?.id;
    });
    
    hasMonopoly = ownedGroupTiles.length === groupTiles.length;
    
    if (!hasMonopoly) {
      buildWarning = "Requires full color set";
    } else {
      const housesInGroup = ownedGroupTiles.map(({ idx }) => {
        const pState = gameState.properties.find(p => p.tileIndex === idx);
        return pState?.houses || 0;
      });
      const minHousesInGroup = Math.min(...housesInGroup);
      
      if (propertyState && propertyState.houses > minHousesInGroup) {
        canBuildEvenly = false;
        buildWarning = "Must build evenly";
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        >
          {/* Card Header */}
          {definition.type === 'property' && 'group' in definition && (
            <div 
              className="h-24 flex items-center justify-center border-b-2 border-slate-900" 
              style={{ backgroundColor: getColorCode(definition.group as string) }}
            >
              <div className="bg-white/20 px-4 py-1 rounded border border-white/40 backdrop-blur-md text-slate-900 font-black uppercase tracking-widest text-sm shadow-sm">
                Title Deed
              </div>
            </div>
          )}
          
          <div className="p-6 flex flex-col gap-4 text-center">
            <h2 className="text-2xl font-black text-slate-100 uppercase">{definition.name}</h2>
            
            {/* Owner Badge */}
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Owner</span>
              <span className="text-slate-200 font-bold" style={{ color: owner?.color || '#cbd5e1' }}>
                {owner ? owner.name : "Bank"}
              </span>
            </div>

            {/* Price & Rent Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-sm">
              <div className="flex justify-between p-3 bg-slate-950">
                <span className="text-slate-500 font-medium">Price</span>
                <span className="text-emerald-400 font-bold">${(definition as any).price}</span>
              </div>
              
              {definition.type === 'property' && 'rent' in definition && (
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent</span>
                    <span className="text-slate-200 font-bold">${definition.rent[0]}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400/80">
                    <span>Rent with color set</span>
                    <span className="font-bold">${definition.rent[0] * 2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent with 1 House</span>
                    <span className="text-slate-200 font-bold">${definition.rent[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent with 2 Houses</span>
                    <span className="text-slate-200 font-bold">${definition.rent[2]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent with 3 Houses</span>
                    <span className="text-slate-200 font-bold">${definition.rent[3]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent with 4 Houses</span>
                    <span className="text-slate-200 font-bold">${definition.rent[4]}</span>
                  </div>
                  <div className="flex justify-between text-rose-400/80">
                    <span>Rent with Hotel</span>
                    <span className="font-bold">${definition.rent[5]}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between p-3 bg-slate-950">
                <span className="text-slate-500 font-medium">Mortgage Value</span>
                <span className="text-slate-300 font-bold">${(definition as any).mortgageValue}</span>
              </div>
              
              {definition.type === 'property' && 'houseCost' in definition && (
                <div className="flex justify-between p-3 bg-slate-950">
                  <span className="text-slate-500 font-medium">Houses cost</span>
                  <span className="text-slate-300 font-bold">${definition.houseCost} each</span>
                </div>
              )}
            </div>

            {/* Current State (if owned) */}
            {propertyState && propertyState.ownerId && (
              <div className="flex justify-center gap-2 mt-2">
                {propertyState.isMortgaged ? (
                  <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded font-bold text-xs uppercase tracking-widest">
                    Mortgaged
                  </span>
                ) : (
                  <>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded font-bold text-xs uppercase tracking-widest">
                      {propertyState.houses === 5 ? "1 Hotel" : `${propertyState.houses} Houses`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Actions for Owner */}
            {isOwner && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {propertyState?.isMortgaged ? (
                  <button 
                    onClick={() => handleAction('UNMORTGAGE_PROPERTY')}
                    className="col-span-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    Unmortgage (${Math.floor((definition as any).mortgageValue * 1.1)})
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAction('MORTGAGE_PROPERTY')}
                    className="col-span-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-lg border border-rose-500/30 transition-colors"
                  >
                    Mortgage (${(definition as any).mortgageValue})
                  </button>
                )}
                
                {definition.type === 'property' && !propertyState?.isMortgaged && (
                  <>
                    <div className="relative group">
                      <button 
                        onClick={() => handleAction('BUILD_HOUSE')}
                        disabled={propertyState!.houses >= 5 || !hasMonopoly || !canBuildEvenly}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/25 transition-colors disabled:opacity-50 disabled:shadow-none"
                      >
                        Build
                      </button>
                      {buildWarning && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {buildWarning}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAction('SELL_HOUSE')}
                      disabled={propertyState!.houses === 0}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/25 transition-colors disabled:opacity-50 disabled:shadow-none"
                    >
                      Sell
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Action for non-owner landing on it (Buy) */}
            {!owner && (gameState.phase === 'LANDED' || gameState.phase === 'ACTION') && gameState.players[gameState.currentPlayerIndex]?.id === user?.id && gameState.players.find(p => p.id === user?.id)?.position === tileIndex && (
               <div className="grid grid-cols-2 gap-3 mt-4">
                 <button 
                    onClick={() => { handleAction('BUY_PROPERTY'); onClose(); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/25 transition-colors"
                  >
                    Buy Property
                  </button>
                  <button 
                    onClick={() => { handleAction('DECLINE_PROPERTY'); onClose(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-colors border border-slate-700"
                  >
                    Auction
                  </button>
               </div>
            )}

          </div>
          
          {/* Close button top right */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
          >
            ✕
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

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
