/**
 * Metrics band — kartu kaca di atas wash ungu, angka hitam + aksen ungu.
 */
const METRICS = [
  { label: "Total Ingestion", value: "50M+", note: "Tokens Diproses", accent: true },
  { label: "SLA Dependability", value: "99.98%", note: "Uptime Target", accent: false },
  { label: "Tool Ecosystem", value: "150+", note: "API Integrasi", accent: true },
  { label: "Mean Reaction Speed", value: "<12ms", note: "Ultra-low Latency", accent: false },
] as const;

export default function MetricsBand() {
  return (
    <section className="glass w-full py-space-lg px-margin rounded-[28px] shadow-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-space-md items-center">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col p-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-[0.18em]">{m.label}</span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span
                className={`font-headline-lg text-headline-lg font-extrabold display-tight ${
                  m.accent ? "text-primary" : "text-on-surface"
                }`}
              >
                {m.value}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{m.note}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
