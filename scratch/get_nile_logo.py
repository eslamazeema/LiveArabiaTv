import urllib.request
import re
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://www.maspero.eg/stream/19', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

# og:image or twitter:image
og_img = re.findall(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html)
print("og:image:", og_img)

dm_thumb = re.findall(r'thumbnailUrl["\']\s+content=["\']([^"\']+)["\']', html)
print("dm_thumb:", dm_thumb)

# all images
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
for i in imgs:
    if any(k in i.lower() for k in ['drama', 'nile', 'stream', 'logo']):
        print("img:", i)
