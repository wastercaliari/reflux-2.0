/**
 * This is an proxy to bypass DNS or VPN issues, host it wherever you want and put URL in PROXY_URL on environment file.
 */

const { pipeline } = require('node:stream');
const { promisify } = require('node:util');
const http = require('node:http');

const pipeline = promisify(pipeline);
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );

  if (req.method === 'HEAD' || req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, 'http://localhost:3000');
    const target = url.searchParams.get('url');

    if (!target) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing "url" query parameter');
      return;
    }

    const response = await fetch(target, {
      method: req.method,
      headers: {
        referer: 'http://127.0.0.1:5500/',
        ...req.headers,
      },
    });

    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.writeHead(response.status);

    await pipeline(response.body, res);
  } catch {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }

    res.end('Internal Server Error');
  }
});

server.listen(3000, '0.0.0.0');
