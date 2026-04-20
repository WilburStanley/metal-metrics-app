import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type MetalData } from '../data/metals';
import { fetchNews, type NewsItem } from '../services/newsService';
import { ErrorCard } from './ErrorCard';

interface NewsCardProps {
  metal: MetalData;
}

export const NewsCard = ({ metal }: NewsCardProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchNews(metal)
      .then((data) => setNews(data.slice(0, 3)))
      .catch(() => setError('Failed to load news'))
      .finally(() => setLoading(false));
  }, [metal.pair]);

  return (
    <div
      className="rounded-lg bg-black border-2 border-white/10 p-5 hover:border-white/20 cursor-pointer"
      onClick={() => navigate('/news')}
    >
      <h3 className="text-sm font-medium text-white mb-4">Latest News</h3>

      {loading && (
        <p className="text-xs text-surface-500 text-center py-4">Loading news...</p>
      )}

      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="flex flex-col divide-y divide-white/10">
          {news.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No recent news available.</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-xs text-amber-500 mb-1">{item.timeAgo}</p>
                <p className="text-sm text-white leading-snug">{item.headline}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};