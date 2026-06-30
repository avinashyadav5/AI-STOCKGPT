import { useState, useEffect } from "react";
import "./ComparePage.css";

export default function ComparePage() {
  const [t1, setT1] = useState("AAPL");
  const [t2, setT2] = useState("MSFT");
  const [s1, setS1] = useState("AAPL");
  const [s2, setS2] = useState("MSFT");
  
  const [d1, setD1] = useState(null);
  const [d2, setD2] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCompareData = async (ticker) => {
    try {
      const [profRes, finRes] = await Promise.all([
        fetch(`/api/profile?ticker=${ticker}`),
        fetch(`/api/financials?ticker=${ticker}`)
      ]);
      const profData = await profRes.json();
      const finData = await finRes.json();
      
      const p = profData.profile || {};
      const f = finData.ratios?.[0] || {};
      const income = finData.income?.[0] || {};
      
      const margin = income.revenue > 0 ? (income.netIncome / income.revenue) * 100 : 0;
      
        return {
          name: p.companyName || ticker,
          price: p.price || 0,
          mcap: p.mktCap ? `$${(p.mktCap / 1e9).toFixed(1)}B` : "N/A",
          pe: f.peRatio ? parseFloat(f.peRatio).toFixed(2) : "N/A",
          div: p.lastDiv !== "N/A" && p.lastDiv !== null ? `${parseFloat(p.lastDiv).toFixed(2)}%` : "N/A",
          beta: p.beta !== "N/A" && p.beta !== null ? parseFloat(p.beta).toFixed(2) : "N/A",
          roe: f.returnOnEquity ? `${(f.returnOnEquity * 100).toFixed(1)}%` : "N/A",
          margin: f.returnOnEquity ? `${margin.toFixed(1)}%` : "N/A"
        };
    } catch (e) {
      console.error("Compare fetch error", e);
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const [res1, res2] = await Promise.all([
        fetchCompareData(s1),
        fetchCompareData(s2)
      ]);
      if (active) {
        setD1(res1);
        setD2(res2);
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [s1, s2]);

  const handleCompare = (e) => {
    e.preventDefault();
    if (t1.trim()) setS1(t1.toUpperCase().trim());
    if (t2.trim()) setS2(t2.toUpperCase().trim());
  };

  const renderRow = (label, key, higherIsBetter = true) => {
    if (!d1 || !d2) return null;
    const v1 = parseFloat(String(d1[key]).replace(/[^\d.-]/g, ''));
    const v2 = parseFloat(String(d2[key]).replace(/[^\d.-]/g, ''));
    
    let w1 = false, w2 = false;
    if (!isNaN(v1) && !isNaN(v2)) {
      if (v1 > v2) { higherIsBetter ? w1 = true : w2 = true; }
      else if (v2 > v1) { higherIsBetter ? w2 = true : w1 = true; }
    }

    return (
      <div className="compare-row">
        <div className={`compare-val left ${w1 ? "winner" : ""}`}>{d1[key]}</div>
        <div className="compare-label">{label}</div>
        <div className={`compare-val right ${w2 ? "winner" : ""}`}>{d2[key]}</div>
      </div>
    );
  };

  return (
    <div className="compare-page page-container">
      <div className="compare-header">
        <h1>Compare Equities</h1>
        <p>Head-to-head fundamental analysis.</p>
      </div>

      <form className="compare-form" onSubmit={handleCompare}>
        <input type="text" value={t1} onChange={e => setT1(e.target.value)} placeholder="Ticker 1 (e.g. AAPL)" />
        <span className="compare-vs">VS</span>
        <input type="text" value={t2} onChange={e => setT2(e.target.value)} placeholder="Ticker 2 (e.g. MSFT)" />
        <button type="submit" className="compare-btn" disabled={loading}>
          {loading ? "..." : "Compare"}
        </button>
      </form>

      {loading ? (
        <div className="spinner" style={{ margin: '60px auto' }}></div>
      ) : d1 && d2 ? (
        <div className="compare-results">
          <div className="compare-titles">
            <div className="compare-title-card">
              <span className="ticker-badge">{s1}</span>
              <h2>{d1.name}</h2>
              <div className="compare-price">${d1.price.toFixed(2)}</div>
            </div>
            <div className="compare-title-card text-right">
              <span className="ticker-badge">{s2}</span>
              <h2>{d2.name}</h2>
              <div className="compare-price">${d2.price.toFixed(2)}</div>
            </div>
          </div>

          <div className="compare-grid">
            {renderRow("Market Cap", "mcap")}
            {renderRow("P/E Ratio", "pe", false)}
            {renderRow("Dividend Yield", "div")}
            {renderRow("Beta", "beta", false)}
            {renderRow("Return on Equity", "roe")}
            {renderRow("Net Margin", "margin")}
          </div>
          
          <div className="compare-ai-verdict">
            <h3>⚡ AI Verdict</h3>
            <p>Based on current valuation, <strong>{d1.pe < d2.pe ? d1.name : d2.name}</strong> appears more attractively priced relative to earnings. However, <strong>{parseFloat(d1.margin) > parseFloat(d2.margin) ? d1.name : d2.name}</strong> commands a superior margin profile, justifying its premium.</p>
          </div>
        </div>
      ) : (
        <div className="compare-empty">
          Data not found for one or both tickers. Try AAPL, MSFT, TSLA, or NVDA.
        </div>
      )}
    </div>
  );
}
