from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
import json

class PersonSchema(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TagSchema(BaseModel):
    id: int
    name: str
    color: str
    model_config = ConfigDict(from_attributes=True)

class MeetingTagSchema(BaseModel):
    id: int
    tag: TagSchema
    model_config = ConfigDict(from_attributes=True)

class MeetingParticipantSchema(BaseModel):
    id: int
    person: PersonSchema
    model_config = ConfigDict(from_attributes=True)

class SummarySchema(BaseModel):
    id: int
    overview: str
    key_points: List[str]
    short_summary: Optional[str] = None
    
    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        if hasattr(obj, "key_points") and isinstance(obj.key_points, str):
            try:
                # Convert from JSON string array to python list
                obj.key_points = json.loads(obj.key_points)
            except:
                obj.key_points = []
        return super().model_validate(obj, *args, **kwargs)

    model_config = ConfigDict(from_attributes=True)

class ChapterSchema(BaseModel):
    id: int
    title: str
    start_ms: int
    end_ms: int
    position: int
    model_config = ConfigDict(from_attributes=True)

class ActionItemOut(BaseModel):
    id: int
    text: str
    completed: bool
    due_date: Optional[str] = None
    timestamp_ms: Optional[int] = None
    position: int
    assignee: Optional[PersonSchema] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ActionItemCreate(BaseModel):
    text: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    timestamp_ms: Optional[int] = None

class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None
    timestamp_ms: Optional[int] = None

class MeetingListItem(BaseModel):
    id: int
    title: str
    date: datetime
    duration_ms: int
    status: str
    participants: List[MeetingParticipantSchema] = []
    tags: List[MeetingTagSchema] = []
    model_config = ConfigDict(from_attributes=True)

class MeetingListResponse(BaseModel):
    items: List[MeetingListItem]
    total: int
    page: int
    per_page: int

class MeetingDetail(MeetingListItem):
    summary: Optional[SummarySchema] = None
    chapters: List[ChapterSchema] = []
    model_config = ConfigDict(from_attributes=True)

class MeetingCreate(BaseModel):
    title: str
    date: Optional[datetime] = None
    participants: Optional[List[str]] = []
    transcript_text: Optional[str] = None
    transcript_format: Optional[str] = "plain"

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    participants: Optional[List[str]] = None

class TranscriptSegmentOut(BaseModel):
    id: int
    start_ms: int
    end_ms: int
    content: str
    position: int
    person: PersonSchema
    model_config = ConfigDict(from_attributes=True)
    
class TranscriptResponse(BaseModel):
    segments: List[TranscriptSegmentOut]
