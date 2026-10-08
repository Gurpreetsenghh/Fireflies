import re

def parse_plain_text(content: str):
    """
    Parses plain text with simple heuristic: Speaker Name: Text
    or [MM:SS] Speaker: Text
    Returns list of {"speaker": str, "start_ms": int, "end_ms": int, "content": str}
    """
    segments = []
    lines = content.strip().split("\n")
    current_ms = 0
    step_ms = 15000 # 15 seconds spacing if no timestamps
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Basic heuristic for Speaker: Text
        speaker = "Unknown"
        text = line
        
        parts = line.split(":", 1)
        if len(parts) == 2:
            speaker_candidate = parts[0].strip()
            # If candidate is short enough, it's likely a speaker
            if len(speaker_candidate) < 30:
                speaker = speaker_candidate
                text = parts[1].strip()
                
        segments.append({
            "speaker": speaker,
            "start_ms": current_ms,
            "end_ms": current_ms + step_ms,
            "content": text
        })
        current_ms += step_ms
        
    return segments
