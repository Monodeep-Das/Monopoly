"use client";

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Try to resume if suspended (e.g. strict browser policies)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playDiceSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const clacks = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < clacks; i++) {
      const time = ctx.currentTime + (i * 0.1) + (Math.random() * 0.04);
      
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + Math.random() * 800;
      filter.Q.value = 2;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.035);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(time);
      noise.stop(time + 0.04);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
}

export function playPurchaseSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    
    // Bright upward arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      // Use pure sine wave to avoid the harsh "horn-like" harmonics of a triangle wave
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      
      const startTime = t + (i * 0.06); 
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02); // Slightly louder for sine
      
      if (i === notes.length - 1) {
        // Smooth exponential fade-out
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.6); // Guarantee total silence before stop
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
        osc.start(startTime);
        osc.stop(startTime + 0.12);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    });
  } catch (e) {
    console.error("Audio error", e);
  }
}
