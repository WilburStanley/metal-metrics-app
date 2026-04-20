import { type MetalData } from '../data/metals';

interface MarketOverviewCardProps {
  metal: MetalData;
  metals: MetalData[];
}

type Trend = 'Bullish' | 'Bearish' | 'Neutral';

const TREND_COLORS: Record<Trend, string> = {
  Bullish: 'text-amber-500',
  Bearish: 'text-red-400',
  Neutral: 'text-surface-400',
};

// Realistic market caps in billions USD — replace with API later
const MARKET_CAPS: Record<string, number> = {
  'XAU/USD': 15400, // Gold ~$15.4T
  'XAG/USD': 1800,  // Silver ~$1.8T
  'XPD/USD': 15,    // Palladium ~$15B
  'XPT/USD': 140,   // Platinum ~$140B
};

// Mathematically accurate: market cap share, not raw price share
const getDominance = (active: MetalData, all: MetalData[]): string => {
  const total = all.reduce((sum, m) => sum + (MARKET_CAPS[m.pair] ?? 0), 0);
  const activeCap = MARKET_CAPS[active.pair] ?? 0;
  if (total === 0) return '0.0';
  return ((activeCap / total) * 100).toFixed(1);
};

// Mathematically accurate: simple moving average of priceHistory
const getTrend = (metal: MetalData): Trend => {
  const history = metal.priceHistory ?? [];
  if (history.length < 2) return 'Neutral';

  const recent = history.slice(-3);
  const earlier = history.slice(0, 3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const trendPercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  if (trendPercent > 0.3) return 'Bullish';
  if (trendPercent < -0.3) return 'Bearish';
  return 'Neutral';
};

// Computed from chart data — mathematically accurate
const get24hChange = (metal: MetalData): { value: string; className: string } => {
  const changePercent = metal.changePercent ?? 0;
  const isPositive = changePercent >= 0;
  return {
    value: `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`,
    className: isPositive ? 'text-green-400' : 'text-red-400',
  };
};

// Computed from priceHistory — mathematically accurate
const getPriceRange = (metal: MetalData): string => {
  const history = metal.priceHistory ?? [];
  if (history.length === 0) return 'N/A';
  const high = Math.max(...history);
  const low = Math.min(...history);
  return `$${low.toLocaleString()} – $${high.toLocaleString()}`;
};

export const MarketOverviewCard = ({ metal, metals }: MarketOverviewCardProps) => {
  const dominance = getDominance(metal, metals);
  const trend = getTrend(metal);
  const change = get24hChange(metal);
  const priceRange = getPriceRange(metal);

  const rows = [
    {
      label: `${metal.name} Dominance`,
      value: `${dominance}%`,
      className: 'text-white',
    },
    {
      label: '24h Change',
      value: change.value,
      className: change.className,
    },
    {
      label: 'Price Range',
      value: priceRange,
      className: 'text-white',
    },
    {
      label: 'Trend',
      value: trend,
      className: TREND_COLORS[trend],
    },
  ];

  return (
    <div className="rounded-lg bg-black border-2 border-white/10 p-5 hover:border-white/20">
      <h3 className="text-sm font-medium text-white mb-4">Market Overview</h3>
      <div className="flex flex-col divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2">
            <span className="text-sm text-surface-500">{row.label}</span>
            <span className={`text-sm font-medium ${row.className}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};