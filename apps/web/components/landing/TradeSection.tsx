"use client";

import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

export function TradeSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden flex items-center justify-center min-h-screen">
      <motion.div 
        className="absolute w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"
        animate={{ 
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 w-full relative h-[600px] flex items-center justify-center">
          
          <motion.div 
            className="absolute z-20 glassmorphism p-6 rounded-2xl w-64 shadow-2xl border-rose-500/30"
            initial={{ opacity: 0, x: -100, y: -50, rotate: -15 }}
            whileInView={{ opacity: 1, x: -80, y: -20, rotate: -5 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            whileHover={{ y: -30, rotate: 0, zIndex: 30 }}
          >
            <div className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4">Player 1 Offers</div>
            <div className="flex items-center gap-4 mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-green-500 rounded-md"></div>
              <div>
                <div className="font-bold">London</div>
                <div className="text-xs text-slate-400">$300 Value</div>
              </div>
            </div>
            <div className="text-3xl font-black text-center text-emerald-400">+$150</div>
          </motion.div>

          <motion.div 
            className="absolute z-10 glassmorphism p-6 rounded-2xl w-64 shadow-2xl border-indigo-500/30"
            initial={{ opacity: 0, x: 100, y: 50, rotate: 15 }}
            whileInView={{ opacity: 1, x: 80, y: 20, rotate: 5 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
            whileHover={{ y: 10, rotate: 0, zIndex: 30 }}
          >
            <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Player 1 Wants</div>
            <div className="flex items-center gap-4 mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-sky-400 rounded-md"></div>
              <div>
                <div className="font-bold">New York</div>
                <div className="text-xs text-slate-400">$400 Value</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-pink-500 rounded-md"></div>
              <div>
                <div className="font-bold">Rome</div>
                <div className="text-xs text-slate-400">$140 Value</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-30 w-20 h-20 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.5)] border-4 border-background"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring", bounce: 0.6 }}
          >
            <Handshake className="w-10 h-10 text-white" />
          </motion.div>
          
        </div>

        <div className="flex-1">
          <motion.h2 
            className="text-4xl md:text-6xl font-black mb-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Master the Art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">Negotiation</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our advanced trading system allows for complex, multi-asset deals. Bundle properties, cash, and Get Out of Jail Free cards to create offers your opponents can't refuse.
          </motion.p>
          <motion.ul 
            className="space-y-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              "Multi-property bundles",
              "Real-time counter offers",
              "Trade immunity status",
              "Secret alliances"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="font-semibold">{feature}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
