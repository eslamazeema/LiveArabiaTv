import urllib.request
import re

url = 'https://www.elahmad.ru/tv/arabic-tv-online.php?id=niledrama'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')

scripts = re.findall(r'<script[\s\S]*?</script>', html, re.I)
print(f"Scripts found: {len(scripts)}")
for s in scripts:
    if any(k in s for k in ['src', 'hls', 'player', 'm3u8', 'video', 'embed', 'source']):
        print("SCRIPT:", s[:400], "\n---")
