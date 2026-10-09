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

export async function createMeeting(data: { title: string; date?: string; participants?: string[]; transcript_text?: string }) {
  return api<MeetingDetail>("/api/v1/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateMeeting(id: number, data: { title?: string; participants?: string[] }) {
  return api<MeetingDetail>(`/api/v1/meetings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteMeeting(id: number) {
  return api<void>(`/api/v1/meetings/${id}`, { method: "DELETE" });
}

export async function createActionItem(meetingId: number, data: { text: string; assignee?: string; due_date?: string; timestamp_ms?: number }) {
  return api<ActionItem>(`/api/v1/meetings/${meetingId}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateActionItem(id: number, data: { text?: string; completed?: boolean; assignee?: string; due_date?: string }) {
  return api<ActionItem>(`/api/v1/action-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteActionItem(id: number) {
  return api<void>(`/api/v1/action-items/${id}`, { method: "DELETE" });
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
