import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://egyptradio.net/'
}

url = 'https://api.instant.audio/data/streams/126/al-aghani'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
        data = r.read().decode('utf-8')
        print("API RESULT:")
        print(data)
        parsed = json.loads(data)
        with open('scratch/aghani_streams_result.json', 'w', encoding='utf-8') as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
except Exception as e:
    print("Error:", e)
