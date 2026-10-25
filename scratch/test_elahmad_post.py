import urllib.request
import urllib.parse
import json
import base64
import re

url = 'https://www.elahmad.ru/tv/arabic-tv-online.php?id=niledrama'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', errors='ignore')

# Extract da_ta
match = re.search(r'var da_ta = (\{[\s\S]*?\});', html)
if not match:
    print("da_ta not found")
    exit(1)

da_ta_str = match.group(1)
# Clean up trailing comma
da_ta_str = re.sub(r',\s*\}', '}', da_ta_str)
da_ta = json.loads(da_ta_str)
print("da_ta extracted:", da_ta)

post_data = urllib.parse.urlencode(da_ta).encode('utf-8')
post_req = urllib.request.Request(url, data=post_data, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': url,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
})

resp = urllib.request.urlopen(post_req, timeout=5)
resp_json = json.loads(resp.read().decode('utf-8'))
print("Response JSON:", resp_json)
