"use client";

import { useQuery } from "@tanstack/react-query";
import { getActionItems } from "@/lib/api";

export function useActionItems(id: number) {
  return useQuery({
    queryKey: ["meeting", id, "actionItems"],
    queryFn: () => getActionItems(id),
  });
}
