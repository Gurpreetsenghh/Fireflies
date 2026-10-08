from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_, func

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("", response_model=schemas.MeetingListResponse)
def list_meetings(
    q: Optional[str] = None,
    participant: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    tag: Optional[str] = None,
    sort: str = "newest",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)
    
    if q:
        search_filter = or_(
            models.Meeting.title.ilike(f"%{q}%"),
            models.Meeting.participants.any(
                models.MeetingParticipant.person.has(models.Person.name.ilike(f"%{q}%"))
            )
        )
        query = query.filter(search_filter)
        
    if participant:
        query = query.filter(
            models.Meeting.participants.any(
                models.MeetingParticipant.person.has(models.Person.name.ilike(f"%{participant}%"))
            )
        )
        
    if date_from:
        query = query.filter(models.Meeting.date >= date_from)
        
    if date_to:
        query = query.filter(models.Meeting.date <= date_to)
        
    if tag:
        query = query.filter(
            models.Meeting.tags.any(
                models.MeetingTag.tag.has(models.Tag.name.ilike(f"%{tag}%"))
            )
        )
        
    if sort == "oldest":
        query = query.order_by(asc(models.Meeting.date))
    else:
        query = query.order_by(desc(models.Meeting.date))
        
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.get("/{id}", response_model=schemas.MeetingDetail)
def get_meeting(id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.get("/{id}/transcript", response_model=schemas.TranscriptResponse)
def get_transcript(id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    segments = db.query(models.TranscriptSegment)\
        .filter(models.TranscriptSegment.meeting_id == id)\
        .order_by(models.TranscriptSegment.position.asc())\
        .all()
        
    return {"segments": segments}

from ..services import transcript_parser, summarizer

@router.post("", response_model=schemas.MeetingDetail)
def create_meeting(meeting_in: schemas.MeetingCreate, db: Session = Depends(get_db)):
    # 1. Parse transcript
    segments_data = []
    if meeting_in.transcript_text:
        segments_data = transcript_parser.parse_plain_text(meeting_in.transcript_text)
        
    duration_ms = max([s["end_ms"] for s in segments_data], default=0)
    
    m = models.Meeting(
        user_id=1,
        title=meeting_in.title,
        date=meeting_in.date or datetime.utcnow(),
        duration_ms=duration_ms,
        status="completed"
    )
    db.add(m)
    db.flush() # get m.id
    
    # 2. Add participants
    for p_name in meeting_in.participants or []:
        person = db.query(models.Person).filter(models.Person.name == p_name).first()
        if not person:
            person = models.Person(name=p_name)
            db.add(person)
            db.flush()
        db.add(models.MeetingParticipant(meeting_id=m.id, person_id=person.id))
        
    # 3. Add segments
    for i, seg in enumerate(segments_data):
        person = db.query(models.Person).filter(models.Person.name == seg["speaker"]).first()
        if not person:
            person = models.Person(name=seg["speaker"])
            db.add(person)
            db.flush()
            
        db.add(models.TranscriptSegment(
            meeting_id=m.id,
            person_id=person.id,
            start_ms=seg["start_ms"],
            end_ms=seg["end_ms"],
            content=seg["content"],
            position=i
        ))
        
    # 4. Generate AI notes
    summary_data = summarizer.generate_summary(segments_data)
    db.add(models.Summary(
        meeting_id=m.id,
        overview=summary_data["overview"],
        key_points=summary_data["key_points"],
        short_summary=summary_data["short_summary"]
    ))
    
    for i, ai in enumerate(summarizer.generate_action_items(segments_data)):
        person = db.query(models.Person).filter(models.Person.name == ai["assignee"]).first()
        if not person:
            person = models.Person(name=ai["assignee"])
            db.add(person)
            db.flush()
            
        db.add(models.ActionItem(
            meeting_id=m.id,
            person_id=person.id,
            text=ai["text"],
            timestamp_ms=ai["timestamp_ms"],
            position=i
        ))
        
    for i, ch in enumerate(summarizer.generate_chapters(segments_data)):
        db.add(models.Chapter(
            meeting_id=m.id,
            title=ch["title"],
            start_ms=ch["start_ms"],
            end_ms=ch["end_ms"],
            position=i
        ))
        
    db.commit()
    db.refresh(m)
    return m

@router.patch("/{id}", response_model=schemas.MeetingDetail)
def update_meeting(id: int, meeting_in: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    if meeting_in.title is not None:
        m.title = meeting_in.title
        
    if meeting_in.participants is not None:
        # Clear existing
        db.query(models.MeetingParticipant).filter(models.MeetingParticipant.meeting_id == id).delete()
        # Add new
        for p_name in meeting_in.participants:
            person = db.query(models.Person).filter(models.Person.name == p_name).first()
            if not person:
                person = models.Person(name=p_name)
                db.add(person)
                db.flush()
            db.add(models.MeetingParticipant(meeting_id=m.id, person_id=person.id))
            
    db.commit()
    db.refresh(m)
    return m
    
@router.delete("/{id}", status_code=204)
def delete_meeting(id: int, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db.delete(m)
    db.commit()
    return None
