export interface Person {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface MeetingParticipant {
  id: number;
  person: Person;
}

export interface MeetingTag {
  id: number;
  tag: Tag;
}

export interface Summary {
  id: number;
  overview: string;
  key_points: string[];
  short_summary: string | null;
}

export interface Chapter {
  id: number;
  title: string;
  start_ms: number;
  end_ms: number;
  position: number;
}

export interface ActionItem {
  id: number;
  text: string;
  completed: boolean;
  due_date: string | null;
  timestamp_ms: number | null;
  position: number;
  assignee: Person | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_ms: number;
  status: string;
  participants: MeetingParticipant[];
  tags: MeetingTag[];
}

export interface MeetingListResponse {
  items: MeetingListItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface MeetingDetail extends MeetingListItem {
  summary: Summary | null;
  chapters: Chapter[];
}

export interface TranscriptSegment {
  id: number;
  start_ms: number;
  end_ms: number;
  content: string;
  position: number;
  person: Person;
}

export interface TranscriptResponse {
  segments: TranscriptSegment[];
}
