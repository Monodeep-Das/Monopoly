"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Node = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r="4"
    fill="#6366f1"
    initial={{ opacity: 0, scale: 0 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
  />
);

const Edge = ({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) => (
  <motion.line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="url(#gradient-line)"
    strokeWidth="1.5"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 0.4 }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, delay, ease: "easeInOut" }}
  />
);

export function NetworkSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = [
    { id: 1, x: 100, y: 150 },
    { id: 2, x: 300, y: 50 },
    { id: 3, x: 500, y: 200 },
    { id: 4, x: 700, y: 100 },
    { id: 5, x: 900, y: 250 },
    { id: 6, x: 200, y: 300 },
    { id: 7, x: 400, y: 350 },
    { id: 8, x: 600, y: 400 },
    { id: 9, x: 800, y: 300 },
    { id: 10, x: 1000, y: 150 },
  ];

  const edges = [
    { source: 1, target: 2 },
    { source: 1, target: 6 },
    { source: 2, target: 3 },
    { source: 2, target: 7 },
    { source: 3, target: 4 },
    { source: 3, target: 8 },
    { source: 4, target: 5 },
    { source: 4, target: 9 },
    { source: 5, target: 10 },
    { source: 6, target: 7 },
    { source: 7, target: 8 },
    { source: 8, target: 9 },
    { source: 9, target: 10 },
  ];

  return (
    <section className="py-32 bg-[#050714] relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
      <div className="container mx-auto px-4 z-10 text-center mb-16">
        <motion.h2 
          className="text-4xl md:text-6xl font-black mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">Real-Time</span> Global Sync
        </motion.h2>
        <motion.p 
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Sub-millisecond WebSocket architecture connects players worldwide. No lag, no desync. Just pure, uninterrupted capitalism.
        </motion.p>
      </div>

      {mounted && (
        <div className="relative w-full max-w-5xl h-[500px] mx-auto hidden md:block">
          <svg className="w-full h-full" viewBox="0 0 1100 500">
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {edges.map((edge, i) => {
              const source = nodes.find(n => n.id === edge.source)!;
              const target = nodes.find(n => n.id === edge.target)!;
              return (
                <Edge 
                  key={i}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  delay={i * 0.1 + 0.5}
                />
              );
            })}

            {nodes.map((node, i) => (
              <Node key={i} x={node.x} y={node.y} delay={i * 0.1} />
            ))}

            {edges.map((edge, i) => {
              const source = nodes.find(n => n.id === edge.source)!;
              const target = nodes.find(n => n.id === edge.target)!;
              return (
                <motion.circle
                  key={`packet-${i}`}
                  r="2"
                  fill="#ec4899"
                  filter="url(#glow)"
                  animate={{
                    cx: [source.x, target.x],
                    cy: [source.y, target.y],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                />
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
