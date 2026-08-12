const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const mapping = [
  { filename: 'aurelia-lamp.jpg', url: 'https://source.unsplash.com/800x600/?brass,table-lamp' },
  { filename: 'solene-pendant.jpg', url: 'https://source.unsplash.com/800x600/?glass,pendant' },
  { filename: 'marne-vase.jpg', url: 'https://source.unsplash.com/800x600/?vase,ceramic' },
  { filename: 'fen-bowls.jpg', url: 'https://source.unsplash.com/800x600/?ceramic,bowl' },
  { filename: 'aldern-throw.jpg', url: 'https://source.unsplash.com/800x600/?linen,throw' },
  { filename: 'rivage-plates.jpg', url: 'https://source.unsplash.com/800x600/?dinner,plate' },
];

function fetchUrl(url, destPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectsLeft > 0) {
          resolve(fetchUrl(res.headers.location, destPath, redirectsLeft - 1));
        } else {
          reject(new Error('Too many redirects'));
        }
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(resolve));
      fileStream.on('error', (err) => reject(err));
    });
    req.on('error', (err) => reject(err));
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
    console.log('All images downloaded');
    process.exit(0);
  } catch (err) {
    console.error('Failed to download images:', err.message || err);
    process.exit(1);
  }
})();
