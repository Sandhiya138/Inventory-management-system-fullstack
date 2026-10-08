import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

const port = parseInt(process.env.PORT, 10) || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Strip query string and hash
  const parsedUrl = req.url.split('?')[0];
  let filePath = path.join(distDir, parsedUrl);

  // If path doesn't exist or is a directory, check for file or fallback to index.html (SPA)
  let serveFile = filePath;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath) && !fs.statSync(indexPath).isDirectory()) {
      serveFile = indexPath;
    } else {
      serveFile = path.join(distDir, 'index.html'); // SPA rewrite
    }
  }

  const ext = path.extname(serveFile).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(serveFile, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(content);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[VelvetStock] Production frontend server listening on 0.0.0.0:${port}`);
});
