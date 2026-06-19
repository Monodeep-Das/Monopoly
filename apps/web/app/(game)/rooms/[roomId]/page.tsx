"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "@/features/rooms/api";
import { useAuthStore } from "@/lib/store/auth";
import { useGameStore } from "@/features/game/store/game-store";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, ArrowLeft, Send, Users, Settings, Play, Bot, Check, X, MessageSquare, LayoutDashboard } from "lucide-react";

import { RoomSettingsModal } from "@/features/rooms/components/RoomSettingsModal";
import { PlayerProfileModal } from "@/features/rooms/components/PlayerProfileModal";

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { user } = useAuthStore();
  const { socket, isConnected } = useGameStore();
  
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const hasAttemptedJoin = useRef(false);
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'lobby' | 'chat' | 'details'>('lobby');

  const updateProfileMutation = useMutation({
    mutationFn: (profile: { nickname?: string; color?: string }) => {
      if (!user) throw new Error("Not logged in");
      return roomsApi.updatePlayerProfile(roomId, user.id, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsProfileOpen(false);
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: roomsApi.joinRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    },
  });

  const fillBotsMutation = useMutation({
    mutationFn: () => roomsApi.fillBots(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: { maxPlayers: number; startingCash: number; map: string }) => 
      roomsApi.updateRoomSettings(roomId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsSettingsOpen(false);
    },
  });

  const kickPlayerMutation = useMutation({
    mutationFn: (playerId: string) => roomsApi.kickPlayer(roomId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    },
  });

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.getRoomById(roomId),
    refetchInterval: 2000,
  });

  const isHost = room?.hostId === user?.id;

  // Track if we were kicked
  useEffect(() => {
    if (room && user && hasAttemptedJoin.current) {
      const isPlayerInRoom = room.players.some(p => p.userId === user.id);
      if (!isPlayerInRoom && !isHost) {
        alert("You have been removed from the room.");
        router.push("/rooms");
      }
    }
  }, [room, user, isHost, router]);

  useEffect(() => {
    if (room && user && !hasAttemptedJoin.current) {
      const isPlayerInRoom = room.players.some(p => p.userId === user.id);
      if (!isPlayerInRoom && room.players.length < room.maxPlayers) {
        hasAttemptedJoin.current = true;
        joinRoomMutation.mutate(roomId);
      }
    }
  }, [room, user, roomId]);

  useEffect(() => {
    if (isConnected && socket) {
      socket.emit("join_room", { roomId });
      
      socket.on("game_started", () => {
        router.push(`/game/${roomId}`);
      });

      socket.on("room_chat_receive", (payload: { sender: string; text: string }) => {
        setMessages(prev => [...prev, payload]);
      });
      
      return () => {
        socket.off("game_started");
        socket.off("room_chat_receive");
      };
    }
  }, [isConnected, socket, roomId, router]);

  const handleStartGame = () => {
    if (!isHost || !socket) return;
    socket.emit("start_game");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (socket) {
      socket.emit("room_chat_send", { text: chatMessage });
    }
    setChatMessage("");
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#111118] text-slate-100 flex items-center justify-center font-bold tracking-widest uppercase animate-pulse">Loading Room...</div>;
  }

  if (!room) {
    return <div className="min-h-screen bg-[#111118] text-slate-100 flex items-center justify-center font-bold tracking-widest uppercase">Room Not Found</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#111118] text-slate-100 p-4 sm:p-8 flex flex-col h-screen overflow-hidden font-sans">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 bg-[#0f0f13] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,31,118,0.25)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#000000_100%)] opacity-40 mix-blend-overlay pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }}
      />

      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-8 shrink-0">
          <div>
            <Link 
              href="/rooms"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-1 sm:mb-2 font-black uppercase tracking-widest text-[10px] relative z-50 pointer-events-auto"
            >
              <ArrowLeft size={14} /> Back to Lobby
            </Link>
            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">{room.name}</h1>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-2 sm:gap-3 shadow-lg w-full sm:w-auto overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Invite Link</span>
            <code className="text-indigo-300 bg-black/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono text-xs sm:text-sm border border-white/5 shadow-inner truncate max-w-[180px] sm:max-w-none">
              {typeof window !== 'undefined' ? `${window.location.origin}/rooms/${roomId}` : `.../rooms/${roomId}`}
            </code>
            <button 
              onClick={copyInvite}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </header>

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden bg-black/40 p-1.5 rounded-2xl border border-white/10 mb-4 shrink-0 shadow-lg relative z-20">
          <button 
            onClick={() => setMobileTab('lobby')} 
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${mobileTab === 'lobby' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={14} /> Lobby
          </button>
          <button 
            onClick={() => setMobileTab('chat')} 
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${mobileTab === 'chat' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MessageSquare size={14} /> Chat
            {messages.length > 0 && mobileTab !== 'chat' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse absolute top-3 right-[35%]" />
            )}
          </button>
          <button 
            onClick={() => setMobileTab('details')} 
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${mobileTab === 'details' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users size={14} /> Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 min-h-0 overflow-y-auto lg:overflow-visible pb-4 lg:pb-0">
          
          {/* Left Column: Chat */}
          <div className={`lg:col-span-1 glassmorphism rounded-3xl flex-col overflow-hidden relative group hover:border-indigo-500/30 transition-all duration-500 min-h-[300px] lg:min-h-0 ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              <h3 className="font-black text-slate-300 text-xs uppercase tracking-widest">Room Chat</h3>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-5 flex flex-col scrollbar-thin scrollbar-thumb-white/10 relative z-10">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold text-center my-auto opacity-50">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`text-sm flex flex-col ${msg.sender === user?.username ? "items-end" : "items-start"}`}>
                    <span className="font-bold text-[10px] text-indigo-400/80 uppercase tracking-wider mb-1.5">{msg.sender}</span>
                    <span className={`px-4 py-2.5 rounded-2xl shadow-md max-w-[90%] break-words ${msg.sender === user?.username ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm backdrop-blur-md"}`}>{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md flex gap-3 relative z-10">
              <input 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 shadow-inner"
              />
              <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white p-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center">
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Center Column: Board Preview & Start Game */}
          <div className={`lg:col-span-2 flex-col items-center justify-center bg-[#161622]/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-8 relative overflow-hidden shadow-2xl ${mobileTab === 'lobby' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Subtle background decoration */}
            <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
               <div className="w-96 h-96 border-[60px] border-indigo-500/50 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center w-full max-w-md">
              <h2 className="text-xl sm:text-3xl font-black text-slate-100 mb-1 sm:mb-2 tracking-tight">Waiting for Players</h2>
              <p className="text-indigo-400/80 mb-10 font-black text-xs uppercase tracking-widest">
                {room.players.length} / {room.maxPlayers} players joined
              </p>

              <div className="bg-[#161622]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-4 sm:mb-8">
                <div className="flex -space-x-3 sm:-space-x-4 justify-center mb-4 sm:mb-8 flex-wrap gap-y-2">
                  {room.players.map((p, i) => {
                    const defaultColors = [
                      '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
                      '#ec4899', '#84cc16', '#eab308', '#14b8a6', '#6366f1', '#f97316'
                    ];
                    const color = p.color || defaultColors[i % defaultColors.length];
                    const displayName = p.nickname || p.user.username;
                    return (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={p.userId} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#161622] flex items-center justify-center relative z-10 hover:z-20 transition-transform hover:-translate-y-2 cursor-pointer group/avatar shadow-lg"
                        style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}80` }}
                      >
                        <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md">{displayName.charAt(0).toUpperCase()}</span>
                        
                        {p.userId === room.hostId && (
                          <span className="absolute -top-2 -right-2 text-xl filter drop-shadow-lg" title="Host">👑</span>
                        )}

                        {/* Kick Button for Host */}
                        {isHost && p.userId !== room.hostId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to kick ${displayName}?`)) {
                                kickPlayerMutation.mutate(p.userId);
                              }
                            }}
                            disabled={kickPlayerMutation.isPending && kickPlayerMutation.variables === p.userId}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
                            title="Kick Player"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                  {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/20 bg-black/20 flex items-center justify-center shadow-inner">
                      <span className="text-white/20 text-xl font-black">?</span>
                    </div>
                  ))}
                </div>
                
                {isHost ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsSettingsOpen(true)}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 font-black py-3.5 px-4 rounded-2xl border border-white/10 shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center"
                        title="Room Settings"
                      >
                        <Settings size={18} className="text-slate-400" />
                      </motion.button>
                      {room.players.length < room.maxPlayers && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fillBotsMutation.mutate()}
                          disabled={fillBotsMutation.isPending}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-black py-3.5 px-6 rounded-2xl border border-white/10 shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Bot size={18} className="text-indigo-400" /> {fillBotsMutation.isPending ? "Filling..." : "Fill with Bots"}
                        </motion.button>
                      )}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartGame}
                      disabled={room.players.length < 2}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black py-3 sm:py-4 px-4 sm:px-6 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:grayscale text-base sm:text-lg uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Play size={20} className="fill-slate-900" />
                      {room.players.length < 2 ? "Waiting..." : "Start Game"}
                    </motion.button>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Waiting for host...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Players list */}
          <div className={`lg:col-span-1 glassmorphism rounded-3xl flex-col p-4 sm:p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 ${mobileTab === 'details' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
            
            <h3 className="font-black text-slate-300 mb-6 uppercase tracking-widest text-xs flex items-center gap-2 relative z-10">
              <Settings size={14} className="text-purple-400" /> Room Settings
            </h3>
            
            <div className="space-y-3 mb-8 flex-1 relative z-10">
              <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Max Players</span>
                <span className="text-slate-200 font-black text-sm">{room.maxPlayers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Map</span>
                <span className="text-purple-400 font-black text-sm capitalize drop-shadow-md">{room.map || "Classic"}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Starting Cash</span>
                <span className="text-emerald-400 font-black text-sm drop-shadow-md">${room.startingCash || 1500}</span>
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={12} /> Roster ({room.players.length})
              </h4>
              <ul className="space-y-3">
                {room.players.map((p, i) => {
                  const defaultColors = [
                    '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
                    '#ec4899', '#84cc16', '#eab308', '#14b8a6', '#6366f1', '#f97316'
                  ];
                  const color = p.color || defaultColors[i % defaultColors.length];
                  const displayName = p.nickname || p.user.username;
                  return (
                    <li key={p.userId} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/5 transition-colors">
                      <div 
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shadow-md"
                        style={{ backgroundColor: color }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 truncate">
                        <span className="text-slate-200 font-bold text-sm tracking-wide truncate">{displayName}</span>
                        {p.userId === room.hostId && (
                          <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest leading-none mt-1">Host</span>
                        )}
                      </div>
                      {p.userId === user?.id && (
                        <button 
                          onClick={() => setIsProfileOpen(true)}
                          className="text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                        >
                          Edit
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

        </div>
      </div>
      <RoomSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={(settings) => updateSettingsMutation.mutate(settings)}
        currentSettings={{ maxPlayers: room.maxPlayers, startingCash: room.startingCash, map: room.map }}
        isSaving={updateSettingsMutation.isPending}
      />
      
      {(() => {
        const myProfile = room.players.find(p => p.userId === user?.id);
        if (!myProfile) return null;
        
        const defaultColors = [
          '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
          '#ec4899', '#84cc16', '#eab308', '#14b8a6', '#6366f1', '#f97316'
        ];
        
        const myIndex = room.players.findIndex(p => p.userId === user?.id);
        const currentColor = myProfile.color || defaultColors[myIndex % defaultColors.length];
        
        // Calculate taken colors (excluding my own selected color so I can still see it as selected)
        const takenColors = room.players
          .filter(p => p.userId !== user?.id)
          .map((p, i) => p.color || defaultColors[i % defaultColors.length]);
        
        return (
          <PlayerProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onSave={(profile) => updateProfileMutation.mutate(profile)}
            currentProfile={{ nickname: myProfile.nickname || myProfile.user.username, color: currentColor }}
            takenColors={takenColors}
            isSaving={updateProfileMutation.isPending}
          />
        );
      })()}
    </div>
  );
}
