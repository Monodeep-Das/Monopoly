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
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <button 
              onClick={() => router.push("/rooms")}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-2 font-medium"
            >
              ← Back to Lobby
            </button>
            <h1 className="text-4xl font-black bg-gradient-to-br from-indigo-400 to-rose-400 text-transparent bg-clip-text">
              Global Leaderboard
            </h1>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-200 uppercase tracking-widest">Top Players</h2>
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
              <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950">
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
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors ${
                    player.rank <= 3 ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    {player.rank === 1 ? (
                      <span className="text-2xl" title="1st Place">🥇</span>
                    ) : player.rank === 2 ? (
                      <span className="text-2xl" title="2nd Place">🥈</span>
                    ) : player.rank === 3 ? (
                      <span className="text-2xl" title="3rd Place">🥉</span>
                    ) : (
                      <span className="font-black text-slate-400">{player.rank}</span>
                    )}
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-bold ${player.rank <= 3 ? 'text-indigo-400' : 'text-slate-200'}`}>
                      {player.username}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-right font-black text-emerald-400">
                    {player.wins}
                  </div>
                  
                  <div className="col-span-2 text-right font-bold text-slate-300">
                    {player.winRate.toFixed(1)}%
                  </div>
                  
                  <div className="col-span-2 text-right font-bold text-slate-500">
                    {player.gamesPlayed}
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
