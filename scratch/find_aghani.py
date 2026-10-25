import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://de1.api.radio-browser.info/json/stations/byname/aghani',
    'https://de1.api.radio-browser.info/json/stations/byname/%D8%A7%D9%84%D8%A3%D8%BA%D8%A7%D9%86%D9%8A',
    'https://de1.api.radio-browser.info/json/stations/byname/105.8',
    'https://de1.api.radio-browser.info/json/stations/bycountry/Egypt'
]

seen = set()
for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as res:
            stations = json.loads(res.read().decode('utf-8'))
            for s in stations:
                name = s.get('name', '')
                url = s.get('url_resolved') or s.get('url', '')
                if url in seen:
                    continue
                seen.add(url)
                if any(w in name.lower() for w in ['aghani', 'أغاني', 'اغاني', '105.8', 'maspero', 'ertu', 'tarab', 'طرب']):
                    print(f"STATION: {name} | URL: {url} | LOGO: {s.get('favicon')}")
    except Exception as e:
        print(f"Error {u}: {e}")
