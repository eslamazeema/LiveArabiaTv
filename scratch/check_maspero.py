import re

with open('scratch/maspero_page.html', 'r', encoding='utf-8') as f:
    text = f.read()

for tag in ['iframe', 'audio', 'video', 'source']:
    matches = re.findall(rf'<{tag}[^>]*>', text, re.IGNORECASE)
    print(f'{tag}:', matches)

scripts = re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL)
for s in scripts:
    if any(k in s for k in ['jwplayer', 'videojs', 'Hls', 'm3u8', 'mp3', 'stream', 'audio', 'Player']):
        for line in s.splitlines():
            if any(k in line.lower() for k in ['file', 'src', 'stream', 'url', 'http']):
                print("JS line:", line.strip())
