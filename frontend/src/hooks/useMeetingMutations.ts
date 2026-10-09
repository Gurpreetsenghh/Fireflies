"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeeting } from "@/lib/api";
import { toast } from "sonner";

export function useMeetingMutations(meetingId: number) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; participants?: string[] }) => updateMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting updated");
    },
    onError: () => {
      toast.error("Failed to update meeting");
    }
  });

  return { updateMutation };
}
