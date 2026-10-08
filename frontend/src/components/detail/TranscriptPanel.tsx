"use client";

import { useEffect, useRef } from "react";
import { TranscriptSegment } from "@/lib/types";
import { usePlayer } from "@/hooks/usePlayer";
import { format } from "date-fns";

export function TranscriptPanel({ segments }: { segments: TranscriptSegment[] }) {
  const { currentMs, seek } = usePlayer();
  const listRef = useRef<HTMLDivElement>(null);
  
  // Find active segment index via binary search or simple find
  const activeIndex = segments.findIndex(
    s => currentMs >= s.start_ms && currentMs <= s.end_ms
  );
  
  // Auto scroll
  useEffect(() => {
    if (activeIndex !== -1 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        // Only scroll if out of view
        const rect = activeEl.getBoundingClientRect();
        const parentRect = listRef.current.getBoundingClientRect();
        if (rect.top < parentRect.top || rect.bottom > parentRect.bottom) {
          activeEl.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    }
  }, [activeIndex]);

  const formatTs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-2">
      {segments.map((seg, i) => {
        const isActive = i === activeIndex;
        const color = seg.person.avatar_url ? "#6C5CE7" : "#00D2D3"; // Fallback color
        
        return (
          <div 
            key={seg.id}
            onClick={() => seek(seg.start_ms)}
            className={`flex gap-4 p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
              isActive ? "bg-primary/5 border-primary" : "border-transparent hover:bg-slate-50"
            }`}
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
              {seg.person.avatar_url ? (
                <img src={seg.person.avatar_url} alt={seg.person.name} className="w-full h-full object-cover" />
              ) : (
                seg.person.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm" style={{ color: color }}>
                  {seg.person.name}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {formatTs(seg.start_ms)}
                </span>
              </div>
              <p className={`text-sm ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                {seg.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
