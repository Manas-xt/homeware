require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');

const app = express();

const path = require('path');

// Serve static images from /images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'lustre-homeware-api' });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Lustre Homeware API listening on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Exiting.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

function shutdown() {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
