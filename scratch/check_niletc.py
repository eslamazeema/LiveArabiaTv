import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'http://www.niletc.tv'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print("STATUS:", resp.status, "Length:", len(html))
        matches = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', html)
        for h, t in matches:
            clean = re.sub(r'<[^>]+>', '', t).strip()
            if any(k in clean.lower() or k in h.lower() for k in ['دراما', 'drama', 'stream', 'live']):
                print("Match:", h, "->", clean)
except Exception as e:
    print("ERR:", e)
