import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    "https://www.elahmad.ru/tv/ontvegypt.php",
    "https://www.elahmad.ru/tv/onsport.php",
    "https://www.elahmad.ru/tv/on-sport.php",
    "https://www.elahmad.ru/tv/on_sport.php",
    "https://www.elahmad.ru/tv/ontime.php",
    "https://www.elahmad.ru/tv/ontimesport.php",
    "https://www.elahmad.ru/tv/ontimesports.php",
    "https://www.elahmad.ru/tv/ontime-sport.php",
    "https://www.elahmad.ru/tv/ontime_sport.php",
    "https://www.elahmad.ru/tv/on-time-sports.php",
    "https://www.elahmad.ru/tv/on-time-sport.php",
    "https://www.elahmad.ru/tv/ontimesport1.php",
    "https://www.elahmad.ru/tv/on-time-sport-1.php",
    "https://www.elahmad.ru/tv/on_time_sports.php"
]

headers = {"User-Agent": "Mozilla/5.0"}
for url in candidates:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=5) as r:
            body = r.read().decode('utf-8', errors='ignore')
            if 'iframe' in body.lower() or 'player' in body.lower() or 'm3u8' in body.lower():
                print("FOUND WORKING:", url, "Length:", len(body))
                # look for title or h1
                import re
                t = re.search(r'<title>(.*?)</title>', body, re.IGNORECASE)
                if t:
                    print("  Title:", t.group(1))
    except Exception as e:
        pass
