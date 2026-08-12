require('dotenv').config();
const { getPool } = require('../db');

// Use Unsplash Source query URLs (they redirect to a photo matching the query).
// These are public and suitable for development/demo use.
const mapping = [
  { slug: 'aurelia-brass-table-lamp', url: 'https://source.unsplash.com/800x600/?brass,table-lamp' },
  { slug: 'solene-glass-pendant', url: 'https://source.unsplash.com/800x600/?glass,pendant' },
  { slug: 'marne-stoneware-vase', url: 'https://source.unsplash.com/800x600/?vase,ceramic' },
  { slug: 'fen-ceramic-bowl-set', url: 'https://source.unsplash.com/800x600/?ceramic,bowl' },
  { slug: 'aldern-linen-throw', url: 'https://source.unsplash.com/800x600/?linen,throw' },
  { slug: 'rivage-dinner-plate-set', url: 'https://source.unsplash.com/800x600/?dinner,plate' },
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
    console.log('Done updating remote image URLs');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update remote image URLs', err.message || err);
    process.exit(1);
  }
})();
