import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0'}

req = urllib.request.Request('https://egyptradio.net/play/al-aghani', headers=headers)
with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
    data = r.read().decode('utf-8', errors='ignore')
    with open('scratch/play_aghani.json', 'w', encoding='utf-8') as f:
        f.write(data)
    print("SUCCESS! File saved to scratch/play_aghani.json")
