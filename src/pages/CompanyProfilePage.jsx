import { useState, useEffect } from "react";
import "./CompanyProfilePage.css";

export default function CompanyProfilePage() {
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async (searchTicker) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile?ticker=${searchTicker}`);
      const json = await res.json();
      setData(json.profile || null);
    } catch (err) {
      setError("Failed to fetch profile. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(ticker);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.ticker.value.trim().toUpperCase();
    if (val) {
      setTicker(val);
      fetchProfile(val);
    }
  };

  return (
    <div className="profile-page page-container">
      <div className="profile-header">
        <div>
          <h1>Company Profile</h1>
          <p>Fundamental business overview and executive leadership.</p>
        </div>
        <form onSubmit={handleSearch} className="profile-search">
          <input type="text" name="ticker" placeholder="Ticker (e.g. AAPL)" defaultValue={ticker} />
          <button type="submit">Fetch</button>
        </form>
      </div>

      {loading && (
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Fetching profile data for {ticker}...</p>
        </div>
      )}

      {error && <div className="profile-error">{error}</div>}

      {!loading && data && Object.keys(data).length > 0 && (
        <div className="profile-content">
          <div className="profile-hero">
            <div className="profile-hero-left">
              {data.image && <img src={data.image} alt={`${data.companyName} logo`} className="profile-logo" />}
              <div className="profile-title">
                <h2>{data.companyName}</h2>
                <div className="profile-badges">
                  <span className="badge">{data.symbol}</span>
                  <span className="badge">{data.exchangeShortName}</span>
                  <span className="badge">{data.sector}</span>
                </div>
              </div>
            </div>
            <div className="profile-hero-right">
              <div className="price-huge">${data.price?.toFixed(2)}</div>
              <div className={`price-change ${data.changes >= 0 ? "positive" : "negative"}`}>
                {data.changes >= 0 ? "▲" : "▼"} {Math.abs(data.changes || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-card profile-desc-card">
              <h3>Business Overview</h3>
              <p>{data.description}</p>
            </div>
            
            <div className="profile-sidebar">
              <div className="profile-card">
                <h3>Key Metrics</h3>
                <div className="metric-row">
                  <span>Market Cap</span>
                  <strong>{data.mktCap ? `$${(data.mktCap / 1e9).toFixed(2)}B` : '-'}</strong>
                </div>
                <div className="metric-row">
                  <span>Beta</span>
                  <strong>{data.beta?.toFixed(2) || '-'}</strong>
                </div>
                <div className="metric-row">
                  <span>Dividend Yield</span>
                  <strong>{data.lastDiv ? `$${data.lastDiv}` : '-'}</strong>
                </div>
              </div>

              <div className="profile-card">
                <h3>Corporate Info</h3>
                <div className="metric-row">
                  <span>CEO</span>
                  <strong>{data.ceo || '-'}</strong>
                </div>
                <div className="metric-row">
                  <span>Employees</span>
                  <strong>{data.fullTimeEmployees?.toLocaleString() || '-'}</strong>
                </div>
                <div className="metric-row">
                  <span>Industry</span>
                  <strong>{data.industry || '-'}</strong>
                </div>
                <div className="metric-row">
                  <span>HQ</span>
                  <strong>{data.city}, {data.state || data.country}</strong>
                </div>
                <div className="metric-row">
                  <span>Website</span>
                  <a href={data.website} target="_blank" rel="noreferrer" className="profile-link">Visit Site ↗</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && (!data || Object.keys(data).length === 0) && !error && (
        <div className="profile-empty">No profile data found for {ticker}.</div>
      )}
    </div>
  );
}
