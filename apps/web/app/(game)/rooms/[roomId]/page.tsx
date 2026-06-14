"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "@/features/rooms/api";
import { useAuthStore } from "@/lib/store/auth";
import { useGameStore } from "@/features/game/store/game-store";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, ArrowLeft, Send, Users, Settings, Play, Bot, Check } from "lucide-react";

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

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.getRoomById(roomId),
    refetchInterval: 2000,
  });

  const isHost = room?.hostId === user?.id;

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
      
      return () => {
        socket.off("game_started");
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
    setMessages(prev => [...prev, { sender: user?.username || "Guest", text: chatMessage }]);
    setChatMessage("");
    // socket.emit("chat_message", { text: chatMessage });
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
    <div className="relative min-h-screen bg-[#111118] text-slate-100 p-8 flex flex-col h-screen overflow-hidden font-sans">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 bg-[#0f0f13] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,31,118,0.25)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#000000_100%)] opacity-40 mix-blend-overlay pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }}
      />

      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <Link 
              href="/rooms"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[10px] relative z-50 pointer-events-auto"
            >
              <ArrowLeft size={14} /> Back to Lobby
            </Link>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">{room.name}</h1>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invite Link</span>
            <code className="text-indigo-300 bg-black/40 px-3 py-1.5 rounded-lg font-mono text-sm border border-white/5 shadow-inner">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Left Column: Chat */}
          <div className="lg:col-span-1 bg-[#161622]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="font-black text-slate-300 text-xs uppercase tracking-widest">Room Chat</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold text-center my-auto opacity-50">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`text-sm flex flex-col ${msg.sender === user?.username ? "items-end" : "items-start"}`}>
                    <span className="font-bold text-[10px] text-indigo-400/80 uppercase tracking-wider mb-1">{msg.sender}</span>
                    <span className="text-slate-200 bg-white/5 border border-white/10 px-3 py-2 rounded-xl shadow-sm">{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
              <input 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
              />
              <button type="submit" className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Center Column: Board Preview & Start Game */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-[#161622]/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
               <div className="w-96 h-96 border-[60px] border-indigo-500/50 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center w-full max-w-md">
              <h2 className="text-3xl font-black text-slate-100 mb-2 tracking-tight">Waiting for Players</h2>
              <p className="text-indigo-400/80 mb-10 font-black text-xs uppercase tracking-widest">
                {room.players.length} / {room.maxPlayers} players joined
              </p>

              <div className="bg-[#161622]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8">
                <div className="flex -space-x-4 justify-center mb-8">
                  {room.players.map((p, i) => (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={p.userId} 
                      className="w-16 h-16 rounded-full border-2 border-[#161622] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] relative z-10 hover:z-20 transition-transform hover:-translate-y-2 cursor-pointer"
                    >
                      <span className="text-2xl font-black text-white drop-shadow-md">{p.user.username.charAt(0).toUpperCase()}</span>
                      {p.userId === room.hostId && (
                        <span className="absolute -top-2 -right-2 text-xl filter drop-shadow-lg" title="Host">👑</span>
                      )}
                    </motion.div>
                  ))}
                  {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 bg-black/20 flex items-center justify-center shadow-inner">
                      <span className="text-white/20 text-xl font-black">?</span>
                    </div>
                  ))}
                </div>
                
                {isHost ? (
                  <div className="space-y-3">
                    {room.players.length < room.maxPlayers && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fillBotsMutation.mutate()}
                        disabled={fillBotsMutation.isPending}
                        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-black py-3.5 px-6 rounded-2xl border border-white/10 shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Bot size={18} className="text-indigo-400" /> {fillBotsMutation.isPending ? "Filling..." : "Fill with Bots"}
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartGame}
                      disabled={room.players.length < 2}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:grayscale text-lg uppercase tracking-widest flex items-center justify-center gap-2"
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
          <div className="lg:col-span-1 bg-[#161622]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col p-6 relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 left-0" />
            <h3 className="font-black text-slate-300 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
              <Settings size={14} className="text-purple-400" /> Room Settings
            </h3>
            
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Max Players</span>
                <span className="text-slate-200 font-black bg-white/5 px-2 py-1 rounded text-sm">{room.maxPlayers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Map</span>
                <span className="text-purple-300 font-black bg-purple-500/10 px-2 py-1 rounded text-sm">Classic</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Starting Cash</span>
                <span className="text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded text-sm">$1500</span>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users size={12} /> Players ({room.players.length})
              </h4>
              <ul className="space-y-2">
                {room.players.map(p => (
                  <li key={p.userId} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                      {p.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-200 font-bold text-sm tracking-wide flex-1 truncate">{p.user.username}</span>
                    {p.userId === room.hostId && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">HOST</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
