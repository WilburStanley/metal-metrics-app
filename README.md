# Metal Metrics

A real-time precious metals dashboard displaying live spot prices, market data, and financial news for Gold, Silver, Palladium, and Platinum.

**Live Demo:** [metal-metrics.vercel.app](https://metal-metrics.vercel.app)

![image alt](https://github.com/WilburStanley/metal-metrics-app/blob/6511f0dfc9f4bd948dc1082e3d3a385bfd379e46/public/metal-metrics-dashboard-img.jpg)
![image alt](https://github.com/WilburStanley/metal-metrics-app/blob/19cb9446fb64f74aa2128c9f57281601b3c26644/public/metal-metrics-news-img.jpg)

---

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, React Router v6

**Backend:** Vercel Serverless Functions (API proxy layer)

**APIs:** GoldAPI.io (live prices), NewsAPI.org (financial news)

---

## Security

- API keys stored as Vercel environment variables — never bundled into the client
- CORS restricted to allowed origins
- Rate limiting per IP (Metals: 10 req/hr, News: 6 req/15min)
- Symbol whitelist and input sanitization on all endpoints

---

## Live vs Mock Data

| Component | Source |
|-----------|--------|
| Metal Cards, Conversion, Market Overview | GoldAPI.io Live |
| News Card, News Page | NewsAPI.org Live |
| Price Chart history | Mock data |

> Price chart uses structured mock data. True intraday history requires a paid API. Chart open/close prices are derived from real GoldAPI data.

## Math & Calculations

### Sparkline (Metal Cards)
Sparklines are interpolated from real GoldAPI fields to ensure the trend direction always matches the live `changePercent`:

```
Points = open_price → proportional steps using ch → current price
```

Where `ch` is the real change amount from GoldAPI. The first and last points are always real values — middle points represent approximate price progression through the trading day.

### Price Chart
```
currentPrice = metal.price (live spot price from GoldAPI)
openPrice = chartData[0].price (first point of selected timeframe)
change = currentPrice - openPrice
changePercent = (change / openPrice) * 100
```

Switching timeframes (1H, 24H, 7D, 30D) updates `openPrice` and therefore `change` and `changePercent` — matching how TradingView and Bloomberg handle timeframe-relative changes.

### Market Dominance
```
dominance = (metal_market_cap / total_market_cap) * 100
```

Uses fixed approximate market caps (Gold ~$15.4T, Silver ~$1.8T, Palladium ~$15B, Platinum ~$140B) rather than raw spot prices, which would produce misleading results due to different units and scales.

### Trend (Market Overview)
Uses a Simple Moving Average (SMA) comparison between the earliest and most recent price history points:

```
earlierAvg = average of first 3 priceHistory points
recentAvg  = average of last 3 priceHistory points
trendPercent = ((recentAvg - earlierAvg) / earlierAvg) * 100

> +0.3% → Bullish
< -0.3% → Bearish
otherwise → Neutral
```

### Unit Conversion (Conversion Card)
All units are converted to troy ounces first, then multiplied by the live spot price:

```
result = amount × unit_to_troy_oz_factor × spot_price

Factors:
  1 ozt = 1.000000 troy oz  (base unit)
  1 g   = 0.032151 troy oz
  1 kg  = 32.15070 troy oz
  1 lb  = 14.58330 troy oz
```

---

## FOREX Market Hours

The market open/closed indicator is derived from real FOREX precious metals market hours — not hardcoded. The metals market (XAU, XAG, XPD, XPT) follows the global FOREX schedule:

```
Opens:  Sunday 22:00 UTC  (Sydney session open)
Closes: Friday 22:00 UTC  (New York session close)
Break:  Daily 22:00–23:00 UTC (~1 hour rollover period)
```

Logic:
```
Saturday           → always closed
Sunday < 22:00 UTC → closed
Sunday ≥ 22:00 UTC → open
Friday ≥ 22:00 UTC → closed
Mon–Thu 22:00–23:00 UTC → closed (daily break)
All other times   → open
```

The indicator updates on each page load when live metal prices are fetched.

---

## Getting Started

```bash
git clone https://github.com/your-username/metal-metrics-app.git
cd metal-metrics-app
npm install
```

Create `.env`:
```env
NEWSAPI_KEY=your_key
GOLDAPI_KEY=your_key
VITE_API_BASE_URL=http://localhost:3000
```

Get free API keys at [goldapi.io](https://goldapi.io) and [newsapi.org](https://newsapi.org).

```bash
npx vercel dev
```

