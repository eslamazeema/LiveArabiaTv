import json

transcript_path = r'C:\Users\EEHC\.gemini\antigravity-ide\brain\13ba37ec-b0b0-4e8c-adff-364488cd04de\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'F5B4AD3CE5CB2860BAF8025B64E4BC53' in line:
            obj = json.loads(line)
            c = str(obj.get('content', ''))
            for seg in c.split('\n'):
                if any(k in seg.lower() for k in ['iframe', 'video', 'audio', 'm3u8', 'stream', '.mp3', 'player']):
                    with open('scratch/dom_player.txt', 'a', encoding='utf-8') as out:
                        out.write(seg + '\n')

print("DONE searching transcript!")
