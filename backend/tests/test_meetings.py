import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.seed.run import seed_if_empty

# Setup in-memory SQLite DB
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

Base.metadata.create_all(bind=engine)

# Seed it once
db = TestingSessionLocal()
seed_if_empty(db)
db.close()

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_list_meetings():
    response = client.get("/api/v1/meetings")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 6
    assert len(data["items"]) >= 6
    
def test_get_meeting_detail():
    # Since DB is seeded, id 1 should exist
    response = client.get("/api/v1/meetings/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "summary" in data
    assert "chapters" in data

def test_get_meeting_404():
    response = client.get("/api/v1/meetings/9999")
    assert response.status_code == 404

def test_get_transcript():
    response = client.get("/api/v1/meetings/1/transcript")
    assert response.status_code == 200
    data = response.json()
    assert "segments" in data
    assert len(data["segments"]) > 0

def test_get_me():
    response = client.get("/api/v1/me")
    assert response.status_code == 200
    assert response.json()["id"] == 1
    
def test_get_people():
    response = client.get("/api/v1/people")
    assert response.status_code == 200
    assert len(response.json()) > 0
    
def test_get_tags():
    response = client.get("/api/v1/tags")
    assert response.status_code == 200
    assert len(response.json()) > 0
