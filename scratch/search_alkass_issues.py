import urllib.request
import json
import re

url = 'https://api.github.com/search/issues?q=repo:iptv-org/iptv+Alkass&sort=updated'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
    items = data.get('items', [])
    for it in items[:10]:
        title = it.get('title', '')
        body = it.get('body') or ''
        m3u8s = re.findall(r'https?://[^\s\"\'<>]+\.m3u8[^\s\"\'<>]*', body)
        if m3u8s:
            print(f"[{title}]")
            for m in m3u8s:
                print('  ', m)
except Exception as e:
    print('Error:', e)
