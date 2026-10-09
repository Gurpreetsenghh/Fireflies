"use client";

import { useMemo } from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { MeetingRow } from "./MeetingRow";
import { format } from "date-fns";

export function MeetingList({ searchQuery, sortOrder = "newest" }: { searchQuery: string, sortOrder?: "newest" | "oldest" }) {
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    if (sortOrder) p.set("sort", sortOrder);
    return p;
  }, [searchQuery, sortOrder]);

  const { data, isLoading, error } = useMeetings(params);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading meetings. Is the backend waking up?
      </div>
    );
  }

  const meetings = data?.items || [];

  if (meetings.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No meetings found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or create a new meeting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 pb-2 border-b dark:border-slate-800">
        <div className="flex-1">Meeting</div>
        <div className="w-32">Date</div>
        <div className="w-24">Duration</div>
        <div className="w-48">Participants</div>
      </div>
      
      {meetings.map((meeting) => (
        <MeetingRow key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
