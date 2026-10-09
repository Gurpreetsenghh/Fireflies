"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMeetingMutations } from "@/hooks/useMeetingMutations";
import { MeetingDetail } from "@/lib/types";

export function EditMeetingModal({ 
  open, 
  onOpenChange, 
  meeting 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  meeting: MeetingDetail;
}) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const { updateMutation } = useMeetingMutations(meeting.id);

  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setParticipants(meeting.participants.map(p => p.person.name).join(", "));
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title,
      participants: participants.split(",").map(p => p.trim()).filter(Boolean),
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Meeting Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Participants (comma separated)</label>
            <Input value={participants} onChange={e => setParticipants(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
