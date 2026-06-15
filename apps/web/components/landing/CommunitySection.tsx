"use client";

import { motion } from "framer-motion";

const players = [
  { name: "Tycoon_King", netWorth: "$45.2M", rank: 1, avatar: "👑" },
  { name: "BoardwalkBoss", netWorth: "$38.9M", rank: 2, avatar: "🎩" },
  { name: "BankruptYou", netWorth: "$31.4M", rank: 3, avatar: "💸" },
  { name: "DiceRoller99", netWorth: "$28.1M", rank: 4, avatar: "🎲" },
  { name: "PropertyMogul", netWorth: "$24.5M", rank: 5, avatar: "🏢" },
];

export function CommunitySection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            className="text-4xl md:text-6xl font-black mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Billionaire's</span> Club
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Compete against the best. Prove your economic superiority and cement your name on the global leaderboards.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-slate-300">Global Top 5</h3>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold animate-pulse">LIVE UPDATE</span>
          </div>
          
          <div className="p-4">
            {players.map((player, i) => (
              <motion.div 
                key={i}
                className="flex items-center justify-between p-4 mb-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                    ${i === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 
                      i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' :
                      i === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/50' :
                      'bg-white/5 text-slate-400 border border-white/10'
                    }
                  `}>
                    #{player.rank}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="text-xl font-bold group-hover:text-primary transition-colors">{player.name}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 tracking-tight">{player.netWorth}</div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Net Worth</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
