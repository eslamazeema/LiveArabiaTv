import re, json, datetime

today = datetime.date.today().isoformat()

def generate_seo_slug(name):
    if not name:
        return ''
    s = name.strip().lower()
    s = re.sub(r'[^\w\u0621-\u064A\u0660-\u0669\- ]+', '', s)
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

with open('channels_data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract DEFAULT_CHANNELS
channels = []
match_ch = re.search(r'const DEFAULT_CHANNELS = (\[.*?\]);', text, re.DOTALL)
if match_ch:
    try:
        channels = json.loads(match_ch.group(1))
    except Exception as e:
        pass

radios = []
match_rad = re.search(r'const DEFAULT_RADIOS = (\[.*?\]);', text, re.DOTALL)
if match_rad:
    try:
        radios = json.loads(match_rad.group(1))
    except Exception as e:
        pass

xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://arabialivetv.com/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
'''

for ch in channels:
    cid = ch.get('id', '')
    cname = ch.get('name', '')
    slug = generate_seo_slug(cname)
    desc = ch.get('description', '') or f"مشاهدة بث مباشر لقناة {cname} بجودة عالية وبدون تقطيع"
    logo = ch.get('logo', '') or 'https://arabialivetv.com/favicon.ico'
    url = f"https://arabialivetv.com/channel/{slug}-{cid}"
    
    xml += f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <video:video>
      <video:thumbnail_loc>{logo}</video:thumbnail_loc>
      <video:title>{cname} بث مباشر</video:title>
      <video:description>{desc}</video:description>
      <video:live>yes</video:live>
    </video:video>
  </url>
'''

for r in radios:
    rid = r.get('id', '')
    rname = r.get('name', '')
    slug = generate_seo_slug(rname)
    url = f"https://arabialivetv.com/?radio={rid}&amp;title={slug}"
    xml += f'''  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
'''

xml += '</urlset>\n'

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(xml)

print(f"Generated sitemap.xml with {len(channels)} channels and {len(radios)} radios.")
