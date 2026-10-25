import urllib.request
import json
import re

# 1. Fetch maspero page to get any session tokens or player config
req = urllib.request.Request('https://www.maspero.eg/stream/19', headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# 2. Query geo.dailymotion.com player API with maspero referer
dm_urls = [
    'https://geo.dailymotion.com/player/metadata/video/x8n6e3a?player_id=xi5eg',
    'https://www.dailymotion.com/player/metadata/video/x8n6e3a'
]

for u in dm_urls:
    print(f"\n--- Testing: {u} ---")
    try:
        dm_req = urllib.request.Request(u, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.maspero.eg/stream/19',
            'Origin': 'https://www.maspero.eg'
        })
        with urllib.request.urlopen(dm_req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("Title:", data.get('title'))
            print("Error:", data.get('error'))
            qualities = data.get('qualities', {})
            print("Qualities keys:", list(qualities.keys()))
            for q, items in qualities.items():
                for it in items:
                    print(f"  {q} ({it.get('type')}): {it.get('url')[:120]}")
    except Exception as e:
        print("ERR:", e)
