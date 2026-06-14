"use client";

import { useEffect, useState } from "react";
import { playDiceSound } from "../utils/audio";
import "./dice3d.css";

interface Dice3DProps {
  value: number;
  isRolling: boolean;
}

function DiceDots({ face }: { face: number }) {
  const dot = <div className="dice-dot" />;
  switch (face) {
    case 1: return <>{dot}</>;
    case 2: return <>{dot}{dot}</>;
    case 3: return <>{dot}{dot}{dot}</>;
    case 4: return <>{dot}{dot}{dot}{dot}</>;
    case 5: return <>{dot}{dot}<div className="dice-dot center-dot" />{dot}{dot}</>;
    case 6: return <>{dot}{dot}{dot}{dot}{dot}{dot}</>;
  }
}

export function Dice3D({ value, isRolling }: Dice3DProps) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (isRolling) {
      playDiceSound();
    }
  }, [isRolling]);

  // Trigger a brief "landed" bounce after rolling stops
  useEffect(() => {
    if (!isRolling) {
      setLanded(true);
      const t = setTimeout(() => setLanded(false), 400);
      return () => clearTimeout(t);
    }
  }, [isRolling]);

  const landClass = !isRolling ? `dice-show-${value}` : "";

  return (
    <div className="dice-perspective">
      <div
        className={`dice-cube ${isRolling ? "rolling" : landClass}`}
        style={
          landed && !isRolling
            ? {
                animation: "dice-land 0.4s ease-out",
                // @ts-ignore CSS custom property
                "--land-rotation":
                  value === 1 ? "rotateX(360deg) rotateY(360deg)"
                  : value === 2 ? "rotateX(360deg) rotateY(270deg)"
                  : value === 3 ? "rotateX(360deg) rotateY(180deg)"
                  : value === 4 ? "rotateX(360deg) rotateY(450deg)"
                  : value === 5 ? "rotateX(270deg) rotateY(360deg)"
                  : "rotateX(450deg) rotateY(360deg)",
              } as React.CSSProperties
            : undefined
        }
      >
        {/* Inner Core: A slightly smaller solid cube that perfectly fits inside the rounded outer corners to block hollow view completely */}
        <div className="dice-inner-face dice-inner-1" />
        <div className="dice-inner-face dice-inner-2" />
        <div className="dice-inner-face dice-inner-3" />
        <div className="dice-inner-face dice-inner-4" />
        <div className="dice-inner-face dice-inner-5" />
        <div className="dice-inner-face dice-inner-6" />

        {/* Front = 1 */}
        <div className="dice-face dice-face-1"><DiceDots face={1} /></div>
        {/* Right = 2 */}
        <div className="dice-face dice-face-2"><DiceDots face={2} /></div>
        {/* Back = 3 */}
        <div className="dice-face dice-face-3"><DiceDots face={3} /></div>
        {/* Left = 4 */}
        <div className="dice-face dice-face-4"><DiceDots face={4} /></div>
        {/* Top = 5 */}
        <div className="dice-face dice-face-5"><DiceDots face={5} /></div>
        {/* Bottom = 6 */}
        <div className="dice-face dice-face-6"><DiceDots face={6} /></div>
      </div>
    </div>
  );
}
