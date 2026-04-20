import { type MetalData } from '../data/metals';
import metalData from '../data/metals';

const USE_MOCK = false; // flipped

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const SYMBOLS = ['XAU', 'XAG', 'XPD', 'XPT'] as const;

const METAL_META = [
  { name: 'Gold',      symbol: 'Au', pair: 'XAU/USD' },
  { name: 'Silver',    symbol: 'Ag', pair: 'XAG/USD' },
  { name: 'Palladium', symbol: 'Pd', pair: 'XPD/USD' },
  { name: 'Platinum',  symbol: 'Pt', pair: 'XPT/USD' },
] as const;

export const fetchMetals = async (): Promise<MetalData[]> => {
  if (USE_MOCK) {
    return Promise.resolve(metalData);
  }

  const results = await Promise.all(
    SYMBOLS.map((symbol) =>
      fetch(`${BASE_URL}/api/metals?symbol=${symbol}`)
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error ?? `Failed to fetch ${symbol}`);
          }
          return res.json();
        })
    )
  );

  return results.map((data, i) => ({
    ...metalData[i],       // keeps chartData and priceHistory from mock
    id: i + 1,
    name: METAL_META[i].name,
    symbol: METAL_META[i].symbol,
    pair: METAL_META[i].pair,
    price: data.price,
    changePercent: data.chp,
  }));
};