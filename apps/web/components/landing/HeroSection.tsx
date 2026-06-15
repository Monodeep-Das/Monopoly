"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import Link from "next/link";

const MagneticButton = ({ children, href, className, variant = "primary" }: { children: React.ReactNode; href: string; className?: string; variant?: "primary" | "secondary" | "tertiary" }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    mouseX.set(middleX * 0.2);
    mouseY.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseStyles = "relative inline-flex items-center justify-center px-8 py-4 font-bold rounded-2xl overflow-hidden transition-colors duration-300 z-10";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 glow-accent shadow-lg shadow-primary/30",
    secondary: "glassmorphism hover:bg-white/10 text-foreground",
    tertiary: "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground"
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} ref={ref} className={`${baseStyles} ${variants[variant]} ${className || ""}`}>
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ x: position.x * 2, y: position.y * 2 }}
        />
        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  );
};

const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-gold-500/30 font-bold text-lg select-none"
          initial={{
            opacity: 0,
            x: `calc(${((i * 11) % 100)}vw)`,
            y: '100vh',
            scale: ((i * 7) % 50) / 100 + 0.5,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: -100,
            x: `calc(${((i * 13) % 200) - 100}px + ${((i * 11) % 100)}vw)`,
            rotate: ((i * 17) % 360),
          }}
          transition={{
            duration: ((i * 19) % 10) + 10,
            repeat: Infinity,
            ease: "linear",
            delay: ((i * 23) % 10),
          }}
        >
          $
        </motion.div>
      ))}
    </div>
  );
};

const BackgroundBoard = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0 opacity-30 mix-blend-screen perspective-1000">
      <motion.div 
        className="relative w-[1200px] h-[1200px] border-4 border-indigo-500/30 rounded-3xl flex transform-style-3d shadow-[0_0_100px_rgba(99,102,241,0.2)]"
        animate={{ 
          rotateX: [60, 60],
          rotateZ: [0, 360]
        }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{ transformPerspective: 2000 }}
      >
        <div className="absolute inset-0 grid grid-cols-11 grid-rows-11 gap-1 p-4">
          {Array.from({ length: 121 }).map((_, i) => {
            const isEdge = i < 11 || i > 110 || i % 11 === 0 || i % 11 === 10;
            return (
              <div 
                key={i} 
                className={`${isEdge ? 'border border-indigo-400/40 bg-indigo-500/5' : 'border border-white/5'} rounded-sm relative`}
              >
                 {isEdge && ((i * 17) % 10) > 7 && (
                   <div className="absolute inset-0 bg-rose-500/30 blur-md" />
                 )}
                 {isEdge && ((i * 23) % 10) > 7 && (
                   <div className="absolute inset-0 bg-cyan-500/30 blur-md" />
                 )}
              </div>
            );
          })}
        </div>
        
        <div className="absolute inset-[15%] border border-indigo-500/20 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm">
           <div className="text-9xl font-black text-indigo-500/10 rotate-[-45deg] tracking-[0.2em]">
             MONOPOLY
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth) * 100);
      mouseY.set((clientY / innerHeight) * 100);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundStyle = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(99, 102, 241, 0.15) 0%, rgba(10, 14, 39, 1) 50%)`;

  return (
    <motion.section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background pt-20"
      style={{ background: backgroundStyle }}
    >
      <BackgroundBoard />
      <Particles />

      <div className="absolute bottom-0 inset-x-0 h-1/2 opacity-20 pointer-events-none mix-blend-screen flex items-end justify-center gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-12 bg-primary/30 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: `${((i * 31) % 80) + 20}%` }}
            transition={{ duration: 2, ease: "easeOut", delay: i * 0.1 }}
            style={{
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative inline-block"
        >
          {/* Mr. Monopoly perched on the corner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="absolute -top-20 -left-20 md:-top-32 md:-left-32 w-40 h-40 md:w-56 md:h-56 z-0 pointer-events-none drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <motion.img 
              src="/monopoly-man.png" 
              alt="Mr. Monopoly" 
              className="w-full h-full object-contain drop-shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.div>

          <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tighter uppercase relative z-10">
            <span className="bg-gradient-to-br from-indigo-300 via-purple-400 to-amber-200 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              Monopoly
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <p className="text-2xl md:text-3xl font-bold text-slate-200 mb-6 tracking-wide drop-shadow-md">
            The Ultimate Real-Time Property Empire
          </p>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
            Buy properties. Build monopolies. Outsmart your friends. Rule the board.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <MagneticButton href="/rooms" variant="primary" className="w-full sm:w-auto uppercase tracking-widest">
            Play Now
          </MagneticButton>
          <MagneticButton href="/login" variant="secondary" className="w-full sm:w-auto">
            Sign In
          </MagneticButton>
          <MagneticButton href="/register" variant="tertiary" className="w-full sm:w-auto">
            Create Account
          </MagneticButton>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll to explore</span>
        <motion.div 
          className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground to-transparent"
          animate={{ height: [0, 48, 0], y: [0, 0, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.section>
  );
}
