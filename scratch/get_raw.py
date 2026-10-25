import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://egyptradio.net/play/al-aghani',
    headers={'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        raw = r.read()
        with open('scratch/aghani_stream.json', 'wb') as f:
            f.write(raw)
        print("WROTE", len(raw), "bytes to scratch/aghani_stream.json")
except Exception as e:
    print("FAILED:", e)
