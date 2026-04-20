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
  ...metalData[i], // keeps chartData and priceHistory from mock
    id: i + 1,
    name: METAL_META[i].name,
    symbol: METAL_META[i].symbol,
    pair: METAL_META[i].pair,
    price: data.price,
    changePercent: data.chp,
    // Sparkline price history interpolated from real GoldAPI data.
    // Start (open_price) and end (price) are real values.
    // Middle points are proportional to real change amount (ch),
    // representing approximate price progression through the trading day.
    // The slight dip at index 4 adds visual realism but is not real intraday data.
    // True intraday tick data requires a paid historical API.
    priceHistory: [
      data.open_price,                        // real: market open price
      data.open_price + (data.ch * 0.1),      // ~10% through the day
      data.open_price + (data.ch * 0.25),     // ~25% through the day
      data.open_price + (data.ch * 0.4),      // ~40% through the day
      data.open_price + (data.ch * 0.3),      // simulated intraday dip
      data.open_price + (data.ch * 0.5),      // ~50% through the day
      data.open_price + (data.ch * 0.65),     // ~65% through the day
      data.open_price + (data.ch * 0.8),      // ~80% through the day
      data.price,                             // real: current live price
    ],
  }));
};