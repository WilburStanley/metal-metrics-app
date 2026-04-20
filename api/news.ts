import type { VercelRequest, VercelResponse } from '@vercel/node';

const VALID_SYMBOLS = ['XAU', 'XAG', 'XCU', 'XPT'];

const METAL_QUERIES: Record<string, string> = {
  XAU: 'gold OR "gold price" OR "gold market"',
  XAG: 'silver OR "silver price" OR "silver market"',
  XCU: 'copper OR "copper price" OR "copper market"',
  XPT: 'platinum OR "platinum price" OR "platinum market"',
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

  // Allow requests with no origin (same-origin) or matching origin
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }

  // Rate limiting — 6 requests per 15 min per IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  if (isRateLimited(ip, 6, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'News rate limit exceeded. Please wait before retrying.' });
  }

  // Validate symbol
  const symbol = sanitize((req.query.symbol as string) ?? '').toUpperCase();
  if (!VALID_SYMBOLS.includes(symbol)) {
    return res.status(400).json({ error: 'Invalid or missing symbol' });
  }

  const query = METAL_QUERIES[symbol];

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=6&language=en&apiKey=${process.env.NEWSAPI_KEY}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}