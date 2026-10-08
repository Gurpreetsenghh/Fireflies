"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeeting } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewMeetingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [transcript, setTranscript] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting created!");
      onOpenChange(false);
      setTitle("");
      setParticipants("");
      setTranscript("");
      router.push(`/meetings/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create meeting.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");
    
    createMutation.mutate({
      title,
      participants: participants ? participants.split(",").map(p => p.trim()).filter(Boolean) : [],
      transcript_text: transcript
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>New Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g. Q3 Roadmap Review" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Participants (comma separated)</label>
            <Input placeholder="Alice, Bob, Charlie" value={participants} onChange={e => setParticipants(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Transcript (Optional)</label>
            <textarea 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Alice: Hello everyone!&#10;Bob: Hi Alice!"
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Processing..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
