import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://3arabi.tv/nile-drama/',
    'https://3arabi.tv/channel/nile-drama/',
    'https://tlfaz.com/nile-drama/',
    'https://tlfaz.com/nile-drama-live/'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print(f"\n{u} -> HTTP {resp.status}, length: {len(html)}")
            iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
            print("  IFRAMES:", iframes)
            m3u8 = re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html)
            print("  M3U8:", m3u8)
            videos = re.findall(r'<video[^>]+src=["\']([^"\']+)["\']', html)
            print("  VIDEOS:", videos)
    except Exception as e:
        print(f"\n{u} -> ERR: {e}")
