require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Missing PEXELS_API_KEY. Set it in environment or backend/.env');
  process.exit(1);
}

const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const mapping = [
  { query: 'brass table lamp', file: 'aurelia-lamp.jpg' },
  { query: 'glass pendant light', file: 'solene-pendant.jpg' },
  { query: 'stoneware vase', file: 'marne-vase.jpg' },
  { query: 'ceramic bowls set', file: 'fen-bowls.jpg' },
  { query: 'linen throw blanket', file: 'aldern-throw.jpg' },
  { query: 'porcelain dinner plates', file: 'rivage-plates.jpg' },
];

function httpsGetJson(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) return reject(new Error('Request Failed. Status Code: ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    for (const m of mapping) {
      console.log('Searching Pexels for:', m.query);
      const opts = {
        hostname: 'api.pexels.com',
        path: `/v1/search?query=${encodeURIComponent(m.query)}&per_page=1&page=1`,
        method: 'GET',
        headers: {
          Authorization: API_KEY,
          'User-Agent': 'Lustre-Image-Fetcher/1.0',
        },
      };
      const res = await httpsGetJson(opts);
      if (res.statusCode !== 200) {
        console.error('Pexels search failed for', m.query, 'status', res.statusCode);
        continue;
      }
      const photos = res.body.photos || [];
      if (!photos.length) {
        console.error('No photos found for', m.query);
        continue;
      }
      const photo = photos[0];
      const src = (photo.src && (photo.src.original || photo.src.large2x || photo.src.large)) || null;
      if (!src) {
        console.error('No downloadable src for', m.query);
        continue;
      }
      const dest = path.join(imagesDir, m.file);
      console.log('Downloading', src, '->', dest);
      try {
        await download(src, dest);
        console.log('Saved', m.file);
      } catch (err) {
        console.error('Failed to download', m.file, err.message || err);
      }
    }
    console.log('Pexels fetch complete');
  } catch (err) {
    console.error('Unexpected error', err.message || err);
    process.exit(1);
  }
})();
