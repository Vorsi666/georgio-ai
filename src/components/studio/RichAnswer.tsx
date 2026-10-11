/**
 * Rich answer widgets — ports the structured answer layout from
 * `desain Georgio agent/chat.html`: bento trend grid, color-palette tokens,
 * and the interactive preview/code tab sandbox.
 */
import { useState } from "react";

/* ------------------------------ bento trends ----------------------------- */

export function BentoTrends() {
  const trends = [
    {
      no: "01 / TREN",
      icon: "blur_on",
      title: "Spatial Glass",
      body: "Translusensi bertingkat dengan difusi chromatic shadow halus, menolak drop-shadow hitam pekat tradisional demi kedalaman multi-layer yang segar.",
      accent: "text-primary",
    },
    {
      no: "02 / TREN",
      icon: "auto_stories",
      title: "Editorial Precision",
      body: "Kombinasi monospace mikro-anotasi dengan Neo-Grotesque dinamis. Asterisk (*), pils status, dan layout asimetris ala sampul vinyl record.",
      accent: "text-primary",
    },
    {
      no: "03 / TREN",
      icon: "bolt",
      title: "Coral Telemetry",
      body: "Penggunaan titik aksen hangat Goldfish Coral (#FF6B4A) untuk indikator eksekusi instan, AI thoughts, dan aksi krusial.",
      accent: "text-tertiary",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {trends.map((t) => (
        <div key={t.no} className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs hover:bg-surface-container transition-colors">
          <div className={`flex items-center justify-between ${t.accent}`}>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{t.no}</span>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{t.title}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-normal">{t.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- color palette ----------------------------- */

const TOKENS = [
  { name: "Electric Cobalt", hex: "#0048CC / Primary", cls: "bg-primary text-on-primary", weight: "60% Weight" },
  { name: "Clean Slate", hex: "#181C20 / On-Surface", cls: "bg-on-surface text-on-primary", weight: "Base Dark" },
  { name: "Soft Sky Cyan", hex: "#DAE2FF / Surface-Tint", cls: "bg-secondary-fixed text-on-secondary-fixed", weight: "Sub-surface" },
  { name: "Coral Spark", hex: "#C73B1A / Tertiary", cls: "bg-tertiary-container text-on-tertiary-container", weight: "Pulse Accent" },
] as const;

export function ColorPalette() {
  return (
    <div className="flex flex-col gap-space-sm pt-space-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-lg text-label-lg text-on-surface">Rekomendasi Design Tokens 2025</span>
          <span className="text-tertiary font-bold">*</span>
        </div>
        <span className="font-label-sm text-label-sm text-outline">Format: Tailwind CSS Token Config</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        {TOKENS.map((t) => (
          <div key={t.name} className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-xs shadow-sm">
            <div className={`h-16 w-full rounded-lg flex items-end p-space-xs ${t.cls}`}>
              <span className="font-label-sm text-label-sm font-semibold">{t.weight}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-on-surface">{t.name}</span>
              <span className="font-label-md text-label-md text-outline">{t.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- component sandbox --------------------------- */

const SAMPLE_CODE = `export function SaaSCard() {
  return (
    <div className="group flex flex-col justify-between
                    bg-surface-container-lowest p-space-lg
                    rounded-2xl shadow-sm hover:shadow-md
                    transition-all duration-300
                    transform hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-primary-fixed
                      flex items-center justify-center
                      text-primary group-hover:scale-110
                      transition-transform">
        <Icon />
      </div>
      <h3 className="mt-space-md font-headline-sm text-headline-sm">
        Enterprise
      </h3>
    </div>
  );
}`;

export function ComponentSandbox() {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
      {/* toolbar */}
      <div className="flex items-center justify-between px-space-md py-space-sm border-b border-surface-container-high">
        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-base text-primary">widgets</span>
          SaaSCard.tsx
        </span>
        <div className="flex rounded-full bg-surface-container-low p-0.5">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm transition-colors ${
                tab === t ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t === "preview" ? "Preview" : "Kode"}
            </button>
          ))}
        </div>
      </div>

      {tab === "preview" ? (
        <div className="p-space-md bg-surface-container-lowest">
          <div className="group flex flex-col justify-between bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer max-w-xs">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
            <div className="mt-space-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Enterprise</h3>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Solution tailored for large teams.</p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-surface-container-high flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary font-semibold">Pelajari</span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
          <p className="mt-space-sm font-label-sm text-label-sm text-outline">
            * Live preview — hover kartu untuk melihat kinetic feedback
          </p>
        </div>
      ) : (
        <pre className="p-space-md bg-surface-container-lowest overflow-x-auto">
          <code className="font-label-sm text-label-sm text-on-surface whitespace-pre leading-relaxed">
            {SAMPLE_CODE}
          </code>
        </pre>
      )}
    </div>
  );
}

/* ---------------------------- feedback pills ----------------------------- */

export function FeedbackRow() {
  return (
    <div className="flex flex-wrap items-center gap-space-sm">
      {[
        { icon: "thumb_up", label: " Bermanfaat" },
        { icon: "content_copy", label: " Salin" },
        { icon: "ios_share", label: " Export" },
      ].map((a) => (
        <button
          key={a.label}
          type="button"
          className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-sm">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}