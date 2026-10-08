"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface PlayerContextType {
  currentMs: number;
  isPlaying: boolean;
  playbackRate: number;
  durationMs: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (ms: number) => void;
  setRate: (rate: number) => void;
  setDurationMs: (ms: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentMs, setCurrentMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [durationMs, setDurationMs] = useState(0);
  
  const lastUpdateRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = Date.now();
      
      const tick = () => {
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        lastUpdateRef.current = now;
        
        setCurrentMs((prev) => {
          const next = prev + delta * playbackRate;
          if (next >= durationMs) {
            setIsPlaying(false);
            return durationMs;
          }
          return next;
        });
        
        rafRef.current = requestAnimationFrame(tick);
      };
      
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, playbackRate, durationMs]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const seek = (ms: number) => {
    setCurrentMs(Math.max(0, Math.min(ms, durationMs)));
  };
  
  const setRate = (rate: number) => setPlaybackRate(rate);

  return (
    <PlayerContext.Provider
      value={{
        currentMs,
        isPlaying,
        playbackRate,
        durationMs,
        play,
        pause,
        togglePlay,
        seek,
        setRate,
        setDurationMs
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
