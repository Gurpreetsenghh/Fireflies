"use client";

import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "@/lib/api";

export function useMeetings(params?: URLSearchParams) {
  return useQuery({
    queryKey: ["meetings", params?.toString() ?? ""],
    queryFn: () => getMeetings(params),
  });
}
