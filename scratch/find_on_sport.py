import sys, re, json
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('channels_data.js', 'r', encoding='utf-8') as f:
    text = f.read()

channels = re.findall(r'\{[^{}]*?"name":\s*"([^"]+)"[^{}]*?\}', text, re.DOTALL)
for ch in channels:
    if any(k in ch.lower() for k in ['on', 'سبورت', 'sport', 'تايم']):
        print(ch)
