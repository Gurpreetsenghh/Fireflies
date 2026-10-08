"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NewMeetingModal } from "../meetings/NewMeetingModal";

export function Topbar({ onSearch }: { onSearch: (val: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0">
      <div className="relative w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search meetings..."
          className="w-full bg-slate-100 border-none rounded-md h-9 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-md h-9 px-4" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>
      
      <NewMeetingModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
