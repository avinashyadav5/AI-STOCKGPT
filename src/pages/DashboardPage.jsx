import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [totalValue, setTotalValue] = useState(0);
  const [dayChange, setDayChange] = useState(0);
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dbRes = await fetch("/api/watchlist");
        const dbData = await dbRes.json();
        const userHoldings = dbData.watchlist || [];

        const promises = userHoldings.map(h => 
          fetch(`/api/profile?ticker=${h.ticker}`)
            .then(res => res.json())
            .then(data => ({
              ...h,
              name: data.profile?.companyName || h.ticker,
              price: data.profile?.price || 0,
              change: data.profile?.changes || 0,
              pct: (data.profile?.changes / (data.profile?.price - data.profile?.changes)) * 100 || 0
            }))
            .catch(() => ({ ...h, name: h.ticker, price: 0, change: 0, pct: 0 }))
        );
        const results = await Promise.all(promises);

        let value = 0.00; // base cash
        let dChange = 0;
        
        results.forEach(h => {
          value += h.shares * h.price;
          dChange += h.shares * h.change;
        });

        const sortedByPct = [...results].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
        setTopGainers(sortedByPct.slice(0, 3));
        setTotalValue(value);
        setDayChange(dChange);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--textDim)', marginTop: '8px' }}>Market Overview, Portfolio Value, and AI Insights.</p>
      
      {loading ? (
        <div className="spinner" style={{ marginTop: '40px' }} />
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px', 
          marginTop: '24px' 
        }}>
          <div style={{ background: 'var(--surfaceElevated)', padding: '24px', borderRadius: '12px' }}>
            <h3>Portfolio Value</h3>
            <h2 style={{ fontSize: '32px', color: 'var(--text)', marginTop: '12px' }}>
              ${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h2>
            <p style={{ color: dayChange >= 0 ? 'var(--emerald)' : 'var(--crimson)', marginTop: '8px' }}>
              {dayChange >= 0 ? "+$" : "-$"}{Math.abs(dayChange).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Today
            </p>
          </div>
          <div style={{ background: 'var(--surfaceElevated)', padding: '24px', borderRadius: '12px' }}>
            <h3>Today's Movers (Your Holdings)</h3>
            <ul style={{ marginTop: '12px', listStyle: 'none', padding: 0 }}>
              {topGainers.length === 0 ? (
                <li style={{ padding: '8px 0', color: 'var(--textDim)' }}>No holdings yet.</li>
              ) : (
                topGainers.map(g => (
                  <li key={g.ticker} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    {g.ticker} <span style={{ float: 'right', color: g.pct >= 0 ? 'var(--emerald)' : 'var(--crimson)' }}>
                      {g.pct >= 0 ? "+" : ""}{g.pct.toFixed(2)}%
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div style={{ background: 'var(--surfaceElevated)', padding: '24px', borderRadius: '12px' }}>
            <h3>Latest AI Insight</h3>
            <p style={{ marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
              NIFTY 50 shows strong support at 24,200. Auto sector is showing bullish momentum based on recent earnings beats by Tata Motors and M&M.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
