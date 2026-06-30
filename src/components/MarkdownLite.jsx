export default function MarkdownLite({ text }) {
  const lines = text.split("\n");
  return (
    <div className="md-content">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="md-h2">{line.slice(3)}</h3>;
        if (line.startsWith("### ")) return <h4 key={i} className="md-h3">{line.slice(4)}</h4>;
        if (line.startsWith("> ")) return <blockquote key={i} className="md-blockquote">{line.slice(2)}</blockquote>;
        if (line.startsWith("---")) return <hr key={i} className="md-hr" />;
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="md-list-item">
              <span className="md-bullet">›</span>
              <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>').replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>') }} />
            </div>
          );
        }
        if (line.startsWith("| ")) {
          const cells = line.split("|").filter((c) => c.trim());
          const isSep = line.includes("---");
          if (isSep) return null;
          const prevLine = i > 0 ? lines[i - 1] : "";
          const nextLine = i < lines.length - 1 ? lines[i + 1] : "";
          const isHeader = nextLine?.includes("|---") || prevLine?.includes("|---");
          return (
            <div key={i} className={`md-table-row ${isHeader ? "md-table-header" : ""}`}>
              {cells.map((cell, j) => <div key={j} className="md-table-cell">{cell.trim()}</div>)}
            </div>
          );
        }
        if (!line.trim()) return <div key={i} className="md-spacer" />;
        const rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>').replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>');
        return <div key={i} className="md-text" dangerouslySetInnerHTML={{ __html: rendered }} />;
      })}
    </div>
  );
}
