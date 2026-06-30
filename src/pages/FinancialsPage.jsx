import { useState, useEffect } from "react";
import "./FinancialsPage.css";

export default function FinancialsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("income");

  const fetchFinancials = async (searchTicker) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/financials?ticker=${searchTicker}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Failed to fetch financials. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials(ticker);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.ticker.value.trim().toUpperCase();
    if (val) {
      setTicker(val);
      fetchFinancials(val);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    if (num >= 1e9 || num <= -1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6 || num <= -1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString();
  };

  const renderTable = (dataset, columns) => {
    if (!dataset || dataset.length === 0) return <div className="fin-empty">No data available</div>;
    return (
      <div className="fin-table-wrapper">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Metric</th>
              {dataset.map((year, i) => (
                <th key={i}>{year.calendarYear || year.date.substring(0, 4)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => (
              <tr key={idx}>
                <td className="fin-metric-name">{col.label}</td>
                {dataset.map((year, i) => (
                  <td key={i}>{col.format ? col.format(year[col.key]) : formatNumber(year[col.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const incomeColumns = [
    { label: "Revenue", key: "revenue" },
    { label: "Cost of Revenue", key: "costOfRevenue" },
    { label: "Gross Profit", key: "grossProfit" },
    { label: "Gross Margin", key: "grossProfitRatio", format: (v) => (v * 100).toFixed(2) + "%" },
    { label: "Operating Expenses", key: "operatingExpenses" },
    { label: "Operating Income", key: "operatingIncome" },
    { label: "Net Income", key: "netIncome" },
    { label: "EPS", key: "eps", format: (v) => "$" + v?.toFixed(2) },
  ];

  const balanceColumns = [
    { label: "Cash & Equivalents", key: "cashAndCashEquivalents" },
    { label: "Total Current Assets", key: "totalCurrentAssets" },
    { label: "Total Assets", key: "totalAssets" },
    { label: "Total Current Liabilities", key: "totalCurrentLiabilities" },
    { label: "Total Debt", key: "totalDebt" },
    { label: "Total Liabilities", key: "totalLiabilities" },
    { label: "Total Equity", key: "totalStockholdersEquity" },
  ];

  const cashColumns = [
    { label: "Operating Cash Flow", key: "operatingCashFlow" },
    { label: "Capital Expenditure", key: "capitalExpenditure" },
    { label: "Free Cash Flow", key: "freeCashFlow" },
    { label: "Dividends Paid", key: "dividendsPaid" },
    { label: "Debt Repayment", key: "debtRepayment" },
  ];

  const ratioColumns = [
    { label: "P/E Ratio", key: "priceEarningsRatio", format: (v) => v?.toFixed(2) + "x" },
    { label: "P/B Ratio", key: "priceToBookRatio", format: (v) => v?.toFixed(2) + "x" },
    { label: "EV / EBITDA", key: "enterpriseValueMultiple", format: (v) => v?.toFixed(2) + "x" },
    { label: "Debt to Equity", key: "debtEquityRatio", format: (v) => v?.toFixed(2) },
    { label: "Current Ratio", key: "currentRatio", format: (v) => v?.toFixed(2) },
    { label: "ROE", key: "returnOnEquity", format: (v) => (v * 100).toFixed(2) + "%" },
  ];

  return (
    <div className="financials-page page-container">
      <div className="fin-header">
        <div>
          <h1>Financial Statements</h1>
          <p>Historical fundamental data and key metrics.</p>
        </div>
        <form onSubmit={handleSearch} className="fin-search">
          <input type="text" name="ticker" placeholder="Ticker (e.g. AAPL)" defaultValue={ticker} />
          <button type="submit">Fetch</button>
        </form>
      </div>

      {loading && (
        <div className="fin-loading">
          <div className="spinner"></div>
          <p>Fetching 5-year financials for {ticker}...</p>
        </div>
      )}

      {error && <div className="fin-error">{error}</div>}

      {!loading && data && (
        <div className="fin-content">
          <div className="fin-tabs">
            <button className={`fin-tab ${activeTab === "income" ? "active" : ""}`} onClick={() => setActiveTab("income")}>Income Statement</button>
            <button className={`fin-tab ${activeTab === "balance" ? "active" : ""}`} onClick={() => setActiveTab("balance")}>Balance Sheet</button>
            <button className={`fin-tab ${activeTab === "cash" ? "active" : ""}`} onClick={() => setActiveTab("cash")}>Cash Flow</button>
            <button className={`fin-tab ${activeTab === "ratios" ? "active" : ""}`} onClick={() => setActiveTab("ratios")}>Key Ratios</button>
          </div>

          <div className="fin-tab-content">
            {activeTab === "income" && renderTable(data.income, incomeColumns)}
            {activeTab === "balance" && renderTable(data.balance, balanceColumns)}
            {activeTab === "cash" && renderTable(data.cash, cashColumns)}
            {activeTab === "ratios" && renderTable(data.ratios, ratioColumns)}
          </div>
        </div>
      )}
    </div>
  );
}
