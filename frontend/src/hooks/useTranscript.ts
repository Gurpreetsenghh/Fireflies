"use client";

import { useQuery } from "@tanstack/react-query";
import { getTranscript } from "@/lib/api";

export function useTranscript(id: number) {
  return useQuery({
    queryKey: ["meeting", id, "transcript"],
    queryFn: () => getTranscript(id),
  });
}
