export default async function handler(req, res) {
  try {
    // Extract the original path from the query string or referer
    const originalUrl = req.url || '';
    // Remove the /api/yahoo prefix and get the path after /api/finance
    const referer = req.headers.referer || '';
    
    // The rewrite sends /api/finance/v8/finance/chart/AAPL?... to /api/yahoo?...
    // We need to reconstruct the Yahoo URL from the original request
    // Vercel rewrites preserve query params
    const yahooPath = req.query.path || '';
    
    // Build query string from all params except 'path'
    const params = new URLSearchParams(req.query);
    params.delete('path');
    
    // Reconstruct from x-vercel-rewrite or from the matched source
    // The rewrite rule: /api/finance/:path* -> /api/yahoo
    // :path* is available as req.query.path
    const fullPath = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path || '');
    const queryString = params.toString();
    const yahooUrl = `https://query1.finance.yahoo.com/${fullPath}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const data = await response.text();
    
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Yahoo Finance proxy error', details: error.message });
  }
}
