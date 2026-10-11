import type { PageId } from "../../lib/pages";

/** Core capabilities grid — the three pillars of the agent. */
const FEATURES = [
  {
    icon: "stream",
    label: "STREAM ENGINE",
    title: "Mengalir, bukan menyembur",
    body: "Jawaban muncul perlahan, kata demi kata. Kamu bisa hentikan kapan saja — seperti menyela teman yang sedang bercerita.",
  },
  {
    icon: "hub",
    label: "MODE SWITCHER",
    title: "Satuthought, tiga cara",
    body: "Mau ngobrol bebas, minta diringkas, atau cari ide? Cukup ganti mode. Riwayatmu tetap tersimpan, tidak hilang saat pindah.",
  },
  {
    icon: "shield_lock",
    label: "OWNER SCOPED",
    title: "Data terisolasi per akun",
    body: "Memory Graph memakai aturan owner-scoped: satu pengguna tidak pernah bisa membaca data pengguna lain. Tanpa login, chat tetap jalan.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="w-full px-margin py-space-xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
              <span>* CORE CAPABILITIES</span>
              <span>—</span>
              <span className="text-on-surface-variant font-normal">Apa yang Georgio mampu</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">
              Dibangun untuk bekerja, bukan sekadar chat
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {FEATURES.map((f) => (
            <article
              key={f.label}
              className="group flex flex-col justify-between bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="space-y-space-md">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-primary font-semibold mb-1">{f.label}</div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{f.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </div>
              <div className="pt-space-lg flex items-center justify-between text-primary font-label-md text-label-md">
                <span>Selengkapnya</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Specialist agent fleet showcase. */
const AGENTS = [
  {
    name: "Georgio Designer",
    role: "DESIGN EXPERT",
    acc: "99.1%",
    icon: "polyline",
    body: "Spesialisasi sistem desain editorial, penataan layout visual adaptif, dan palet estetika harmonis.",
  },
  {
    name: "Georgio Analyst",
    role: "STRATEGY DECK",
    acc: "98.7%",
    icon: "insights",
    body: "Sintesis tren kompetitor, kalkulasi pasar, dan ekstraksi sinyal dari dokumen terverifikasi.",
  },
  {
    name: "Georgio Engineer",
    role: "SCRIPT ENGINE",
    acc: "97.9%",
    icon: "terminal",
    body: "Refactoring fungsi, testing generator, penulisan skrip, dan setup pipeline otomatis.",
  },
  {
    name: "Georgio Archivist",
    role: "RAG RETRIEVAL",
    acc: "99.4%",
    icon: "dataset",
    body: "Tanya jawab langsung pada kumpulan dokumen internal, repositori kode, dan basis pengetahuan.",
  },
] as const;

export function AgentsSection({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <section className="w-full bg-surface-container-low px-margin py-space-xl rounded-xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase">
              Multi-Specialist Fleet
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">Persona Agen Khusus</h2>
          </div>
          <div className="flex items-center gap-space-sm font-label-md text-label-md text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            4 Agen Standby &amp; Siap Didelegasikan
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {AGENTS.map((a) => (
            <article
              key={a.name}
              className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-space-md bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-secondary/40">{a.icon}</span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-primary font-semibold">
                    {a.role}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{a.name}</h3>
                  <span className="font-label-sm text-label-sm text-primary font-bold">{a.acc}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md leading-relaxed">
                  {a.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("agent-capabilities")}
                className="w-full inline-flex items-center justify-center gap-space-xs rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md py-space-sm hover:bg-primary hover:text-on-primary transition-colors"
              >
                Delegasikan
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}