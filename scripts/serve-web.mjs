import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

/**
 * Serves the exported web build with the cross-origin isolation headers that
 * expo-sqlite needs for its WebAssembly database. The Expo dev server only
 * adds those headers to Metro bundles, not to the HTML document.
 */

const root = resolve(process.cwd(), process.env.DIST_DIR ?? 'dist-web');
const port = Number(process.env.PORT ?? 8082);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(root, relative);
  if (!candidate.startsWith(root + sep) && candidate !== root) return null;

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  // Client-side routing: unknown paths fall back to the app shell.
  const shell = join(root, 'index.html');
  return existsSync(shell) ? shell : null;
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? '/');

  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'no-store');

  if (!file) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Twice web preview: http://localhost:${port}`);
});
