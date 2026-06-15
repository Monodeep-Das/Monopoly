"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

const Counter = ({ from, to, label, prefix = "", suffix = "" }: { from: number; to: number; label: string; prefix?: string; suffix?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (value) => {
          setCount(Math.round(value));
        }
      });
      return controls.stop;
    }
  }, [from, to, inView]);

  return (
    <div ref={ref} className="flex flex-col items-center p-8 glassmorphism border border-white/5 rounded-3xl w-full max-w-xs group hover:bg-white/5 transition-colors">
      <div className="text-5xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 group-hover:from-primary group-hover:to-purple-400 transition-all duration-500">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-slate-400 uppercase tracking-widest font-bold">
        {label}
      </div>
    </div>
  );
};

export function StatsSection() {
  return (
    <section className="py-32 bg-[#050714] relative border-y border-white/5">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/3">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              By the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Numbers</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join a thriving global economy of ruthless capitalists and real estate moguls.
            </motion.p>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Counter from={0} to={12450} label="Games Played" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Counter from={0} to={2} label="Properties Owned" suffix="M" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Counter from={0} to={842} label="Trades Completed" suffix="k" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Counter from={0} to={50} label="Global Players" suffix="k+" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
