import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Test various potential elahmad channels for Nile Drama
elahmad_ids = ['niledrama', 'nile_drama', 'drama_nile', 'ntnegypt', 'nile-drama', 'egypt_drama', 'nile']
for eid in elahmad_ids:
    url = f"https://www.elahmad.ru/tv/radiant.php?id={eid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        html = res.read().decode('utf-8', errors='ignore')
        if 'csrf-token' in html:
            print(f"Elahmad found valid player for: {eid}")
    except Exception as e:
        pass

# Also search elahmad channels list
try:
    req = urllib.request.Request("https://www.elahmad.ru/tv/mobile.php", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
    matches = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([^<]*دراما[^<]*)</a>', html, re.I)
    print("\nElahmad Drama channels:")
    for m in matches:
        print(" ", m)
except Exception as e:
    print("Elahmad list error:", e)
