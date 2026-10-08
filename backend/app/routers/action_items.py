from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["Action Items"])

def utcnow():
    return datetime.now(timezone.utc)

@router.get("/meetings/{id}/action-items", response_model=List[schemas.ActionItemOut])
def list_action_items(id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    items = db.query(models.ActionItem)\
        .filter(models.ActionItem.meeting_id == id)\
        .order_by(models.ActionItem.position.asc())\
        .all()
    return items

@router.post("/meetings/{id}/action-items", response_model=schemas.ActionItemOut)
def create_action_item(id: int, item: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    person_id = None
    if item.assignee:
        person = db.query(models.Person).filter(models.Person.name == item.assignee).first()
        if not person:
            # Create the person
            person = models.Person(name=item.assignee)
            db.add(person)
            db.commit()
            db.refresh(person)
        person_id = person.id
        
    max_pos = db.query(models.ActionItem).filter(models.ActionItem.meeting_id == id).count()
    
    new_item = models.ActionItem(
        meeting_id=id,
        person_id=person_id,
        text=item.text,
        due_date=item.due_date,
        timestamp_ms=item.timestamp_ms,
        position=max_pos,
        completed=False
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.patch("/action-items/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(item_id: int, item_update: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    if item_update.text is not None:
        db_item.text = item_update.text
        
    if item_update.completed is not None:
        db_item.completed = item_update.completed
        
    if item_update.due_date is not None:
        db_item.due_date = item_update.due_date
        
    if item_update.timestamp_ms is not None:
        db_item.timestamp_ms = item_update.timestamp_ms
        
    if item_update.assignee is not None:
        if item_update.assignee == "":
            db_item.person_id = None
        else:
            person = db.query(models.Person).filter(models.Person.name == item_update.assignee).first()
            if not person:
                person = models.Person(name=item_update.assignee)
                db.add(person)
                db.commit()
                db.refresh(person)
            db_item.person_id = person.id

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/action-items/{item_id}", status_code=204)
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    db.delete(db_item)
    db.commit()
    return None
