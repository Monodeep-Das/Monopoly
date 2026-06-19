"use client";

import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/features/stats/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const router = useRouter();
  
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: statsApi.getLeaderboard,
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-4 sm:mt-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <button 
              onClick={() => router.push("/rooms")}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[10px]"
            >
              ← Back to Lobby
            </button>
            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-br from-indigo-400 to-rose-400 text-transparent bg-clip-text drop-shadow-sm">
              Global Leaderboard
            </h1>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h2 className="font-black text-slate-200 uppercase tracking-widest text-sm sm:text-base">Top Players</h2>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
              Loading rankings...
            </div>
          ) : leaderboard?.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No ranked players yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-950">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2 text-right">Wins</div>
                <div className="col-span-2 text-right">Win %</div>
                <div className="col-span-2 text-right">Games</div>
              </div>
              
              {leaderboard?.map((player) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={player.id} 
                  className={`flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-4 p-4 items-start md:items-center hover:bg-slate-800/30 transition-colors ${
                    player.rank === 1 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500' :
                    player.rank === 2 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-l-4 border-slate-300' :
                    player.rank === 3 ? 'bg-gradient-to-r from-orange-400/10 to-transparent border-l-4 border-orange-400' : ''
                  }`}
                >
                  <div className="flex w-full md:contents justify-between items-center mb-2 md:mb-0">
                    <div className="flex items-center gap-3 md:col-span-1 md:justify-center">
                      {player.rank === 1 ? (
                        <span className="text-3xl filter drop-shadow-md" title="1st Place">🥇</span>
                      ) : player.rank === 2 ? (
                        <span className="text-3xl filter drop-shadow-md" title="2nd Place">🥈</span>
                      ) : player.rank === 3 ? (
                        <span className="text-3xl filter drop-shadow-md" title="3rd Place">🥉</span>
                      ) : (
                        <span className="font-black text-slate-400 text-lg w-8 text-center">{player.rank}</span>
                      )}
                    </div>
                    
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-slate-300 shadow-inner">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-black text-base sm:text-lg tracking-wide ${player.rank === 1 ? 'text-amber-400' : player.rank === 2 ? 'text-slate-200' : player.rank === 3 ? 'text-orange-400' : 'text-slate-300'}`}>
                        {player.username}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full md:contents grid grid-cols-3 gap-2 mt-2 md:mt-0 text-center md:text-right bg-slate-950/50 md:bg-transparent p-2 md:p-0 rounded-xl">
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 md:hidden font-bold mb-1">Wins</span>
                      <span className="font-black text-emerald-400 text-sm sm:text-base">{player.wins}</span>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 md:hidden font-bold mb-1">Win Rate</span>
                      <span className="font-black text-slate-300 text-sm sm:text-base">{player.winRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col md:block">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 md:hidden font-bold mb-1">Games</span>
                      <span className="font-black text-slate-400 text-sm sm:text-base">{player.gamesPlayed}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
