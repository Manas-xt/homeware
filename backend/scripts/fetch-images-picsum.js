const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const mapping = [
  { filename: 'aurelia-lamp.jpg', url: 'https://picsum.photos/seed/aurelia/800/600' },
  { filename: 'solene-pendant.jpg', url: 'https://picsum.photos/seed/solene/800/600' },
  { filename: 'marne-vase.jpg', url: 'https://picsum.photos/seed/marne/800/600' },
  { filename: 'fen-bowls.jpg', url: 'https://picsum.photos/seed/fen/800/600' },
  { filename: 'aldern-throw.jpg', url: 'https://picsum.photos/seed/aldern/800/600' },
  { filename: 'rivage-plates.jpg', url: 'https://picsum.photos/seed/rivage/800/600' },
];

function fetchUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return resolve(fetchUrl(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(resolve));
      fileStream.on('error', reject);
    });
    req.on('error', reject);
  });
}

(async () => {
  try {
    for (const m of mapping) {
      const dest = path.join(imagesDir, m.filename);
      console.log('Downloading', m.url, '->', dest);
      await fetchUrl(m.url, dest);
      console.log('Saved', dest);
    }
    console.log('All picsum images downloaded');
    process.exit(0);
  } catch (err) {
    console.error('Failed to download picsum images:', err.message || err);
    process.exit(1);
  }
})();
