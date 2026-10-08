"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMeeting } from "@/hooks/useMeeting";
import { useTranscript } from "@/hooks/useTranscript";
import { PlayerProvider, usePlayer } from "@/hooks/usePlayer";
import { PlayerPanel } from "@/components/detail/PlayerPanel";
import { TranscriptPanel } from "@/components/detail/TranscriptPanel";

function MeetingDetailContent({ id }: { id: number }) {
  const { data: meeting, isLoading: isMeetingLoading } = useMeeting(id);
  const { data: transcriptData, isLoading: isTranscriptLoading } = useTranscript(id);
  const { setDurationMs } = usePlayer();

  useEffect(() => {
    if (meeting?.duration_ms) {
      setDurationMs(meeting.duration_ms);
    }
  }, [meeting?.duration_ms, setDurationMs]);

  if (isMeetingLoading || isTranscriptLoading) {
    return <div className="p-8">Loading meeting...</div>;
  }

  if (!meeting) {
    return <div className="p-8">Meeting not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-4 bg-white shrink-0">
        <Link href="/meetings" className="p-2 hover:bg-slate-100 rounded-full mr-2">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="font-semibold text-slate-900 truncate">{meeting.title}</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Player & Transcript */}
        <div className="w-2/3 flex flex-col border-r">
          <PlayerPanel />
          <TranscriptPanel segments={transcriptData?.segments || []} />
        </div>

        {/* Right Panel: Notes (Placeholder for now) */}
        <div className="w-1/3 flex flex-col bg-slate-50">
          <div className="p-4 border-b bg-white">
            <h2 className="font-semibold">Notes</h2>
          </div>
          <div className="p-4 overflow-auto space-y-6">
            {meeting.summary && (
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-2">Summary</h3>
                <p className="text-sm text-slate-800 mb-4">{meeting.summary.overview}</p>
                <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1">
                  {meeting.summary.key_points.map((kp, i) => (
                    <li key={i}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {meeting.chapters && meeting.chapters.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-2">Outline</h3>
                <div className="space-y-2">
                  {meeting.chapters.map(ch => (
                    <div key={ch.id} className="text-sm flex gap-4">
                      <span className="text-primary font-medium">{Math.floor(ch.start_ms / 60000)}:{(Math.floor(ch.start_ms / 1000) % 60).toString().padStart(2, '0')}</span>
                      <span className="text-slate-700">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
