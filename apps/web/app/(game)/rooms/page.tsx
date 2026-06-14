"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "@/features/rooms/api";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { LogOut, User, Trophy, Plus, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function LobbyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getRooms,
    refetchInterval: 5000, // Poll every 5s
  });

  const createRoomMutation = useMutation({
    mutationFn: roomsApi.createRoom,
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push(`/rooms/${newRoom.id}`);
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: roomsApi.joinRoom,
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push(`/rooms/${room.id}`);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: roomsApi.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const handleCreateRoom = () => {
    if (!user) return router.push("/login");
    setIsCreating(true);
    createRoomMutation.mutate({ name: `${user.username}'s Game`, maxPlayers: 4 });
  };

  return (
    <div className="relative min-h-screen bg-[#111118] text-slate-100 p-8 font-sans overflow-hidden">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 bg-[#0f0f13] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,31,118,0.25)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#000000_100%)] opacity-40 mix-blend-overlay pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto mt-4">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-amber-200 drop-shadow-sm">
              Game Lobby
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide">Join an open game or create your own</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-200 tracking-wide">{user?.username}</p>
              <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                {user?.isGuest ? "Guest Player" : "Registered"}
              </p>
            </div>
            
            <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg items-center px-4 py-2">
              <button
                onClick={() => router.push("/leaderboard")}
                className="px-3 py-1.5 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 rounded-md border-r border-white/10 mr-4 pr-5"
              >
                <Trophy size={16} className="text-amber-400" /> Rankings
              </button>
              
              <UserButton 
                afterSignOutUrl="/login" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-white/20 shadow-md",
                  }
                }}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom}
              disabled={createRoomMutation.isPending || isCreating}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm border border-purple-400/30"
            >
              <Plus size={20} />
              {createRoomMutation.isPending ? "Creating..." : "Create Room"}
            </motion.button>
            
            <div className="bg-[#161622]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <h3 className="font-black text-slate-400 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Open Rooms</span>
                  <span className="text-indigo-300 font-black text-xl drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]">{rooms?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Players Online</span>
                  <span className="text-emerald-300 font-black text-xl drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="lg:col-span-3">
            <div className="bg-[#161622]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
              
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3">
                  Available Rooms
                </h2>
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["rooms"] })}
                  className="text-slate-500 hover:text-indigo-400 transition-colors p-2 bg-black/20 rounded-lg border border-white/5 hover:border-indigo-500/30"
                  title="Refresh Rooms"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              
              <div className="p-0 min-h-[400px]">
                {isLoading ? (
                  <div className="p-16 flex flex-col items-center justify-center text-indigo-400/50 font-bold tracking-widest uppercase text-sm animate-pulse">
                    <RefreshCw size={32} className="mb-4 animate-spin" />
                    Scanning for rooms...
                  </div>
                ) : rooms?.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-slate-500 font-medium h-full">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-inner">
                      <span className="text-4xl filter grayscale opacity-50">🏠</span>
                    </div>
                    <p className="text-xl font-bold text-slate-300 mb-2">No active rooms found</p>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Be the first to host a game</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {rooms?.map((room) => (
                      <motion.li 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={room.id} 
                        className="p-6 hover:bg-white/[0.03] transition-all flex items-center justify-between group"
                      >
                        <div>
                          <h3 className="font-black text-xl text-slate-200 group-hover:text-indigo-300 transition-colors tracking-wide">
                            {room.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-2 text-slate-300 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-bold shadow-inner">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                              {room.players.length} / {room.maxPlayers} Players
                            </span>
                            <span className="text-slate-500 uppercase tracking-widest text-xs font-black">
                              ID: {room.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {room.hostId === user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this room?")) {
                                  deleteRoomMutation.mutate(room.id);
                                }
                              }}
                              disabled={deleteRoomMutation.isPending && deleteRoomMutation.variables === room.id}
                              className="text-rose-400/70 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 font-bold py-2.5 px-4 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50 flex items-center gap-2"
                              title="Delete Room"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (!user) return router.push("/login");
                              joinRoomMutation.mutate(room.id);
                            }}
                            disabled={joinRoomMutation.isPending || room.players.length >= room.maxPlayers}
                            className="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white font-black uppercase tracking-widest py-2.5 px-8 rounded-xl transition-all border border-indigo-500/30 disabled:opacity-50 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400 flex items-center gap-2 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                          >
                            {joinRoomMutation.variables === room.id && joinRoomMutation.isPending 
                              ? "Joining..." 
                              : "Join"}
                            <ArrowRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
