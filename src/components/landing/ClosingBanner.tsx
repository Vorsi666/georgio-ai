/**
 * Closing banner + footer — ungu pekat ke muda ala referensi,
 * headline putih ekstra-tebal.
 */
import type { PageId } from "../../lib/pages";

export function ClosingBanner({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <section className="relative w-full overflow-hidden py-space-xl px-margin text-white rounded-[28px] bg-gradient-to-br from-[#2e1065] via-[#7c3aed] to-[#c4b5fd] shadow-lg">
      <div className="violet-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:none] [&]:bg-[length:36px_36px]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg relative z-10">
        <div className="max-w-xl space-y-space-xs">
          <div className="font-label-md text-label-md uppercase tracking-[0.22em] text-white/70 font-semibold">
            Siap melangkah lebih jauh
          </div>
          <h3 className="display-tight font-headline-lg text-headline-lg font-extrabold leading-tight">
            Tingkatkan produktivitas tim dengan Georgio.
          </h3>
          <p className="font-body-md text-body-md text-white/80">
            Mulai dalam hitungan detik. Tanpa konfigurasi server yang rumit. Hubungkan data internal Anda
            secara aman.
          </p>
        </div>
        <div className="flex items-center gap-space-md">
          <button
            type="button"
            onClick={() => onNavigate("chat-workspace")}
            className="rounded-full bg-white px-space-xl py-3.5 font-label-lg text-label-lg text-[#5b21b6] shadow-lg hover:scale-105 transition-transform"
          >
            Coba Sekarang Gratis
          </button>
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-8 flex max-w-7xl items-center justify-between font-label-sm text-label-sm text-white/70">
        <span className="uppercase tracking-wider">Design Resources</span>
        <span>2025 July</span>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="w-full">
      <div className="w-full px-margin py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">
            © 2025 Georgio Autonomous Systems. Crafted for high-fidelity agentic orchestration.
          </span>
        </div>
        <div className="flex items-center gap-space-lg">
          <span className="font-label-md text-label-md text-on-surface-variant">Telemetry &amp; Privacy</span>
          <span className="font-label-md text-label-md text-on-surface-variant">API Architecture</span>
          <span className="font-label-md text-label-md text-primary flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            System Status: Optimal
          </span>
        </div>
      </div>
    </footer>
  );
}
