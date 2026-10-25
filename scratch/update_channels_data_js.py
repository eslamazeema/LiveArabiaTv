import json
import os
import re

repo_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv"

with open(os.path.join(repo_dir, "channels_backup.json"), "r", encoding="utf-8") as f:
    channels = json.load(f)

# Read full_site_backup_v2.5.json for news, matches, radios
with open(os.path.join(repo_dir, "full_site_backup_v2.5.json"), "r", encoding="utf-8") as f:
    full_data = json.load(f)

radios = full_data.get("radios", [])
matches = full_data.get("matches", [])
news = full_data.get("news", [])

# Generate channels_data.js content
header = """/**
 * بث مباشر للقنوات الفضائية (arabialivetv.com) - Official Channel Data Store
 * Version: 2.5 (58 Live Arabic Channels & Radios Snapshot)
 */

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fa-globe' },
  { id: 'movies', name: 'أفلام وسينما', icon: 'fa-film' },
  { id: 'sports', name: 'الرياضة والمباريات', icon: 'fa-futbol' },
  { id: 'news', name: 'الأخبار العالمية', icon: 'fa-newspaper' },
  { id: 'islamic', name: 'قرآن وإسلاميات', icon: 'fa-kaaba' },
  { id: 'drama', name: 'دراما وترفيه', icon: 'fa-tv' },
  { id: 'docu', name: 'وثائقية', icon: 'fa-compass' },
  { id: 'kids', name: 'أطفال', icon: 'fa-child' }
];

const DEFAULT_CHANNELS = """ + json.dumps(channels, ensure_ascii=False, indent=2) + """;

const DEFAULT_SPORTS_NEWS = """ + json.dumps(news, ensure_ascii=False, indent=2) + """;

const DEFAULT_MATCHES = """ + json.dumps(matches, ensure_ascii=False, indent=2) + """;

const DEFAULT_RADIOS = """ + json.dumps(radios, ensure_ascii=False, indent=2) + """;

const DEFAULT_HIGHLIGHTS = [
  {
    id: 'high-1',
    title: 'ملخص وأهداف مباراة الأهلي وسيمبا التنزاني في دوري الأبطال',
    duration: '08:45',
    category: 'كرة إفريقية',
    views: '142K',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://shoof.alkass.net/live/ch1.m3u8'
  },
  {
    id: 'high-2',
    title: 'تغطية خاصة: ملخص أهداف قمة ريال مدريد ومانشستر سيتي',
    duration: '12:10',
    category: 'رياضة عالمية',
    views: '210K',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8'
  }
];
"""

with open(os.path.join(repo_dir, "channels_data.js"), "w", encoding="utf-8") as f:
    f.write(header)
print("Updated channels_data.js with version 2.5 and all 58 channels!")

# Also update DEFAULT_CHANNELS in database.js
db_path = os.path.join(repo_dir, "database.js")
with open(db_path, "r", encoding="utf-8") as f:
    db_content = f.read()

# Replace DEFAULT_CHANNELS = [ ... ];
channels_js = "const DEFAULT_CHANNELS = " + json.dumps(channels, ensure_ascii=False, indent=2) + ";\n\nconst DEFAULT_RADIOS ="
db_content = re.sub(r"const DEFAULT_CHANNELS = \[[\s\S]*?\];\s*const DEFAULT_RADIOS =", channels_js, db_content)

with open(db_path, "w", encoding="utf-8") as f:
    f.write(db_content)
print("Updated database.js with all 58 channels in DEFAULT_CHANNELS!")
