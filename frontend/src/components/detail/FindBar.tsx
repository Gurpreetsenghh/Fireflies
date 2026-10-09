"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

export function FindBar({ 
  onClose, 
  onSearch,
  matchCount,
  currentMatch,
  onNext,
  onPrev
}: { 
  onClose: () => void;
  onSearch: (query: string) => void;
  matchCount: number;
  currentMatch: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="absolute top-2 right-4 bg-white dark:bg-slate-950 shadow-lg border border-slate-200 dark:border-slate-800 rounded-md p-1.5 flex items-center gap-2 z-10">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Find in transcript"
          className="pl-8 pr-2 py-1 text-sm border-none bg-slate-100 dark:bg-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-primary w-48"
        />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1 whitespace-nowrap">
        {matchCount > 0 ? `${currentMatch + 1} of ${matchCount}` : "0 of 0"}
      </div>
      <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1">
        <button onClick={onPrev} className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={onNext} className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
