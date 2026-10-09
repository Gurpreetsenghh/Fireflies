"use client";

import { Search, Plus, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NewMeetingModal } from "../meetings/NewMeetingModal";

export function Topbar({ 
  onSearch, 
  sortOrder = "newest",
  onSortChange = () => {}
}: { 
  onSearch: (val: string) => void,
  sortOrder?: "newest" | "oldest",
  onSortChange?: (val: "newest" | "oldest") => void
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-14 border-b dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950 shrink-0">
      <div className="relative w-96 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meetings..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md h-9 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border rounded-md px-2 h-9 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm">
          <ArrowDownUp className="w-4 h-4" />
          <select 
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as "newest" | "oldest")}
            className="bg-transparent border-none outline-none focus:ring-0 text-sm font-medium cursor-pointer"
            aria-label="Sort by recency"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-md h-9 px-4" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>
      
      <NewMeetingModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
