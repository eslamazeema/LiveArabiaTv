import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.urlopen('https://arabialivetv.com/api/channels', context=ctx, timeout=15)
channels = json.loads(req.read().decode())['data']
print(f"Total channels fetched from live server: {len(channels)}")

# Print some channel names
for i, ch in enumerate(channels):
    print(f"{i+1:2d}. [{ch.get('category')}] {ch.get('name')} (ID: {ch.get('id')})")
