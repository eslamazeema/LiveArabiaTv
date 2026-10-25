import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://fomny.com/Video/Arabic/01/Nile-Drama/Nile-Drama.php',
    'https://fomny.com/tv-arabic/Nile-Drama.php'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, context=ctx, timeout=5) as res:
            html = res.read().decode('utf-8', errors='ignore')
            print(u, 'STATUS:', res.status)
            iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
            print('IFRAMES:', iframes)
            m3u8 = re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html)
            print('M3U8:', m3u8)
            dm = re.findall(r'dailymotion\.com[^"\'\s<>]+', html)
            print('DM:', dm)
    except Exception as e:
        print(u, 'ERR:', e)
