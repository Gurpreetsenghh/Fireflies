export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

import { MeetingListResponse, MeetingDetail, TranscriptResponse, User, Person, Tag, ActionItem } from "./types";

export async function getMeetings(params?: URLSearchParams) {
  const query = params ? `?${params.toString()}` : "";
  return api<MeetingListResponse>(`/api/v1/meetings${query}`);
}

export async function getMeeting(id: number) {
  return api<MeetingDetail>(`/api/v1/meetings/${id}`);
}

export async function getTranscript(id: number) {
  return api<TranscriptResponse>(`/api/v1/meetings/${id}/transcript`);
}

export async function getActionItems(id: number) {
  return api<ActionItem[]>(`/api/v1/meetings/${id}/action-items`);
}

export async function getMe() {
  return api<User>("/api/v1/me");
}

export async function getPeople() {
  return api<Person[]>("/api/v1/people");
}

export async function getTags() {
  return api<Tag[]>("/api/v1/tags");
}
