"use client";

import { useQuery } from "@tanstack/react-query";
import { getMeeting } from "@/lib/api";

export function useMeeting(id: number) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => getMeeting(id),
  });
}
