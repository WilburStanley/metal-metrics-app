import type { VercelRequest, VercelResponse } from '@vercel/node';

const VALID_SYMBOLS = ['XAU', 'XAG', 'XPD', 'XPT'];

// Simple in-memory rate limiter per IP
const requestLog = new Map<string, number[]>();

const isRateLimited = (ip: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > limit;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  const origin = req.headers.origin ?? '';
  const allowedOrigins = [
    'http://localhost:5173',
    'https://metal-metrics.vercel.app',
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }

  // Rate limiting — 10 requests per hour per IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  if (isRateLimited(ip, 10, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Metals rate limit exceeded. Please wait before retrying.' });
  }

  // Validate symbol
  const symbol = ((req.query.symbol as string) ?? '').toUpperCase();
  if (!VALID_SYMBOLS.includes(symbol)) {
    return res.status(400).json({ error: `Invalid symbol: ${symbol}` });
  }

  // Validate currency
  const currency = ((req.query.currency as string) ?? 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    return res.status(400).json({ error: 'Invalid currency format' });
  }

  try {
    const response = await fetch(
      `https://www.goldapi.io/api/${symbol}/${currency}`,
      {
        headers: {
          'x-access-token': process.env.GOLDAPI_KEY!,
          'Content-Type': 'application/json',
        },
      }
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