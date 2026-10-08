from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["Lookups"])

@router.get("/me", response_model=schemas.UserSchema)
def get_me(db: Session = Depends(get_db)):
    # Mocking logged in user as user 1
    user = db.query(models.User).filter(models.User.id == 1).first()
    return user

@router.get("/people", response_model=List[schemas.PersonSchema])
def get_people(db: Session = Depends(get_db)):
    return db.query(models.Person).all()

@router.get("/tags", response_model=List[schemas.TagSchema])
def get_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()
