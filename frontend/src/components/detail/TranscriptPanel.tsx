"use client";

import { useEffect, useRef, useMemo } from "react";
import { TranscriptSegment } from "@/lib/types";
import { usePlayer } from "@/hooks/usePlayer";

export function TranscriptPanel({ 
  segments,
  highlightQuery = "",
  highlightSegmentIndex = -1
}: { 
  segments: TranscriptSegment[],
  highlightQuery?: string,
  highlightSegmentIndex?: number
}) {
  const { currentMs, seek } = usePlayer();
  const listRef = useRef<HTMLDivElement>(null);
  
  // Find active segment index via binary search or simple find
  const activeIndex = segments.findIndex(
    s => currentMs >= s.start_ms && currentMs <= s.end_ms
  );
  
  // Auto scroll for playback tracking
  useEffect(() => {
    // Priority goes to the search highlight if it exists
    if (highlightSegmentIndex !== -1 && listRef.current) {
       const el = listRef.current.children[highlightSegmentIndex] as HTMLElement;
       if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
       return;
    }

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
  }, [activeIndex, highlightSegmentIndex]);

  const formatTs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper to highlight matching text
  const renderContent = (content: string, isSearchMatch: boolean) => {
    if (!isSearchMatch || !highlightQuery.trim()) return content;
    
    const parts = content.split(new RegExp(`(${highlightQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlightQuery.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 dark:text-slate-50 rounded-sm px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-2">
      {segments.map((seg, i) => {
        const isActive = i === activeIndex;
        const isSearchMatch = i === highlightSegmentIndex;
        const color = seg.person.avatar_url ? "#6C5CE7" : "#00D2D3"; // Fallback color
        
        return (
          <div 
            key={seg.id}
            onClick={() => seek(seg.start_ms)}
            className={`flex gap-4 p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
              isSearchMatch 
                ? "bg-yellow-50 border-yellow-400" 
                : isActive 
                  ? "bg-primary/5 border-primary" 
                  : "border-transparent hover:bg-slate-50 dark:bg-slate-900"
            }`}
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
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
              <p className={`text-sm ${isActive || isSearchMatch ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-300"}`}>
                {renderContent(seg.content, highlightQuery.trim() !== "" && seg.content.toLowerCase().includes(highlightQuery.toLowerCase()))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
