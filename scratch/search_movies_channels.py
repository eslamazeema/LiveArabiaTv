import urllib.request
import re
import concurrent.futures

print("Fetching Arabic & Movies playlists from iptv-org...")

sources = [
    "https://iptv-org.github.io/iptv/categories/movies.m3u",
    "https://iptv-org.github.io/iptv/languages/ara.m3u",
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

# Filter for movie/cinema/film/aflam/rotana/mbc keywords or group-title="Movies"
movie_keywords = [
    "cinema", "movies", "movie", "film", "aflam", "افلام", "أفلام", "سينما",
    "rotana", "روتانا", "mbc2", "mbc 2", "mbc max", "mbc action", "zee aflam",
    "زي افلام", "زي أفلام", "classic", "كلاسيك", "drama", "دراما", "comedy", "كوميدي"
]

candidate_streams = []
seen_urls = set()

for info, url in all_entries:
    if url in seen_urls:
        continue
    info_lower = info.lower()
    # Check if Arabic or movie related
    if any(k in info_lower for k in movie_keywords) or 'group-title="movies"' in info_lower:
        # Extract title from comma
        title = info.split(",")[-1].strip() if "," in info else info
        candidate_streams.append({'title': title, 'info': info, 'url': url})
        seen_urls.add(url)

print(f"Found {len(candidate_streams)} candidate movie streams. Testing live status...")

def test_stream(stream):
    url = stream['url']
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as r:
            if r.status == 200:
                first_bytes = r.read(150).decode('utf-8', errors='ignore')
                if "#EXTM3U" in first_bytes or len(first_bytes) > 20:
                    return {'success': True, 'title': stream['title'], 'url': url}
    except Exception:
        pass
    return {'success': False, 'title': stream['title'], 'url': url}

working_streams = []
with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
    futures = [executor.submit(test_stream, s) for s in candidate_streams]
    for f in concurrent.futures.as_completed(futures):
        res = f.result()
        if res['success']:
            working_streams.append(res)
            print(f"[WORKING] {res['title']} -> {res['url']}")

print(f"\n==========================================")
print(f"TOTAL WORKING ARABIC MOVIE CHANNELS: {len(working_streams)}")
for s in working_streams:
    print(f"- {s['title']}: {s['url']}")
