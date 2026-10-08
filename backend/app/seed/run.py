import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import User, Meeting, Person, MeetingParticipant, TranscriptSegment, Summary, Chapter, ActionItem, Tag, MeetingTag

def seed_if_empty(db: Session):
    """Called from main.py lifespan. Skips if any meeting exists."""
    if db.query(Meeting).first():
        return
    
    # 1. Create default user
    default_user = User(name="Test User", email="test@example.com", avatar_url="https://ui-avatars.com/api/?name=Test+User")
    db.add(default_user)
    db.commit()
    db.refresh(default_user)

    # 2. Load meetings.json
    seed_file = os.path.join(os.path.dirname(__file__), "data", "meetings.json")
    if not os.path.exists(seed_file):
        print(f"Seed file not found at {seed_file}")
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        meetings_data = json.load(f)

    # Dictionary to hold get-or-create entities
    people = {}
    tags = {}

    def get_person(name):
        if name not in people:
            p = db.query(Person).filter(Person.name == name).first()
            if not p:
                p = Person(name=name, avatar_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}")
                db.add(p)
                db.commit()
                db.refresh(p)
            people[name] = p
        return people[name]

    def get_tag(name):
        if name not in tags:
            t = db.query(Tag).filter(Tag.name == name).first()
            if not t:
                # generate deterministic color based on name
                color = f"#{abs(hash(name)) % 0xFFFFFF:06x}"
                t = Tag(name=name, color=color)
                db.add(t)
                db.commit()
                db.refresh(t)
            tags[name] = t
        return tags[name]

    for data in meetings_data:
        duration_ms = max([seg.get("end_ms", 0) for seg in data.get("segments", [])], default=0)
        
        m = Meeting(
            user_id=default_user.id,
            title=data["title"],
            date=datetime.fromisoformat(data["date"]),
            duration_ms=duration_ms,
            status=data.get("status", "completed")
        )
        db.add(m)
        db.commit()
        db.refresh(m)

        # Participants
        for p_name in data.get("participants", []):
            person = get_person(p_name)
            mp = MeetingParticipant(meeting_id=m.id, person_id=person.id)
            db.add(mp)

        # Segments
        for i, seg in enumerate(data.get("segments", [])):
            person = get_person(seg["speaker"])
            ts = TranscriptSegment(
                meeting_id=m.id,
                person_id=person.id,
                start_ms=seg["start_ms"],
                end_ms=seg["end_ms"],
                content=seg["content"],
                position=i
            )
            db.add(ts)

        # Summary
        if "summary" in data:
            s_data = data["summary"]
            s = Summary(
                meeting_id=m.id,
                overview=s_data["overview"],
                key_points=s_data["key_points"],
                short_summary=s_data.get("short_summary")
            )
            db.add(s)

        # Chapters
        for i, ch in enumerate(data.get("chapters", [])):
            c = Chapter(
                meeting_id=m.id,
                title=ch["title"],
                start_ms=ch["start_ms"],
                end_ms=ch["end_ms"],
                position=i
            )
            db.add(c)

        # Action Items
        for i, ai in enumerate(data.get("action_items", [])):
            assignee = get_person(ai["assignee"]) if ai.get("assignee") else None
            a = ActionItem(
                meeting_id=m.id,
                person_id=assignee.id if assignee else None,
                text=ai["text"],
                due_date=ai.get("due_date"),
                timestamp_ms=ai.get("timestamp_ms"),
                position=i,
                completed=ai.get("completed", False)
            )
            db.add(a)

        # Tags
        for t_name in data.get("tags", []):
            tag = get_tag(t_name)
            mt = MeetingTag(meeting_id=m.id, tag_id=tag.id)
            db.add(mt)

        db.commit()
    print("Seed data successfully loaded.")
