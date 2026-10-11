/**
 * Metrics & trust band — ported from `desain Georgio agent/Halaman.html`
 * ("Metrics & Trust Band"). Static figures mirroring the design.
 */
const METRICS = [
  { label: "TOTAL INGESTION", value: "50M+", note: "Tokens Diproses", accent: "primary" },
  { label: "SLA DEPENDABILITY", value: "99.98%", note: "Uptime Target", accent: "on-surface" },
  { label: "TOOL ECOSYSTEM", value: "150+", note: "API Integrasi", accent: "primary" },
  { label: "MEAN REACTION SPEED", value: "<12ms", note: "Ultra-low Latency", accent: "on-surface" },
] as const;

export default function MetricsBand() {
  return (
    <section className="w-full bg-surface-container-lowest shadow-sm py-space-lg px-margin rounded-xl">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-space-md items-center">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col p-space-sm">
            <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider">{m.label}</span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span
                className={`font-headline-lg text-headline-lg font-bold ${
                  m.accent === "primary" ? "text-primary" : "text-on-surface"
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