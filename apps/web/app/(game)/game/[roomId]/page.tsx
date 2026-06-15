"use client";

import { GameBoard } from "@/features/game/components/GameBoard";
import { useGameStore } from "@/features/game/store/game-store";
import { useAuthStore } from "@/lib/store/auth";
import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { TradeModal } from "@/features/game/components/TradeModal";
import { BOARD_TILES } from "@richup/game-engine";
import { IdleWarningTimer } from "@/features/game/components/IdleWarningTimer";
import { AuctionModal } from "@/features/game/components/AuctionModal";
import { PropertyModal } from "@/features/game/components/PropertyModal";
import { GameOverOverlay } from "@/features/game/components/GameOverOverlay";
import { LedgerModal } from "@/features/game/components/LedgerModal";
import { motion, AnimatePresence } from "framer-motion";
import { Dice3D } from "@/features/game/components/Dice3D";
import { 
  Dices, SkipForward, Coins, Ticket, ReceiptText, 
  Footprints, Flag, Home, Receipt, Hammer, Lock, Unlock, 
  Gift, Sparkles, Siren, Key, Megaphone, BadgeDollarSign, 
  Trophy, Handshake, CheckCircle2, XCircle, HeartCrack, 
  PlaySquare, Gamepad2, Medal, AlertTriangle, ArrowDownCircle, Info, Eye
} from "lucide-react";
import { getTileRect, Point } from '@/features/game/utils/board-math';
import { playPurchaseSound, playDebitSound } from '@/features/game/utils/audio';

// ─── Slide-in Card Wrapper ───
function OverlayCard({ children, borderColor = "#6366f1" }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.3, ease: "backIn" } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-[#1a1a2e]/95 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-center mb-3 w-full max-w-xs origin-center"
      style={{ border: `1.5px solid ${borderColor}50` }}
    >
      {children}
    </motion.div>
  );
}

// ─── Pulse Dot for turn indicator ───
function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

