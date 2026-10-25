import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

login_payload = json.dumps({"username": "admin", "password": "admin"}).encode('utf-8')
req = urllib.request.Request("https://arabialivetv.com/api/auth/login", data=login_payload, headers={
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
})
with urllib.request.urlopen(req, context=ctx) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

ch_req = urllib.request.Request("https://arabialivetv.com/api/channels", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(ch_req, context=ctx) as resp:
    ch_list = json.loads(resp.read().decode('utf-8')).get('data', [])
    nile_ch = next((c for c in ch_list if 'النيل للدراما' in c.get('name', '')), None)

if nile_ch:
    cid = nile_ch['id']
    update_data = {
        **nile_ch,
        "streamUrl": "https://www.elahmad.ru/tv/ntnegypt.php?id=drama",
        "fallbackUrl": "https://www.elahmad.ru/tv/ntnegypt.php?id=drama",
        "type": "iframe"
    }
    put_req = urllib.request.Request(f"https://arabialivetv.com/api/channels/{cid}", data=json.dumps(update_data).encode('utf-8'), headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    }, method="PUT")
    with urllib.request.urlopen(put_req, context=ctx) as resp:
        print("Update Response:", json.loads(resp.read().decode('utf-8')))
