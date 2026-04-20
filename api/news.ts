import type { VercelRequest, VercelResponse } from '@vercel/node';

const VALID_SYMBOLS = ['XAU', 'XAG', 'XCU', 'XPT'];

const FINNHUB_CATEGORY: Record<string, string> = {
  XAU: 'gold',
  XAG: 'silver',
  XCU: 'copper',
  XPT: 'platinum',
};

// Simple in-memory rate limiter per IP
const requestLog = new Map<string, number[]>();

const isRateLimited = (ip: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > limit;
};

// Sanitize query
const sanitize = (str: string): string =>
  str.replace(/[<>"'`;(){}]/g, '').trim().slice(0, 100);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — only allow your domain
  const origin = req.headers.origin ?? '';
  const allowedOrigins = [
    'http://localhost:3001',
    'https://metal-metrics.vercel.app',
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }

  // Rate limiting — 20 requests per 15 min per IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  if (isRateLimited(ip, 20, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'News rate limit exceeded. Please wait before retrying.' });
  }

  // Validate symbol
  const symbol = sanitize((req.query.symbol as string) ?? '').toUpperCase();
  if (!VALID_SYMBOLS.includes(symbol)) {
    return res.status(400).json({ error: 'Invalid or missing symbol' });
  }

  const keyword = FINNHUB_CATEGORY[symbol];

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_KEY}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data: any[] = await response.json();

    // Filter by keyword in headline or summary
    const filtered = data.filter((article) => {
      const headline = article.headline?.toLowerCase() ?? '';
      const summary = article.summary?.toLowerCase() ?? '';
      const kw = keyword.toLowerCase();
      return headline.includes(kw) || summary.includes(kw);
    });

    // Fall back to top general finance articles if no keyword matches
    const final = filtered.length > 0 ? filtered.slice(0, 6) : data.slice(0, 6);

    // Map Finnhub fields to match frontend's expected shape
    const articles = final.map((article) => ({
      source: { id: null, name: article.source },
      author: null,
      title: article.headline,
      description: article.summary,
      url: article.url,
      urlToImage: article.image,
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      content: article.summary,
    }));

    return res.status(200).json({ articles });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}