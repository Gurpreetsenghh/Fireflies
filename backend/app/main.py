import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine, SessionLocal
from .routers import health, meetings, lookups, action_items
from . import models
from .seed.run import seed_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("data", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    
    # Seed DB
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
        
    yield

app = FastAPI(title="Meetings API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(health.router, prefix="/api/v1")
app.include_router(meetings.router, prefix="/api/v1")
app.include_router(lookups.router, prefix="/api/v1")
app.include_router(action_items.router, prefix="/api/v1")
