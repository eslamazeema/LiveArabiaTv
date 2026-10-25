import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Login
login_payload = json.dumps({"username": "admin", "password": "admin"}).encode('utf-8')
req = urllib.request.Request("https://arabialivetv.com/api/auth/login", data=login_payload, headers={
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
})

try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        token = res.get('token')
        print("Logged in successfully! Token received.")
except Exception as e:
    print("Login error:", e)
    sys.exit(1)

# 2. Delete Channel ch-1792321042385
del_req = urllib.request.Request("https://arabialivetv.com/api/channels/ch-1792321042385", headers={
    "Authorization": f"Bearer {token}",
    "User-Agent": "Mozilla/5.0"
}, method="DELETE")

try:
    with urllib.request.urlopen(del_req, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Delete response:", res)
except Exception as e:
    print("Delete error:", e)

# 3. Verify channels list after deletion
verify_req = urllib.request.Request("https://arabialivetv.com/api/channels", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(verify_req, context=ctx) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    ch_list = data.get('data', [])
    print(f"Total channels remaining in production: {len(ch_list)}")
    found = [ch for ch in ch_list if ch.get('id') == 'ch-1792321042385' or 'النيل للدراما' in ch.get('name', '')]
    if not found:
        print("✅ SUCCESS: قناة النيل للدراما has been completely removed from production!")
    else:
        print("⚠️ Channel still found:", found)
