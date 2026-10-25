import urllib.request
import json

req = urllib.request.Request('https://www.dailymotion.com/player/metadata/video/x8n6e3a', headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.maspero.eg/stream/19',
    'Origin': 'https://www.maspero.eg'
})

with urllib.request.urlopen(req, timeout=5) as resp:
    data = json.loads(resp.read().decode('utf-8'))

with open('scratch/dm_meta.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Saved dm_meta.json! Error field:", data.get('error'))
print("Qualities:", data.get('qualities'))
