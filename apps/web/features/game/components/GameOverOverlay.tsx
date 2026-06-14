import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GameState, PlayerState } from '@richup/shared-types';
import { useRouter } from 'next/navigation';
import { Trophy, Home, Medal, Crown } from 'lucide-react';

interface GameOverOverlayProps {
  gameState: GameState;
}

// Simple deterministic pseudo-random for stable initial confetti state
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ gameState }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedPlayers = [...gameState.players].sort((a, b) => b.totalAssetValue - a.totalAssetValue);
  const winner = sortedPlayers[0]; // Or gameState.players.find(p => p.id === gameState.winner)

  if (!mounted || !winner) return null;

  const confettiCount = 60;
  const emojis = ['🎉', '💎', '💸', '🏆', '✨', '🪙', '🎊'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[#0f0e1a]/80 backdrop-blur-xl"
      />

      {/* Confetti Explosion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: confettiCount }).map((_, i) => {
          const randX = pseudoRandom(i) * 100;
          const randY = pseudoRandom(i + 100) * 100;
          const delay = pseudoRandom(i + 200) * 1.5;
          const emoji = emojis[Math.floor(pseudoRandom(i + 300) * emojis.length)];
          const size = 16 + pseudoRandom(i + 400) * 24;

          return (
            <motion.div
              key={i}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${randX}vw`,
                y: `${randY > 50 ? randY + 50 : randY - 20}vh`, // explode outwards more
                scale: [0, 1.5, 1],
                opacity: [1, 1, 0],
                rotate: [0, 360 * (pseudoRandom(i) > 0.5 ? 1 : -1)],
              }}
              transition={{
                duration: 3 + pseudoRandom(i) * 2,
                delay: delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ fontSize: size }}
            >
              {emoji}
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        className="relative z-10 w-full max-w-2xl bg-[#1a1a2e]/90 border border-purple-500/30 rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.2)] p-8 flex flex-col items-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute -top-12 bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4 border-[#1a1a2e]"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mt-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 text-center tracking-tight drop-shadow-lg">
          GAME OVER
        </h1>
        
        <p className="mt-2 text-slate-400 font-medium text-sm uppercase tracking-widest">
          Final Rankings
        </p>

        {/* Winner Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 w-full bg-gradient-to-r from-[#2d2b55] to-[#1e1d3a] border border-amber-500/40 rounded-2xl p-6 flex flex-col items-center shadow-lg shadow-amber-500/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 animate-[shimmer_3s_infinite]" />
          <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2">Winner</span>
          <div className="flex items-center gap-4 relative z-10">
            <div 
              className="w-12 h-12 rounded-full border-2 shadow-[0_0_15px_currentColor]"
              style={{ backgroundColor: winner.color, borderColor: winner.color, color: winner.color }}
            />
            <div>
              <h2 className="text-2xl font-black text-white">{winner.name}</h2>
              <p className="text-amber-400 font-bold tabular-nums text-lg">${winner.totalAssetValue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard List */}
        <div className="mt-8 w-full flex flex-col gap-3">
          {sortedPlayers.map((player, index) => {
            if (index === 0) return null; // Skip winner as they are highlighted above
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  player.bankrupt 
                    ? 'bg-rose-950/20 border-rose-900/30 opacity-70' 
                    : 'bg-[#12111f]/60 border-[#2d2b55]/40'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a2e] border border-[#2d2b55] font-black text-slate-400 shrink-0">
                  {index + 1}
                </div>
                
                <div 
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: player.color }}
                />

                <div className="flex-1 min-w-0">
                  <span className={`font-bold block truncate ${player.bankrupt ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {player.name}
                  </span>
                  {player.bankrupt && (
                    <span className="text-[10px] text-rose-500 font-black uppercase tracking-wider">Bankrupt</span>
                  )}
                </div>

                <div className="text-right">
                  <span className={`font-bold tabular-nums ${player.bankrupt ? 'text-slate-600' : 'text-slate-300'}`}>
                    ${player.totalAssetValue.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Return Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/rooms')}
          className="mt-10 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
        >
          <Home className="w-5 h-5" />
          Return to Lobby
        </motion.button>

      </motion.div>
    </div>
  );
};
