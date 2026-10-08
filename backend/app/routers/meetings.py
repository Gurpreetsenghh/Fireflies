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
