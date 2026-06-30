import { useState, useEffect } from "react";
import "./NewsPage.css";

export default function NewsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async (searchTicker) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/news?ticker=${searchTicker}`);
      const data = await res.json();
      setNews(data.news || []);
    } catch (err) {
      setError("Failed to fetch news. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(ticker);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.ticker.value.trim().toUpperCase();
    if (val) {
      setTicker(val);
      fetchNews(val);
    }
  };

  return (
    <div className="news-page page-container">
      <div className="news-header">
        <div>
          <h1>Market News & AI Sentiment</h1>
          <p>Live news feed powered by Finnhub with real-time AI impact analysis.</p>
        </div>
        <form onSubmit={handleSearch} className="news-search">
          <input type="text" name="ticker" placeholder="Search Ticker (e.g. TSLA)" defaultValue={ticker} />
          <button type="submit">Analyze</button>
        </form>
      </div>

      {loading && (
        <div className="news-loading">
          <div className="scanner"></div>
          <p>AI Agent is reading and analyzing articles...</p>
        </div>
      )}

      {error && <div className="news-error">{error}</div>}

      {!loading && news.length === 0 && !error && (
        <div className="news-empty">No recent news found for {ticker}.</div>
      )}

      {!loading && news.length > 0 && (
        <div className="news-feed">
          {news.map((item, i) => (
            <div key={i} className={`news-card sentiment-${item.sentiment?.toLowerCase() || 'neutral'}`}>
              <div className="news-card-header">
                <span className="news-source">{item.source || 'Finnhub'}</span>
                <span className="news-time">{item.datetime ? new Date(item.datetime * 1000).toLocaleString() : 'Recent'}</span>
              </div>
              <h3 className="news-headline">{item.headline}</h3>
              <p className="news-summary">{item.summary}</p>
              
              <div className="news-ai-analysis">
                <div className="ai-badge">
                  <span className="ai-dot"></span>
                  {item.sentiment || 'Neutral'}
                </div>
                <p className="ai-impact">{item.impact}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
