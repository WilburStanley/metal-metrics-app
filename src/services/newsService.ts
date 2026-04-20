import { type MetalData } from '../data/metals';
import newsData from '../data/news';

export interface NewsItem {
  id: number;
  timeAgo: string;
  headline: string;
  description?: string;
  content?: string;
  source?: string;
  author?: string;
  url?: string;
  imageUrl?: string;
  publishedAt?: string;
}

const USE_MOCK = false;
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Map pair to symbol for the proxy route
const PAIR_TO_SYMBOL: Record<string, string> = {
  'XAU/USD': 'XAU',
  'XAG/USD': 'XAG',
  'XPD/USD': 'XPD',
  'XPT/USD': 'XPT',
};

const getTimeAgo = (publishedAt: string): string => {
  const diff = Date.now() - new Date(publishedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0)    return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0)   return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return 'Just now';
};

export const fetchNews = async (metal: MetalData): Promise<NewsItem[]> => {
  if (USE_MOCK) {
    return Promise.resolve(newsData[metal.pair] ?? []);
  }

  const symbol = PAIR_TO_SYMBOL[metal.pair];
  console.log('1. symbol:', symbol);
  console.log('2. BASE_URL:', BASE_URL);
  console.log('3. full URL:', `${BASE_URL}/api/news?symbol=${symbol}`);

  if (!symbol) throw new Error(`Unknown pair: ${metal.pair}`);

  // Call your proxy server, not NewsAPI directly
  const response = await fetch(`${BASE_URL}/api/news?symbol=${symbol}`);
  console.log('4. response status:', response.status);
  console.log('5. response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.log('6. error response:', error);
    throw new Error(error.error ?? 'Failed to fetch news');
  }

  const data = await response.json();
  console.log('7. data:', data);

  return data.articles.map((article: any, index: number) => ({
    id: index + 1,
    headline: article.title,
    description: article.description,
    content: article.content,
    source: article.source?.name,
    author: article.author,
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    timeAgo: getTimeAgo(article.publishedAt),
  }));
};