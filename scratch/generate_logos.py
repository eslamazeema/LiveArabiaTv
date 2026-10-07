import os

os.makedirs('assets/logos', exist_ok=True)

logos = {
    'rotana-cinema-egy.svg': ('#C62828', '#8E0000', 'روتانا سينما مصر', 'ROTANA CINEMA EGYPT', '🎬'),
    'rotana-cinema-ksa.svg': ('#D32F2F', '#7F0000', 'روتانا سينما', 'ROTANA CINEMA', '🍿'),
    'rotana-classic.svg': ('#C5A059', '#6D4C13', 'روتانا كلاسيك', 'ROTANA CLASSIC', '🎞️'),
    'rotana-comedy.svg': ('#F57C00', '#B23C00', 'روتانا كوميدي', 'ROTANA COMEDY', '🎭'),
    'rotana-drama.svg': ('#7B1FA2', '#4A0072', 'روتانا دراما', 'ROTANA DRAMA', '📺'),
    'aflam-fast.svg': ('#B71C1C', '#5F0909', 'أفلام عربية', 'ARABIC MOVIES HD', '🎬'),
    'movies-action.svg': ('#E64A19', '#931500', 'أفلام أكشن', 'ACTION MOVIES HD', '🔥'),
    'movies-thriller.svg': ('#37474F', '#102027', 'تشويق وإثارة', 'THRILLER MOVIES HD', '⚡'),
    'thikrayat.svg': ('#5D4037', '#271810', 'قناة ذكريات', 'THIKRAYAT TV', '📽️')
}

for filename, (c1, c2, ar, en, icon) in logos.items():
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="grad_{filename[:5]}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="60" fill="url(#grad_{filename[:5]})"/>
  <circle cx="200" cy="140" r="75" fill="rgba(255,255,255,0.15)"/>
  <text x="200" y="160" font-family="'Segoe UI', Tahoma, sans-serif" font-size="52" text-anchor="middle">{icon}</text>
  <text x="200" y="270" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">{ar}</text>
  <text x="200" y="315" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="16" font-weight="700" fill="rgba(255,255,255,0.8)" letter-spacing="2" text-anchor="middle">{en}</text>
</svg>"""
    with open(os.path.join('assets/logos', filename), 'w', encoding='utf-8') as f:
        f.write(svg)

print(f"Generated {len(logos)} clean SVG logos in assets/logos successfully!")
