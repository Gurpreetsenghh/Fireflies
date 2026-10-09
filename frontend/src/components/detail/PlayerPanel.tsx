"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerPanel() {
  const { currentMs, durationMs, isPlaying, togglePlay, seek, playbackRate, setRate } = usePlayer();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
      <Button variant="ghost" size="icon" onClick={togglePlay} className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
      </Button>

      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
          {formatTime(currentMs)}
        </span>
        
        <input
          type="range"
          min={0}
          max={durationMs}
          value={currentMs}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
          {formatTime(durationMs)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {[1, 1.5, 2].map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              playbackRate === r ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
