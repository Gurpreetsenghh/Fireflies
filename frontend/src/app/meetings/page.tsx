"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { MeetingList } from "@/components/meetings/MeetingList";

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <Topbar 
        onSearch={setSearchQuery} 
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      <div className="flex-1 overflow-auto p-6">
        <MeetingList searchQuery={searchQuery} sortOrder={sortOrder} />
      </div>
    </div>
  );
}
