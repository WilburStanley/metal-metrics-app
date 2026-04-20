import { useState, useEffect } from 'react';
import { ExternalLink, Clock, User, Building2 } from 'lucide-react';
import { fetchNews, type NewsItem } from '../services/newsService';
import { type MetalData } from '../data/metals';
import metalData from '../data/metals';
import { ErrorCard } from '../components/ErrorCard.tsx';

// Metal tab config
const METAL_TABS = metalData.map((m) => ({
  pair: m.pair,
  name: m.name,
  symbol: m.symbol,
}));

interface NewsPageProps {
  activeMetal?: MetalData | null;
}

export const NewsPage = ({ activeMetal }: NewsPageProps) => {
  const defaultPair = activeMetal?.pair ?? metalData[0].pair;
  const [selectedPair, setSelectedPair] = useState<string>(defaultPair);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMetal =
    metalData.find((m) => m.pair === selectedPair) ?? metalData[0];

  // Sync with dashboard active metal
  useEffect(() => {
    if (activeMetal?.pair) {
      setSelectedPair(activeMetal.pair);
    }
  }, [activeMetal?.pair]);

  // Fetch news when metal changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchNews(selectedMetal)
      .then((data) => setNews(data))
      .catch(() => setError('Failed to load news'))
      .finally(() => setLoading(false));
  }, [selectedPair, selectedMetal]);

  return (
    <div className="flex w-full justify-center flex-col px-5">
      <div className="mt-10 max-w-300 w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-amber-500 font-mono text-xs mb-2 uppercase tracking-wider">
            Market Intelligence
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Latest News
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            Real-time news and analysis for precious metals
          </p>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {METAL_TABS.map((tab) => (
            <button
              key={tab.pair}
              onClick={() => setSelectedPair(tab.pair)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border cursor-pointer
                ${
                  selectedPair === tab.pair
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    : 'bg-black border-white/10 text-surface-400 hover:border-white/20 hover:text-white'
                }`}>
              <span className="font-mono mr-2 text-xs opacity-60">
                {tab.symbol}
              </span>
              {tab.name}
            </button>
          ))}
        </div>
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg bg-black border border-white/10 p-5 animate-pulse"
              >
                <div className="h-3 bg-white/5 rounded mb-3 w-1/3" />
                <div className="h-4 bg-white/5 rounded mb-2 w-full" />
                <div className="h-4 bg-white/5 rounded mb-4 w-3/4" />
                <div className="h-20 bg-white/5 rounded mb-4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
        {/* Error */}
        {error && !loading && <ErrorCard message={error} />}
        {/* News */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.length === 0 ? (
              <div className="col-span-3 rounded-lg bg-white/5 border border-white/10 p-10 text-center">
                <p className="text-white/40 text-sm">No recent news found for {selectedMetal.name}.</p>
                <p className="text-white/20 text-xs mt-1">Check back later or try another metal.</p>
              </div>
            ) : (
              news.map((item) => (
                <NewsArticleCard key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const NewsArticleCard = ({ item }: { item: NewsItem }) => {
  return (
    <div className="rounded-lg bg-black border border-white/10 hover:border-white/20 transition flex flex-col overflow-hidden">

      {item.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.headline}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {item.source && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <Building2 className="w-3 h-3" />
              {item.source}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <Clock className="w-3 h-3" />
            {item.timeAgo}
          </span>
        </div>
        <h3 className="text-sm font-medium text-white leading-snug mb-2">
          {item.headline}
        </h3>
        {item.description && (
          <p className="text-xs text-surface-500 leading-relaxed mb-4 flex-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          {item.author && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <User className="w-3 h-3" />
              {item.author}
            </span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition ml-auto">
              Read Full Article
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};