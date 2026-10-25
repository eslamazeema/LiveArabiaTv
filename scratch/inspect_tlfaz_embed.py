import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://tlfaz.com/Tv-Channel/nile-drama/?embed_media_shr=1'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

print("Length:", len(html))
print("Iframes:", re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html))
print("M3U8:", re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html))
print("Videos:", re.findall(r'<video[^>]+src=["\']([^"\']+)["\']', html))

# Look for player setup
jw = re.findall(r'jwplayer\([^)]*\)\.setup\(([\s\S]*?)\);', html)
print(f"JWPlayer setups found: {len(jw)}")
for j in jw:
    print("JW:", j[:300])

# Look for Clappr or VideoJS or Player
for m in re.finditer(r'(?:file|source|src)\s*:\s*["\']([^"\']+)["\']', html):
    print("Source:", m.group(1))
