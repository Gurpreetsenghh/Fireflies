from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Integer, String, Text, ForeignKey, DateTime, Boolean, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    meetings: Mapped[List["Meeting"]] = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")

class Meeting(Base):
    __tablename__ = "meetings"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="completed") # processing, completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="meetings")
    participants: Mapped[List["MeetingParticipant"]] = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")
    segments: Mapped[List["TranscriptSegment"]] = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summary: Mapped["Summary"] = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    chapters: Mapped[List["Chapter"]] = relationship("Chapter", back_populates="meeting", cascade="all, delete-orphan")
    action_items: Mapped[List["ActionItem"]] = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    tags: Mapped[List["MeetingTag"]] = relationship("MeetingTag", back_populates="meeting", cascade="all, delete-orphan")

class Person(Base):
    __tablename__ = "people"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    __table_args__ = (UniqueConstraint("meeting_id", "person_id"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    person_id: Mapped[int] = mapped_column(ForeignKey("people.id", ondelete="CASCADE"))

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="participants")
    person: Mapped["Person"] = relationship("Person")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"
    __table_args__ = (Index("idx_meeting_position", "meeting_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    person_id: Mapped[Optional[int]] = mapped_column(ForeignKey("people.id", ondelete="SET NULL"))
    start_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    end_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="segments")
    person: Mapped["Person"] = relationship("Person")

class Summary(Base):
    __tablename__ = "summaries"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), unique=True)
    overview: Mapped[str] = mapped_column(Text, nullable=False)
    key_points: Mapped[str] = mapped_column(Text, nullable=False) # JSON string array
    short_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="summary")

class Chapter(Base):
    __tablename__ = "chapters"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    start_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    end_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="chapters")

class ActionItem(Base):
    __tablename__ = "action_items"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    person_id: Mapped[Optional[int]] = mapped_column(ForeignKey("people.id", ondelete="SET NULL"), nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="action_items")
    assignee: Mapped[Optional["Person"]] = relationship("Person")

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    color: Mapped[str] = mapped_column(String, nullable=False)

class MeetingTag(Base):
    __tablename__ = "meeting_tags"
    __table_args__ = (UniqueConstraint("meeting_id", "tag_id"),)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"))

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="tags")
    tag: Mapped["Tag"] = relationship("Tag")
