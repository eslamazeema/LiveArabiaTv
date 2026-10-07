import urllib.request
import re
import json

# Target Arabic countries and Arabic streams
arabic_sources = [
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/eg.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/sa.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/ae.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/lb.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/sy.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/iq.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/kw.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/ma.m3u",
    "https://iptv-org.github.io/iptv/languages/ara.m3u"
]

all_channels = []

for src in arabic_sources:
    try:
        req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as r:
            lines = r.read().decode('utf-8', errors='ignore').splitlines()
            current_info = None
            for line in lines:
                line = line.strip()
                if line.startswith("#EXTINF:"):
                    current_info = line
                elif line.startswith("http") and current_info:
                    all_channels.append((current_info, line))
                    current_info = None
    except Exception as e:
        print(f"Error {src}: {e}")

# Keywords for Arabic movies, cinema, drama, series
keywords = [
    "cinema", "سينما", "aflam", "أفلام", "افلام", "film", "movies", "movie",
    "rotana", "روتانا", "mbc", "drama", "دراما", "zaman", "زمان", "classic", "كلاسيك",
    "zee", "زي", "nile", "نايل", "al kahera", "القاهرة", "art"
]

selected = []
seen = set()

for info, url in all_channels:
    if url in seen:
        continue
    info_low = info.lower()
    if any(k in info_low for k in keywords):
        name = info.split(",")[-1].strip() if "," in info else info
        selected.append((name, url, info))
        seen.add(url)

print(f"Found {len(selected)} Arabic movie/drama candidates. Testing live...")

results = []

def test_url(item):
    name, url, info = item
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                header = resp.read(200).decode('utf-8', errors='ignore')
                if "#EXTM3U" in header or len(header) > 30:
                    return (True, name, url, info)
    except Exception:
        pass
    return (False, name, url, info)

import concurrent.futures
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    for ok, name, url, info in ex.map(test_url, selected):
        if ok:
            print(f"✅ {name} -> {url}")
            results.append((name, url, info))

with open("scratch/working_arabic_movies.json", "w", encoding="utf-8") as f:
    json.dump([{"name": n, "url": u, "info": i} for n, u, i in results], f, ensure_ascii=False, indent=2)

print(f"\nDone! Saved {len(results)} working channels.")
