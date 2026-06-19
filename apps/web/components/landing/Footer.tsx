"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative bg-[#050714] pt-16 sm:pt-32 pb-8 sm:pb-12 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-24">
          <motion.h2 
            className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 uppercase tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Rule?</span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link 
              href="/rooms" 
              className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 bg-white text-black hover:bg-slate-200 font-black rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] text-lg sm:text-xl uppercase tracking-widest w-full sm:w-auto"
            >
              Play Now - It's Free
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16 border-t border-white/10 pt-10 sm:pt-16">
          <div className="col-span-2">
            <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">MONOPOLY</h3>
            <p className="text-slate-400 max-w-md">
              The ultimate real-time multiplayer property trading game. Buy, build, trade, and dominate your opponents in sub-millisecond synced lobbies.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">Game</h4>
            <ul className="space-y-4">
              <li><Link href="/rooms" className="text-slate-400 hover:text-white transition-colors">Play Now</Link></li>
              <li><Link href="/leaderboard" className="text-slate-400 hover:text-white transition-colors">Leaderboards</Link></li>
              <li><Link href="/how-to-play" className="text-slate-400 hover:text-white transition-colors">How to Play</Link></li>
              <li><Link href="/patch-notes" className="text-slate-400 hover:text-white transition-colors">Patch Notes</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Monopoly Game. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
