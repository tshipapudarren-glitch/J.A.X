import React, { useState, useEffect, useCallback } from 'react';

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  published_at: string;
  summary: string;
  sentiment: string;
  score: number;
  impact: string;
  symbols?: string[];
}

const SENTIMENT_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  bullish: { color: 'text-green-400', bg: 'bg-green-500/20', icon: '📈' },
  bearish: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '📉' },
  neutral: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '➡️' },
  mixed: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '🔄' },
};

const IMPACT_CONFIG: Record<string, { color: string; label: string }> = {
  high: { color: 'bg-red-500', label: 'HIGH' },
  medium: { color: 'bg-yellow-500', label: 'MED' },
  low: { color: 'bg-gray-500', label: 'LOW' },
};

const NewsIntel = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState<any>(null);
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [stats, setStats] = useState({ bullish: 0, bearish: 0, neutral: 0, mixed: 0 });

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/jax-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch' }),
      });
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles || []);
        const arts = data.articles || [];
        setStats({
          bullish: arts.filter((a: NewsArticle) => a.sentiment === 'bullish').length,
          bearish: arts.filter((a: NewsArticle) => a.sentiment === 'bearish').length,
          neutral: arts.filter((a: NewsArticle) => a.sentiment === 'neutral').length,
          mixed: arts.filter((a: NewsArticle) => a.sentiment === 'mixed').length,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const analyzeCustom = async () => {
    if (!customText.trim()) return;
    setAnalyzing(true);
    setCustomAnalysis(null);
    try {
      const res = await fetch('/jax-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', text: customText }),
      });
      const data = await res.json();
      if (data.success) setCustomAnalysis(data.analysis);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filtered = filterSentiment === 'all' ? articles : articles.filter(a => a.sentiment === filterSentiment);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-NEWS-ANALYST • AI-Powered Sentiment Analysis</p>
        </div>
        <button onClick={fetchNews} disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-sm font-medium transition flex items-center gap-2">
          {loading ? '⟳ Fetching...' : '📰 Fetch Latest News'}
        </button>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-4 gap-4">
        {(['bullish', 'bearish', 'neutral', 'mixed'] as const).map(s => {
          const cfg = SENTIMENT_CONFIG[s];
          return (
            <div key={s} className={`rounded-lg p-4 ${cfg.bg} border border-white/5`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cfg.icon}</span>
                <div>
                  <div className={`text-2xl font-bold ${cfg.color}`}>{stats[s]}</div>
                  <div className="text-xs text-gray-400 capitalize">{s}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-400">Filter:</span>
        {['all', 'bullish', 'bearish', 'neutral', 'mixed'].map(f => (
          <button key={f} onClick={() => setFilterSentiment(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterSentiment === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}>
            {f === 'all' ? '🌐 All' : `${SENTIMENT_CONFIG[f as keyof typeof SENTIMENT_CONFIG]?.icon} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">{filtered.length} articles</span>
      </div>

      {/* News Feed */}
      <div className="space-y-3">
        {loading && articles.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">⟳</div>
            <p>Fetching and analyzing news...</p>
            <p className="text-xs text-gray-500 mt-2">AI sentiment analysis may take 10-20 seconds</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📰</div>
            <p>No articles found. Click "Fetch Latest News" to load.</p>
            <p className="text-xs text-gray-500 mt-2">Or use the custom analyzer below to analyze any headline.</p>
          </div>
        ) : (
          filtered.map((article, i) => {
            const sentCfg = SENTIMENT_CONFIG[article.sentiment] || SENTIMENT_CONFIG.neutral;
            const impCfg = IMPACT_CONFIG[article.impact] || IMPACT_CONFIG.low;
            return (
              <div key={i} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition border border-white/5">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${impCfg.color}`} title={impCfg.label} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sentCfg.bg} ${sentCfg.color}`}>
                        {sentCfg.icon} {article.sentiment}
                      </span>
                      <span className="text-xs text-gray-500">{article.source}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{new Date(article.published_at).toLocaleDateString()}</span>
                      {article.score && (
                        <span className="text-xs text-gray-500">Score: {(article.score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">{article.title}</h3>
                    {article.summary && (
                      <p className="text-xs text-gray-400 line-clamp-2">{article.summary}</p>
                    )}
                    {article.symbols && article.symbols.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {article.symbols.map((s, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Analyzer */}
      <div className="bg-gradient-to-r from-blue-900/30 to-slate-800 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-blue-300 mb-4">🔍 Custom Sentiment Analyzer</h3>
        <p className="text-xs text-gray-400 mb-3">Paste any headline or news text to get instant AI sentiment analysis.</p>
        <textarea value={customText} onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g. Apple reports record Q4 earnings, beats expectations by 15%..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 h-20 resize-none focus:outline-none focus:border-blue-500" />
        <button onClick={analyzeCustom} disabled={analyzing || !customText.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-sm font-medium transition">
          {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
        {customAnalysis && (
          <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-lg px-3 py-1 rounded-full ${SENTIMENT_CONFIG[customAnalysis.sentiment]?.bg} ${SENTIMENT_CONFIG[customAnalysis.sentiment]?.color}`}>
                {SENTIMENT_CONFIG[customAnalysis.sentiment]?.icon} {customAnalysis.sentiment?.toUpperCase()}
              </span>
              <span className="text-sm text-gray-400">Confidence: {((customAnalysis.score || 0.5) * 100).toFixed(0)}%</span>
              <span className={`text-xs px-2 py-0.5 rounded ${IMPACT_CONFIG[customAnalysis.impact]?.color} text-white`}>
                {IMPACT_CONFIG[customAnalysis.impact]?.label} IMPACT
              </span>
            </div>
            <p className="text-sm text-gray-300">{customAnalysis.summary}</p>
            {customAnalysis.symbols?.length > 0 && (
              <div className="flex gap-1 mt-2">
                {customAnalysis.symbols.map((s: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsIntel;
