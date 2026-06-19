"use client";

import { motion } from "framer-motion";
import { Dices, Building2, Crown } from "lucide-react";

const steps = [
  {
    title: "Roll & Acquire",
    description: "Start your turn with a roll of the dice. Navigate the board, land on unowned properties, and make strategic investments to build your foundational portfolio.",
    icon: <Dices className="w-12 h-12 text-white" />,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Build & Upgrade",
    description: "Secure a monopoly by owning all properties of the same color. Develop them with houses and massive hotel complexes to skyrocket your rental income.",
    icon: <Building2 className="w-12 h-12 text-white" />,
    color: "from-emerald-400 to-green-500"
  },
  {
    title: "Trade & Dominate",
    description: "Negotiate complex, multi-asset trades with other players. Be ruthless, drain their cash reserves, and stand alone as the ultimate property tycoon.",
    icon: <Crown className="w-12 h-12 text-white" />,
    color: "from-amber-400 to-orange-500"
  }
];

export function HowToPlaySection() {
  return (
    <section className="py-16 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative blurred background elements */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-24">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Play</span>
          </motion.h2>
          <motion.p 
            className="text-base sm:text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Master the core mechanics in three simple steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative max-w-6xl mx-auto">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 opacity-20 -z-10 rounded-full" />

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              className="relative glassmorphism p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center group hover:bg-white/5 transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${step.color} p-[2px] mb-4 sm:mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center text-3xl sm:text-5xl">
                  {step.icon}
                </div>
              </div>
              
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 text-4xl sm:text-6xl font-black text-white/5 select-none pointer-events-none transition-all duration-300 group-hover:text-white/10 group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2">
                0{i + 1}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
