/**
 * This is an proxy to bypass DNS or VPN issues, host it wherever you want and put URL in PROXY_URL on environment file.
 * Usually used to THUMBNAIL content.
 */

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = url.searchParams.get('url');

    if (req.method === 'HEAD' || req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (!target) {
      return new Response('Missing "url" query parameter', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    try {
      const response = fetch(target, {
        method: req.method,
        headers: {
          ...req.headers,
          referer: 'http://127.0.0.1:5500/',
        },
      });

      return response;
    } catch (error) {
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
