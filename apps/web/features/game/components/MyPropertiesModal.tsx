"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/game-store";
import { useAuthStore } from "@/lib/store/auth";
import { BOARD_TILES } from "@richup/game-engine";

interface MyPropertiesModalProps {
  onClose: () => void;
  onSelectProperty: (tileIndex: number) => void;
}

export function MyPropertiesModal({ onClose, onSelectProperty }: MyPropertiesModalProps) {
  const { gameState } = useGameStore();
  const { user } = useAuthStore();

  if (!gameState) return null;

  const myProperties = gameState.properties.filter(p => p.ownerId === user?.id);

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
          className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <div>
              <h2 className="text-2xl font-black text-slate-200">My Portfolio</h2>
              <p className="text-slate-400 text-sm mt-1">Manage your properties, houses, and mortgages.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-slate-950">
            {myProperties.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <div className="text-4xl mb-4">🏠</div>
                <p className="text-lg font-medium">You don't own any properties yet.</p>
                <p className="text-sm mt-1">Land on unowned properties to buy them!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProperties.map(p => {
                  const tile = BOARD_TILES[p.tileIndex];
                  return (
                    <button
                      key={p.tileIndex}
                      onClick={() => onSelectProperty(p.tileIndex)}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-left flex flex-col group"
                    >
                      {"group" in tile && tile.group ? (
                        <div className="h-4 w-full" style={{ backgroundColor: getColorCode(tile.group as string) }} />
                      ) : (
                        <div className="h-4 w-full bg-slate-700" />
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{tile.name}</h3>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          {p.isMortgaged ? (
                            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded">MORTGAGED</span>
                          ) : (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">ACTIVE</span>
                          )}
                          {p.houses > 0 && (
                            <span className="text-slate-300 font-medium bg-slate-800 px-2 py-1 rounded">
                              {p.houses === 5 ? 'Hotel' : `${p.houses} House${p.houses > 1 ? 's' : ''}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
