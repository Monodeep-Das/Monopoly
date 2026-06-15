"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const PropertyCard = ({ color, name, price, rent, delay }: { color: string, name: string, price: string, rent: string, delay: number }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -15;
    const rotateYValue = ((x - centerX) / centerX) * 15;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="perspective-1000"
    >
      <motion.div
        className="w-64 h-96 bg-card rounded-2xl border-2 border-border shadow-2xl flex flex-col overflow-hidden relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
        
        <div className={`h-24 ${color} border-b-2 border-border flex items-center justify-center px-4 text-center transform translate-z-10`}>
          <h3 className="text-black font-black uppercase text-xl tracking-tighter shadow-sm">{name}</h3>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-between p-6 transform translate-z-5">
          <div className="text-center w-full">
            <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Rent</p>
            <p className="text-2xl font-black text-white">${rent}</p>
          </div>
          
          <div className="w-full space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>1 House</span>
              <span className="font-bold text-white">${parseInt(rent) * 5}</span>
            </div>
            <div className="flex justify-between">
              <span>2 Houses</span>
              <span className="font-bold text-white">${parseInt(rent) * 15}</span>
            </div>
            <div className="flex justify-between">
              <span>Hotel</span>
              <span className="font-bold text-white">${parseInt(rent) * 40}</span>
            </div>
          </div>
          
          <div className="w-full border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Price</p>
            <p className="text-xl font-black text-white">${price}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export function PropertyShowcaseSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.h2 
              className="text-4xl md:text-6xl font-black mb-4"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Assets</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Exquisitely designed property cards that feel like holding luxury in your hands. 
              Hover over them to experience our signature 3D perspective engine.
            </motion.p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 perspective-1000">
          <PropertyCard 
            color="bg-sky-400" 
            name="Boardwalk" 
            price="400" 
            rent="50"
            delay={0.1}
          />
          <PropertyCard 
            color="bg-pink-500" 
            name="St. Charles Place" 
            price="140" 
            rent="10"
            delay={0.2}
          />
          <PropertyCard 
            color="bg-amber-500" 
            name="New York Ave" 
            price="200" 
            rent="16"
            delay={0.3}
          />
          <PropertyCard 
            color="bg-green-500" 
            name="Pacific Ave" 
            price="300" 
            rent="26"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}
