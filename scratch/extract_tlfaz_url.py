import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://tlfaz.com/Tv-Channel/nile-drama/?embed_media_shr=1'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

idx = html.find('video_url')
if idx != -1:
    snippet = html[idx:idx+400]
    print("Found video_url snippet:")
    print(snippet)
