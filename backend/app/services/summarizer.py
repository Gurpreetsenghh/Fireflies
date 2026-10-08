import json

def generate_summary(segments):
    """
    Mock summarizer. Deterministic logic instead of LLM.
    """
    if not segments:
        return {
            "overview": "No transcript provided.",
            "key_points": json.dumps([]),
            "short_summary": "Empty meeting"
        }
        
    full_text = " ".join([seg["content"] for seg in segments])
    sentences = [s.strip() for s in full_text.split(".") if s.strip()]
    
    if not sentences:
        return {
            "overview": "No transcript provided.",
            "key_points": json.dumps([]),
            "short_summary": "Empty meeting"
        }
        
    overview = sentences[0] + "." if sentences else "Meeting summary."
    if len(sentences) > 1:
        overview += " " + sentences[-1] + "."
        
    key_points = []
    # Any sentence with a question mark
    questions = [s for s in full_text.split("?") if s.strip()]
    if len(questions) > 1:
        key_points.append("Discussed: " + questions[0].split(".")[-1].strip() + "?")
        
    if not key_points:
        key_points = [sentences[0] + "."]
        
    return {
        "overview": overview,
        "key_points": json.dumps(key_points),
        "short_summary": "Meeting recap"
    }

def generate_action_items(segments):
    """
    Find sentences with action keywords.
    """
    items = []
    keywords = ["should", "need to", "will", "action", "todo", "to-do"]
    
    for seg in segments:
        text = seg["content"].lower()
        if any(kw in text for kw in keywords):
            items.append({
                "text": seg["content"],
                "assignee": seg["speaker"],
                "timestamp_ms": seg["start_ms"],
                "due_date": None
            })
            if len(items) >= 3:
                break
    return items

def generate_chapters(segments):
    """
    Split into 2 or 3 chunks.
    """
    if not segments:
        return []
        
    total_ms = segments[-1]["end_ms"]
    chapters = []
    chapters.append({
        "title": "Introduction",
        "start_ms": 0,
        "end_ms": total_ms // 2
    })
    chapters.append({
        "title": "Discussion",
        "start_ms": total_ms // 2,
        "end_ms": total_ms
    })
    return chapters

def generate_tags(segments):
    """
    Return basic tags.
    """
    return ["Generated", "Meeting"]
