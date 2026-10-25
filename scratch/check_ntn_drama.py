import urllib.request
import re

url = 'https://www.elahmad.ru/tv/ntnegypt.php?id=drama'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print("Page fetched! Length:", len(html))
        iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
        print("IFRAMES:", iframes)
        streams = re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html)
        print("STREAMS:", streams)
        radiant = re.findall(r'radiant[^"\'\s<>]+', html)
        print("RADIANT:", radiant)
except Exception as e:
    print("ERR:", e)
