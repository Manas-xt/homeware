require('dotenv').config();
const { getPool } = require('../db');

const mapping = [
  { slug: 'aurelia-brass-table-lamp', url: '/images/aurelia-lamp.svg' },
  { slug: 'solene-glass-pendant', url: '/images/solene-pendant.svg' },
  { slug: 'marne-stoneware-vase', url: '/images/marne-vase.svg' },
  { slug: 'fen-ceramic-bowl-set', url: '/images/fen-bowls.svg' },
  { slug: 'aldern-linen-throw', url: '/images/aldern-throw.svg' },
  { slug: 'rivage-dinner-plate-set', url: '/images/rivage-plates.svg' },
];

(async () => {
  try {
    const pool = await getPool();
    for (const m of mapping) {
      console.log('Updating', m.slug);
      await pool.request()
        .input('slug', (await getSql()).NVarChar, m.slug)
        .input('url', (await getSql()).NVarChar, m.url)
        .query('UPDATE Products SET ImageUrl = @url WHERE Slug = @slug');
    }
    console.log('Done updating image URLs to local paths');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update image URLs', err.message || err);
    process.exit(1);
  }
})();

async function getSql() {
  const db = require('../db');
  return db.sql;
}
