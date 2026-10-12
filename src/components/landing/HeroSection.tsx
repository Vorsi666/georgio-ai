import type { PageId } from "../../lib/pages";

/**
 * Hero — Violet Glass: label kecil abu-abu, headline hitam ekstra-tebal
 * dengan aksen ungu, panel kaca di atas gradasi ungu.
 */
export default function HeroSection({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <section className="violet-wash relative w-full overflow-hidden px-margin py-space-xl rounded-[28px] border border-white/60 shadow-lg">
      <div className="violet-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-tertiary-container/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-space-xl items-center justify-between">
        <div className="w-full lg:w-7/12 flex flex-col items-start space-y-space-md">
          <span className="font-label-md text-label-md uppercase tracking-[0.22em] text-on-surface-variant/70">
            Design Resources
          </span>

          <h1 className="display-tight font-headline-xl text-headline-xl text-on-surface max-w-2xl">
            Asisten AI Cerdas
            <br />
            yang <span className="text-primary">Berpikir✦</span>
          </h1>
          <p className="font-label-lg text-label-lg uppercase tracking-[0.18em] text-primary">
            Follow for more
          </p>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Orkestrasi multi-agen otonom untuk sintesis riset mendalam, penulisan kode instan, arsitektur
            UI/UX berstandar tinggi, hingga otomasi pipeline data tanpa hambatan kognitif.
          </p>

          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <button
              type="button"
              onClick={() => onNavigate("chat-workspace")}
              className="inline-flex items-center gap-space-sm px-space-lg py-3 rounded-full bg-on-surface text-surface-container-lowest font-label-lg text-label-lg shadow-md hover:bg-primary transition-all transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-xl leading-none">bolt</span>
              <span>Mulai Percakapan Baru</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("agent-capabilities")}
              className="glass inline-flex items-center gap-space-sm px-space-lg py-3 rounded-full text-on-surface font-label-lg text-label-lg shadow-sm hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-xl text-primary">schema</span>
              <span>Jelajahi Kapabilitas Agent</span>
            </button>
          </div>

          <div className="flex items-center gap-space-lg pt-space-sm text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-primary">✦</span>
              <span>LATENCY: 12ms</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-tertiary">★</span>
              <span>TOKEN EFFICIENCY: 99.4%</span>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ZERO HUMAN OVERHEAD</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-5/12 flex justify-center lg:justify-end">
          <GlassPanel />
        </div>
      </div>
    </section>
  );
}

/** Panel kaca ungu — kartu chat mini + bar metrik ala referensi. */
function GlassPanel() {
  return (
    <div className="glass relative w-full max-w-md rounded-[28px] p-5 shadow-xl overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-primary/30 to-tertiary-container/40 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-14 h-56 w-56 rounded-full bg-secondary-fixed/50 blur-2xl" />

      <div className="flex items-center justify-between pb-4 relative z-10">
        <span className="rounded-full border border-primary/25 bg-white/70 px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-primary backdrop-blur-md">
          Georgio Core v2.4
        </span>
        <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="rounded-2xl bg-white/80 p-4 shadow-sm space-y-3 relative z-10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-tertiary-container text-white">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm leading-tight text-on-surface">
                Georgio Orchestrator
              </div>
              <div className="font-label-sm text-label-sm text-secondary">Autonomous Mode Ready</div>
            </div>
          </div>
          <span className="rounded bg-primary/10 px-2 py-1 font-label-sm text-label-sm font-semibold text-primary">
            99.4% OPT
          </span>
        </div>

        <div className="space-y-1 rounded-xl bg-surface-container-low/80 p-3 font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">›</span>
            <span className="font-medium text-on-surface">Pipeline Initialized:</span>
            <span>4 nodes synced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">›</span>
            <span>Context depth:</span>
            <span className="font-semibold text-primary">16,384 tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">›</span>
            <span className="font-semibold text-emerald-600">Stream verified (12ms)</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="mb-1 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>Inference Throughput</span>
            <span className="font-semibold text-primary">3.84x Base</span>
          </div>
          <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
            <polyline
              points="0,20 15,16 30,18 45,10 60,13 75,6 90,9 105,4 120,8 135,3 150,6 165,2 180,5 200,1"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant relative z-10">
        <span className="uppercase tracking-wider">Design Resources</span>
        <span>2025 July</span>
      </div>
    </div>
  );
}
