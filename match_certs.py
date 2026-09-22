import os
import json

certs_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs"
img_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images"

def norm(name):
    return name.replace('&', '_').replace('-', '_').replace(' ', '_').lower()

pdfs = {}
for f in os.listdir(certs_dir):
    if f.endswith('.pdf'):
        base = os.path.splitext(f)[0]
        pdfs[norm(base)] = f

imgs = {}
for f in os.listdir(img_dir):
    if f.endswith(('.png', '.jpg', '.jpeg')):
        base = os.path.splitext(f)[0]
        imgs[norm(base)] = f

all_norms = sorted(set(list(pdfs.keys()) + list(imgs.keys())))

matched = []
for n in all_norms:
    pdf_file = pdfs.get(n)
    img_file = imgs.get(n)
    matched.append({
        'norm_key': n,
        'pdf': pdf_file,
        'img': img_file
    })

print(f"Total matched unique certificates: {len(matched)}")
for m in matched:
    print(f"{m['norm_key']:50s} | PDF: {str(m['pdf']):45s} | IMG: {str(m['img'])}")