export default function GamePage({ params: paramsPromise }: { params: Promise<{ roomId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { gameState, dispatchAction, socket, isConnected, resetGameState, spectators } = useGameStore();
  const { user } = useAuthStore();

  const prevPropertiesRef = useRef(gameState?.properties || []);

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [selectedPropertyTile, setSelectedPropertyTile] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [prevRollId, setPrevRollId] = useState<string>("");

  useEffect(() => {
    if (isConnected && socket) {
      socket.emit("join_room", { roomId: params.roomId });
      
      const handleSpectators = (spectators: any) => {
        useGameStore.getState().setSpectators(spectators);
      };
      
      socket.on("spectators_updated", handleSpectators);
      
      return () => {
        socket.off("spectators_updated", handleSpectators);
      };
    }
  }, [isConnected, socket, params.roomId]);

  useEffect(() => {
    return () => {
      resetGameState();
    };
  }, [resetGameState]);

  // Auto-scroll activity feed (newest at top)
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [gameState?.log?.length]);

  // Dice roll animation trigger
  useEffect(() => {
    const currentRollId = gameState?.lastDiceRoll ? `${gameState.lastDiceRoll.die1}-${gameState.lastDiceRoll.die2}-${gameState.currentPlayerIndex}-${gameState.log?.length}` : "";
    if (gameState?.lastDiceRoll && currentRollId !== prevRollId) {
      if (prevRollId !== "") { // Don't animate on initial load
        setIsRolling(true);
        setTimeout(() => {
          setIsRolling(false);
        }, 800);
      }
      setPrevRollId(currentRollId);
    }
  }, [gameState?.lastDiceRoll, prevRollId, gameState?.currentPlayerIndex, gameState?.log?.length]);

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === user?.id;
  const myProperties = gameState?.properties.filter(p => p.ownerId === user?.id) || [];
  const myPlayer = gameState?.players.find(p => p.id === user?.id);

  // Hook to detect property purchases
  useEffect(() => {
    if (gameState) {
      const prevOwned = prevPropertiesRef.current.filter((p: any) => p.ownerId !== null).length;
      const currOwned = gameState.properties.filter(p => p.ownerId !== null).length;
      
      // If the total number of owned properties increased, someone bought a property!
      if (currOwned > prevOwned) {
        playPurchaseSound();
      }
      
      prevPropertiesRef.current = gameState.properties;
    }
  }, [gameState?.properties]);

  const prevPlayersRef = useRef(gameState?.players || []);

  // Hook to detect money debits
  useEffect(() => {
    if (gameState) {
      const prevPlayers = prevPlayersRef.current;
      const currPlayers = gameState.players;
      
      let wasDebited = false;
      for (const curr of currPlayers) {
        const prev = prevPlayers.find(p => p.id === curr.id);
        if (prev && curr.cash < prev.cash) {
          wasDebited = true;
          break;
        }
      }
      
      if (wasDebited) {
        playDebitSound();
      }
      
      prevPlayersRef.current = currPlayers;
    }
  }, [gameState?.players]);

  // Auto-open trade modal when a trade is proposed to the current user
  useEffect(() => {
    if (gameState?.activeTrade && gameState.activeTrade.toPlayerId === user?.id && gameState.activeTrade.status === 'pending') {
      setShowTradeModal(true);
    }
  }, [gameState?.activeTrade, user?.id]);

  const handleRollDice = () => {
    dispatchAction({ type: 'ROLL_DICE' });
  };

  const handleEndTurn = () => {
    dispatchAction({ type: 'END_TURN' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${params.roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameState) {
    return (
      <div className="h-screen bg-[#0f0e1a] text-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 border-2 border-purple-500/30 rounded-full" />
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide">Connecting to game...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f0e1a] text-slate-100 flex overflow-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <IdleWarningTimer />
      <AuctionModal />
      {gameState.phase === 'GAME_OVER' && <GameOverOverlay gameState={gameState} />}

      {selectedPropertyTile !== null && (
        <PropertyModal
          tileIndex={selectedPropertyTile}
          onClose={() => setSelectedPropertyTile(null)}
        />
      )}

      {/* ═══════════ LEFT SIDEBAR ═══════════ */}
      <aside className="w-56 bg-[#12111f] border-r border-[#2d2b55]/60 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-[#2d2b55]/60 flex items-center gap-1.5">
          <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text tracking-tight">MONOPOLY</span>
        </div>

        {/* Share link */}
        <div className="px-3 py-2.5 border-b border-[#2d2b55]/60">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>🔗</span> Share this game
          </p>
          <div className="flex gap-1">
            <code className="flex-1 text-[10px] bg-[#1a1a2e] text-purple-300/80 px-2 py-1.5 rounded truncate font-mono border border-[#2d2b55]/50">
              .../{params.roomId.substring(0, 8)}
            </code>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleCopy}
              className={`text-[10px] px-2.5 py-1.5 rounded font-bold transition-all ${copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#2d2b55] hover:bg-[#3d3b65] text-slate-300 border border-transparent'
                }`}
            >
              {copied ? '✓' : '📋'}
            </motion.button>
          </div>
        </div>

        {/* Chat */}
        <div className="px-3 py-2 border-b border-[#2d2b55]/60 flex items-center gap-2">
          <span className="text-xs">💬</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chat</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 text-xs space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d2b55 transparent' }}>
          {gameState?.log?.filter(e => e.type === 'CHAT_MESSAGE').map((msg, i) => (
            <div key={`chat-${i}`} className="flex flex-col">
              {msg.playerId && (
                <span className="font-bold text-[10px] mb-0.5" style={{ color: gameState.players.find(p => p.id === msg.playerId)?.color || '#fff' }}>
                  {gameState.players.find(p => p.id === msg.playerId)?.name}
                </span>
              )}
              <span className="text-slate-200 bg-[#2d2b55]/40 px-2.5 py-1.5 rounded-lg rounded-tl-none inline-block break-words self-start">
                {msg.message}
              </span>
            </div>
          ))}
          {(!gameState?.log?.some(e => e.type === 'CHAT_MESSAGE')) && (
            <p className="flex items-center gap-1.5 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
              No messages yet
            </p>
          )}
        </div>
        <div className="p-2 border-t border-[#2d2b55]/60 relative">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chatInput.trim()) {
                useGameStore.getState().sendChat(chatInput);
                setChatInput("");
              }
            }}
            placeholder="Type a message..."
            className="w-full bg-[#1a1a2e] border border-[#2d2b55]/50 rounded-lg pl-2.5 pr-8 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
          <button
            onClick={() => {
              if (chatInput.trim()) {
                useGameStore.getState().sendChat(chatInput);
                setChatInput("");
              }
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

        {/* Leave Game */}
        <div className="p-2 border-t border-[#2d2b55]/60">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm("Are you sure you want to leave?")) {
                router.push("/rooms");
              }
            }}
            className="w-full bg-rose-500/8 hover:bg-rose-500/15 text-rose-400 text-[11px] font-bold py-2 rounded-lg border border-rose-500/15 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Leave Game
          </motion.button>
        </div>
      </aside>

      {/* ═══════════ CENTER — Board ═══════════ */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#0f0e1a]">
        <div className="flex-1 relative flex items-center justify-center p-3 overflow-hidden">
          <GameBoard onTileClick={(idx) => setSelectedPropertyTile(idx)} />

          {/* ─── Board Center Overlay ─── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className="pointer-events-auto flex flex-col items-center gap-1"
              style={{ width: '52%', maxWidth: '400px', maxHeight: '58%' }}
            >
              <AnimatePresence mode="wait">
                {/* Dice */}
                <motion.div
                  key="dice"
                  className="flex gap-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dice3D value={gameState.lastDiceRoll?.die1 || 1} isRolling={isRolling} />
                  <Dice3D value={gameState.lastDiceRoll?.die2 || 1} isRolling={isRolling} />
                </motion.div>

                {/* Doubles indicator */}
                {gameState.consecutiveDoubles > 0 && gameState.phase === 'ROLLING' && (
                  <motion.span
                    key="doubles"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] font-black text-amber-400 tracking-widest uppercase mb-1 drop-shadow-md"
                  >
                    ⚡ Doubles! Roll Again
                  </motion.span>
                )}

                {/* Roll Dice */}
                {isMyTurn && gameState.phase === 'ROLLING' && !currentPlayer?.inJail && (
                  <motion.button
                    key="roll"
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      boxShadow: [
                        '0 8px 20px rgba(124, 58, 237, 0.25), 0 0 0 0 rgba(139, 92, 246, 0.5)',
                        '0 8px 20px rgba(124, 58, 237, 0.25), 0 0 0 12px rgba(139, 92, 246, 0)',
                      ]
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      scale: { type: "spring", stiffness: 400, damping: 25 },
                      y: { type: "spring", stiffness: 400, damping: 25 },
                      boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
                    }}
                    exit={{ opacity: 0, scale: 0, transition: { duration: 0.2, ease: "backIn" } }}
                    whileHover={{ y: -1, filter: "brightness(1.05)" }}
                    whileTap={{ y: 1, filter: "brightness(1)", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2), 0 0 0 0 rgba(139, 92, 246, 0)" }}
                    onClick={handleRollDice}
                    style={{
                      background: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)'
                    }}
                    className="h-[44px] min-w-[160px] rounded-[11px] flex items-center justify-center gap-2 mb-2 text-white font-semibold text-[16px] transition-transform duration-100"
                  >
                    <Dices size={20} className="text-white" strokeWidth={2.5} />
                    Roll the dice
                  </motion.button>
                )}

                {/* End Turn */}
                {isMyTurn && (gameState.phase === 'ACTION' || gameState.phase === 'TRADE') && (
                  <motion.button
                    key="end-turn"
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0, transition: { duration: 0.2, ease: "backIn" } }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ y: -1, filter: "brightness(1.05)" }}
                    whileTap={{ y: 1, filter: "brightness(1)", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" }}
                    onClick={handleEndTurn}
                    style={{
                      background: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)',
                      boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)'
                    }}
                    className="h-[44px] min-w-[160px] rounded-[11px] flex items-center justify-center gap-2 mb-2 text-white font-semibold text-[16px] transition-transform duration-100"
                  >
                    <SkipForward size={20} className="text-white" strokeWidth={2.5} />
                    End Turn
                  </motion.button>
                )}

                {/* Jail */}
                {isMyTurn && gameState.phase === 'JAIL_DECISION' && currentPlayer?.inJail && (
                  <OverlayCard key="jail-card" borderColor="#f97316">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-xs font-black text-orange-400 tracking-wider uppercase">In Jail — Turn {(currentPlayer?.jailTurns ?? 0) + 1}/3</span>
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{
                          opacity: 1, scale: 1, y: 0,
                          boxShadow: [
                            '0 8px 20px rgba(99, 102, 241, 0.25), 0 0 0 0 rgba(99, 102, 241, 0.5)',
                            '0 8px 20px rgba(99, 102, 241, 0.25), 0 0 0 8px rgba(99, 102, 241, 0)',
                          ]
                        }}
                        transition={{
                          opacity: { duration: 0.2 },
                          scale: { type: "spring", stiffness: 400, damping: 25 },
                          y: { type: "spring", stiffness: 400, damping: 25 },
                          boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
                        }}
                        exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.2 } }}
                        whileHover={{ y: -1, filter: "brightness(1.05)" }}
                        whileTap={{ y: 1, filter: "brightness(1)", boxShadow: "0 4px 10px rgba(99, 102, 241, 0.2), 0 0 0 0 rgba(99, 102, 241, 0)" }}
                        onClick={() => dispatchAction({ type: 'ROLL_FOR_JAIL' })}
                        style={{ background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)' }}
                        className="h-[44px] flex-1 rounded-[11px] flex items-center justify-center gap-1.5 text-white font-semibold text-[14px] transition-transform duration-100"
                      >
                        <Dices size={18} className="text-white" strokeWidth={2.5} /> Roll Doubles
                      </motion.button>
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{
                          opacity: 1, scale: 1, y: 0,
                          boxShadow: [
                            '0 8px 20px rgba(249, 115, 22, 0.25), 0 0 0 0 rgba(249, 115, 22, 0.5)',
                            '0 8px 20px rgba(249, 115, 22, 0.25), 0 0 0 8px rgba(249, 115, 22, 0)',
                          ]
                        }}
                        transition={{
                          opacity: { duration: 0.2 },
                          scale: { type: "spring", stiffness: 400, damping: 25 },
                          y: { type: "spring", stiffness: 400, damping: 25 },
                          boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
                        }}
                        exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.2 } }}
                        whileHover={ (currentPlayer?.cash ?? 0) < 50 ? {} : { y: -1, filter: "brightness(1.05)" } }
                        whileTap={ (currentPlayer?.cash ?? 0) < 50 ? {} : { y: 1, filter: "brightness(1)", boxShadow: "0 4px 10px rgba(249, 115, 22, 0.2), 0 0 0 0 rgba(249, 115, 22, 0)" } }
                        onClick={() => dispatchAction({ type: 'PAY_JAIL_BAIL' })}
                        disabled={(currentPlayer?.cash ?? 0) < 50}
                        style={{ background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' }}
                        className="h-[44px] flex-1 rounded-[11px] flex items-center justify-center gap-1.5 text-white font-semibold text-[14px] transition-transform duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Coins size={18} className="text-white" strokeWidth={2.5} /> Pay $50
                      </motion.button>
                    </div>
                    {(currentPlayer?.getOutOfJailFreeCards ?? 0) > 0 && (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{
                          opacity: 1, scale: 1, y: 0,
                          boxShadow: [
                            '0 8px 20px rgba(16, 185, 129, 0.25), 0 0 0 0 rgba(16, 185, 129, 0.5)',
                            '0 8px 20px rgba(16, 185, 129, 0.25), 0 0 0 8px rgba(16, 185, 129, 0)',
                          ]
                        }}
                        transition={{
                          opacity: { duration: 0.2 },
                          scale: { type: "spring", stiffness: 400, damping: 25 },
                          y: { type: "spring", stiffness: 400, damping: 25 },
                          boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
                        }}
                        exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.2 } }}
                        whileHover={{ y: -1, filter: "brightness(1.05)" }}
                        whileTap={{ y: 1, filter: "brightness(1)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2), 0 0 0 0 rgba(16, 185, 129, 0)" }}
                        onClick={() => dispatchAction({ type: 'USE_JAIL_CARD' })}
                        style={{ background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' }}
                        className="h-[44px] w-full mt-2 rounded-[11px] flex items-center justify-center gap-1.5 text-white font-semibold text-[14px] transition-transform duration-100"
                      >
                        <Ticket size={18} className="text-white" strokeWidth={2.5} /> Use Jail Card
                      </motion.button>
                    )}
                  </OverlayCard>
                )}

                {/* Buy / Auction */}
                {isMyTurn && gameState.phase === 'LANDED' && currentPlayer && (
                  <OverlayCard key="buy-card" borderColor="#6366f1">
                    <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Unowned Property</span>
                    <h3 className="text-lg font-black text-white">{BOARD_TILES[currentPlayer.position]?.name}</h3>
                    {(BOARD_TILES[currentPlayer.position] as any)?.price && (
                      <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-0.5 rounded-full">
                        ${(BOARD_TILES[currentPlayer.position] as any).price}
                      </span>
                    )}
                    <div className="flex gap-2 w-full">
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => dispatchAction({ type: 'DECLINE_PROPERTY' })}
                        className="flex-1 bg-[#2d2b55] hover:bg-[#3d3b65] text-slate-300 font-bold py-2.5 rounded-lg text-xs border border-[#3d3b65] transition-colors"
                      >
                        Auction
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => dispatchAction({ type: 'BUY_PROPERTY' })}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-2.5 rounded-lg text-xs shadow-lg shadow-emerald-500/25"
                      >
                        Buy
                      </motion.button>
                    </div>
                  </OverlayCard>
                )}

                {/* Bankruptcy */}
                {isMyTurn && gameState.phase === 'BANKRUPT_RESOLUTION' && currentPlayer && (
                  <OverlayCard key="bankrupt-card" borderColor="#ef4444">
                    <span className="text-lg">🚨</span>
                    <span className="text-xs font-black text-rose-400 tracking-wider uppercase">In Debt!</span>
                    <p className="text-slate-400 text-[11px] text-center">You have a negative balance. Mortgage properties, sell houses, or trade to clear your debt.</p>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        let creditorId = 'bank';
                        const landedProp = gameState.properties.find(p => p.tileIndex === currentPlayer.position);
                        if (landedProp && landedProp.ownerId && landedProp.ownerId !== currentPlayer.id) {
                          creditorId = landedProp.ownerId;
                        }
                        dispatchAction({ type: 'DECLARE_BANKRUPTCY', creditorId } as any);
                      }}
                      className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black py-2.5 rounded-lg text-xs shadow-lg"
                    >
                      Declare Bankruptcy
                    </motion.button>
                  </OverlayCard>
                )}
              </AnimatePresence>

              {/* Activity Feed — lightweight event ticker */}
              <div
                ref={feedRef}
                className="w-[280px] max-h-[220px] overflow-y-auto mx-auto mt-4 pr-1 [&::-webkit-scrollbar]:hidden"
                style={{
                  scrollbarWidth: 'none',
                  maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                }}
              >
                {(() => {
                  const entries = [...(gameState.log || [])]
                    .map((e, index) => ({ ...e, originalIndex: index }))
                    .filter(e => e.type !== 'CHAT_MESSAGE')
                    .filter(e => !(e.type === 'ERROR' && e.message === 'Not your turn'))
                    .reverse()
                    .slice(0, 40);
                  const getEventIcon = (type: string) => {
                    const iconProps = { size: 14, strokeWidth: 2.5, className: "opacity-90" };
                    switch (type) {
                      case 'DICE_ROLLED': return <Dices {...iconProps} className="text-blue-400" />;
                      case 'PLAYER_MOVED': return <Footprints {...iconProps} className="text-slate-400" />;
                      case 'PLAYER_PASSED_GO': return <Flag {...iconProps} className="text-emerald-400" />;
                      case 'PROPERTY_PURCHASED': return <Home {...iconProps} className="text-fuchsia-400" />;
                      case 'RENT_PAID': return <Coins {...iconProps} className="text-amber-400" />;
                      case 'TAX_PAID': return <Receipt {...iconProps} className="text-rose-400" />;
                      case 'HOUSE_BUILT': return <Hammer {...iconProps} className="text-teal-400" />;
                      case 'HOUSE_SOLD': return <ArrowDownCircle {...iconProps} className="text-rose-400" />;
                      case 'PROPERTY_MORTGAGED': return <Lock {...iconProps} className="text-slate-500" />;
                      case 'PROPERTY_UNMORTGAGED': return <Unlock {...iconProps} className="text-emerald-400" />;
                      case 'CARD_DRAWN': return <Gift {...iconProps} className="text-purple-400" />;
                      case 'CARD_EFFECT_APPLIED': return <Sparkles {...iconProps} className="text-yellow-400" />;
                      case 'SENT_TO_JAIL': return <Siren {...iconProps} className="text-red-500" />;
                      case 'RELEASED_FROM_JAIL': return <Key {...iconProps} className="text-amber-300" />;
                      case 'AUCTION_STARTED': return <Megaphone {...iconProps} className="text-orange-400" />;
                      case 'AUCTION_BID_PLACED': return <BadgeDollarSign {...iconProps} className="text-emerald-400" />;
                      case 'AUCTION_WON': return <Trophy {...iconProps} className="text-yellow-400" />;
                      case 'TRADE_PROPOSED': return <Handshake {...iconProps} className="text-blue-400" />;
                      case 'TRADE_ACCEPTED': return <CheckCircle2 {...iconProps} className="text-emerald-500" />;
                      case 'TRADE_DECLINED': return <XCircle {...iconProps} className="text-rose-500" />;
                      case 'PLAYER_BANKRUPT': return <HeartCrack {...iconProps} className="text-slate-600" />;
                      case 'TURN_CHANGED': return <PlaySquare {...iconProps} className="text-indigo-400" />;
                      case 'GAME_STARTED': return <Gamepad2 {...iconProps} className="text-fuchsia-500" />;
                      case 'GAME_OVER': return <Medal {...iconProps} className="text-yellow-400" />;
                      case 'ERROR': return <AlertTriangle {...iconProps} className="text-red-500" />;
                      default: return <Info {...iconProps} className="text-slate-500" />;
                    }
                  };
                  return entries.map((entry, i) => {
                    const opacity = i === 0 ? 1 : 0.9;
                    
                    // Check if a player's name is mentioned in the message
                    // We sort by name length descending to match the longest name first (e.g. "Bob" vs "BobTheBuilder")
                    const mentionedPlayer = [...gameState.players]
                      .sort((a, b) => b.name.length - a.name.length)
                      .find(p => entry.message.includes(p.name));

                    return (
                      <motion.div
                        layout
                        key={entry.originalIndex}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth, slow ease-out
                        className="flex items-start justify-start gap-2 py-[4px] px-2"
                        style={{ opacity }}
                      >
                        <span className="shrink-0 leading-none mt-[2px]">
                          {mentionedPlayer ? (
                            <div 
                              className="w-[15px] h-[15px] rounded-full flex items-center justify-center shrink-0 border-[1.5px] border-[#0f0e1a] shadow-sm relative overflow-hidden" 
                              style={{ backgroundColor: mentionedPlayer.color || '#cbd5e1', boxShadow: `0 1px 3px ${mentionedPlayer.color}60` }}
                              title={mentionedPlayer.name}
                            >
                              <div className="absolute inset-0 top-[-15%] rounded-full border border-white/30 scale-75 pointer-events-none" />
                              <span className="text-[9px] font-black text-white leading-none" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.4)' }}>
                                {mentionedPlayer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            getEventIcon(entry.type)
                          )}
                        </span>
                        <span className="text-[14px] leading-[1.3] text-white/80 break-words text-left font-medium max-w-full">
                          {entry.message}
                        </span>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Turn indicator bar */}
        <div className="h-9 bg-[#12111f] border-t border-[#2d2b55]/40 flex items-center justify-center px-4 shrink-0">
          {isMyTurn ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-bold text-emerald-400 flex items-center gap-2"
            >
              <PulseDot color="#34d399" />
              Your turn — {gameState.phase.replace(/_/g, ' ').toLowerCase()}
            </motion.span>
          ) : (
            <span className="text-[11px] text-slate-500 flex items-center gap-2">
              <span 
                className="w-1.5 h-1.5 rounded-full inline-block" 
                style={{ backgroundColor: currentPlayer?.color || '#475569', boxShadow: `0 0 8px ${currentPlayer?.color || '#475569'}80` }}
              />
              Waiting for <span className="font-bold" style={{ color: currentPlayer?.color || '#cbd5e1' }}>{currentPlayer?.name}</span>
            </span>
          )}
        </div>
      </main>

      {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
      <aside className="w-64 bg-[#12111f] border-l border-[#2d2b55]/60 flex flex-col shrink-0 overflow-hidden">

        {/* Players Header */}
        <div className="px-3 py-2 border-b border-[#2d2b55]/60 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Players</span>
          <button 
            onClick={() => setShowLedger(true)}
            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-wider uppercase bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition-colors"
          >
            <ReceiptText size={12} />
            Ledger
          </button>
        </div>

        {/* Players */}
        <div className="border-b border-[#2d2b55]/60">
          {gameState.players.map((p) => {
            const isTurn = currentPlayer?.id === p.id;
            const isMe = p.id === user?.id;
            return (
              <motion.div
                key={p.id}
                layout
                className={`flex items-center gap-2.5 px-3 py-2 border-b border-[#2d2b55]/30 transition-all ${isTurn ? 'bg-purple-500/8' : 'hover:bg-[#1a1a2e]/50'
                  }`}
              >
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full shrink-0 shadow-md"
                    style={{
                      backgroundColor: p.color || '#cbd5e1',
                      boxShadow: isTurn ? `0 0 12px ${p.color || '#cbd5e1'}60` : 'none'
                    }}
                  />
                  {isTurn && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2"
                      style={{ borderColor: p.color || '#cbd5e1' }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[13px] font-bold truncate block ${p.bankrupt ? 'text-slate-600 line-through' : isTurn ? 'text-white' : 'text-slate-300'
                    }`}>
                    {p.name}
                    {isMe && <span className="text-[9px] text-slate-500 ml-1">(you)</span>}
                  </span>
                </div>
                <span className={`text-[13px] font-black tabular-nums ${p.bankrupt ? 'text-slate-700' : p.cash < 0 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-100'
                  }`}>
                  {p.cash < 0 ? `-$${Math.abs(p.cash)}` : `$${p.cash}`}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="px-3 py-3 border-b border-[#2d2b55]/60">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              if (confirm("Declare bankruptcy?")) {
                dispatchAction({ type: 'DECLARE_BANKRUPTCY', creditorId: 'bank' } as any);
              }
            }}
            disabled={!isMyTurn}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold py-2 rounded-lg border border-rose-500/20 transition-all disabled:opacity-30 flex items-center justify-center"
          >
            Bankrupt
          </motion.button>
        </div>

        {/* Spectators */}
        {spectators && spectators.length > 0 && (
          <div className="border-b border-[#2d2b55]/60 bg-[#161426]">
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#2d2b55]/30">
              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={12} /> Spectating ({spectators.length})
              </span>
            </div>
            <div className="px-3 py-2.5 space-y-1.5">
              {spectators.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/60 shadow-[0_0_5px_rgba(217,70,239,0.5)]"></span>
                  {s.username}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trades */}
        <div className="border-b border-[#2d2b55]/60">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trades</span>
            {!gameState.activeTrade && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowTradeModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-sm hover:shadow-emerald-500/20 transition-all"
              >
                ✚ Create
              </motion.button>
            )}
          </div>
          <div className="px-3 pb-2.5">
            {gameState.activeTrade ? (
              <button
                onClick={() => setShowTradeModal(true)}
                className="w-full text-left bg-[#1a1a2e] border border-purple-500/40 hover:border-purple-400/80 rounded-lg p-2.5 text-xs cursor-pointer transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] block relative z-50 pointer-events-auto"
              >
                <div className="font-bold text-purple-300 text-[11px] flex items-center justify-between">
                  Active trade
                  <span className="text-[10px] text-purple-400/70 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">View →</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {gameState.players.find(p => p.id === gameState.activeTrade?.fromPlayerId)?.name}
                  <span className="text-purple-400 mx-1">↔</span>
                  {gameState.players.find(p => p.id === gameState.activeTrade?.toPlayerId)?.name}
                </div>
              </button>
            ) : (
              <div className="bg-[#1a1a2e] border border-[#2d2b55]/50 rounded-lg p-3 text-[11px] text-slate-500 text-center leading-relaxed">
                Make trades with other players to exchange properties and money.
              </div>
            )}
          </div>
        </div>

        {/* My Properties */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d2b55]/60 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              My properties ({myProperties.length})
            </span>
          </div>

          {myProperties.length === 0 ? (
            <div className="px-3 py-3">
              <div className="bg-[#1a1a2e] border border-[#2d2b55]/50 rounded-lg p-3 text-[11px] text-slate-500 text-center leading-relaxed">
                ⓘ Click on a property on the board to manage it.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2d2b55 transparent' }}>
              {myProperties.map(prop => {
                const tile = BOARD_TILES[prop.tileIndex];
                const tileAny = tile as any;
                const groupColor = tileAny.group ? getColorCode(tileAny.group) : '#cbd5e1';
                return (
                  <motion.button
                    key={prop.tileIndex}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedPropertyTile(prop.tileIndex)}
                    className="w-full flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2d2b55]/60 border border-[#2d2b55]/40 rounded-lg px-2.5 py-2 text-left transition-all group"
                  >
                    <div className="w-3 h-6 rounded-sm shrink-0" style={{ backgroundColor: groupColor }} />
                    <span className="flex-1 text-[11px] font-bold text-slate-300 truncate group-hover:text-purple-300 transition-colors">
                      {tile.name}
                    </span>
                    {prop.isMortgaged && (
                      <span className="text-[8px] text-rose-400 font-black bg-rose-500/10 px-1.5 py-0.5 rounded">M</span>
                    )}
                    {prop.houses > 0 && (
                      <span className="text-[9px] text-emerald-400 font-bold">
                        {prop.houses === 5 ? '🏨' : `${'🏠'.repeat(prop.houses)}`}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* My Balance Footer */}
        {myPlayer && (
          <div className="px-3 py-2.5 border-t border-[#2d2b55]/60 bg-[#0f0e1a]/50 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your balance</span>
              <span className="text-sm font-black text-emerald-400">${myPlayer.cash}</span>
            </div>
          </div>
        )}
      </aside>

      <LedgerModal
        isOpen={showLedger}
        onClose={() => setShowLedger(false)}
        gameState={gameState}
        currentPlayerId={user?.id || null}
      />
      {showTradeModal && (
        <TradeModal onClose={() => {
          // If there's still a pending trade when closing, auto-decline it
          const currentTrade = gameState?.activeTrade;
          if (currentTrade && currentTrade.status === 'pending') {
            dispatchAction({ type: 'TRADE_DECLINE', tradeId: currentTrade.id });
          }
          setShowTradeModal(false);
        }} />
      )}
    </div>
  );
}

function getColorCode(group: string) {
  const map: Record<string, string> = {
    "brown": "#8b4513",
    "light-blue": "#87ceeb",
    "pink": "#ff69b4",
    "orange": "#ffa500",
    "red": "#ef4444",
    "yellow": "#eab308",
    "green": "#22c55e",
    "dark-blue": "#3b82f6",
  };
  return map[group] || "#cbd5e1";
}
