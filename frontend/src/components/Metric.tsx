type MetricProps = { label: string; value: string | number };

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </div>
  );
}
