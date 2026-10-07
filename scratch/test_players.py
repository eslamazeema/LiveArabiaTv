import urllib.request

players = [
    'embed.php', 'embed_tv.php', 'radiant.php', 'cloudflare.php', 'plyr.php', 'shaka-player.php'
]

for p in players:
    url = f'https://www.elahmad.ru/tv/{p}?id=natgeo_1'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.elahmad.ru/tv/'})
        with urllib.request.urlopen(req, timeout=5) as r:
            body = r.read().decode('utf-8', errors='ignore')
            has_ads = 'vidoomy' in body
            print(f"{p}: status={r.status}, length={len(body)}, has_ads={has_ads}")
    except Exception as e:
        print(f"{p}: {e}")
