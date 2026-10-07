import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('channels_data.js', 'r', encoding='utf-8') as f:
    txt = f.read()

entries = txt.split('{')
embeds = []
for e in entries:
    if 'id:' in e and 'streamUrl:' in e:
        id_m = re.search(r"id:\s*['\"]([^'\"]+)['\"]", e)
        name_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", e)
        type_m = re.search(r"type:\s*['\"]([^'\"]+)['\"]", e)
        url_m = re.search(r"streamUrl:\s*['\"]([^'\"]+)['\"]", e)
        
        if id_m and url_m:
            cid = id_m.group(1)
            cname = name_m.group(1) if name_m else ''
            ctype = type_m.group(1) if type_m else ''
            curl = url_m.group(1)
            if ctype != 'hls' or 'embed' in curl or not curl.endswith('.m3u8'):
                embeds.append((cid, cname, ctype, curl))

print(f"Total non-pure .m3u8 channels: {len(embeds)}")
for cid, cname, ctype, curl in embeds:
    print(f"- {cid} | {cname} | type={ctype} | {curl}")
