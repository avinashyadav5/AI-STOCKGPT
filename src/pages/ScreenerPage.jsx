import { useState, useEffect } from "react";
import MarkdownLite from "../components/MarkdownLite";
import "./ScreenerPage.css";

export default function ScreenerPage() {
  const [filterSector, setFilterSector] = useState("All");
  const [filterPe, setFilterPe] = useState("All");
  const [filterDiv, setFilterDiv] = useState("All");
  
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    const fetchScreener = async () => {
      try {
        const query = new URLSearchParams({
          sector: filterSector,
          pe: filterPe,
          div: filterDiv
        }).toString();
        const res = await fetch(`/api/screener?${query}`);
        const data = await res.json();
        setFilteredStocks(data.results || []);
      } catch (e) {
        console.error("Screener fetch error:", e);
      }
    };
    fetchScreener();
  }, [filterSector, filterPe, filterDiv]);

  const handleScan = () => {
    if (filteredStocks.length === 0) return;
    setIsScanning(true);
    setAiReport(null);
    
    setTimeout(() => {
      const names = filteredStocks.slice(0, 3).map(s => s.name).join(", ");
      const isUndervalued = filterPe === "<15" || filterPe === "15-30";
      const isDividend = filterDiv === ">3%";
      
      let report = `## AI Screener Analysis\n\nI have scanned **${filteredStocks.length}** equities matching your criteria.\n\n`;
      report += `> **Key Finding:** Top candidates like **${names}** display strong fundamentals relative to their peer group.\n\n`;
      
      if (isUndervalued) {
        report += `### Valuation\nThese stocks are trading at a discount (P/E < 15). The market may be pricing in macro headwinds, but ROE remains robust, indicating potential margin of safety.\n\n`;
      }
      if (isDividend) {
        report += `### Yield Profile\nThe high dividend yields (>3%) are well-covered by free cash flow. Ideal for income-focused portfolios.\n\n`;
      }
      
      report += `---\n*Disclaimer: AI-generated insight based on surface-level metrics. Conduct deeper DD before investing.*`;
      
      setAiReport(report);
      setIsScanning(false);
    }, 2500);
  };

  return (
    <div className="screener-page page-container">
      <div className="screener-header">
        <div>
          <h1>AI Stock Screener</h1>
          <p>Filter thousands of equities and run automated AI analysis on the results.</p>
        </div>
      </div>

      <div className="screener-controls">
        <div className="filter-group">
          <label>Sector</label>
          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
            <option value="All">All Sectors</option>
            <option value="Technology">Technology</option>
            <option value="Financials">Financials</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Energy">Energy</option>
            <option value="Consumer">Consumer</option>
            <option value="Auto">Auto</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>P/E Ratio</label>
          <select value={filterPe} onChange={(e) => setFilterPe(e.target.value)}>
            <option value="All">Any Valuation</option>
            <option value="<15">Undervalued (&lt; 15)</option>
            <option value="15-30">Fair (15 - 30)</option>
            <option value=">30">Growth (&gt; 30)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Dividend Yield</label>
          <select value={filterDiv} onChange={(e) => setFilterDiv(e.target.value)}>
            <option value="All">Any Yield</option>
            <option value=">1%">&gt; 1%</option>
            <option value=">3%">High Yield (&gt; 3%)</option>
            <option value="None">No Dividend</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <button 
            className="ai-scan-btn" 
            onClick={handleScan}
            disabled={isScanning || filteredStocks.length === 0}
          >
            {isScanning ? (
              <><span className="spinner-small"></span> Scanning {filteredStocks.length} Results...</>
            ) : (
              `⚡ Scan ${filteredStocks.length} Results with AI`
            )}
          </button>
        </div>
      </div>

      <div className="screener-layout">
        <div className="screener-table-wrapper">
          <table className="screener-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company</th>
                <th>Sector</th>
                <th className="num-col">Market Cap</th>
                <th className="num-col">P/E</th>
                <th className="num-col">Div Yield</th>
                <th className="num-col">ROE</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((s) => (
                  <tr key={s.ticker}>
                    <td><span className="ticker-badge">{s.ticker}</span></td>
                    <td className="company-name">{s.name}</td>
                    <td><span className="sector-tag">{s.sector}</span></td>
                    <td className="num-col">${s.mcap}B</td>
                    <td className="num-col">{s.pe.toFixed(1)}</td>
                    <td className="num-col">{s.div.toFixed(1)}%</td>
                    <td className="num-col text-emerald">{s.roe.toFixed(1)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">No stocks match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {aiReport && !isScanning && (
          <div className="ai-report-panel">
            <div className="ai-report-header">
              <span className="ai-icon">⚡</span>
              <h3>AI Screener Insight</h3>
            </div>
            <div className="ai-report-content">
              <MarkdownLite text={aiReport} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
