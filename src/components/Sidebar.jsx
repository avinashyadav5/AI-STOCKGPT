import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const MENU_GROUPS = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", path: "/", icon: "📊" },
      { id: "ai-research", label: "AI Research", path: "/chat", icon: "🤖" },
      { id: "markets", label: "Markets", path: "/markets", icon: "📈" },
    ]
  },
  {
    title: "Analysis",
    items: [
      { id: "stock-explorer", label: "Stock Explorer", path: "/explorer", icon: "🔍" },
      { id: "company", label: "Company", path: "/company", icon: "🏢" },
      { id: "charts", label: "Charts", path: "/charts", icon: "📉" },
      { id: "financials", label: "Financials", path: "/financials", icon: "💰" },
      { id: "news", label: "News", path: "/news", icon: "📰" },
    ]
  },
  {
    title: "Tools",
    items: [
      { id: "compare", label: "Compare", path: "/compare", icon: "⚖" },
      { id: "portfolio", label: "Portfolio", path: "/portfolio", icon: "💼" },
      { id: "watchlist", label: "Watchlist", path: "/watchlist", icon: "👀" },
      { id: "alerts", label: "Alerts", path: "/alerts", icon: "🔔" },
      { id: "screener", label: "Screener", path: "/screener", icon: "🎯" },
      { id: "calendar", label: "Calendar", path: "/calendar", icon: "📅" },
      { id: "reports", label: "AI Reports", path: "/reports", icon: "📄" },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "settings", label: "Settings", path: "/settings", icon: "⚙" },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">StockGPT</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="sidebar-group">
            <div className="sidebar-group-title">{group.title}</div>
            {group.items.map((item) => (
              <NavLink 
                key={item.id} 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      
    </aside>
  );
}
