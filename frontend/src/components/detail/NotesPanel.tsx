"use client";

import { useMeeting } from "@/hooks/useMeeting";
import { useActionItems } from "@/hooks/useActionItems";
import { usePlayer } from "@/hooks/usePlayer";
import { useActionItemMutations } from "@/hooks/useActionItemMutations";

export function NotesPanel({ meetingId }: { meetingId: number }) {
  const { data: meeting } = useMeeting(meetingId);
  const { data: actionItems } = useActionItems(meetingId);
  const { toggleComplete } = useActionItemMutations(meetingId);
  const { seek } = usePlayer();

  if (!meeting) return null;

  return (
    <div className="flex flex-col bg-slate-50 h-full overflow-hidden">
      <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="font-semibold text-slate-800">Notes</h2>
      </div>
      <div className="p-5 overflow-auto space-y-8 flex-1">
        {meeting.summary && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Summary
            </h3>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{meeting.summary.overview}</p>
              
              <h4 className="text-xs font-semibold text-slate-600 mb-2">Key Points</h4>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 marker:text-slate-400">
                {meeting.summary.key_points.map((kp, i) => (
                  <li key={i} className="pl-1">{kp}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
        
        {meeting.chapters && meeting.chapters.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Outline
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
              {meeting.chapters.map(ch => (
                <div 
                  key={ch.id} 
                  onClick={() => seek(ch.start_ms)}
                  className="text-sm flex gap-4 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span className="text-blue-600 font-medium w-12 shrink-0">
                    {Math.floor(ch.start_ms / 60000)}:{(Math.floor(ch.start_ms / 1000) % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-slate-700 font-medium">{ch.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {actionItems && actionItems.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Action Items
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
              {actionItems.map((ai) => (
                <div key={ai.id} className="flex gap-3 p-3 items-start">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer" 
                    checked={ai.completed}
                    onChange={(e) => toggleComplete.mutate({ id: ai.id, completed: e.target.checked })} 
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${ai.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{ai.text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {ai.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-600">
                            {ai.assignee.avatar_url ? (
                              <img src={ai.assignee.avatar_url} alt={ai.assignee.name} className="w-full h-full object-cover" />
                            ) : (
                              ai.assignee.name.charAt(0)
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{ai.assignee.name}</span>
                        </div>
                      )}
                      {ai.timestamp_ms !== null && (
                        <button onClick={() => seek(ai.timestamp_ms!)} className="text-[10px] text-blue-600 font-semibold hover:underline">
                          @{Math.floor(ai.timestamp_ms / 60000)}:{(Math.floor(ai.timestamp_ms / 1000) % 60).toString().padStart(2, '0')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
