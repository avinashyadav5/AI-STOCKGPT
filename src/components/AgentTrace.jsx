import { AGENT_PIPELINE, SPINNER } from "../data/stocks";

export default function AgentTrace({ active, done }) {
  return (
    <div className="agent-trace">
      {AGENT_PIPELINE.map((agent, i) => {
        const isDone = done > i;
        const isActive = active === i;
        return (
          <div
            key={agent.id}
            className={`agent-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            style={{ "--agent-color": agent.color, animationDelay: `${i * 0.06}s` }}
          >
            <div className="agent-icon-wrap">
              <span className="agent-icon">{agent.icon}</span>
              {isActive && <span className="agent-pulse-ring" />}
            </div>
            <div className="agent-info">
              <div className="agent-label">{agent.label}</div>
              {isActive && <div className="agent-desc">{agent.desc}</div>}
              {isDone && <div className="agent-timing">{(0.8 + Math.random() * 0.6).toFixed(1)}s</div>}
            </div>
            <div className="agent-status">
              {isDone && <span className="agent-check">✓</span>}
              {isActive && <span className="agent-spinner">{SPINNER[Math.floor(Date.now() / 120) % 8]}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
