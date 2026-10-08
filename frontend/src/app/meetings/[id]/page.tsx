"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useMeeting } from "@/hooks/useMeeting";
import { useTranscript } from "@/hooks/useTranscript";
import { PlayerProvider, usePlayer } from "@/hooks/usePlayer";
import { PlayerPanel } from "@/components/detail/PlayerPanel";
import { TranscriptPanel } from "@/components/detail/TranscriptPanel";
import { deleteMeeting } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { NotesPanel } from "@/components/detail/NotesPanel";
import { FindBar } from "@/components/detail/FindBar";

function MeetingDetailContent({ id }: { id: number }) {
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(id);
  const { data: transcriptData, isLoading: isTranscriptLoading } = useTranscript(id);
  const { setDurationMs, currentMs } = usePlayer();
  const [showFind, setShowFind] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meeting?")) {
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
    return <div className="p-8">Loading meeting...</div>;
  }

  if (!meeting) {
    return <div className="p-8">Meeting not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <Link href="/meetings" className="p-2 hover:bg-slate-100 rounded-full mr-2 shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <h1 className="font-semibold text-slate-900 truncate pr-4">{meeting.title}</h1>
        </div>
        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-md shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showFind && (
        <FindBar
          onClose={() => setShowFind(false)}
          onSearch={() => {}}
          matchCount={0}
          currentMatch={0}
          onNext={() => {}}
          onPrev={() => {}}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Player & Transcript */}
        <div className="w-2/3 flex flex-col border-r relative">
          <PlayerPanel />
          <TranscriptPanel segments={transcriptData?.segments || []} />
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
