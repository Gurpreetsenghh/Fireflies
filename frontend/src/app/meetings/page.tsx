"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { MeetingList } from "@/components/meetings/MeetingList";

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full bg-white">
      <Topbar onSearch={setSearchQuery} />
      <div className="flex-1 overflow-auto p-6">
        <MeetingList searchQuery={searchQuery} />
      </div>
    </div>
  );
}
