export default function PlaceholderPage({ title }) {
  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <h1>{title}</h1>
      <p style={{ color: 'var(--textDim)', marginTop: '8px' }}>This page is coming in Phase 2 or Phase 3.</p>
      
      <div style={{ marginTop: '24px', background: 'var(--surfaceElevated)', padding: '24px', borderRadius: '12px' }}>
        <p>Stay tuned for updates.</p>
      </div>
    </div>
  );
}
