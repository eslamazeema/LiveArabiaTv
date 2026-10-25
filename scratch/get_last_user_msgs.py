import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

path = r"C:\Users\EEHC\.gemini\antigravity-ide\brain\13ba37ec-b0b0-4e8c-adff-364488cd04de\.system_generated\logs\transcript.jsonl"
user_msgs = []
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        if '"type":"USER_INPUT"' in line:
            try:
                obj = json.loads(line)
                user_msgs.append((obj.get("step_index"), obj.get("content")))
            except Exception:
                pass

for s, c in user_msgs[-8:]:
    print(f"=== Step {s} ===")
    print(c)
    print("=" * 40)

