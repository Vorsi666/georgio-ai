/**
 * Editorial closing banner + footer — ported from
 * `desain Georgio agent/Halaman.html`.
 */
import type { PageId } from "../../lib/pages";

export function ClosingBanner({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <section className="w-full bg-gradient-to-r from-primary via-primary-container to-surface-tint py-space-xl px-margin text-on-primary relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute -left-12 -bottom-16 text-white/10 select-none font-bold text-[220px] leading-none">
        *
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg relative z-10">
        <div className="max-w-xl space-y-space-xs">
          <div className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider font-semibold">
            * Siap Melangkah Lebih Jauh :)
          </div>
          <h3 className="font-headline-lg text-headline-lg text-white font-extrabold leading-tight">
            Tingkatkan Produktivitas Tim Anda dengan Ekosistem Georgio Agent.
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
            className="px-space-xl py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-lg hover:bg-surface-container transition-all transform hover:scale-105"
          >
            Coba Sekarang Gratis
          </button>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
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