import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://www.maspero.eg/stream/19', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

# Search for /stream/19 or the active stream logo
idx = html.find('/stream/19')
if idx != -1:
    snippet = html[max(0, idx-500):min(len(html), idx+500)]
    print("Found /stream/19 snippet:")
    imgs = re.findall(r'src=["\']([^"\']+)["\']', snippet)
    print("Imgs near /stream/19:", imgs)

# Also check wikimedia
req2 = urllib.request.Request('https://commons.wikimedia.org/wiki/File:Nile_Drama.png', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html2 = urllib.request.urlopen(req2, timeout=5).read().decode('utf-8', errors='ignore')
    wiki_imgs = re.findall(r'https://upload\.wikimedia\.org/wikipedia/commons/[^"\'\s<>]+', html2)
    print("Wiki imgs:", wiki_imgs[:2])
except Exception as e:
    print("Wiki err:", e)
