"use client";

import { useState } from "react";
import { useMeeting } from "@/hooks/useMeeting";
import { useActionItems } from "@/hooks/useActionItems";
import { usePlayer } from "@/hooks/usePlayer";
import { useActionItemMutations } from "@/hooks/useActionItemMutations";

export function NotesPanel({ meetingId }: { meetingId: number }) {
  const { data: meeting } = useMeeting(meetingId);
  const { data: actionItems } = useActionItems(meetingId);
  const { toggleComplete, editText, deleteItem, addActionItem } = useActionItemMutations(meetingId);
  const { seek } = usePlayer();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  if (!meeting) return null;

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 h-full overflow-hidden">
      <div className="p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200">Notes</h2>
      </div>
      <div className="p-5 overflow-auto space-y-8 flex-1">
        {meeting.summary && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Summary
            </h3>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{meeting.summary.overview}</p>
              
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Key Points</h4>
              <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1.5 marker:text-slate-400">
                {meeting.summary.key_points.map((kp, i) => (
                  <li key={i} className="pl-1">{kp}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
        
        {meeting.chapters && meeting.chapters.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Outline
            </h3>
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {meeting.chapters.map(ch => (
                <div 
                  key={ch.id} 
                  onClick={() => seek(ch.start_ms)}
                  className="text-sm flex gap-4 p-3 hover:bg-slate-50 dark:bg-slate-900 cursor-pointer transition-colors"
                >
                  <span className="text-blue-600 font-medium w-12 shrink-0">
                    {Math.floor(ch.start_ms / 60000)}:{(Math.floor(ch.start_ms / 1000) % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{ch.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {actionItems && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Action Items
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {actionItems.map((ai) => (
                <div key={ai.id} className="flex gap-3 p-3 items-start group">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer shrink-0" 
                    checked={ai.completed}
                    onChange={(e) => toggleComplete.mutate({ id: ai.id, completed: e.target.checked })} 
                  />
                  <div className="flex-1 min-w-0">
                    {editingId === ai.id ? (
                      <input
                        type="text"
                        className="w-full text-sm font-medium border border-primary rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          if (editValue.trim() !== ai.text) {
                            editText.mutate({ id: ai.id, text: editValue });
                          }
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editValue.trim() !== ai.text) {
                              editText.mutate({ id: ai.id, text: editValue });
                            }
                            setEditingId(null);
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <p 
                        className={`text-sm font-medium cursor-text hover:bg-slate-50 dark:bg-slate-900 rounded px-1 -mx-1 ${ai.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}
                        onClick={() => {
                          setEditingId(ai.id);
                          setEditValue(ai.text);
                        }}
                      >
                        {ai.text}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {ai.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-400">
                            {ai.assignee.avatar_url ? (
                              <img src={ai.assignee.avatar_url} alt={ai.assignee.name} className="w-full h-full object-cover" />
                            ) : (
                              ai.assignee.name.charAt(0)
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{ai.assignee.name}</span>
                        </div>
                      )}
                      {ai.timestamp_ms !== null && (
                        <button onClick={() => seek(ai.timestamp_ms!)} className="text-[10px] text-blue-600 font-semibold hover:underline">
                          @{Math.floor(ai.timestamp_ms / 60000)}:{(Math.floor(ai.timestamp_ms / 1000) % 60).toString().padStart(2, '0')}
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                    onClick={() => {
                      if (confirm("Delete this action item?")) {
                        deleteItem.mutate(ai.id);
                      }
                    }}
                    aria-label="Delete action item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}

              {isAdding ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 flex items-center gap-3">
                  <input type="checkbox" disabled className="w-4 h-4 mt-0.5" />
                  <input
                    type="text"
                    className="flex-1 text-sm border-none bg-white dark:bg-slate-950 shadow-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter action item..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newValue.trim()) {
                        addActionItem.mutate({ text: newValue.trim() });
                        setNewValue("");
                        setIsAdding(false);
                      }
                      if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewValue("");
                      }
                    }}
                    autoFocus
                    onBlur={() => {
                      if (newValue.trim()) {
                        addActionItem.mutate({ text: newValue.trim() });
                      }
                      setIsAdding(false);
                      setNewValue("");
                    }}
                  />
                </div>
              ) : (
                <button 
                  className="w-full text-left p-3 text-sm text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:bg-slate-900 hover:text-slate-900 dark:text-slate-50 transition-colors flex items-center gap-2"
                  onClick={() => setIsAdding(true)}
                >
                  <span className="text-lg leading-none mb-0.5">+</span> Add action item...
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
