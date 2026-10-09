"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MeetingListItem } from "@/lib/types";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MeetingRow({ meeting }: { meeting: MeetingListItem }) {
  const date = new Date(meeting.date);

  return (
    <Link 
      href={`/meetings/${meeting.id}`}
      className="flex items-center px-4 py-4 hover:bg-slate-50 dark:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:border-slate-800 cursor-pointer group"
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate group-hover:text-primary transition-colors">
          {meeting.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {meeting.tags.map(mt => (
            <span 
              key={mt.id} 
              className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
              style={{ backgroundColor: `${mt.tag.color}15`, color: mt.tag.color, borderColor: `${mt.tag.color}30` }}
            >
              {mt.tag.name}
            </span>
          ))}
        </div>
      </div>
      
      <div className="w-32 text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {format(date, "MMM d, yyyy")}
      </div>
      
      <div className="w-24 text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {formatDuration(meeting.duration_ms)}
      </div>
      
      <div className="w-48 shrink-0 flex items-center">
        <div className="flex -space-x-2">
          {meeting.participants.slice(0, 4).map((p) => (
            <div 
              key={p.id}
              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 overflow-hidden"
              title={p.person.name}
            >
              {p.person.avatar_url ? (
                <img src={p.person.avatar_url} alt={p.person.name} className="w-full h-full object-cover" />
              ) : (
                p.person.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-500 dark:text-slate-400 z-10">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
