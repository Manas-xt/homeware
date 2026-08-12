const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

const mapping = [
  { tag: 'lamp', file: 'aurelia-lamp.jpg' },
  { tag: 'pendant light', file: 'solene-pendant.jpg' },
  { tag: 'stoneware vase', file: 'marne-vase.jpg' },
  { tag: 'ceramic bowls', file: 'fen-bowls.jpg' },
  { tag: 'linen throw', file: 'aldern-throw.jpg' },
  { tag: 'dinner plates', file: 'rivage-plates.jpg' },
];

function download(url, dest, redirects = 0) {
  const maxRedirects = 5;
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; node-fetch)' }
    };
    const req = https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects >= maxRedirects) return reject(new Error('Too many redirects'));
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        res.resume();
        return resolve(download(loc, dest, redirects + 1));
      }
      if (res.statusCode !== 200) return reject(new Error('Request Failed. Status Code: ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => reject(err));
    });
    req.on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    for (const m of mapping) {
      // loremflickr supports tag-based images: /800/600/<tag>
      const tagSafe = encodeURIComponent(m.tag);
      const src = `https://loremflickr.com/800/600/${tagSafe}`;
      const dest = path.join(imagesDir, m.file);
      console.log(`Downloading ${src} -> ${dest}`);
      try {
        await download(src, dest);
        console.log('Saved', dest);
      } catch (err) {
        console.error('Failed', m.file, err.message || err);
      }
    }
    console.log('All LoremFlickr images attempted');
  } catch (err) {
    console.error('Unexpected error', err.message || err);
    process.exit(1);
  }
})();
