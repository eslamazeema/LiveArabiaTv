import urllib.request
import re
import json

test_urls = [
    # National Geographic official / proxy streams
    "https://adtv.ae",
    "https://adtv.ae/live",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/ae.m3u",
    "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_arabic.m3u8",
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as r:
            content = r.read().decode('utf-8', errors='ignore')
            # Look for nat geo
            matches = [line for line in content.splitlines() if any(k in line.lower() for k in ['natgeo', 'national geographic', 'ناشيونال'])]
            print(f"[{url}] matches: {len(matches)}")
            for m in matches[:5]:
                print("  ", m)
    except Exception as e:
        print(f"[{url}] error: {e}")
