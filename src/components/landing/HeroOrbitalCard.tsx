/**
 * Hero orbital card — ported from `desain Georgio agent/Halaman.html`
 * ("Right Column: Stylized Agent Hero Node / Orbital Art Card").
 * Concentric vinyl rings + terminal thought-stream + live sparkline.
 */
export default function HeroOrbitalCard() {
  return (
    <div className="w-full lg:w-5/12 flex justify-center lg:justify-end">
      <div className="relative w-full max-w-md bg-gradient-to-b from-primary to-primary-container p-6 rounded-3xl text-on-primary shadow-xl overflow-hidden">
        {/* Decorative concentric orbit rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-52 h-52 rounded-full border border-white/15 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-white/25 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Koi motif accent */}
        <div className="pointer-events-none absolute top-10 right-14 flex items-center gap-1 opacity-90">
          <span className="text-tertiary-fixed font-label-lg text-label-lg">* 01/</span>
          <span className="material-symbols-outlined text-tertiary-fixed text-sm">filter_vintage</span>
        </div>

        {/* Card header */}
        <div className="flex items-center justify-between pb-space-lg relative z-10">
          <div className="flex items-center gap-space-xs">
            <span className="px-space-sm py-0.5 rounded-full bg-white/20 font-label-sm text-label-sm uppercase tracking-wider backdrop-blur-md">
              Georgio Core v2.4
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-label-md text-label-md text-primary-fixed">AGENTIC GRAPH #882</span>
        </div>

        {/* Floating agent visual */}
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

          {/* Terminal thought stream */}
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

          {/* Live sparkline */}
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
    </div>
  );
}