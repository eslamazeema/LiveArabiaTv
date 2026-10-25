import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://www.elahmad.ru/tv/egypt.php", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    html = r.read().decode('windows-1256', errors='ignore')

links = re.findall(r'href="([^"]*\.php[^"]*)"[^>]*>([^<]+)</a>', html)
for href, name in links:
    if any(w in name for w in ['سبورت', 'رياض', 'اون', 'أون', 'تايم', 'time', 'sport', 'on']):
        print(f"{name.strip()} -> {href}")
