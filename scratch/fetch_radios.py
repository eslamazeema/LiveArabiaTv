import urllib.request
import json

stations_to_query = [
    "https://de1.api.radio-browser.info/json/stations/bycountry/Egypt",
    "https://de1.api.radio-browser.info/json/stations/bycountry/Saudi%20Arabia",
    "https://de1.api.radio-browser.info/json/stations/bycountry/Morocco"
]

results = []
for endpoint in stations_to_query:
    try:
        req = urllib.request.Request(endpoint, headers={'User-Agent': 'RadioSearchApp/1.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            # sort by clickcount / votes
            data.sort(key=lambda x: x.get('votes', 0), reverse=True)
            for item in data[:8]:
                results.append({
                    "name": item.get("name"),
                    "country": item.get("country"),
                    "url": item.get("url_resolved"),
                    "codec": item.get("codec"),
                    "bitrate": item.get("bitrate")
                })
    except Exception as e:
        print(f"Error {endpoint}: {e}")

with open("scratch/radios.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved to scratch/radios.json")
