import json
import os
from datetime import datetime, timedelta, timezone

def generate_meetings():
    now = datetime.now(timezone.utc)
    
    meetings = []
    
    # 1. Product Roadmap Planning
    meeting1 = {
        "title": "Product Roadmap Planning",
        "date": (now - timedelta(days=2)).isoformat(),
        "status": "completed",
        "participants": ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"],
        "segments": [
            {"speaker": "Alice Smith", "start_ms": 0, "end_ms": 15000, "content": "Welcome everyone to our Q3 roadmap planning."},
            {"speaker": "Bob Jones", "start_ms": 15000, "end_ms": 32000, "content": "Thanks Alice. I think we should prioritize the new dashboard features first."},
            {"speaker": "Charlie Brown", "start_ms": 32000, "end_ms": 45000, "content": "Agreed, but let's not forget the backend migration we discussed last week."},
            {"speaker": "Diana Prince", "start_ms": 45000, "end_ms": 60000, "content": "I'll make sure the design team has the mockups ready for the dashboard by Friday."}
        ],
        "summary": {
            "overview": "The team discussed the Q3 product roadmap, focusing heavily on the new dashboard features and backend migration.",
            "key_points": json.dumps(["Dashboard features are top priority", "Backend migration needs to be scheduled", "Design mockups due Friday"]),
            "short_summary": "Q3 Roadmap alignment"
        },
        "chapters": [
            {"title": "Introduction", "start_ms": 0, "end_ms": 15000},
            {"title": "Dashboard Priority", "start_ms": 15000, "end_ms": 32000},
            {"title": "Backend Migration", "start_ms": 32000, "end_ms": 60000}
        ],
        "action_items": [
            {"text": "Finalize dashboard mockups", "assignee": "Diana Prince", "due_date": (now + timedelta(days=3)).isoformat().split("T")[0], "timestamp_ms": 45000},
            {"text": "Schedule backend migration", "assignee": "Charlie Brown", "due_date": None, "timestamp_ms": 32000}
        ],
        "tags": ["Roadmap", "Planning"]
    }
    meetings.append(meeting1)

    # 2. Sprint Retrospective
    meeting2 = {
        "title": "Sprint Retrospective",
        "date": (now - timedelta(days=7)).isoformat(),
        "status": "completed",
        "participants": ["Alice Smith", "Eve Adams"],
        "segments": [
            {"speaker": "Alice Smith", "start_ms": 0, "end_ms": 20000, "content": "Let's review what went well and what didn't in the last sprint."},
            {"speaker": "Eve Adams", "start_ms": 20000, "end_ms": 40000, "content": "The deployment pipeline was a bit flaky. We need to fix the CI/CD cache issues."},
            {"speaker": "Alice Smith", "start_ms": 40000, "end_ms": 60000, "content": "I'll create a ticket for the DevOps team to look into the cache issue."}
        ],
        "summary": {
            "overview": "Sprint retrospective focused on the flaky deployment pipeline and CI/CD caching problems.",
            "key_points": json.dumps(["Deployment pipeline was flaky", "CI/CD cache needs fixing"]),
            "short_summary": "Sprint Retro & CI/CD issues"
        },
        "chapters": [
            {"title": "Sprint Review", "start_ms": 0, "end_ms": 20000},
            {"title": "CI/CD Issues", "start_ms": 20000, "end_ms": 60000}
        ],
        "action_items": [
            {"text": "Create DevOps ticket for CI/CD cache", "assignee": "Alice Smith", "due_date": None, "timestamp_ms": 40000}
        ],
        "tags": ["Retrospective", "Engineering"]
    }
    meetings.append(meeting2)

    # Add 4 more basic meetings to satisfy the '6 meetings' requirement
    for i in range(3, 7):
        m = {
            "title": f"Weekly Team Sync {i}",
            "date": (now - timedelta(days=i*5)).isoformat(),
            "status": "completed",
            "participants": ["Alice Smith", "Bob Jones"],
            "segments": [
                {"speaker": "Alice Smith", "start_ms": 0, "end_ms": 10000, "content": "Status updates everyone?"},
                {"speaker": "Bob Jones", "start_ms": 10000, "end_ms": 20000, "content": "No blockers on my end."}
            ],
            "summary": {
                "overview": f"Routine sync meeting {i}.",
                "key_points": json.dumps(["No blockers reported"]),
                "short_summary": "Routine sync"
            },
            "chapters": [
                {"title": "Status Updates", "start_ms": 0, "end_ms": 20000}
            ],
            "action_items": [],
            "tags": ["Sync"]
        }
        meetings.append(m)

    os.makedirs("app/seed/data", exist_ok=True)
    with open("app/seed/data/meetings.json", "w", encoding="utf-8") as f:
        json.dump(meetings, f, indent=2)

if __name__ == "__main__":
    generate_meetings()
    print("Seed data generated at app/seed/data/meetings.json")
