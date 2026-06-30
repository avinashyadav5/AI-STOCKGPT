import { useState, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";
import "./SettingsPage.css";

const NAV_SECTIONS = [
  { id: "profile",       icon: "👤", label: "Profile" },
  { id: "appearance",    icon: "🎨", label: "Appearance" },
  { id: "preferences",   icon: "🌍", label: "Preferences" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "ai",            icon: "🤖", label: "AI Preferences" },
  { id: "market",        icon: "📈", label: "Market Preferences" },
  { id: "security",      icon: "🔐", label: "Security" },
  { id: "datasources",   icon: "📊", label: "Data Sources" },
  { id: "export",        icon: "📄", label: "Export" },
  { id: "apikeys",       icon: "🔑", label: "API Keys" },
  { id: "activity",      icon: "📜", label: "Activity" },
  { id: "about",         icon: "ℹ️",  label: "About" },
];

const ACCENT_COLORS = [
  { id: "violet", label: "Blue",   color: "#6366f1" },
  { id: "emerald",label: "Green",  color: "#10b981" },
  { id: "purple", label: "Purple", color: "#a855f7" },
  { id: "rose",   label: "Rose",   color: "#f43f5e" },
  { id: "amber",  label: "Amber",  color: "#f59e0b" },
  { id: "cyan",   label: "Cyan",   color: "#06b6d4" },
];

const RECENT_SEARCHES = [
  { q: "AAPL earnings analysis", time: "2 hours ago" },
  { q: "NVDA vs AMD comparison", time: "5 hours ago" },
  { q: "Reliance Industries Q4 results", time: "1 day ago" },
  { q: "Top IT sector stocks India", time: "2 days ago" },
  { q: "Bitcoin market outlook 2026", time: "3 days ago" },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  const { settings, updateSetting } = useSettings();
  const {
    fullName, email, username, country, timezone, profileCurrency, phone, avatar,
    themeMode, accent, fontSize,
    defCurrency, defExchange, language,
    priceEmail, pricePush, priceSms, newsAlerts, earningsAlerts, dividendAlerts, ipoAlerts,
    aiModel, responseStyle, responseLen, outBullets, outTables, outCharts, outMarkdown,
    incRisks, incOpps, incRatios, incSources,
    mktNSE, mktBSE, mktNASDAQ, mktNYSE, secIT, secBanking, secPharma, secEnergy, secAuto, secFMCG, timeframe,
    twoFA, exportFmt, autoSave
  } = settings;

  const setAvatar = (v) => updateSetting("avatar", v);
  const setFullName = (v) => updateSetting("fullName", v);
  const setEmail = (v) => updateSetting("email", v);
  const setUsername = (v) => updateSetting("username", v);
  const setCountry = (v) => updateSetting("country", v);
  const setTimezone = (v) => updateSetting("timezone", v);
  const setProfileCurrency = (v) => updateSetting("profileCurrency", v);
  const setPhone = (v) => updateSetting("phone", v);
  const fileRef = useRef();

  const setThemeMode = (v) => updateSetting("themeMode", v);
  const setAccent = (v) => updateSetting("accent", v);
  const setFontSize = (v) => updateSetting("fontSize", v);

  const setDefCurrency = (v) => updateSetting("defCurrency", v);
  const setDefExchange = (v) => updateSetting("defExchange", v);
  const setLanguage = (v) => updateSetting("language", v);

  const setPriceEmail = (v) => updateSetting("priceEmail", v);
  const setPricePush = (v) => updateSetting("pricePush", v);
  const setPriceSms = (v) => updateSetting("priceSms", v);
  const setNewsAlerts = (v) => updateSetting("newsAlerts", v);
  const setEarnings = (v) => updateSetting("earningsAlerts", v);
  const setDividend = (v) => updateSetting("dividendAlerts", v);
  const setIpo = (v) => updateSetting("ipoAlerts", v);

  const setAiModel = (v) => updateSetting("aiModel", v);
  const setResStyle = (v) => updateSetting("responseStyle", v);
  const setResLen = (v) => updateSetting("responseLen", v);
  const setOutBullets = (v) => updateSetting("outBullets", v);
  const setOutTables = (v) => updateSetting("outTables", v);
  const setOutCharts = (v) => updateSetting("outCharts", v);
  const setOutMarkdown = (v) => updateSetting("outMarkdown", v);
  const setIncRisks = (v) => updateSetting("incRisks", v);
  const setIncOpps = (v) => updateSetting("incOpps", v);
  const setIncRatios = (v) => updateSetting("incRatios", v);
  const setIncSources = (v) => updateSetting("incSources", v);

  const setMktNSE = (v) => updateSetting("mktNSE", v);
  const setMktBSE = (v) => updateSetting("mktBSE", v);
  const setMktNASDAQ = (v) => updateSetting("mktNASDAQ", v);
  const setMktNYSE = (v) => updateSetting("mktNYSE", v);
  const setSecIT = (v) => updateSetting("secIT", v);
  const setSecBanking = (v) => updateSetting("secBanking", v);
  const setSecPharma = (v) => updateSetting("secPharma", v);
  const setSecEnergy = (v) => updateSetting("secEnergy", v);
  const setSecAuto = (v) => updateSetting("secAuto", v);
  const setSecFMCG = (v) => updateSetting("secFMCG", v);
  const setTimeframe = (v) => updateSetting("timeframe", v);

  const setTwoFA = (v) => updateSetting("twoFA", v);
  const setExportFmt = (v) => updateSetting("exportFmt", v);
  const setAutoSave = (v) => updateSetting("autoSave", v);

  const [showPwForm, setShowPwForm] = useState(false);

  // API Keys
  const [showKeys, setShowKeys] = useState(false);
  const [keyValidating, setKeyValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);

  const [savedMsg, setSavedMsg] = useState("");
  const [activeActivityTab, setActiveActivityTab] = useState("Recent Searches");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = () => {
    setSavedMsg("✅ All settings saved successfully!");
    setTimeout(() => setSavedMsg(""), 3500);
  };

  const validateKeys = () => {
    setKeyValidating(true);
    setKeyStatus(null);
    setTimeout(() => {
      setKeyValidating(false);
      setKeyStatus("success");
    }, 2000);
  };

  const Checkbox = ({ checked, onChange, label }) => (
    <label className="s-checkbox">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="s-checkmark">{checked ? "☑" : "☐"}</span>
      <span>{label}</span>
    </label>
  );

  const Toggle = ({ checked, onChange }) => (
    <button className={`s-toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
      <div className="s-toggle-knob" />
    </button>
  );

  const Radio = ({ name, value, current, onChange, label }) => (
    <label className={`s-radio ${current === value ? "active" : ""}`} onClick={() => onChange(value)}>
      <span className="s-radio-dot">{current === value ? "●" : "○"}</span>
      {label}
    </label>
  );

  const SectionTitle = ({ icon, title, id, badge }) => (
    <div className="s-section-title" id={`section-${id}`}>
      <span>{icon} {title}</span>
      {badge && <span className="s-badge">{badge}</span>}
    </div>
  );

  return (
    <div className="settings-page page-container">
      {/* Header */}
      <div className="s-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences, and AI configuration.</p>
        </div>
        <div className="s-header-actions">
          {savedMsg && <span className="s-saved-flash">{savedMsg}</span>}
          <button className="s-save-btn" onClick={save}>Save Changes</button>
        </div>
      </div>

      <div className="s-layout">
        {/* Sidebar Nav */}
        <nav className="s-nav">
          {NAV_SECTIONS.map(s => (
            <button
              key={s.id}
              className={`s-nav-item ${active === s.id ? "active" : ""}`}
              onClick={() => scrollTo(s.id)}
            >
              <span className="s-nav-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Panels */}
        <div className="s-panels">

          {/* ── 1. PROFILE ─────────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="👤" title="Profile" id="profile" />
            <div className="s-profile-row">
              <div className="s-avatar-wrap">
                <div
                  className="s-avatar"
                  style={{ backgroundImage: avatar ? `url(${avatar})` : undefined }}
                >
                  {!avatar && <span>AM</span>}
                </div>
                <button className="s-avatar-btn" onClick={() => fileRef.current?.click()}>
                  Change Photo
                </button>
                <input
                  ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) setAvatar(URL.createObjectURL(f));
                  }}
                />
              </div>
              <div className="s-profile-fields">
                <div className="s-field-row">
                  <div className="s-field">
                    <label>Full Name</label>
                    <input className="s-input" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="s-field">
                    <label>Username</label>
                    <div className="s-input-prefix-wrap">
                      <span className="s-input-prefix">@</span>
                      <input className="s-input prefixed" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="s-field-row">
                  <div className="s-field">
                    <label>Email Address</label>
                    <input className="s-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="s-field">
                    <label>Phone Number</label>
                    <input className="s-input" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="s-field-row">
                  <div className="s-field">
                    <label>Country</label>
                    <select className="s-select" value={country} onChange={e => setCountry(e.target.value)}>
                      {["India","United States","United Kingdom","Singapore","Canada","Australia","Germany","Japan"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="s-field">
                    <label>Timezone</label>
                    <select className="s-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                      {["Asia/Kolkata (IST +5:30)","America/New_York (EST -5:00)","Europe/London (GMT +0:00)","Asia/Tokyo (JST +9:00)","America/Los_Angeles (PST -8:00)"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="s-field" style={{ maxWidth: 280 }}>
                  <label>Default Currency</label>
                  <select className="s-select" value={profileCurrency} onChange={e => setProfileCurrency(e.target.value)}>
                    {["INR","USD","EUR","GBP","JPY","SGD"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. APPEARANCE ──────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="🎨" title="Appearance" id="appearance" />

            <div className="s-group">
              <div className="s-group-label">Theme</div>
              <div className="s-radio-row">
                {[["dark","🌙 Dark"],["light","☀️ Light"],["system","💻 System"]].map(([v,l]) => (
                  <Radio key={v} name="theme" value={v} current={themeMode} onChange={setThemeMode} label={l} />
                ))}
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Accent Color</div>
              <div className="s-accent-row">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.id}
                    className={`s-accent-swatch ${accent === c.id ? "active" : ""}`}
                    style={{ "--ac": c.color }}
                    onClick={() => setAccent(c.id)}
                    title={c.label}
                  >
                    <div className="s-accent-circle" />
                    <span>{c.label}</span>
                    {accent === c.id && <span className="s-accent-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Font Size</div>
              <div className="s-radio-row">
                {[["small","Small"],["medium","Medium"],["large","Large"]].map(([v,l]) => (
                  <Radio key={v} name="fontsize" value={v} current={fontSize} onChange={setFontSize} label={l} />
                ))}
              </div>
            </div>
          </div>

          {/* ── 3. PREFERENCES ─────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="🌍" title="Preferences" id="preferences" />

            <div className="s-group">
              <div className="s-group-label">Default Currency</div>
              <div className="s-chip-row">
                {[["INR","₹ INR"],["USD","$ USD"],["EUR","€ EUR"],["GBP","£ GBP"]].map(([v,l]) => (
                  <button key={v} className={`s-chip ${defCurrency===v?"active":""}`} onClick={() => setDefCurrency(v)}>{l}</button>
                ))}
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Default Exchange</div>
              <div className="s-chip-row">
                {["NSE","BSE","NASDAQ","NYSE"].map(v => (
                  <button key={v} className={`s-chip ${defExchange===v?"active":""}`} onClick={() => setDefExchange(v)}>{v}</button>
                ))}
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Language</div>
              <div className="s-chip-row">
                {["English","Hindi","Japanese","Spanish","French"].map(v => (
                  <button key={v} className={`s-chip ${language===v?"active":""}`} onClick={() => setLanguage(v)}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 4. NOTIFICATIONS ───────────────────── */}
          <div className="s-card">
            <SectionTitle icon="🔔" title="Notifications" id="notifications" />

            <div className="s-notif-block">
              <div className="s-notif-row">
                <div className="s-notif-info">
                  <div className="s-notif-title">Price Alerts</div>
                  <div className="s-notif-desc">Get notified when a stock hits your target price</div>
                </div>
                <div className="s-notif-channels">
                  <Checkbox checked={priceEmail} onChange={setPriceEmail} label="Email" />
                  <Checkbox checked={pricePush} onChange={setPricePush} label="Push" />
                  <Checkbox checked={priceSms} onChange={setPriceSms} label="SMS" />
                </div>
              </div>
              {[
                ["News Alerts",     "Breaking financial news for your watchlist",    newsAlerts,    setNewsAlerts],
                ["Earnings Alerts", "Reminder before earnings releases",              earningsAlerts,setEarnings],
                ["Dividend Alerts", "Notify on dividend announcements",               dividendAlerts,setDividend],
                ["IPO Alerts",      "Get notified about upcoming IPOs",               ipoAlerts,     setIpo],
              ].map(([title, desc, val, setter]) => (
                <div key={title} className="s-notif-row">
                  <div className="s-notif-info">
                    <div className="s-notif-title">{title}</div>
                    <div className="s-notif-desc">{desc}</div>
                  </div>
                  <Toggle checked={val} onChange={setter} />
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. AI PREFERENCES ──────────────────── */}
          <div className="s-card s-card-highlight">
            <SectionTitle icon="🤖" title="AI Preferences" id="ai" badge="⭐ Unique to StockGPT" />

            <div className="s-ai-grid">
              <div className="s-group">
                <div className="s-group-label">AI Model</div>
                <div className="s-radio-col">
                  {[["gpt4","GPT-4o"],["llama3","LLaMA 3.3 70B"],["gemini","Gemini 1.5 Pro"]].map(([v,l]) => (
                    <Radio key={v} name="aimodel" value={v} current={aiModel} onChange={setAiModel} label={l} />
                  ))}
                </div>
              </div>

              <div className="s-group">
                <div className="s-group-label">Response Style</div>
                <div className="s-radio-col">
                  {[["beginner","🎓 Beginner"],["investor","💼 Investor"],["analyst","📊 Professional Analyst"]].map(([v,l]) => (
                    <Radio key={v} name="style" value={v} current={responseStyle} onChange={setResStyle} label={l} />
                  ))}
                </div>
              </div>

              <div className="s-group">
                <div className="s-group-label">Response Length</div>
                <div className="s-radio-col">
                  {[["short","⚡ Short"],["medium","📄 Medium"],["detailed","📚 Detailed"]].map(([v,l]) => (
                    <Radio key={v} name="len" value={v} current={responseLen} onChange={setResLen} label={l} />
                  ))}
                </div>
              </div>
            </div>

            <div className="s-field-row" style={{ marginTop: 4 }}>
              <div className="s-group">
                <div className="s-group-label">Preferred Output Format</div>
                <div className="s-checkbox-col">
                  <Checkbox checked={outBullets}  onChange={setOutBullets}  label="Bullet Points" />
                  <Checkbox checked={outTables}   onChange={setOutTables}   label="Tables" />
                  <Checkbox checked={outCharts}   onChange={setOutCharts}   label="Charts" />
                  <Checkbox checked={outMarkdown} onChange={setOutMarkdown} label="Markdown" />
                </div>
              </div>
              <div className="s-group">
                <div className="s-group-label">Always Include in Reports</div>
                <div className="s-checkbox-col">
                  <Checkbox checked={incRisks}   onChange={setIncRisks}   label="Risk Factors" />
                  <Checkbox checked={incOpps}    onChange={setIncOpps}    label="Opportunities" />
                  <Checkbox checked={incRatios}  onChange={setIncRatios}  label="Financial Ratios" />
                  <Checkbox checked={incSources} onChange={setIncSources} label="Sources & Citations" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. MARKET PREFERENCES ──────────────── */}
          <div className="s-card">
            <SectionTitle icon="📈" title="Market Preferences" id="market" />

            <div className="s-group">
              <div className="s-group-label">Default Markets</div>
              <div className="s-checkbox-row">
                <Checkbox checked={mktNSE}    onChange={setMktNSE}    label="NSE" />
                <Checkbox checked={mktBSE}    onChange={setMktBSE}    label="BSE" />
                <Checkbox checked={mktNASDAQ} onChange={setMktNASDAQ} label="NASDAQ" />
                <Checkbox checked={mktNYSE}   onChange={setMktNYSE}   label="NYSE" />
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Favorite Sectors</div>
              <div className="s-checkbox-row wrap">
                <Checkbox checked={secIT}      onChange={setSecIT}      label="IT" />
                <Checkbox checked={secBanking} onChange={setSecBanking} label="Banking" />
                <Checkbox checked={secPharma}  onChange={setSecPharma}  label="Pharma" />
                <Checkbox checked={secEnergy}  onChange={setSecEnergy}  label="Energy" />
                <Checkbox checked={secAuto}    onChange={setSecAuto}    label="Auto" />
                <Checkbox checked={secFMCG}    onChange={setSecFMCG}    label="FMCG" />
              </div>
            </div>

            <div className="s-group">
              <div className="s-group-label">Default Chart Timeframe</div>
              <div className="s-chip-row">
                {["1D","1W","1M","6M","1Y","5Y"].map(v => (
                  <button key={v} className={`s-chip ${timeframe===v?"active":""}`} onClick={() => setTimeframe(v)}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 7. SECURITY ────────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="🔐" title="Security" id="security" />

            <div className="s-notif-row">
              <div className="s-notif-info">
                <div className="s-notif-title">Two-Factor Authentication</div>
                <div className="s-notif-desc">Protect your account with an additional verification step</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {twoFA && <span style={{ fontSize: 11, color: "var(--emerald)" }}>Enabled</span>}
                <Toggle checked={twoFA} onChange={setTwoFA} />
              </div>
            </div>

            <div className="s-sec-grid">
              <button className="s-sec-btn" onClick={() => setShowPwForm(v => !v)}>
                <span className="s-sec-icon">🔒</span>
                <div>
                  <div className="s-sec-label">Change Password</div>
                  <div className="s-sec-desc">Update your login password</div>
                </div>
              </button>
              <button className="s-sec-btn" onClick={() => { alert("Login history viewed."); }}>
                <span className="s-sec-icon">📋</span>
                <div>
                  <div className="s-sec-label">Login History</div>
                  <div className="s-sec-desc">View past login activity</div>
                </div>
              </button>
              <button className="s-sec-btn" onClick={() => { alert("Managed devices opened."); }}>
                <span className="s-sec-icon">📱</span>
                <div>
                  <div className="s-sec-label">Active Devices</div>
                  <div className="s-sec-desc">Manage logged-in devices</div>
                </div>
              </button>
              <button className="s-sec-btn warn" onClick={() => {
                if (window.confirm("Are you sure you want to log out from all other devices?")) {
                  setSavedMsg("Logged out everywhere.");
                  setTimeout(() => setSavedMsg(""), 3000);
                }
              }}>
                <span className="s-sec-icon">🚪</span>
                <div>
                  <div className="s-sec-label">Sign Out Everywhere</div>
                  <div className="s-sec-desc">Log out of all active sessions</div>
                </div>
              </button>
            </div>

            {showPwForm && (
              <div className="s-pw-form">
                <div className="s-field"><label>Current Password</label><input className="s-input" type="password" placeholder="••••••••" /></div>
                <div className="s-field"><label>New Password</label><input className="s-input" type="password" placeholder="••••••••" /></div>
                <div className="s-field"><label>Confirm New Password</label><input className="s-input" type="password" placeholder="••••••••" /></div>
                <button className="s-save-btn" style={{ alignSelf: "flex-start" }} onClick={() => { setShowPwForm(false); setSavedMsg("Password updated"); setTimeout(() => setSavedMsg(""), 3000); }}>Update Password</button>
              </div>
            )}

            <div className="s-danger-zone">
              <div className="s-danger-title">⚠️ Danger Zone</div>
              <button className="s-danger-btn" onClick={() => {
                if (window.confirm("WARNING: This will permanently delete your account and all saved data. Proceed?")) {
                  setSavedMsg("Account deletion initiated (Mock).");
                  setTimeout(() => setSavedMsg(""), 3000);
                }
              }}>Delete Account</button>
            </div>
          </div>

          {/* ── 8. DATA SOURCES ────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="📊" title="Data Sources" id="datasources" />

            {[
              { cat: "Stock Data",            sources: ["Finnhub","Yahoo Finance","Alpha Vantage"] },
              { cat: "Financial Statements",  sources: ["Financial Modeling Prep"] },
              { cat: "News",                  sources: ["Finnhub News","NewsAPI"] },
            ].map(g => (
              <div key={g.cat} className="s-datasource-group">
                <div className="s-group-label">{g.cat}</div>
                <div className="s-source-list">
                  {g.sources.map(s => (
                    <div key={s} className="s-source-row">
                      <span className="s-source-dot">🟢</span>
                      <span className="s-source-name">{s}</span>
                      <span className="s-source-status">Connected</span>
                      <span className="s-source-sync">Last sync: 5 mins ago</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── 9. EXPORT ──────────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="📄" title="Export" id="export" />

            <div className="s-group">
              <div className="s-group-label">Default Export Format</div>
              <div className="s-chip-row">
                {["PDF","CSV","Markdown","Word"].map(v => (
                  <button key={v} className={`s-chip ${exportFmt===v?"active":""}`} onClick={() => setExportFmt(v)}>{v}</button>
                ))}
              </div>
            </div>

            <div className="s-notif-row">
              <div className="s-notif-info">
                <div className="s-notif-title">Auto-Save Reports</div>
                <div className="s-notif-desc">Automatically save generated AI reports to your history</div>
              </div>
              <Toggle checked={autoSave} onChange={setAutoSave} />
            </div>

            <button className="s-outline-btn">📥 Download History</button>
          </div>

          {/* ── 10. API KEYS ───────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="🔑" title="API Keys" id="apikeys" badge="Developer Mode" />
            <p className="s-desc">Use your own API keys for increased rate limits and privacy. Keys are stored locally in your <code>.env</code> file.</p>

            {[
              { label: "OpenAI API Key",    placeholder: "sk-proj-••••••••••••••••••••••••" },
              { label: "Groq API Key",      placeholder: "gsk_••••••••••••••••••••••••" },
              { label: "Finnhub API Key",   placeholder: "d9••••••••••••••" },
              { label: "Alpha Vantage Key", placeholder: "••••••••••••••••" },
            ].map(k => (
              <div key={k.label} className="s-field">
                <label>{k.label}</label>
                <div className="s-apikey-row">
                  <input
                    className="s-input mono"
                    type={showKeys ? "text" : "password"}
                    defaultValue={k.placeholder}
                  />
                  <span className={`s-apikey-status ${keyStatus === "success" ? "ok" : ""}`}>
                    {keyStatus === "success" ? "✓ Valid" : "●"}
                  </span>
                </div>
              </div>
            ))}

            <div className="s-apikey-actions">
              <button className="s-link-btn" onClick={() => setShowKeys(v => !v)}>
                {showKeys ? "🙈 Hide Keys" : "👁 Reveal Keys"}
              </button>
              <button className="s-validate-btn" onClick={validateKeys} disabled={keyValidating}>
                {keyValidating ? <><span className="spinner-small" />Validating…</> : "⚡ Validate All Keys"}
              </button>
            </div>
          </div>

          {/* ── 11. ACTIVITY ───────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="📜" title="Activity" id="activity" />

            <div className="s-activity-tabs">
              {["Recent Searches","Saved Reports","Login History","Export History","AI Usage"].map(t => (
                <button 
                  key={t} 
                  className={`s-activity-tab ${activeActivityTab === t ? "active" : ""}`}
                  style={{
                    backgroundColor: activeActivityTab === t ? "var(--surfaceElevated)" : "var(--surface)",
                    borderColor: activeActivityTab === t ? "var(--borderBright)" : "var(--border)",
                    color: activeActivityTab === t ? "var(--text)" : "var(--textDim)"
                  }}
                  onClick={() => setActiveActivityTab(t)}
                >{t}</button>
              ))}
            </div>

            {activeActivityTab === "Recent Searches" && (
              <div className="s-group" style={{ marginTop: 10 }}>
                <div className="s-group-label">Recent Searches</div>
                <div className="s-search-history">
                  {recentSearches.length === 0 ? (
                    <div className="s-desc">No recent searches.</div>
                  ) : (
                    recentSearches.map((r, i) => (
                      <div key={i} className="s-search-item">
                        <span className="s-search-icon">🔍</span>
                        <span className="s-search-q">{r.q}</span>
                        <span className="s-search-time">{r.time}</span>
                        <button className="s-search-del" onClick={() => {
                          setRecentSearches(recentSearches.filter((_, idx) => idx !== i));
                        }}>✕</button>
                      </div>
                    ))
                  )}
                </div>
                {recentSearches.length > 0 && (
                  <button className="s-link-btn" style={{ marginTop: 10 }} onClick={() => setRecentSearches([])}>
                    Clear Search History
                  </button>
                )}
              </div>
            )}
            
            {activeActivityTab !== "Recent Searches" && (
              <div className="s-group" style={{ marginTop: 10 }}>
                <div className="s-desc">Nothing to show for {activeActivityTab} yet.</div>
              </div>
            )}
          </div>

          {/* ── 12. ABOUT ──────────────────────────── */}
          <div className="s-card">
            <SectionTitle icon="ℹ️" title="About" id="about" />

            <div className="s-about-grid">
              {[
                ["Version",    "v2.0.0"],
                ["AI Model",   "LLaMA 3.3 70B"],
                ["Backend",    "FastAPI + LangGraph"],
                ["Database",   "PostgreSQL (Neon)"],
                ["Vector DB",  "FAISS"],
                ["License",    "MIT"],
                ["Frontend",   "React 18 + Vite"],
                ["Data",       "Finnhub + Yahoo Finance"],
              ].map(([k,v]) => (
                <div key={k} className="s-about-card">
                  <div className="s-about-label">{k}</div>
                  <div className="s-about-val">{v}</div>
                </div>
              ))}
            </div>

            <div className="s-stack-chips">
              {["React 18","Vite 8","FastAPI","LangGraph","LangChain","FAISS","SQLAlchemy","Groq API","yfinance","Finnhub","PostgreSQL","Sentence Transformers"].map(t => (
                <span key={t} className="s-stack-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Save Bar */}
          <div className="s-save-bar">
            {savedMsg && <span className="s-saved-flash">{savedMsg}</span>}
            <button className="s-reset-btn" onClick={() => { setSavedMsg("Reset to defaults."); setTimeout(() => setSavedMsg(""), 2500); }}>
              Reset to Defaults
            </button>
            <button className="s-save-btn" onClick={save}>Save All Changes</button>
          </div>

        </div>
      </div>
    </div>
  );
}
