import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { type MetalData, type TimeFrame } from '../data/metals';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-surface-500 mb-1">{label}</p>
      <p className="text-white font-medium">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const timeFrames: TimeFrame[] = ['1H', '24H', '7D', '30D'];

interface PriceChartCardProps {
  metal: MetalData;
}

export const PriceChartCard = ({ metal }: PriceChartCardProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');

  const data = metal.chartData[timeFrame];
  const currentPrice = metal.price;
  const openPrice = data[0].price;
  const change = currentPrice - openPrice;
  const changePercent = ((change / openPrice) * 100).toFixed(2);
  const isPositive = change >= 0;
  const high = Math.max(...data.map((d) => d.price));
  const low = Math.min(...data.map((d) => d.price));

  return (
    <div className="rounded-lg transition bg-black border-2 border-white/10 hover:border-white/20 h-full">
      <div className="rounded-lg p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-medium text-white">{metal.name} Price Chart</h2>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded border border-amber-500/20">
              {timeFrame}
            </span>
          </div>
          <div className="md:text-right">
            <p className="text-2xl font-semibold text-center text-white tabular-nums tracking-tight">
              ${currentPrice.toLocaleString()}
            </p>
            <p className={`text-sm mt-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${change.toFixed(2)}{' '}
              <span className="text-surface-500">
                ({isPositive ? '+' : ''}{changePercent}%)
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeFrames.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer
                  ${timeFrame === tf
                    ? 'bg-white/10 text-white'
                    : 'text-surface-500 hover:text-white hover:bg-white/5'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="linear"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#metalGradient)"
                dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#f59e0b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <div>
            <p className="text-xs text-surface-500 mb-1">High ({timeFrame})</p>
            <p className="text-sm font-medium text-white tabular-nums">${high.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Low ({timeFrame})</p>
            <p className="text-sm font-medium text-white tabular-nums">${low.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Volume</p>
            <p className="text-sm font-medium text-white tabular-nums">24.5K</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Market Cap</p>
            <p className="text-sm font-medium text-white tabular-nums">$12.4T</p>
          </div>
        </div>
      </div>
    </div>
  );
};