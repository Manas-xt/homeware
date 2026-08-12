require('dotenv').config();
const { getPool } = require('../db');

const mapping = [
  { slug: 'aurelia-brass-table-lamp', url: 'https://via.placeholder.com/400x300?text=Aurelia+Lamp' },
  { slug: 'solene-glass-pendant', url: 'https://via.placeholder.com/400x300?text=Solene+Pendant' },
  { slug: 'marne-stoneware-vase', url: 'https://via.placeholder.com/400x300?text=Marne+Vase' },
  { slug: 'fen-ceramic-bowl-set', url: 'https://via.placeholder.com/400x300?text=Fen+Bowls' },
  { slug: 'aldern-linen-throw', url: 'https://via.placeholder.com/400x300?text=Aldern+Throw' },
  { slug: 'rivage-dinner-plate-set', url: 'https://via.placeholder.com/400x300?text=Rivage+Plates' },
];

(async () => {
  try {
    const pool = await getPool();
    for (const m of mapping) {
      console.log('Updating', m.slug);
      await pool.request()
        .input('slug', mssqlType('NVarChar'), m.slug)
        .input('url', mssqlType('NVarChar'), m.url)
        .query('UPDATE Products SET ImageUrl = @url WHERE Slug = @slug');
    }
    console.log('Done updating image URLs');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update image URLs', err.message || err);
    process.exit(1);
  }
})();

function mssqlType(name) {
  // lazy require to avoid top-level dependency issues
  const { sql } = require('../db');
  return sql[name];
}
