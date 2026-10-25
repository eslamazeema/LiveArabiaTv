const Database = require('better-sqlite3');
const path = require('path');
const cp = require('child_process');

const dbPath = path.join(__dirname, '..', 'altv_database.db');
const db = new Database(dbPath);

const content = cp.execSync('git show 5b9b002:database.js', { encoding: 'utf-8' });
const match = content.match(/const DEFAULT_CHANNELS = \[([\s\S]*?)\];/);
const defaultChannels = eval('[' + match[1] + ']');

console.log('Restoring', defaultChannels.length, 'channels to altv_database.db...');

const updateStmt = db.prepare(`
  UPDATE channels SET
    name = @name, category = @category, country = @country, quality = @quality,
    logo = @logo, type = @type, stream_url = @streamUrl, fallback_url = @fallbackUrl,
    description = @description, is_featured = @isFeatured, viewers_count = @viewersCount,
    sort_order = @sortOrder, is_default = CASE WHEN @id = 'ch-aljazeera-news' THEN 1 ELSE 0 END
  WHERE id = @id
`);

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO channels (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order, is_default)
  VALUES (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder, CASE WHEN @id = 'ch-aljazeera-news' THEN 1 ELSE 0 END)
`);

const trx = db.transaction((channels) => {
  for (const ch of channels) {
    const params = {
      id: ch.id,
      name: ch.name,
      category: ch.category,
      country: ch.country,
      quality: ch.quality,
      logo: ch.logo,
      type: ch.type || 'hls',
      streamUrl: ch.streamUrl || '',
      fallbackUrl: ch.fallbackUrl || ch.streamUrl || '',
      description: ch.description || '',
      isFeatured: ch.isFeatured ? 1 : 0,
      viewersCount: ch.viewersCount || 10000,
      sortOrder: ch.sortOrder
    };
    const info = updateStmt.run(params);
    if (info.changes === 0) {
      insertStmt.run(params);
    }
  }
});

trx(defaultChannels);
console.log('Restoration complete!');
