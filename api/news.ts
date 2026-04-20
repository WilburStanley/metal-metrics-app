import type { VercelRequest, VercelResponse } from '@vercel/node';

const VALID_SYMBOLS = ['XAU', 'XAG', 'XPD', 'XPT'];

const METAL_QUERIES: Record<string, string> = {
  XAU: 'gold price OR gold market OR gold trading',
  XAG: 'silver price OR silver market OR silver trading',
  XPD: 'palladium price OR palladium market OR palladium trading',
  XPT: 'platinum price OR platinum market OR platinum trading',
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  if (isRateLimited(ip, 20, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'News rate limit exceeded. Please wait before retrying.' });
  }

  const symbol = sanitize((req.query.symbol as string) ?? '').toUpperCase();
  if (!VALID_SYMBOLS.includes(symbol)) {
    return res.status(400).json({ error: 'Invalid or missing symbol' });
  }

  const query = METAL_QUERIES[symbol];

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&searchIn=title&sortBy=publishedAt&pageSize=12&language=en&apiKey=${process.env.NEWSAPI_KEY}`
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