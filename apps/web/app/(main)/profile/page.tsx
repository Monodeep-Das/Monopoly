"use client";

import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/features/stats/api";
import { useAuthStore } from "@/lib/store/auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["stats", "me"],
    queryFn: statsApi.getMyStats,
    enabled: !!user,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["history", "me"],
    queryFn: statsApi.getMyHistory,
    enabled: !!user,
  });

  if (!user) {
    return <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <button 
              onClick={() => router.push("/rooms")}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-2 font-medium"
            >
              ← Back to Lobby
            </button>
            <h1 className="text-4xl font-black text-slate-100">
              My Profile
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/20 border-4 border-indigo-500/30 flex items-center justify-center font-black text-4xl text-indigo-400 mb-4">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-slate-100">{user.username}</h2>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">
                Joined {new Date(stats?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm mb-6">Career Stats</h3>
              
              {isStatsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Games Played</span>
                    <span className="text-slate-200 font-black text-xl">{stats?.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Wins</span>
                    <span className="text-emerald-400 font-black text-xl">{stats?.wins}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Losses</span>
                    <span className="text-rose-400 font-black text-xl">{stats?.losses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Win Rate</span>
                    <span className="text-indigo-400 font-black text-xl">{stats?.winRate.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Match History */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-slate-200 uppercase tracking-widest">Match History</h3>
              </div>
              
              {isHistoryLoading ? (
                <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
                  Loading match history...
                </div>
              ) : history?.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  <div className="text-4xl mb-4">🎲</div>
                  <p>You haven't played any games yet.</p>
                  <button 
                    onClick={() => router.push("/rooms")}
                    className="mt-4 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                  >
                    Join a game now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {history?.map((match) => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={match.gameId} 
                      className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-black uppercase tracking-widest ${
                            match.result === 'Victory' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            match.result === 'Defeat' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          }`}>
                            {match.result}
                          </span>
                          <span className="text-slate-400 font-medium text-sm">
                            {new Date(match.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-200 text-lg">{match.roomName}</h4>
                        <p className="text-slate-500 text-sm mt-1">
                          vs. {match.opponents.join(", ") || "Nobody"}
                        </p>
                      </div>
                      
                      <div className="text-right flex flex-col gap-1 items-end">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Final Rank</span>
                        <span className="text-2xl font-black text-slate-200">#{match.rank || '-'}</span>
                        <span className="text-emerald-400 font-bold text-sm">${match.finalMoney}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
