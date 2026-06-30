import { useState, useEffect } from "react";
import "./ExplorerPage.css";

const TRENDING = ["NVDA", "AAPL", "TATAMOTORS.NS", "TSLA", "ZOMATO.NS", "MSFT"];

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchExplorerData = async (ticker) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/explorer?ticker=${ticker}`);
      const json = await res.json();
      setData(json.stats || {});
    } catch (err) {
      console.error(err);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearched(true);
      fetchExplorerData(query.trim().toUpperCase());
    }
  };

  const clickTag = (tag) => {
    setQuery(tag);
    setSearched(true);
    fetchExplorerData(tag.toUpperCase());
  };

  return (
    <div className="explorer-page page-container">
      <div className="explorer-hero">
        <h1>Stock Explorer</h1>
        <p>Deep-dive search for historical data and insights.</p>
        
        <form className="explorer-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search any ticker (e.g. NVDA)" 
            autoFocus 
          />
          <button type="submit">Explore</button>
        </form>
        
        <div className="explorer-tags">
          <span className="tags-label">Trending:</span>
          {TRENDING.map(t => (
            <span key={t} className="explorer-tag" onClick={() => clickTag(t)}>{t}</span>
          ))}
        </div>
      </div>

      {searched && loading && (
        <div className="explorer-results">
           <div className="spinner" style={{ margin: '40px auto' }}></div>
        </div>
      )}

      {searched && !loading && data && Object.keys(data).length > 0 && (
        <div className="explorer-results">
          <h2>Explorer Results for <span className="text-cyan">{query.toUpperCase()}</span></h2>
          <div className="explorer-grid">
            <div className="explorer-card">
              <h3>Historical Performance</h3>
              <table className="explorer-table">
                <tbody>
                  <tr><td>1 Month</td><td className={data.perf1M >= 0 ? "text-emerald" : "text-crimson"}>{data.perf1M > 0 ? "+" : ""}{(data.perf1M || 0).toFixed(2)}%</td></tr>
                  <tr><td>6 Months</td><td className={data.perf6M >= 0 ? "text-emerald" : "text-crimson"}>{data.perf6M > 0 ? "+" : ""}{(data.perf6M || 0).toFixed(2)}%</td></tr>
                  <tr><td>1 Year</td><td className={data.perf1Y >= 0 ? "text-emerald" : "text-crimson"}>{data.perf1Y > 0 ? "+" : ""}{(data.perf1Y || 0).toFixed(2)}%</td></tr>
                  <tr><td>5 Years</td><td className={data.perf5Y >= 0 ? "text-emerald" : "text-crimson"}>{data.perf5Y > 0 ? "+" : ""}{(data.perf5Y || 0).toFixed(2)}%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="explorer-card">
              <h3>Volatility Metrics</h3>
              <table className="explorer-table">
                <tbody>
                  <tr><td>Beta (5Y Monthly)</td><td>{(data.beta || 0).toFixed(2)}</td></tr>
                  <tr><td>52-Week High</td><td>${(data.high52 || 0).toFixed(2)}</td></tr>
                  <tr><td>52-Week Low</td><td>${(data.low52 || 0).toFixed(2)}</td></tr>
                  <tr><td>Average Volume (3M)</td><td>{((data.volAvg || 0) / 1000000).toFixed(1)}M</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="explorer-disclaimer">
            * Data is powered by Yahoo Finance live market data.
          </div>
        </div>
      )}
      
      {searched && !loading && data && Object.keys(data).length === 0 && (
        <div className="explorer-results">
          <p style={{textAlign: "center", color: "var(--textDim)"}}>No data found for {query.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
}
