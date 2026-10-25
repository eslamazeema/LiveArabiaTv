import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('scratch/maspero_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
for s in scripts:
    print("Found script:", s)
    if 'app' in s or 'main' in s or 'stream' in s or 'chunk' in s or 'live' in s:
        try:
            full_url = s if s.startswith('http') else 'https://www.maspero.eg' + s
            req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
                code = r.read().decode('utf-8', errors='ignore')
                urls = re.findall(r'https?://[a-zA-Z0-9_\-\./:\?=&%]+(?:\.m3u8|\.mp3|stream|live)[a-zA-Z0-9_\-\./:\?=&%]*', code)
                if urls:
                    print(f"Streams in {s}:", urls)
        except Exception as e:
            print(f"Error reading {s}:", e)
