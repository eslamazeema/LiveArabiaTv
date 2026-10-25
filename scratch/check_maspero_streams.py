import urllib.request
import re
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.maspero.eg/stream/19'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

streams = re.findall(r'<a[^>]+href=["\']([^"\']*stream/\d+)["\'][^>]*>([\s\S]*?)</a>', html)
for href, name in set(streams):
    clean = re.sub(r'<[^>]+>', '', name).strip()
    if clean:
        print(href, "->", clean)
