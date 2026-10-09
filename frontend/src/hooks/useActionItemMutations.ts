"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ActionItem } from "@/lib/types";
import { toast } from "sonner";

export function useActionItemMutations(meetingId: number) {
  const queryClient = useQueryClient();

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return api<ActionItem>(`/api/v1/action-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["meeting", meetingId, "actionItems"] });
      const previousItems = queryClient.getQueryData<ActionItem[]>(["meeting", meetingId, "actionItems"]);
      
      if (previousItems) {
        queryClient.setQueryData<ActionItem[]>(
          ["meeting", meetingId, "actionItems"],
          previousItems.map(item => item.id === id ? { ...item, completed } : item)
        );
      }
      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["meeting", meetingId, "actionItems"], context.previousItems);
      }
      toast.error("Failed to update action item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId, "actionItems"] });
    },
  });

  const addActionItem = useMutation({
    mutationFn: async (data: { text: string }) => {
      return api<ActionItem>(`/api/v1/meetings/${meetingId}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId, "actionItems"] });
      toast.success("Action item added");
    },
    onError: () => toast.error("Failed to add action item")
  });

  const editText = useMutation({
    mutationFn: async ({ id, text }: { id: number; text: string }) => {
      return api<ActionItem>(`/api/v1/action-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId, "actionItems"] });
      toast.success("Action item updated");
    },
    onError: () => toast.error("Failed to update action item")
  });

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      return api<void>(`/api/v1/action-items/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId, "actionItems"] });
      toast.success("Action item deleted");
    },
    onError: () => toast.error("Failed to delete action item")
  });

  return {
    toggleComplete,
    addActionItem,
    editText,
    deleteItem
  };
}
