import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetalDataProps {
  id: number;
  name: string;
  symbol: string;
  pair: string;
  price: number;
  changePercent?: number;
  priceHistory?: number[];
}

interface MetalCardProps extends MetalDataProps {
  unit?: string;
  isActive?: boolean;
  onClick?: () => void;
}

type Trend = 'up' | 'down' | 'neutral';

const getTrend = (change: number): Trend => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
};

const TREND_CONFIG: Record<Trend, {
  icon: React.ElementType;
  className: string;
}> = {
  up:      { icon: TrendingUp,   className: 'text-green-400 bg-green-400/10' },
  down:    { icon: TrendingDown, className: 'text-red-400 bg-red-400/10'     },
  neutral: { icon: Minus,        className: 'text-surface-400 bg-white/5'    },
};

const buildSparklinePath = (history: number[]): string => {
  if (history.length < 2) return '';

  const width = 200;
  const height = 40;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  return history
    .map((point, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

export const MetalDataCard = ({
  name = 'Name',
  symbol = 'N/A',
  pair = 'N/A',
  price = 0,
  changePercent = 0,
  priceHistory = [],
  unit = '/ oz',
  isActive = false,
  onClick,
}: MetalCardProps) => {
  const trend = getTrend(changePercent);
  const { icon: TrendIcon, className: trendClassName } = TREND_CONFIG[trend];
  const sparklinePath = buildSparklinePath(priceHistory);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg p-5 cursor-pointer transition bg-black border-2
        ${isActive
          ? 'border-amber-500/20'
          : 'border-white/10 hover:border-white/20'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded flex items-center justify-center border-2
            ${isActive
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-surface/10 border-surface-500/20'}`}
          >
            <span className={`font-semibold text-sm
              ${isActive ? 'text-amber-500' : 'text-surface-300'}`}>
              {symbol}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">{name}</h3>
            <p className="text-xs text-surface-500 font-mono">{pair}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${trendClassName}`}>
          <TrendIcon className="w-3 h-3" />
          {changePercent.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-white tabular-nums tracking-tight">
          ${price.toLocaleString()}
        </span>
        <span className="text-xs text-surface-500">{unit}</span>
      </div>

      <div className="mt-4 h-10">
        <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
          {sparklinePath && (
            <path
              d={sparklinePath}
              stroke="currentColor"
              className={`opacity-80 ${isActive ? 'text-amber-500' : 'text-surface-400'}`}
              fill="none"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>
    </div>
  );
};