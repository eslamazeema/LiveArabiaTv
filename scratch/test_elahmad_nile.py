import urllib.request
import re
import json
import base64
from Crypto.Cipher import AES
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_elahmad_channel(channel_id):
    try:
        url = f"https://www.elahmad.ru/tv/radiant.php?id={channel_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            cookies = resp.headers.get('set-cookie', '')

        csrf_match = re.search(r'name="csrf-token" content="([^"]+)"', html)
        if not csrf_match:
            return None, "No CSRF"
        csrf = csrf_match.group(1)

        post_body = f"id={channel_id}&csrf_token={csrf}".encode('utf-8')
        post_req = urllib.request.Request('https://www.elahmad.ru/tv/result/embed_result_elahmad_82.php', data=post_body, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': f'https://www.elahmad.ru/tv/radiant.php?id={channel_id}',
            'Origin': 'https://www.elahmad.ru',
            'Content-Type': 'application/x-www-form-urlencoded'
        })
        if cookies:
            post_req.add_header('Cookie', cookies.split(';')[0])

        with urllib.request.urlopen(post_req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            
        link_4 = base64.b64decode(data['link_4'])
        key = bytes.fromhex(data['key'])
        iv = bytes.fromhex(data['iv'])
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(link_4)
        pad = decrypted[-1]
        decrypted = decrypted[:-pad].decode('utf-8')
        return decrypted, "OK"
    except Exception as e:
        return None, str(e)

# Search elahmad egyptian channels page
req = urllib.request.Request("https://www.elahmad.ru/tv/egypt-tv.php", headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    links = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', html)
    print("Found Egyptian TV links on Elahmad:")
    for href, text in links:
        clean_text = re.sub(r'<[^>]+>', '', text).strip()
        if 'نيل' in clean_text or 'دراما' in clean_text or 'nile' in href.lower() or 'drama' in href.lower():
            print(" -", href, "|", clean_text)
except Exception as e:
    print("Error fetching egypt-tv.php:", e)
