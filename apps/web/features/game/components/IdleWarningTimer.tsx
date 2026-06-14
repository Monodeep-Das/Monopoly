"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "../store/game-store";
import { motion, AnimatePresence } from "framer-motion";

export function IdleWarningTimer() {
  const { idleTimeoutAt } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!idleTimeoutAt) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, idleTimeoutAt - Date.now());
      setTimeLeft(remaining);
    }, 1000);

    // Initial calculation
    setTimeLeft(Math.max(0, idleTimeoutAt - Date.now()));

    return () => clearInterval(interval);
  }, [idleTimeoutAt]);

  if (!idleTimeoutAt || timeLeft === null) return null;

  const seconds = Math.floor(timeLeft / 1000) % 60;
  const minutes = Math.floor(timeLeft / 1000 / 60);

  const formatTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft < 30000; // Less than 30 seconds

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="absolute top-4 right-4 z-50 pointer-events-none"
      >
        <div className={`
          flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl
          ${isUrgent 
            ? "bg-rose-500/20 border-rose-500/50 shadow-rose-500/20 animate-pulse" 
            : "bg-amber-500/20 border-amber-500/50 shadow-amber-500/10"}
        `}>
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-xl
            ${isUrgent ? "bg-rose-500 text-white" : "bg-amber-500 text-white"}
          `}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${isUrgent ? "text-rose-400" : "text-amber-400"}`}>
              Idle Warning
            </p>
            <p className="text-white font-black font-mono text-xl leading-none">
              {timeLeft <= 0 ? "Closing..." : formatTime}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
