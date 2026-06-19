"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Users, Zap, Handshake, LayoutDashboard, Trophy, UserCircle } from "lucide-react";

const features = [
  {
    title: "Multiplayer Rooms",
    desc: "Create private lobbies or join public games with matchmaking based on your play style and skill level.",
    color: "from-blue-500 to-indigo-600",
    icon: <Users className="w-16 h-16 text-blue-400" />
  },
  {
    title: "WebSocket Sync",
    desc: "Zero-latency synchronization ensures dice rolls, trades, and movement happen instantly across all devices.",
    color: "from-emerald-400 to-teal-500",
    icon: <Zap className="w-16 h-16 text-emerald-400" />
  },
  {
    title: "Trading System",
    desc: "Complex, multi-variable trading engine supporting properties, cash, and immunity deals.",
    color: "from-rose-500 to-pink-600",
    icon: <Handshake className="w-16 h-16 text-rose-400" />
  },
  {
    title: "Property Management",
    desc: "Detailed portfolio dashboard to track your ROI, rent yields, and monopoly dominance.",
    color: "from-amber-400 to-orange-500",
    icon: <LayoutDashboard className="w-16 h-16 text-amber-400" />
  },
  {
    title: "Leaderboards",
    desc: "Climb the global ranks. Show off your net worth, win rate, and total bankruptcies caused.",
    color: "from-violet-500 to-purple-600",
    icon: <Trophy className="w-16 h-16 text-violet-400" />
  },
  {
    title: "Persistent Profiles",
    desc: "Unlock custom dice, exclusive player tokens, and premium board skins as you level up.",
    color: "from-cyan-400 to-blue-500",
    icon: <UserCircle className="w-16 h-16 text-cyan-400" />
  }
];

export function FeaturesSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

  return (
    <section ref={targetRef} className="relative h-[200vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-24">
        
        <div className="container mx-auto px-4 mb-8 sm:mb-16 shrink-0">
          <motion.h2 
            className="text-3xl sm:text-5xl md:text-7xl font-black text-center mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Domination</span>
          </motion.h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 px-4 w-full">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="w-[80vw] sm:w-[85vw] md:w-[500px] shrink-0 h-[350px] sm:h-[420px] md:h-[500px] glassmorphism rounded-3xl border border-white/10 p-6 sm:p-10 flex flex-col justify-between group hover:border-white/20 transition-colors relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              
              <div>
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform duration-300 transform-origin-left">{feature.icon}</div>
                <h3 className="text-xl sm:text-3xl font-black mb-2 sm:mb-4">{feature.title}</h3>
                <p className="text-base sm:text-xl text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>

              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${feature.color} w-1/3 group-hover:w-full transition-all duration-1000 ease-out`} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
