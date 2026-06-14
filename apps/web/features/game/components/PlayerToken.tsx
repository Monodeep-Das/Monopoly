"use client";

import { motion } from "framer-motion";
import { Point, getTileCenter } from "../utils/board-math";
import { useEffect, useState, useRef } from "react";

interface PlayerTokenProps {
  id: string;
  name: string;
  color: string;
  position: Point;
  tileIndex: number;
  isTurn?: boolean;
}

export function PlayerToken({ name, color, position, tileIndex, isTurn }: PlayerTokenProps) {
  const prevTileIndexRef = useRef(tileIndex);
  const [animationPath, setAnimationPath] = useState<{ x: number | number[], y: number | number[] }>({ x: position.x, y: position.y });
  const [transitionDuration, setTransitionDuration] = useState(0.5);

  useEffect(() => {
    if (tileIndex !== prevTileIndexRef.current) {
      const oldIndex = prevTileIndexRef.current;
      const newIndex = tileIndex;
      const pathPoints: Point[] = [];
      
      // Go to jail is a direct teleport
      if (oldIndex === 30 && newIndex === 10) {
        pathPoints.push(position);
        setTransitionDuration(0.5);
      } else {
        const distance = newIndex - oldIndex;
        // Moving backward via Chance card usually is small distance, crossing GO is large negative
        const isCrossingGo = distance < -20;
        
        if (distance > 0 || isCrossingGo) {
          // Forward
          let step = oldIndex;
          while (step !== newIndex) {
            step = (step + 1) % 40;
            if (step === newIndex) break;
            pathPoints.push(getTileCenter(step));
          }
        } else {
          // Backward
          let step = oldIndex;
          while (step !== newIndex) {
            step = (step - 1 + 40) % 40;
            if (step === newIndex) break;
            pathPoints.push(getTileCenter(step));
          }
        }
        
        pathPoints.push(position);
        // Calculate duration based on distance to keep token speed consistent
        const steps = pathPoints.length;
        setTransitionDuration(steps * 0.15); // 0.15s per tile
      }

      setAnimationPath({
        x: pathPoints.map(p => p.x),
        y: pathPoints.map(p => p.y)
      });
      
      prevTileIndexRef.current = tileIndex;
    } else {
      // Shifting position within the same tile (another player arrived)
      setAnimationPath({ x: position.x, y: position.y });
      setTransitionDuration(0.3); // Quick slide
    }
  }, [tileIndex, position]);
  return (
    <motion.g
      initial={false}
      animate={animationPath}
      transition={
        Array.isArray(animationPath.x) 
          ? { duration: transitionDuration, ease: "linear" }
          : { type: "spring", stiffness: 120, damping: 18 }
      }
    >
      {/* Glow effect for active player */}
      {isTurn && (
        <motion.circle
          r="18"
          fill={color}
          opacity={0.15}
          animate={{ r: [18, 24, 18], opacity: [0.15, 0.05, 0.15] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      )}

      {/* Shadow */}
      <circle r="13" fill="black" opacity={0.25} cy={2} />

      {/* Token body */}
      <circle r="12" fill={color} stroke="#0f0e1a" strokeWidth="2.5" />
      
      {/* Highlight */}
      <circle r="9" fill="none" stroke="white" strokeWidth="0.5" opacity={0.3} cy={-1} />

      {/* Letter */}
      <text 
        x="0" 
        y="1" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        className="font-black fill-white"
        style={{ fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        pointerEvents="none"
      >
        {name.charAt(0).toUpperCase()}
      </text>
      
      {/* Active turn pulse ring */}
      {isTurn && (
        <motion.circle
          r="16"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
        />
      )}
    </motion.g>
  );
}
