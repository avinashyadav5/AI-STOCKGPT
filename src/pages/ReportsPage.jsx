import { useState, useEffect } from "react";
import MarkdownLite from "../components/MarkdownLite";
import { useSettings } from "../contexts/SettingsContext";
import "./ReportsPage.css";

const RAG_TICKERS = ["AAPL", "MSFT", "NVDA", "TSLA"];

const SAMPLE_REPORTS = [
  { ticker: "AAPL", company: "Apple Inc.", date: "2026-06-20", verdict: "BUY", confidence: "High" },
  { ticker: "MSFT", company: "Microsoft Corp.", date: "2026-06-18", verdict: "BUY", confidence: "High" },
  { ticker: "NVDA", company: "NVIDIA Corp.", date: "2026-06-15", verdict: "BUY", confidence: "Medium" },
];

export default function ReportsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ragTickers, setRagTickers] = useState(RAG_TICKERS);
  const [savedReports, setSavedReports] = useState(SAMPLE_REPORTS);
  const [activeReport, setActiveReport] = useState(null);
  
  const { aiModelId, getAiPromptAddons, settings } = useSettings();

  useEffect(() => {
    fetch("/api/rag-status")
      .then(r => r.json())
      .then(data => { if (data.tickers_with_rag) setRagTickers(data.tickers_with_rag); })
      .catch(() => {});
  }, []);

  const generateReport = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setActiveReport(null);

    try {
      const res = await fetch("/api/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticker: ticker.toUpperCase(),
          ai_model: aiModelId,
          system_prompt_addon: getAiPromptAddons()
        })
      });
      const data = await res.json();
      if (data.report) {
        setReport(data);
        // Save to history
        const newEntry = {
          ticker: data.ticker,
          company: data.company,
          date: new Date().toISOString().slice(0, 10),
          verdict: extractVerdict(data.report),
          confidence: data.rag_supported ? "High" : "Medium",
          reportContent: data.report
        };
        setSavedReports(prev => [newEntry, ...prev.slice(0, 9)]);
      } else {
        setError("Failed to generate report. Please try again.");
      }
    } catch (e) {
      setError(`Backend unavailable: ${e.message}`);
    }
    setLoading(false);
  };

  const extractVerdict = (reportText) => {
    if (/BUY/i.test(reportText) && !/SELL|HOLD/i.test(reportText.slice(-500))) return "BUY";
    if (/SELL/i.test(reportText.slice(-500))) return "SELL";
    return "HOLD";
  };

  const verdictColor = (v) => {
    if (v === "BUY") return "var(--emerald)";
    if (v === "SELL") return "var(--crimson)";
    return "var(--amber)";
  };

  const displayReport = activeReport?.reportContent || report?.report;
  const displayMeta = activeReport || (report ? {
    ticker: report.ticker, company: report.company,
    verdict: extractVerdict(report.report), confidence: report.rag_supported ? "High" : "Medium"
  } : null);

  return (
    <div className="reports-page page-container">
      <div className="reports-header">
        <div>
          <h1>AI Investment Reports</h1>
          <p>Deep-dive equity research powered by RAG over annual reports and real-time data.</p>
        </div>
      </div>

      <div className="reports-layout">
        {/* Sidebar */}
        <div className="reports-sidebar">
          {/* Generator */}
          <div className="report-generator-card">
            <div className="rg-title">⚡ Generate Report</div>
            <input
              type="text"
              className="rg-input"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="Ticker (e.g. AAPL)"
              onKeyDown={e => e.key === "Enter" && generateReport()}
            />
            <div className="rg-rag-hint">
              {ragTickers.includes(ticker.toUpperCase())
                ? <span className="rag-badge rag-on">📚 10-K RAG Active</span>
                : <span className="rag-badge rag-off">📄 General AI Mode</span>
              }
            </div>
            <button
              className="rg-btn"
              onClick={generateReport}
              disabled={loading || !ticker.trim()}
            >
              {loading ? (
                <><span className="spinner-small"></span> Generating...</>
              ) : "Generate Research Report"}
            </button>
            {error && <div className="rg-error">{error}</div>}
          </div>

          {/* RAG Coverage */}
          <div className="rag-coverage-card">
            <div className="rag-coverage-title">📚 RAG Coverage</div>
            <p className="rag-coverage-desc">Annual report data available for:</p>
            <div className="rag-chips">
              {ragTickers.map(t => (
                <button
                  key={t}
                  className={`rag-chip ${ticker === t ? "active" : ""}`}
                  onClick={() => setTicker(t)}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Report History */}
          <div className="report-history">
            <div className="rh-title">📋 Recent Reports</div>
            <div className="rh-list">
              {savedReports.map((r, i) => (
                <div
                  key={i}
                  className={`rh-item ${displayMeta?.ticker === r.ticker && !report ? "active" : ""}`}
                  onClick={() => {
                    if (r.reportContent) { setActiveReport(r); setReport(null); }
                    else setTicker(r.ticker);
                  }}
                >
                  <div className="rh-left">
                    <span className="rh-ticker">{r.ticker}</span>
                    <span className="rh-company">{r.company}</span>
                    <span className="rh-date">{r.date}</span>
                  </div>
                  <span className="rh-verdict" style={{ color: verdictColor(r.verdict) }}>{r.verdict}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Report Area */}
        <div className="reports-main">
          {loading ? (
            <div className="report-loading">
              <div className="spinner" style={{ width: 48, height: 48, margin: "0 auto 20px" }}></div>
              <div className="rl-title">Generating Investment Research Report</div>
              <div className="rl-steps">
                <div className="rl-step active">🔍 Querying RAG / Annual Report database...</div>
                <div className="rl-step active">📊 Fetching live financials & news...</div>
                <div className="rl-step active">🤖 Synthesizing with {settings.aiModel === "gemini" ? "Gemini 1.5 Pro" : (settings.aiModel === "gpt4" ? "GPT-4o" : "LLaMA 3.3 70B")}...</div>
              </div>
            </div>
          ) : displayReport && displayMeta ? (
            <div className="report-content-wrapper">
              <div className="report-meta-bar">
                <div className="rmb-left">
                  <span className="rmb-ticker">{displayMeta.ticker}</span>
                  <span className="rmb-company">{displayMeta.company}</span>
                  {displayMeta.confidence === "High" && <span className="rmb-rag-badge">📚 10-K RAG Enhanced</span>}
                </div>
                <div className="rmb-right">
                  <span className="rmb-verdict-label">AI Verdict:</span>
                  <span className="rmb-verdict" style={{ color: verdictColor(displayMeta.verdict) }}>
                    {displayMeta.verdict}
                  </span>
                </div>
              </div>
              <div className="report-body">
                <MarkdownLite text={displayReport} />
              </div>
            </div>
          ) : (
            <div className="report-empty">
              <div className="re-icon">📈</div>
              <h2>AI-Powered Investment Research</h2>
              <p>Enter a ticker and click Generate to create a comprehensive equity research report, powered by our multi-agent AI with RAG over annual reports.</p>
              <div className="re-features">
                <div className="re-feature">📚 RAG over 10-K filings for AAPL, MSFT, NVDA, TSLA</div>
                <div className="re-feature">📊 Live financials + news sentiment integration</div>
                <div className="re-feature">🤖 6-section structured analysis with buy/hold/sell verdict</div>
                <div className="re-feature">⚡ Powered by {settings.aiModel === "gemini" ? "Gemini 1.5 Pro" : (settings.aiModel === "gpt4" ? "GPT-4o" : "LLaMA 3.3 70B")}</div>
              </div>
              <div className="re-quick">
                {RAG_TICKERS.map(t => (
                  <button key={t} className="re-quick-btn" onClick={() => { setTicker(t); }}>
                    Generate {t} Report
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
