"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/game-store";
import { useAuthStore } from "@/lib/store/auth";
import { BOARD_TILES } from "@richup/game-engine";

export function AuctionModal() {
  const { gameState, dispatchAction } = useGameStore();
  const { user } = useAuthStore();

  if (!gameState || gameState.phase !== 'AUCTION' || !gameState.activeAuction) {
    return null;
  }

  const { activeAuction } = gameState;
  const tile = BOARD_TILES[activeAuction.propertyIndex];
  
  const amIParticipating = activeAuction.participants.includes(user?.id || '');
  const myPlayer = gameState.players.find(p => p.id === user?.id);
  const highestBidder = gameState.players.find(p => p.id === activeAuction.currentBidderId);

  const handleBid = (amount: number) => {
    dispatchAction({ type: 'AUCTION_BID', amount: activeAuction.currentBid + amount });
  };

  const handlePass = () => {
    dispatchAction({ type: 'AUCTION_PASS' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl shadow-indigo-500/20 w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-indigo-600/20 p-6 text-center border-b border-indigo-500/30">
            <span className="text-indigo-400 font-black tracking-widest uppercase text-xs animate-pulse">Public Auction</span>
            <h2 className="text-3xl font-black text-white mt-1 uppercase">{tile.name}</h2>
            <p className="text-slate-300 font-medium mt-1">Starting Price: ${(tile as any).price}</p>
          </div>

          <div className="p-6 flex flex-col gap-6">
            
            {/* Current Bid Info */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* 7-Second Timer Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800/50">
                <motion.div
                  key={activeAuction.currentBid} // Restarts animation when bid changes
                  initial={{ width: "100%", backgroundColor: "#22c55e" }}
                  animate={{ width: "0%", backgroundColor: "#ef4444" }}
                  transition={{ duration: 7, ease: "linear" }}
                  className="h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Current Highest Bid</span>
              <div className="text-5xl font-black text-emerald-400 font-mono tracking-tight shadow-emerald-500/50 drop-shadow-lg">
                ${activeAuction.currentBid}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-slate-400 text-sm">by</span>
                <span className="text-white font-bold px-3 py-1 bg-slate-800 rounded-full text-sm border border-slate-700">
                  {highestBidder ? highestBidder.name : 'No bids yet'}
                </span>
              </div>
            </div>

            {/* Participants Status */}
            <div className="flex justify-center gap-2 flex-wrap">
              {gameState.players.filter(p => !p.bankrupt).map(p => {
                const isParticipating = activeAuction.participants.includes(p.id);
                const isHighest = p.id === activeAuction.currentBidderId;
                return (
                  <div key={p.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                    isHighest ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    isParticipating ? 'bg-slate-800 border-slate-700 text-slate-300' :
                    'bg-slate-950 border-rose-500/30 text-rose-500/70 line-through'
                  }`}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#cbd5e1' }} />
                    {p.name}
                    {!isParticipating && " (Passed)"}
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            {amIParticipating ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[10, 50, 100].map(amount => {
                    const newTotal = activeAuction.currentBid + amount;
                    const canAfford = myPlayer && myPlayer.cash >= newTotal;
                    
                    return (
                      <button
                        key={amount}
                        onClick={() => handleBid(amount)}
                        disabled={!canAfford}
                        className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 text-white disabled:text-slate-500 font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:scale-100 disabled:shadow-none flex flex-col items-center justify-center gap-1"
                      >
                        <span>+ ${amount}</span>
                        <span className="text-[10px] font-medium opacity-70">Bid ${newTotal}</span>
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handlePass}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black py-4 rounded-xl border border-rose-500/30 transition-all uppercase tracking-widest active:scale-95"
                >
                  Pass / Drop Out
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                <p className="text-slate-400 font-bold">You are spectating this auction.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
