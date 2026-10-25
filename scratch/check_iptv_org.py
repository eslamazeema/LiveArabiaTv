import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/eg.m3u",
    "https://iptv-org.github.io/iptv/countries/eg.m3u",
    "https://iptv-org.github.io/iptv/categories/sports.m3u"
]

for u in urls:
    try:
        print("Checking", u)
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            content = r.read().decode('utf-8', errors='ignore')
            lines = content.splitlines()
            for i, line in enumerate(lines):
                if any(w in line.lower() for w in ['on time', 'ontime', 'on sport', 'onsport']):
                    print(line)
                    if i + 1 < len(lines):
                        print("  Stream:", lines[i+1])
    except Exception as e:
        print("Error on", u, e)
