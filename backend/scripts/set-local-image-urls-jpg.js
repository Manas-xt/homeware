require('dotenv').config();
const { getPool } = require('../db');

const mapping = [
  { slug: 'aurelia-brass-table-lamp', url: '/images/aurelia-lamp.jpg' },
  { slug: 'solene-glass-pendant', url: '/images/solene-pendant.jpg' },
  { slug: 'marne-stoneware-vase', url: '/images/marne-vase.jpg' },
  { slug: 'fen-ceramic-bowl-set', url: '/images/fen-bowls.jpg' },
  { slug: 'aldern-linen-throw', url: '/images/aldern-throw.jpg' },
  { slug: 'rivage-dinner-plate-set', url: '/images/rivage-plates.jpg' },
];

(async () => {
  try {
    const pool = await getPool();
    const sql = (await require('../db')).sql;
    for (const m of mapping) {
      console.log('Updating', m.slug, '=>', m.url);
      await pool.request()
        .input('slug', sql.NVarChar, m.slug)
        .input('url', sql.NVarChar, m.url)
        .query('UPDATE Products SET ImageUrl = @url WHERE Slug = @slug');
    }
    console.log('Done updating ImageUrl to local JPGs');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update ImageUrl', err.message || err);
    process.exit(1);
  }
})();
