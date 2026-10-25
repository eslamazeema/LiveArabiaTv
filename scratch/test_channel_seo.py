import urllib.request, ssl, re, urllib.parse, sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl._create_unverified_context()
url = 'https://arabialivetv.com/channel/' + urllib.parse.quote('قناة-النيل-للدراما-ch-1792322157387')
req = urllib.request.Request(url, headers={'User-Agent': 'Googlebot/2.1'})
r = urllib.request.urlopen(req, context=ctx)
html = r.read().decode('utf-8')

title = re.search(r'<title>(.*?)</title>', html)
desc = re.search(r'<meta name="description" content="(.*?)"', html)
canon = re.search(r'<link rel="canonical" href="(.*?)"', html)
og_title = re.search(r'<meta property="og:title" content="(.*?)"', html)
og_image = re.search(r'<meta property="og:image" content="(.*?)"', html)

print('Status:', r.status)
print('Title:', title.group(1) if title else 'None')
print('Description:', desc.group(1) if desc else 'None')
print('Canonical:', canon.group(1) if canon else 'None')
print('OG Title:', og_title.group(1) if og_title else 'None')
print('OG Image:', og_image.group(1) if og_image else 'None')
print('Has BroadcastEvent:', 'BroadcastEvent' in html)
