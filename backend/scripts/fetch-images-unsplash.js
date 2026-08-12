const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const maxRedirects = 5;

const mapping = [
  { query: 'brass table lamp,lamp', file: 'aurelia-lamp.jpg' },
  { query: 'glass pendant light,pendant', file: 'solene-pendant.jpg' },
  { query: 'stoneware vase,ceramic vase', file: 'marne-vase.jpg' },
  { query: 'ceramic bowls,serving bowls', file: 'fen-bowls.jpg' },
  { query: 'linen throw blanket,throw blanket', file: 'aldern-throw.jpg' },
  { query: 'porcelain dinner plates,tableware', file: 'rivage-plates.jpg' },
];

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects >= maxRedirects) return reject(new Error('Too many redirects'));
        const loc = res.headers.location;
        res.resume();
        return resolve(download(loc, dest, redirects + 1));
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
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    for (const m of mapping) {
      const src = `https://source.unsplash.com/800x600/?${encodeURIComponent(m.query)}`;
      const dest = path.join(imagesDir, m.file);
      console.log(`Downloading ${src} -> ${dest}`);
      try {
        await download(src, dest);
        console.log('Saved', dest);
      } catch (err) {
        console.error('Failed', m.file, err.message || err);
      }
    }
    console.log('All Unsplash images attempted');
  } catch (err) {
    console.error('Unexpected error', err.message || err);
    process.exit(1);
  }
})();
