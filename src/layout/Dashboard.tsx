import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { MetalDataCard } from '../components/MetalDataCard';
import { fetchMetals } from '../services/metalService';
import { PriceChartCard } from '../components/PriceChartCard';
import { type MetalData } from '../data/metals';
import { ConversionCard } from '../components/CoversionCard';
import { MarketOverviewCard } from '../components/MarketOverviewCard';
import { NewsCard } from '../components/NewsCard';
import { ErrorCard } from '../components/ErrorCard';

interface DashboardProps {
  activeMetal: MetalData | null;
  setActiveMetal: Dispatch<SetStateAction<MetalData | null>>;
}

const isMarketOpen = (): boolean => {
  const now = new Date();
  const day = now.getUTCDay();    // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const timeUTC = hour * 60 + minute; // total minutes since midnight UTC

  const OPEN  = 22 * 60;  // 22:00 UTC
  const CLOSE = 22 * 60;  // 22:00 UTC (1 hour daily break)

  // Saturday — always closed
  if (day === 6) return false;

  // Sunday — only open after 22:00 UTC
  if (day === 0) return timeUTC >= OPEN;

  // Friday — closed after 22:00 UTC
  if (day === 5) return timeUTC < CLOSE;

  // Monday–Thursday — open except 22:00–23:00 UTC daily break
  return !(timeUTC >= 22 * 60 && timeUTC < 23 * 60);
};

export const Dashboard = ({
  activeMetal, setActiveMetal
}: DashboardProps) => {
  const [metals, setMetals] = useState<MetalData[]>([]);
  const [market, setMarket] = useState<boolean>(isMarketOpen());
  const [marketLastUpdate, setMarketLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetals().then((data) => {
      setMetals(data);
      if (!activeMetal) setActiveMetal(data[0]);
      setMarketLastUpdate(new Date()); // updates when data is fetched
      setMarket(isMarketOpen());  
    })
    .catch(() => setError('Failed to load market data'));
  }, []);

  const withError = (component: React.ReactNode) =>
  error ? <ErrorCard message="Failed to load market data." /> : component;

  return (
    <div className="flex w-full justify-center items-center flex-col px-5">
      <div className="mt-10 max-w-300 w-full">
        <div>
          <p className="text-amber-500 font-mono text-xs mb-2 uppercase tracking-wider">Live Market Data</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Precious Metals</h1>
        </div>
        <div className="flex flex-col justify-start items-start md:flex-row md:justify-between md:items-center mt-1 gap-2 md:gap-0">
          <p className="text-surface-400 text-sm">Real-time spot prices and market analysis</p>
          <p className="text-sm flex items-center gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse relative ${
              market ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-surface-500">
              {market ? 'Market Open' : 'Market Closed'}
              <span className="px-2">|</span>
              Updated:
            </span>
            <span className="font-mono">
              {marketLastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {error ? (
            // spans all 4 columns
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <ErrorCard message="Failed to load market data." />
            </div>
          ) : (
            metals.map((metal) => (
              <MetalDataCard
                key={metal.id}
                {...metal}
                isActive={activeMetal?.pair === metal.pair}
                onClick={() => setActiveMetal(metal)}
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-stretch mb-10">
          <div className="h-full">
            {withError(activeMetal && <PriceChartCard metal={activeMetal} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
            <div>{withError(activeMetal && <ConversionCard metal={activeMetal} />)}</div>
            <div>{withError(activeMetal && <MarketOverviewCard metal={activeMetal!} metals={metals} />)}</div>
            <div>
              {activeMetal && <NewsCard metal={activeMetal} />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};