import re, json, sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('channels_data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# find channels
pattern = re.compile(r'\{[^{}]*?"name":\s*"[^"]*?bein[^"]*?"[^{}]*?\}', re.IGNORECASE)
for m in pattern.finditer(text):
    print(m.group(0))
    print("="*40)
