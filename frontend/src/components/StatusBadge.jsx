export function StatusBadge({ status }) {
  const className = String(status || '').toLowerCase().replace(/\s+/g, '-');
  return <span className={`status status-${className}`}>{status}</span>;
}
