import urllib.request
import re

for url in [
    'https://www.elahmad.ru/tv/arabic-tv-online.php?id=niledrama',
    'https://www.elahmad.ru/tv/radiant.php?id=nile_drama'
]:
    print(f"\n--- Checking: {url} ---")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print("Length:", len(html))
            iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
            print("IFRAMES:", iframes)
            streams = re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html)
            print("STREAMS:", streams)
            dailymotion = re.findall(r'dailymotion\.com[^"\'\s<>]+', html)
            print("DAILYMOTION:", dailymotion)
            youtube = re.findall(r'youtube\.com[^"\'\s<>]+', html)
            print("YOUTUBE:", youtube)
            players = re.findall(r'https?://[^"\'\s<>]+player[^"\'\s<>]*', html)
            print("PLAYERS:", players)
    except Exception as e:
        print("ERR:", e)
