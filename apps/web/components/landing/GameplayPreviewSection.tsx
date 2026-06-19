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
    <section ref={containerRef} className="pt-8 sm:pt-12 pb-16 sm:pb-32 bg-[#0a0e27] relative min-h-[120vh] sm:min-h-[150vh] flex flex-col items-center">
      
      <div className="container mx-auto px-4 z-20 text-center mb-12 sm:mb-24 sticky top-16 sm:top-32">
        <motion.h2 
          className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Board</span> is Yours
        </motion.h2>
        <motion.p 
          className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Immerse yourself in a beautifully crafted 3D playing space. Watch properties change hands and empires rise in real-time.
        </motion.p>
      </div>

      <motion.div 
        className="sticky top-[30vh] sm:top-[40vh] w-[340px] h-[340px] sm:w-[550px] sm:h-[550px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px] border-2 sm:border-4 border-white/10 bg-[#111827] rounded-xl shadow-2xl flex relative transform-style-3d z-10"
        style={{ scale, rotateX, y, transformPerspective: 1000 }}
      >
        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />

        <div className="absolute inset-[15%] border border-white/5 sm:border-2 bg-black/50 rounded-lg flex items-center justify-center transform translate-z-10 backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-purple-400 to-amber-200 opacity-50 rotate-[-45deg]">
            MONOPOLY
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 md:h-32 flex">
          <div className="w-16 sm:w-24 md:w-32 h-full border-r border-b sm:border-r-2 sm:border-b-2 border-white/10 bg-white/5" />
          <div className="flex-1 flex">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-b sm:border-r-2 sm:border-b-2 border-white/10 relative">
                {i === 2 && <div className="absolute bottom-0 w-full h-2 sm:h-4 bg-sky-500" />}
                {i === 4 && <div className="absolute bottom-0 w-full h-2 sm:h-4 bg-sky-500" />}
                {i === 7 && <div className="absolute bottom-0 w-full h-2 sm:h-4 bg-sky-500" />}
              </div>
            ))}
          </div>
          <div className="w-16 sm:w-24 md:w-32 h-full border-b border-white/10 sm:border-b-2 bg-white/5" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32 flex">
          <div className="w-16 sm:w-24 md:w-32 h-full border-r border-t sm:border-r-2 sm:border-t-2 border-white/10 bg-white/5" />
          <div className="flex-1 flex">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-t sm:border-r-2 sm:border-t-2 border-white/10 relative">
                {i === 1 && <div className="absolute top-0 w-full h-2 sm:h-4 bg-green-500" />}
                {i === 2 && <div className="absolute top-0 w-full h-2 sm:h-4 bg-green-500" />}
                {i === 4 && <div className="absolute top-0 w-full h-2 sm:h-4 bg-green-500" />}
                {i === 7 && <div className="absolute top-0 w-full h-2 sm:h-4 bg-blue-600" />}
                {i === 8 && <div className="absolute top-0 w-full h-2 sm:h-4 bg-blue-600" />}
              </div>
            ))}
          </div>
          <div className="w-16 sm:w-24 md:w-32 h-full border-t border-white/10 sm:border-t-2 bg-white/5" />
        </div>

        <div className="absolute left-0 top-16 bottom-16 sm:top-24 sm:bottom-24 md:top-32 md:bottom-32 w-16 sm:w-24 md:w-32 flex flex-col">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-b border-r sm:border-b-2 sm:border-r-2 border-white/10 relative">
                {i === 1 && <div className="absolute right-0 h-full w-2 sm:w-4 bg-pink-500" />}
                {i === 3 && <div className="absolute right-0 h-full w-2 sm:w-4 bg-pink-500" />}
                {i === 4 && <div className="absolute right-0 h-full w-2 sm:w-4 bg-pink-500" />}
                {i === 6 && <div className="absolute right-0 h-full w-2 sm:w-4 bg-orange-500" />}
                {i === 8 && <div className="absolute right-0 h-full w-2 sm:w-4 bg-orange-500" />}
            </div>
          ))}
        </div>

        <div className="absolute right-0 top-16 bottom-16 sm:top-24 sm:bottom-24 md:top-32 md:bottom-32 w-16 sm:w-24 md:w-32 flex flex-col">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-b border-l sm:border-b-2 sm:border-l-2 border-white/10 relative">
                {i === 1 && <div className="absolute left-0 h-full w-2 sm:w-4 bg-amber-400" />}
                {i === 2 && <div className="absolute left-0 h-full w-2 sm:w-4 bg-amber-400" />}
                {i === 4 && <div className="absolute left-0 h-full w-2 sm:w-4 bg-amber-400" />}
                {i === 6 && <div className="absolute left-0 h-full w-2 sm:w-4 bg-red-500" />}
                {i === 7 && <div className="absolute left-0 h-full w-2 sm:w-4 bg-red-500" />}
            </div>
          ))}
        </div>

        <motion.div 
          className="absolute w-5 h-5 sm:w-8 sm:h-8 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(244,63,94,0.8)] z-20"
          animate={{ 
            x: ['15%', '85%', '85%', '15%', '15%'],
            y: ['15%', '15%', '85%', '85%', '15%']
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1] 
          }}
        />
        <motion.div 
          className="absolute w-5 h-5 sm:w-8 sm:h-8 bg-cyan-400 rounded-sm border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"
          animate={{ 
            x: ['85%', '15%', '15%', '85%', '85%'],
            y: ['85%', '85%', '15%', '15%', '85%']
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
