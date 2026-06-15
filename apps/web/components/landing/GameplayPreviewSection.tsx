"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function GameplayPreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [40, 20, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  return (
    <section ref={containerRef} className="pt-12 pb-32 bg-[#0a0e27] relative min-h-[150vh] flex flex-col items-center">
      
      <div className="container mx-auto px-4 z-20 text-center mb-24 sticky top-32">
        <motion.h2 
          className="text-5xl md:text-7xl font-black mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Board</span> is Yours
        </motion.h2>
        <motion.p 
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Immerse yourself in a beautifully crafted 3D playing space. Watch properties change hands and empires rise in real-time.
        </motion.p>
      </div>

      <motion.div 
        className="sticky top-[40vh] w-[800px] h-[800px] border-4 border-white/10 bg-[#111827] rounded-xl shadow-2xl flex relative transform-style-3d z-10"
        style={{ scale, rotateX, y, transformPerspective: 1000 }}
      >
        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />

        <div className="absolute inset-[15%] border-2 border-white/5 bg-black/50 rounded-lg flex items-center justify-center transform translate-z-10 backdrop-blur-sm">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-purple-400 to-amber-200 opacity-50 rotate-[-45deg]">
            MONOPOLY
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-32 flex">
          <div className="w-32 h-full border-r-2 border-b-2 border-white/10 bg-white/5" />
          <div className="flex-1 flex">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-1 border-r-2 border-b-2 border-white/10 relative">
                {i === 2 && <div className="absolute bottom-0 w-full h-4 bg-sky-500" />}
                {i === 4 && <div className="absolute bottom-0 w-full h-4 bg-sky-500" />}
                {i === 7 && <div className="absolute bottom-0 w-full h-4 bg-sky-500" />}
              </div>
            ))}
          </div>
          <div className="w-32 h-full border-b-2 border-white/10 bg-white/5" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 flex">
          <div className="w-32 h-full border-r-2 border-t-2 border-white/10 bg-white/5" />
          <div className="flex-1 flex">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-1 border-r-2 border-t-2 border-white/10 relative">
                {i === 1 && <div className="absolute top-0 w-full h-4 bg-green-500" />}
                {i === 2 && <div className="absolute top-0 w-full h-4 bg-green-500" />}
                {i === 4 && <div className="absolute top-0 w-full h-4 bg-green-500" />}
                {i === 7 && <div className="absolute top-0 w-full h-4 bg-blue-600" />}
                {i === 8 && <div className="absolute top-0 w-full h-4 bg-blue-600" />}
              </div>
            ))}
          </div>
          <div className="w-32 h-full border-t-2 border-white/10 bg-white/5" />
        </div>

        <div className="absolute left-0 top-32 bottom-32 w-32 flex flex-col">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-b-2 border-r-2 border-white/10 relative">
              {i === 1 && <div className="absolute right-0 h-full w-4 bg-pink-500" />}
              {i === 3 && <div className="absolute right-0 h-full w-4 bg-pink-500" />}
              {i === 4 && <div className="absolute right-0 h-full w-4 bg-pink-500" />}
              {i === 6 && <div className="absolute right-0 h-full w-4 bg-orange-500" />}
              {i === 8 && <div className="absolute right-0 h-full w-4 bg-orange-500" />}
            </div>
          ))}
        </div>

        <div className="absolute right-0 top-32 bottom-32 w-32 flex flex-col">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-b-2 border-l-2 border-white/10 relative">
              {i === 1 && <div className="absolute left-0 h-full w-4 bg-amber-400" />}
              {i === 2 && <div className="absolute left-0 h-full w-4 bg-amber-400" />}
              {i === 4 && <div className="absolute left-0 h-full w-4 bg-amber-400" />}
              {i === 6 && <div className="absolute left-0 h-full w-4 bg-red-500" />}
              {i === 7 && <div className="absolute left-0 h-full w-4 bg-red-500" />}
            </div>
          ))}
        </div>

        <motion.div 
          className="absolute w-8 h-8 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(244,63,94,0.8)] z-20"
          animate={{ 
            x: [60, 700, 700, 60, 60],
            y: [60, 60, 700, 700, 60]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1] 
          }}
        />
        <motion.div 
          className="absolute w-8 h-8 bg-cyan-400 rounded-sm border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"
          animate={{ 
            x: [700, 60, 60, 700, 700],
            y: [700, 700, 60, 60, 700]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            delay: 1
          }}
        />

      </motion.div>
    </section>
  );
}
