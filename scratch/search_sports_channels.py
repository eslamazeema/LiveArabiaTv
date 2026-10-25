import urllib.request
import re
import concurrent.futures
import json

print("Fetching sports category from iptv-org...")

sources = [
    "https://iptv-org.github.io/iptv/categories/sports.m3u",
    "https://iptv-org.github.io/iptv/languages/ara.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/ae.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/qa.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/sa.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/eg.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/kw.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/om.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/bh.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/ma.m3u",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/iq.m3u"
]

all_entries = []

for src in sources:
    try:
        req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            lines = r.read().decode('utf-8', errors='ignore').splitlines()
            current_info = None
            for line in lines:
                line = line.strip()
                if line.startswith("#EXTINF:"):
                    current_info = line
                elif line.startswith("http") and current_info:
                    all_entries.append((current_info, line))
                    current_info = None
    except Exception as e:
        print(f"Error fetching {src}: {e}")

print(f"Total entries fetched: {len(all_entries)}")

sports_keywords = [
    "sport", "sports", "رياضة", "رياضية", "كأس", "كاس", "kass", "alkass",
    "dubai sport", "abu dhabi sport", "ad sport", "sharjah sport", "ksa sport",
    "arryadia", "ontime", "on time", "ahly", "أهلي", "zamalek", "زمالك",
    "bein", "racing", "ريسنج", "yass", "ياس", "bahrain sport", "iraq sport"
]

candidate_streams = []
seen_urls = set()

for info, url in all_entries:
    if url in seen_urls:
        continue
    info_lower = info.lower()
    if any(k in info_lower for k in sports_keywords):
        title = info.split(",")[-1].strip() if "," in info else info
        candidate_streams.append({'title': title, 'info': info, 'url': url})
        seen_urls.add(url)

print(f"Found {len(candidate_streams)} candidate Arabic sports streams. Testing live status...")

def test_stream(stream):
    url = stream['url']
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as r:
            if r.status == 200:
                header = r.read(150).decode('utf-8', errors='ignore')
                if "#EXTM3U" in header or len(header) > 20:
                    return {'success': True, 'title': stream['title'], 'url': url, 'info': stream['info']}
    except Exception:
        pass
    return {'success': False, 'title': stream['title'], 'url': url, 'info': stream['info']}

working_streams = []
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(test_stream, s) for s in candidate_streams]
    for f in concurrent.futures.as_completed(futures):
        res = f.result()
        if res['success']:
            working_streams.append(res)
            # print safe ascii
            clean_title = re.sub(r'[^\x00-\x7F]+', ' ', res['title'])
            print(f"[WORKING] {clean_title} -> {res['url']}")

print(f"\n==========================================")
print(f"TOTAL WORKING ARABIC SPORTS CHANNELS: {len(working_streams)}")

with open("scratch/working_arabic_sports.json", "w", encoding="utf-8") as f:
    json.dump(working_streams, f, ensure_ascii=False, indent=2)
