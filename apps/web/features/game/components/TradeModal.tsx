"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useGameStore } from "../store/game-store";
import { useAuthStore } from "@/lib/store/auth";
import { BOARD_TILES } from "@richup/game-engine";

interface TradeModalProps {
  onClose: () => void;
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

export function TradeModal({ onClose }: TradeModalProps) {
  const { gameState, dispatchAction } = useGameStore();
  const { user } = useAuthStore();
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [offerProperties, setOfferProperties] = useState<number[]>([]);
  const [offerCash, setOfferCash] = useState<number>(0);
  const [requestProperties, setRequestProperties] = useState<number[]>([]);
  const [requestCash, setRequestCash] = useState<number>(0);

  if (!gameState || !user) return null;

  const me = gameState.players.find(p => p.id === user.id);
  const otherPlayers = gameState.players.filter(p => p.id !== user.id && !p.bankrupt);
  const targetPlayer = gameState.players.find(p => p.id === selectedPlayerId);

  // If there's an active trade involving me
  const activeTrade = gameState.activeTrade;
  const isPendingTrade = activeTrade && activeTrade.status === 'pending';
  const amIReceiving = isPendingTrade && activeTrade?.toPlayerId === user.id;
  const amISending = isPendingTrade && activeTrade?.fromPlayerId === user.id;

  const myProperties = me?.properties || [];
  const targetProperties = targetPlayer?.properties || [];

  const handleToggleOfferProperty = (tileIndex: number) => {
    setOfferProperties(prev => 
      prev.includes(tileIndex) ? prev.filter(i => i !== tileIndex) : [...prev, tileIndex]
    );
  };

  const handleToggleRequestProperty = (tileIndex: number) => {
    setRequestProperties(prev => 
      prev.includes(tileIndex) ? prev.filter(i => i !== tileIndex) : [...prev, tileIndex]
    );
  };

  const handleSendTrade = () => {
    if (!selectedPlayerId) return;
    dispatchAction({
      type: 'TRADE_PROPOSE',
      trade: {
        fromPlayerId: user.id,
        toPlayerId: selectedPlayerId,
        offerProperties,
        offerCash,
        requestProperties,
        requestCash
      }
    });
    onClose();
  };

  const handleAcceptTrade = () => {
    if (activeTrade) {
      dispatchAction({ type: 'TRADE_ACCEPT', tradeId: activeTrade.id });
    }
    onClose();
  };

  const handleDeclineTrade = () => {
    if (activeTrade) {
      dispatchAction({ type: 'TRADE_DECLINE', tradeId: activeTrade.id });
    }
    onClose();
  };

  const handleNegotiateTrade = () => {
    if (activeTrade) {
      setSelectedPlayerId(activeTrade.fromPlayerId);
      setOfferCash(activeTrade.requestCash);
      setOfferProperties(activeTrade.requestProperties);
      setRequestCash(activeTrade.offerCash);
      setRequestProperties(activeTrade.offerProperties);
      
      dispatchAction({ type: 'TRADE_DECLINE', tradeId: activeTrade.id });
      // Do not call onClose() so the user stays in the modal to edit their counter-offer
    }
  };

  const canSend = selectedPlayerId && (offerCash > 0 || requestCash > 0 || offerProperties.length > 0 || requestProperties.length > 0);

  const renderPropertyBadge = (tileIndex: number, isSelected: boolean, onClick?: () => void) => {
    const tile = BOARD_TILES[tileIndex] as any;
    if (!tile) return null;
    const groupColor = tile.group ? getColorCode(tile.group) : '#cbd5e1';
    return (
      <motion.div 
        key={tileIndex}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        className={`text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold ${
          isSelected 
            ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
            : 'bg-[#1a1a2e] border-[#2d2b55]/60 text-slate-400 hover:border-slate-500 hover:text-slate-300'
        }`}
        style={{ border: `1.5px solid ${isSelected ? 'rgba(168,85,247,0.6)' : 'rgba(45,43,85,0.6)'}` }}
      >
        <div 
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: groupColor }}
        />
        {tile.name}
        {isSelected && (
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="ml-auto text-purple-400"
          >
            ✓
          </motion.span>
        )}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0f0e1a]/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative bg-[#12111f] border border-[#2d2b55]/60 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.08), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          {/* ── Header ── */}
          <div className="relative overflow-hidden">
            {/* Gradient background */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: isPendingTrade
                  ? (amIReceiving 
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.15) 100%)' 
                    : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 100%)')
                  : 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.15) 50%, rgba(168,85,247,0.1) 100%)'
              }}
            />
            {/* Animated shimmer */}
            <motion.div 
              className="absolute inset-0 opacity-30"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
            
            <div className="relative px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/30 flex items-center justify-center text-lg backdrop-blur-md">
                  {amIReceiving ? '📨' : amISending ? '📤' : isPendingTrade ? '🔄' : '🤝'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">
                    {amIReceiving ? "Incoming Offer" : amISending ? "Pending Offer" : isPendingTrade ? "Active Trade" : "Propose Trade"}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                    {amIReceiving ? "Review and respond" : amISending ? "Awaiting response" : isPendingTrade ? "Trade in progress" : "Select a player and build your offer"}
                  </p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors backdrop-blur-md"
              >
                ✕
              </motion.button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d2b55 transparent' }}>
            {isPendingTrade ? (
              /* ─── Viewing Pending Trade ─── */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Trade participants */}
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="flex items-center gap-2 bg-[#1a1a2e] border border-[#2d2b55]/60 rounded-xl px-4 py-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gameState.players.find(p => p.id === activeTrade!.fromPlayerId)?.color || '#cbd5e1' }} />
                    <span className="text-sm font-bold text-slate-200">
                      {activeTrade!.fromPlayerId === user.id ? 'You' : gameState.players.find(p => p.id === activeTrade!.fromPlayerId)?.name}
                    </span>
                  </div>
                  <motion.div 
                    animate={{ x: [0, 4, 0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-purple-400 text-lg font-black"
                  >
                    ⇄
                  </motion.div>
                  <div className="flex items-center gap-2 bg-[#1a1a2e] border border-[#2d2b55]/60 rounded-xl px-4 py-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gameState.players.find(p => p.id === activeTrade!.toPlayerId)?.color || '#cbd5e1' }} />
                    <span className="text-sm font-bold text-slate-200">
                      {activeTrade!.toPlayerId === user.id ? 'You' : gameState.players.find(p => p.id === activeTrade!.toPlayerId)?.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {/* Offer side */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1a1a2e]/80 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-emerald-400/30 rounded-t-2xl" />
                    <h3 className="font-black text-emerald-400 text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {amIReceiving 
                        ? `${gameState.players.find(p => p.id === activeTrade!.fromPlayerId)?.name} Offers` 
                        : amISending ? "You Offered" 
                        : `${gameState.players.find(p => p.id === activeTrade!.fromPlayerId)?.name} Offers`}
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#0f0e1a] rounded-xl p-3 border border-[#2d2b55]/40">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Cash</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">${activeTrade!.offerCash}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Properties</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTrade!.offerProperties.length === 0 && <span className="text-slate-600 text-[11px] italic">No properties</span>}
                          {activeTrade!.offerProperties.map(idx => renderPropertyBadge(idx, true))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Request side */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#1a1a2e]/80 border border-rose-500/20 rounded-2xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/60 to-rose-400/30 rounded-t-2xl" />
                    <h3 className="font-black text-rose-400 text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {amIReceiving 
                        ? "In Exchange For" 
                        : amISending ? "You Requested" 
                        : `${gameState.players.find(p => p.id === activeTrade!.toPlayerId)?.name} Gives`}
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#0f0e1a] rounded-xl p-3 border border-[#2d2b55]/40">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Cash</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">${activeTrade!.requestCash}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Properties</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTrade!.requestProperties.length === 0 && <span className="text-slate-600 text-[11px] italic">No properties</span>}
                          {activeTrade!.requestProperties.map(idx => renderPropertyBadge(idx, true))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* ─── Creating New Trade ─── */
              <div className="space-y-6">
                {/* Player selector */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    Select Player
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {otherPlayers.map(p => (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedPlayerId(p.id)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all font-bold text-sm ${
                          selectedPlayerId === p.id 
                            ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.12)]' 
                            : 'bg-[#1a1a2e] border-[#2d2b55]/50 text-slate-400 hover:text-slate-200 hover:border-[#3d3b65]'
                        }`}
                        style={{ border: `1.5px solid ${selectedPlayerId === p.id ? 'rgba(168,85,247,0.5)' : 'rgba(45,43,85,0.5)'}` }}
                      >
                        <div className="relative">
                          <div 
                            className="w-5 h-5 rounded-full shrink-0"
                            style={{ backgroundColor: p.color || '#cbd5e1' }}
                          />
                          {selectedPlayerId === p.id && (
                            <motion.div 
                              layoutId="selectedPlayer"
                              className="absolute -inset-1 rounded-full border-2 border-purple-400/60"
                            />
                          )}
                        </div>
                        {p.name}
                        <span className="text-[10px] text-emerald-400 font-mono ml-1">${p.cash}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {selectedPlayerId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Swap indicator */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: me?.color || '#cbd5e1' }} />
                        <span className="text-xs font-bold text-slate-300">You</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
                      </div>
                      <motion.div 
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-black backdrop-blur-md"
                      >
                        ⇄
                      </motion.div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 h-px bg-gradient-to-l from-rose-500/30 to-transparent" />
                        <span className="text-xs font-bold text-slate-300">{targetPlayer?.name}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: targetPlayer?.color || '#cbd5e1' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* ── My Offer ── */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#1a1a2e]/60 border border-emerald-500/15 rounded-2xl p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-emerald-400/20 rounded-t-2xl" />
                        <h3 className="font-black text-emerald-400 text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          I&apos;m Offering
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Cash input */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cash Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 font-black text-sm">$</span>
                              <input 
                                type="number" 
                                min="0"
                                max={me?.cash || 0}
                                value={offerCash}
                                onChange={(e) => setOfferCash(Math.max(0, Math.min(Number(e.target.value), me?.cash || 0)))}
                                className="w-full bg-[#0f0e1a] border border-[#2d2b55]/50 rounded-xl pl-8 pr-3 py-3 text-emerald-400 font-black text-lg outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                              />
                            </div>
                            {/* Range slider */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max={me?.cash || 0}
                                step={10}
                                value={offerCash}
                                onChange={(e) => setOfferCash(Number(e.target.value))}
                                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(52,211,153,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-300 [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_14px_rgba(52,211,153,0.7)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-300 [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                style={{
                                  background: `linear-gradient(to right, #34d399 0%, #34d399 ${(me?.cash ? (offerCash / me.cash) * 100 : 0)}%, #1e1b3a ${(me?.cash ? (offerCash / me.cash) * 100 : 0)}%, #1e1b3a 100%)`
                                }}
                              />
                              <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{me?.cash ? Math.round((offerCash / me.cash) * 100) : 0}%</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-600">Available: <span className="text-slate-400 font-mono">${me?.cash}</span></span>
                              <div className="flex gap-1">
                                {[100, 500].map(amount => (
                                  <button
                                    key={amount}
                                    onClick={() => setOfferCash(Math.min(offerCash + amount, me?.cash || 0))}
                                    className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                                  >
                                    +${amount}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Properties */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                              Properties 
                              {offerProperties.length > 0 && (
                                <span className="text-purple-400 ml-1">({offerProperties.length} selected)</span>
                              )}
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d2b55 transparent' }}>
                              {myProperties.length === 0 && <span className="text-slate-600 text-[11px] italic">You have no properties</span>}
                              {myProperties.map(idx => renderPropertyBadge(idx, offerProperties.includes(idx), () => handleToggleOfferProperty(idx)))}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* ── I Want ── */}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#1a1a2e]/60 border border-rose-500/15 rounded-2xl p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/60 to-rose-400/20 rounded-t-2xl" />
                        <h3 className="font-black text-rose-400 text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          I Want
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Cash input */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cash Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 font-black text-sm">$</span>
                              <input 
                                type="number" 
                                min="0"
                                max={targetPlayer?.cash || 0}
                                value={requestCash}
                                onChange={(e) => setRequestCash(Math.max(0, Math.min(Number(e.target.value), targetPlayer?.cash || 0)))}
                                className="w-full bg-[#0f0e1a] border border-[#2d2b55]/50 rounded-xl pl-8 pr-3 py-3 text-emerald-400 font-black text-lg outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all font-mono"
                              />
                            </div>
                            {/* Range slider */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max={targetPlayer?.cash || 0}
                                step={10}
                                value={requestCash}
                                onChange={(e) => setRequestCash(Number(e.target.value))}
                                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(251,113,133,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-300 [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_14px_rgba(251,113,133,0.7)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-rose-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-300 [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                                style={{
                                  background: `linear-gradient(to right, #fb7185 0%, #fb7185 ${(targetPlayer?.cash ? (requestCash / targetPlayer.cash) * 100 : 0)}%, #1e1b3a ${(targetPlayer?.cash ? (requestCash / targetPlayer.cash) * 100 : 0)}%, #1e1b3a 100%)`
                                }}
                              />
                              <span className="text-[9px] text-slate-500 font-mono w-8 text-right">{targetPlayer?.cash ? Math.round((requestCash / targetPlayer.cash) * 100) : 0}%</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-600">They have: <span className="text-slate-400 font-mono">${targetPlayer?.cash}</span></span>
                              <div className="flex gap-1">
                                {[100, 500].map(amount => (
                                  <button
                                    key={amount}
                                    onClick={() => setRequestCash(Math.min(requestCash + amount, targetPlayer?.cash || 0))}
                                    className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md font-bold hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                                  >
                                    +${amount}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Properties */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                              Properties
                              {requestProperties.length > 0 && (
                                <span className="text-purple-400 ml-1">({requestProperties.length} selected)</span>
                              )}
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d2b55 transparent' }}>
                              {targetProperties.length === 0 && <span className="text-slate-600 text-[11px] italic">They have no properties</span>}
                              {targetProperties.map(idx => renderPropertyBadge(idx, requestProperties.includes(idx), () => handleToggleRequestProperty(idx)))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* ── Action Bar ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-6 py-4 border-t border-[#2d2b55]/40 bg-[#0f0e1a]/80 backdrop-blur-md flex justify-between items-center gap-4"
          >
            {isPendingTrade ? (
              amIReceiving ? (
                <>
                  {/* Trade summary */}
                  <div className="text-[10px] text-slate-500 flex-1">
                    <span className="font-bold text-purple-400">Review carefully</span> — this trade is permanent
                  </div>
                  <div className="flex gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDeclineTrade}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black py-3 px-6 rounded-xl border border-rose-500/30 transition-all text-sm uppercase tracking-wider"
                    >
                      Decline
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNegotiateTrade}
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-black py-3 px-6 rounded-xl border border-purple-500/30 transition-all text-sm uppercase tracking-wider"
                    >
                      Negotiate
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAcceptTrade}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider"
                    >
                      Accept Trade ✓
                    </motion.button>
                  </div>
                </>
              ) : amISending ? (
                <>
                  <div className="text-[10px] text-slate-500 flex-1 flex items-center gap-2">
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                    <span>Waiting for response...</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDeclineTrade}
                    className="bg-[#1a1a2e] hover:bg-[#2d2b55] text-slate-300 font-bold py-3 px-6 rounded-xl border border-[#2d2b55]/60 transition-all text-sm"
                  >
                    Cancel Proposal
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="flex-1" />
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="bg-[#1a1a2e] hover:bg-[#2d2b55] text-slate-300 font-bold py-3 px-6 rounded-xl border border-[#2d2b55]/60 transition-all text-sm"
                  >
                    Close
                  </motion.button>
                </>
              )
            ) : (
              <>
                {/* Trade summary */}
                <div className="text-[10px] text-slate-500 flex-1">
                  {canSend ? (
                    <span className="text-emerald-400/70">
                      Ready to send — {offerProperties.length + requestProperties.length} properties, ${offerCash + requestCash} total cash
                    </span>
                  ) : selectedPlayerId ? (
                    <span>Add cash or properties to create an offer</span>
                  ) : (
                    <span>Choose a player to begin</span>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-white text-sm font-bold py-2.5 px-4 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={canSend ? { scale: 1.03 } : undefined}
                    whileTap={canSend ? { scale: 0.97 } : undefined}
                    onClick={handleSendTrade}
                    disabled={!canSend}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                  >
                    Send Offer →
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
