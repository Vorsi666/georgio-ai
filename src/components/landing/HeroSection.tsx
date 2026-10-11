import type { PageId } from "../../lib/pages";

/**
 * Hero section — ported from `desain Georgio agent/Halaman.html`
 * ("Top Ambient Canvas & Hero Banner" + "Left Column").
 */
export default function HeroSection({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-surface-container-low px-margin py-space-xl rounded-xl">
      <div className="pointer-events-none absolute -right-24 -top-32 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-primary-fixed/40 via-surface-container/60 to-transparent blur-3xl opacity-80" />
      <div className="pointer-events-none absolute right-1/4 top-1/2 w-96 h-96 rounded-full bg-secondary-container/30 blur-2xl" />

      <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-space-xl items-center justify-between">
        <div className="w-full lg:w-7/12 flex flex-col items-start space-y-space-md">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-md text-label-md text-primary font-semibold tracking-wide">
              ✨ Multi-Agent Intelligence Engine 2024–2025
            </span>
            <span className="text-tertiary font-label-md text-label-md ml-1">*v2.4</span>
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight max-w-2xl">
            Asisten AI Cerdas yang <span className="text-primary italic">Berpikir</span>, Merancang, dan
            Menuntaskan Pekerjaan Anda.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Orkestrasi multi-agen otonom untuk sintesis riset mendalam, penulisan kode instan, arsitektur
            UI/UX berstandar tinggi, hingga otomasi pipeline data tanpa hambatan kognitif.
          </p>

          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <button
              type="button"
              onClick={() => onNavigate("chat-workspace")}
              className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-xl leading-none">bolt</span>
              <span>Mulai Percakapan Baru</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("agent-capabilities")}
              className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-xl text-secondary">schema</span>
              <span>Jelajahi Kapabilitas Agent</span>
            </button>
          </div>

          <div className="flex items-center gap-space-lg pt-space-sm text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-primary">*</span>
              <span>LATENCY: 12ms</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-tertiary">★</span>
              <span>TOKEN EFFICIENCY: 99.4%</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ZERO HUMAN OVERHEAD</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-5/12 flex justify-center lg:justify-end">
          <OrbitalArt />
        </div>
      </div>
    </section>
  );
}

/** Inline orbital art — the decorative half of the hero card. */
function OrbitalArt() {
  return (
    <div className="relative w-full max-w-md bg-gradient-to-b from-primary to-primary-container p-6 rounded-3xl text-on-primary shadow-xl overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/20 flex items-center justify-center">
        <div className="w-52 h-52 rounded-full border border-white/15 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-white/25 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-10 right-14 flex items-center gap-1 opacity-90">
        <span className="text-tertiary-fixed font-label-lg text-label-lg">* 01/</span>
        <span className="material-symbols-outlined text-tertiary-fixed text-sm">filter_vintage</span>
      </div>

      <div className="flex items-center justify-between pb-space-lg relative z-10">
        <div className="flex items-center gap-space-xs">
          <span className="px-space-sm py-0.5 rounded-full bg-white/20 font-label-sm text-label-sm uppercase tracking-wider backdrop-blur-md">
            Georgio Core v2.4
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="font-label-md text-label-md text-primary-fixed">AGENTIC GRAPH #882</span>
      </div>

      <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-space-md shadow-md space-y-space-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm leading-tight text-on-surface">
                Georgio Orchestrator
              </div>
              <div className="font-label-sm text-label-sm text-secondary">Status: Autonomous Mode Ready</div>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-secondary-container/60 text-on-secondary-container font-label-sm text-label-sm font-semibold">
            99.4% OPT
          </span>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-low font-label-sm text-label-sm space-y-1 text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">›</span>
            <span className="text-on-surface font-medium">Pipeline Initialized:</span>
            <span className="text-secondary">4 specialized nodes synced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">›</span>
            <span>Context vector depth:</span>
            <span className="font-label-sm text-primary font-semibold">16,384 tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">›</span>
            <span className="text-emerald-600 font-semibold">Execution: Active stream verified (12ms)</span>
          </div>
        </div>

        <div className="pt-space-xs">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1">
            <span>Inference Throughput</span>
            <span className="text-primary font-semibold">3.84x Base Model</span>
          </div>
          <div className="w-full h-8 bg-surface-container rounded-lg overflow-hidden flex items-end px-1 pt-1">
            <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="w-full h-full" aria-hidden>
              <polyline
                points="0,20 15,16 30,18 45,10 60,13 75,6 90,9 105,4 120,8 135,3 150,6 165,2 180,5 200,1"
                fill="none"
                stroke="#0048cc"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-white/80 font-label-sm text-label-sm relative z-10">
        <span>© 2024-2025 GEORGIO DESIGN SYSTEMS</span>
        <span>AUTO-SYNC ENABLED</span>
      </div>
    </div>
  );
}