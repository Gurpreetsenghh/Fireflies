"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Edit2, Clock, Calendar, Users } from "lucide-react";
import { useMeeting } from "@/hooks/useMeeting";
import { useTranscript } from "@/hooks/useTranscript";
import { PlayerProvider, usePlayer } from "@/hooks/usePlayer";
import { PlayerPanel } from "@/components/detail/PlayerPanel";
import { TranscriptPanel } from "@/components/detail/TranscriptPanel";
import { deleteMeeting } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { NotesPanel } from "@/components/detail/NotesPanel";
import { FindBar } from "@/components/detail/FindBar";
import { EditMeetingModal } from "@/components/meetings/EditMeetingModal";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MeetingDetailContent({ id }: { id: number }) {
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(id);
  const { data: transcriptData, isLoading: isTranscriptLoading } = useTranscript(id);
  const { setDurationMs, currentMs } = usePlayer();
  const [showFind, setShowFind] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  const segments = transcriptData?.segments || [];

  // Compute search matches: array of segment indices that contain the query
  const matchIndices = useMemo(() => {
    if (!findQuery.trim()) return [];
    const q = findQuery.toLowerCase();
    return segments
      .map((seg, i) => (seg.content.toLowerCase().includes(q) ? i : -1))
      .filter((i) => i !== -1);
  }, [findQuery, segments]);

  const handleSearch = useCallback((query: string) => {
    setFindQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  const handleNextMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchIndices.length);
  }, [matchIndices.length]);

  const handlePrevMatch = useCallback(() => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchIndices.length) % matchIndices.length);
  }, [matchIndices.length]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      try {
        await deleteMeeting(id);
        toast.success("Meeting deleted");
        queryClient.invalidateQueries({ queryKey: ["meetings"] });
        router.push("/meetings");
      } catch {
        toast.error("Failed to delete meeting");
      }
    }
  };

  useEffect(() => {
    if (meeting?.duration_ms) {
      setDurationMs(meeting.duration_ms);
    }
  }, [meeting?.duration_ms, setDurationMs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowFind(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isMeetingLoading || isTranscriptLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950">
        <div className="h-14 border-b dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-950 shrink-0">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-2/3 flex flex-col border-r dark:border-slate-800 p-4 space-y-4">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-1/3 p-4 space-y-4">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Meeting not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 relative">
      {/* Header */}
      <div className="h-14 border-b dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <Link href="/meetings" className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full mr-2 shrink-0" aria-label="Back to meetings">
            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-slate-900 dark:text-slate-50 truncate">{meeting.title}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(meeting.date), "MMM d, yyyy · h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(meeting.duration_ms)}
              </span>
              {meeting.participants.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {meeting.participants.map(p => p.person.name).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setShowEdit(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900 rounded-md" aria-label="Edit meeting">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-md" aria-label="Delete meeting">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <EditMeetingModal open={showEdit} onOpenChange={setShowEdit} meeting={meeting} />

      {showFind && (
        <FindBar
          onClose={() => { setShowFind(false); setFindQuery(""); }}
          onSearch={handleSearch}
          matchCount={matchIndices.length}
          currentMatch={currentMatchIndex}
          onNext={handleNextMatch}
          onPrev={handlePrevMatch}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Player & Transcript */}
        <div className="w-2/3 flex flex-col border-r dark:border-slate-800 relative">
          <PlayerPanel />
          <TranscriptPanel
            segments={segments}
            highlightQuery={findQuery}
            highlightSegmentIndex={matchIndices.length > 0 ? matchIndices[currentMatchIndex] : -1}
          />
        </div>

        {/* Right Panel: Notes */}
        <div className="w-1/3 flex flex-col">
          <NotesPanel meetingId={id} />
        </div>
      </div>
    </div>
  );
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = parseInt(unwrappedParams.id, 10);

  return (
    <PlayerProvider>
      <MeetingDetailContent id={id} />
    </PlayerProvider>
  );
}
