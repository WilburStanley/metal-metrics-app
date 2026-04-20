import { type MetalData } from '../data/metals';
import metalData from '../data/metals';

const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SYMBOLS = ['XAU', 'XAG', 'XCU', 'XPT'] as const;

const METAL_META = [
  { name: 'Gold',     symbol: 'Au', pair: 'XAU/USD' },
  { name: 'Silver',   symbol: 'Ag', pair: 'XAG/USD' },
  { name: 'Copper',   symbol: 'Cu', pair: 'XCU/USD' },
  { name: 'Platinum', symbol: 'Pt', pair: 'XPT/USD' },
] as const;

export const fetchMetals = async (): Promise<MetalData[]> => {
  if (USE_MOCK) {
    return Promise.resolve(metalData);
  }

  // Fetch all metals in parallel
  const results = await Promise.all(
    SYMBOLS.map((symbol) =>
      fetch(`${BASE_URL}/api/metals/${symbol}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
          return res.json();
        })
    )
  );

  // Map GoldAPI response to MetalData shape
  return results.map((data, i) => ({
    id: i + 1,
    name: METAL_META[i].name,
    symbol: METAL_META[i].symbol,
    pair: METAL_META[i].pair,
    price: data.price,
    changePercent: data.chp,             // GoldAPI field for change percent
    priceHistory: [],                     // populated by chart API later
    chartData: metalData[i].chartData,   // still mock until chart API ready
  }));
};