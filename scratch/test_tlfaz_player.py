import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://player.tlfaz.com/embed/nile-drama'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    resp = urllib.request.urlopen(req, context=ctx, timeout=8)
    print("STATUS:", resp.status)
    html = resp.read().decode('utf-8', errors='ignore')
    print("Length:", len(html))
    print("M3U8:", re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html))
    print("Iframes:", re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html))
    print("Videos:", re.findall(r'<video[^>]+src=["\']([^"\']+)["\']', html))
    print("Dailymotion:", re.findall(r'dailymotion\.com[^"\'\s<>]+', html))
    print("Youtube:", re.findall(r'youtube\.com[^"\'\s<>]+', html))
    for m in re.finditer(r'(?:file|source|src)\s*:\s*["\']([^"\']+)["\']', html):
        print("Source:", m.group(1))
except Exception as e:
    print("ERR:", e)
