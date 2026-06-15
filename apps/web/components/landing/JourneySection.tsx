"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[150vh] flex items-center justify-center overflow-hidden py-24 bg-[#050714]"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      <motion.div 
        className="container mx-auto px-4 relative z-10 flex flex-col items-center"
        style={{ opacity, scale }}
      >
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.h2 
            className="text-5xl md:text-7xl font-black mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            The Rise of an <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Empire</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            It starts with a single property. It ends with total domination. Experience the thrill of building a massive real estate portfolio in real-time.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative">
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 -translate-y-1/2 z-0"></div>

          {[
            {
              title: "Acquire",
              desc: "Roll the dice, land on prime real estate, and make your first investment.",
              icon: "🏠",
              delay: 0
            },
            {
              title: "Develop",
              desc: "Build houses and massive hotel complexes to increase your rental income.",
              icon: "🏗️",
              delay: 0.2
            },
            {
              title: "Conquer",
              desc: "Bankrupt your rivals and stand alone as the ultimate property tycoon.",
              icon: "👑",
              delay: 0.4
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              className="relative z-10 glassmorphism p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-colors duration-500"
              style={{ y: i % 2 === 0 ? y1 : y2 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: step.delay }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 glow-accent">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
