import { useState, useEffect } from "react";
import "./CalendarPage.css";

const MOCK_EVENTS = [
  { ticker: "AAPL", name: "Apple Inc.", date: "2026-07-28", eps_est: 1.34, time: "After Market", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corp.", date: "2026-07-22", eps_est: 2.93, time: "After Market", sector: "Technology" },
  { ticker: "NVDA", name: "NVIDIA Corp.", date: "2026-08-15", eps_est: 0.64, time: "After Market", sector: "Technology" },
  { ticker: "GOOGL", name: "Alphabet Inc.", date: "2026-07-29", eps_est: 1.89, time: "After Market", sector: "Technology" },
  { ticker: "META", name: "Meta Platforms", date: "2026-07-30", eps_est: 4.72, time: "After Market", sector: "Technology" },
  { ticker: "JPM", name: "JPMorgan Chase", date: "2026-07-12", eps_est: 4.01, time: "Before Market", sector: "Financials" },
  { ticker: "BAC", name: "Bank of America", date: "2026-07-14", eps_est: 0.83, time: "Before Market", sector: "Financials" },
  { ticker: "JNJ", name: "Johnson & Johnson", date: "2026-07-15", eps_est: 2.31, time: "Before Market", sector: "Healthcare" },
  { ticker: "TSLA", name: "Tesla Inc.", date: "2026-07-22", eps_est: 0.52, time: "After Market", sector: "Automotive" },
  { ticker: "V", name: "Visa Inc.", date: "2026-07-23", eps_est: 2.42, time: "After Market", sector: "Financials" },
  { ticker: "WMT", name: "Walmart Inc.", date: "2026-08-19", eps_est: 0.68, time: "Before Market", sector: "Retail" },
  { ticker: "XOM", name: "Exxon Mobil", date: "2026-08-02", eps_est: 1.93, time: "Before Market", sector: "Energy" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filterSector, setFilterSector] = useState("All");
  const [filterTime, setFilterTime] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMonth, setViewMonth] = useState(6); // July (0-indexed)
  const [viewYear, setViewYear] = useState(2026);

  useEffect(() => {
    // Fetch from backend, fallback to mock
    fetch("/api/calendar")
      .then(r => r.json())
      .then(data => {
        if (data.calendar && data.calendar.length > 0) {
          setEvents([...MOCK_EVENTS, ...data.calendar.map(c => ({
            ...c, name: c.ticker, time: "After Market", sector: "N/A"
          }))]);
        } else {
          setEvents(MOCK_EVENTS);
        }
      })
      .catch(() => setEvents(MOCK_EVENTS));
  }, []);

  const sectors = ["All", ...new Set(MOCK_EVENTS.map(e => e.sector))];
  const times = ["All", "Before Market", "After Market"];

  const filtered = events.filter(e => {
    if (filterSector !== "All" && e.sector !== filterSector) return false;
    if (filterTime !== "All" && e.time !== filterTime) return false;
    return true;
  });

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsOnDay = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filtered.filter(e => e.date === dateStr);
  };

  const monthLabel = `${MONTHS[viewMonth]} ${viewYear}`;

  return (
    <div className="calendar-page page-container">
      <div className="cal-header">
        <div>
          <h1>Earnings Calendar</h1>
          <p>Upcoming earnings releases, EPS estimates &amp; key events.</p>
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}>‹</button>
          <span className="cal-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}>›</button>
        </div>
      </div>

      {/* Filters */}
      <div className="cal-filters">
        <div className="filter-group">
          <label>Sector</label>
          <select value={filterSector} onChange={e => setFilterSector(e.target.value)}>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Timing</label>
          <select value={filterTime} onChange={e => setFilterTime(e.target.value)}>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13 }}>
          {filtered.length} events this period
        </div>
      </div>

      <div className="cal-layout">
        {/* Calendar Grid */}
        <div className="cal-grid-wrapper">
          <div className="cal-weekdays">
            {WEEKDAYS.map(d => <div key={d} className="cal-wday">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((day, i) => {
              const dayEvents = day ? eventsOnDay(day) : [];
              const isToday = day && new Date().getDate() === day && new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear;
              return (
                <div key={i} className={`cal-cell ${day ? "active" : "empty"} ${isToday ? "today" : ""}`}>
                  {day && (
                    <>
                      <div className="cal-day-num">{day}</div>
                      <div className="cal-day-events">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.ticker}
                            className={`cal-event-chip ${ev.time === "Before Market" ? "before" : "after"}`}
                            onClick={() => setSelectedEvent(ev)}
                            title={`${ev.ticker}: EPS est. $${ev.eps_est}`}
                          >
                            {ev.ticker}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="cal-overflow">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* List & Detail Panel */}
        <div className="cal-side">
          {selectedEvent ? (
            <div className="cal-detail-card">
              <button className="cal-close" onClick={() => setSelectedEvent(null)}>✕</button>
              <div className="cal-detail-ticker">{selectedEvent.ticker}</div>
              <div className="cal-detail-name">{selectedEvent.name}</div>
              <div className="cal-detail-rows">
                <div className="cal-detail-row"><span>Date</span><strong>{selectedEvent.date}</strong></div>
                <div className="cal-detail-row"><span>Timing</span><strong>{selectedEvent.time}</strong></div>
                <div className="cal-detail-row"><span>EPS Estimate</span><strong className="cal-eps">${selectedEvent.eps_est}</strong></div>
                <div className="cal-detail-row"><span>Sector</span><strong>{selectedEvent.sector}</strong></div>
              </div>
              <div className="cal-detail-hint">AI analysis available via Chat → "Analyze {selectedEvent.ticker} earnings"</div>
            </div>
          ) : (
            <div className="cal-upcoming">
              <h3>Upcoming Events</h3>
              <div className="cal-event-list">
                {filtered
                  .filter(e => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 10)
                  .map(ev => (
                    <div key={ev.ticker} className="cal-list-item" onClick={() => setSelectedEvent(ev)}>
                      <div className="cal-list-left">
                        <span className={`cal-time-badge ${ev.time === "Before Market" ? "before" : "after"}`}>
                          {ev.time === "Before Market" ? "AM" : "PM"}
                        </span>
                        <div>
                          <div className="cal-list-ticker">{ev.ticker}</div>
                          <div className="cal-list-name">{ev.name}</div>
                        </div>
                      </div>
                      <div className="cal-list-right">
                        <div className="cal-list-date">{ev.date.slice(5)}</div>
                        <div className="cal-list-eps">est. ${ev.eps_est}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
