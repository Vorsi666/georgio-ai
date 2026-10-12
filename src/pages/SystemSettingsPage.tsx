import { useState } from "react";
import RemotionPreview, { COMPOSITION_META } from "../remotion/Preview";
import type { RemotionCompositionId, RemotionSettings } from "../lib/remotion-settings";
import { FPS_OPTIONS, RESOLUTION_PRESETS, saveRemotionSettings } from "../lib/remotion-settings";

/**
 * System Settings — panel konfigurasi Remotion.
 * Semua disimpan lokal di browser (localStorage `georgio-remotion-settings`).
 * Render MP4 final tetap lewat CLI: `npx remotion render <Komposisi>`.
 */
export default function SystemSettingsPage({
  settings,
  onChange,
}: {
  settings: RemotionSettings;
  onChange: (s: RemotionSettings) => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [copied, setCopied] = useState(false);

  function update(patch: Partial<RemotionSettings>) {
    const next = { ...settings, ...patch };
    onChange(next);
    saveRemotionSettings(next);
  }

  const renderCmd = `npx remotion render ${settings.composition} --fps=${settings.fps} --width=${settings.width} --height=${settings.height}`;

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(renderCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard diblokir — user masih bisa salin manual */
    }
  }

  return (
    <div className="flex w-full flex-col gap-space-lg">
      <section className="glass flex w-full flex-wrap items-center justify-between gap-space-md rounded-[24px] p-space-md shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-tertiary-container text-white shadow-md">
            <span className="material-symbols-outlined text-2xl leading-none">tune</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">System Settings</span>
              <span className="rounded-full bg-primary px-space-xs py-0.5 font-label-sm text-label-sm font-medium tracking-wider text-white">
                REMOTION
              </span>
            </div>
            <span className="font-label-md text-label-md text-outline">Konfigurasi video & preview</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => update({ enabled: !settings.enabled })}
          role="switch"
          aria-checked={settings.enabled}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-label-lg text-label-lg transition-colors ${
            settings.enabled ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-lg leading-none">
            {settings.enabled ? "toggle_on" : "toggle_off"}
          </span>
          {settings.enabled ? "Remotion Aktif" : "Remotion Mati"}
        </button>
      </section>

      <section className="glass flex w-full flex-col gap-space-md rounded-[24px] p-space-lg shadow-sm">
        <div className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
          Komposisi
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(COMPOSITION_META) as RemotionCompositionId[]).map((id) => {
            const active = settings.composition === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => update({ composition: id })}
                aria-pressed={active}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active ? "border-primary bg-primary/5 shadow-md" : "border-white/60 bg-white/60 hover:border-primary/30"
                }`}
              >
                <div className="font-headline-sm text-headline-sm text-on-surface">{COMPOSITION_META[id].label}</div>
                <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{COMPOSITION_META[id].hint}</div>
                <div className="mt-2 font-label-sm text-label-sm text-primary">{id}</div>
              </button>
            );
          })}
        </div>

        <div className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
          Frame rate
        </div>
        <div className="flex flex-wrap gap-2">
          {FPS_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => update({ fps: f })}
              aria-pressed={settings.fps === f}
              className={`rounded-full px-4 py-1.5 font-label-lg text-label-lg transition-colors ${
                settings.fps === f ? "bg-on-surface text-white" : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f} fps
            </button>
          ))}
        </div>

        <div className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
          Resolusi
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {RESOLUTION_PRESETS.map((r) => {
            const active = settings.width === r.width && settings.height === r.height;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => update({ width: r.width, height: r.height })}
                aria-pressed={active}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  active ? "border-primary bg-primary/5 shadow-md" : "border-white/60 bg-white/60 hover:border-primary/30"
                }`}
              >
                <div className="font-body-md text-body-md text-on-surface">{r.label}</div>
                <div className="font-label-sm text-label-sm text-outline">
                  {r.width}×{r.height}
                </div>
              </button>
            );
          })}
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
            Durasi · {settings.durationSec} detik
          </span>
          <input
            type="range"
            min={3}
            max={30}
            step={1}
            value={settings.durationSec}
            onChange={(e) => update({ durationSec: Number(e.target.value) })}
            className="w-full accent-[#7c3aed]"
            aria-label="Durasi video dalam detik"
          />
        </label>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">Judul preview (opsional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kosong = pakai default"
              maxLength={60}
              className="rounded-xl border border-transparent bg-surface-container-low px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface-variant">Subjudul (khusus Intro)</span>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Kosong = pakai default"
              maxLength={80}
              className="rounded-xl border border-transparent bg-surface-container-low px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
          Preview langsung
        </div>
        {settings.enabled ? (
          <RemotionPreview
            composition={settings.composition}
            fps={settings.fps}
            width={settings.width}
            height={settings.height}
            durationSec={settings.durationSec}
            overrideTitle={title}
            overrideSubtitle={subtitle}
          />
        ) : (
          <p className="rounded-2xl bg-surface-container-low p-4 font-body-md text-body-md text-on-surface-variant">
            Remotion dimatikan — tombol “Buat video” di chat disembunyikan sampai kamu aktifkan lagi.
          </p>
        )}

        <div className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant/70">
          Render MP4 final (CLI)
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-on-surface p-4 text-white">
          <code className="break-all font-label-md text-label-md">{renderCmd}</code>
          <p className="font-body-sm text-body-sm text-white/70">
            Jalankan di folder proyek — butuh Chrome/Chromium untuk render headless. Entry sudah diset di{" "}
            <code>remotion.config.ts</code>.
          </p>
          <button
            type="button"
            onClick={copyCmd}
            className="inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-1.5 font-label-md text-label-md text-on-surface"
          >
            <span className="material-symbols-outlined text-base leading-none">content_copy</span>
            {copied ? "Tersalin!" : "Salin perintah"}
          </button>
        </div>
      </section>
    </div>
  );
}
