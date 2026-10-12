import { lazy, Suspense } from "react";
import type { ChatMessage, ChatVideo } from "../../lib/agui-client";
import type { RemotionCompositionId } from "../../lib/remotion-settings";
import { compositionLabel, formatEta } from "../../lib/render-video";

// Preview.tsx (fallback kalau MP4 belum ada) sudah dipisah jadi chunk sendiri oleh
// vite advancedChunks, jadi lazy import di sini tidak menambah chunk baru.
const LazyPreview = lazy(() => import("../../remotion/Preview"));

const KNOWN: readonly string[] = ["GeorgioIntro", "ChatRecap", "WebsiteReview"];

/** Bar progres render — angka nyata per frame, bukan animasi palsu. */
function RenderProgress({
  progress,
  status,
  eta,
  totalFrames,
}: {
  progress: number;
  status: string;
  eta: number | null;
  totalFrames: number;
}) {
  const pct = Math.round(progress * 100);
  const etaText = formatEta(eta);
  return (
    <div
      className="mt-2 flex flex-col gap-2 rounded-2xl border border-primary/20 bg-surface-container-low/70 p-3"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-label-md text-label-md text-primary">
          <span className="material-symbols-outlined animate-spin text-base leading-none">progress_activity</span>
          {status}
        </span>
        <span className="font-label-md text-label-md tabular-nums text-on-surface-variant">{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary-container transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
        <span>{totalFrames > 0 ? `${totalFrames} frame · WebCodecs` : "menyiapkan…"}</span>
        {etaText && <span>~{etaText} lagi</span>}
      </div>
    </div>
  );
}

export default function ChatVideoBlock({
  video,
  messages,
  progress,
}: {
  video?: ChatVideo;
  messages: ChatMessage[];
  progress?: NonNullable<ChatMessage["render"]>;
}) {
  // 1) Masih render → hanya progres, jangan mountsPlayer dulu (hemat CPU)
  if (progress && !progress.done) {
    return (
      <RenderProgress
        progress={progress.progress}
        status={progress.status}
        eta={progress.etaMs}
        totalFrames={progress.totalFrames}
      />
    );
  }

  if (!video) {
    if (progress?.done && progress.error) {
      return (
        <div className="flex flex-col items-start gap-1 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 px-4 py-3">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline">Render</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{progress.error}</p>
        </div>
      );
    }
    return null;
  }

  const known = KNOWN.includes(video.composition);
  const label = known ? compositionLabel(video.composition as RemotionCompositionId) : video.composition;

  // 2) Ada MP4 hasil render → kirim langsung ke chat sebagai <video> (play + unduh)
  if (video.dataUrl) {
    return (
      <figure className="flex flex-col gap-2">
        <video
          src={video.dataUrl}
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-2xl bg-black/40 shadow-lg"
          style={{ aspectRatio: `${video.width} / ${video.height}` }}
        />
        <figcaption className="flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm text-outline">
          <span>
            {label} · {video.width}×{video.height} · {video.fps} fps · {video.durationSec} dtk
            {video.bytes ? ` · ${(video.bytes / (1024 * 1024)).toFixed(1)} MB` : ""}
          </span>
          <a
            href={video.dataUrl}
            download={`${video.composition}.mp4`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-label-md text-label-md text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <span className="material-symbols-outlined text-sm leading-none">download</span>
            Unduh MP4
          </a>
        </figcaption>
      </figure>
    );
  }

  // 3) Komposisi tidak dikenal (thread lama / data rusak) — jujur, bukan fallback diam-diam
  if (!known) {
    return (
      <div className="flex flex-col items-start gap-1 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 px-4 py-3">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline">Video</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Komposisi <code className="font-label-md text-label-md">{video.composition}</code> tidak dikenali — tidak bisa
          dirender di browser.
        </p>
      </div>
    );
  }

  // 4) Belum ada MP4 (thread lama) → Player Remotion interaktif
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center rounded-2xl bg-primary/5 font-label-md text-label-md text-primary">
          Memuat video…
        </div>
      }
    >
      <LazyPreview
        composition={video.composition as RemotionCompositionId}
        fps={video.fps}
        width={video.width}
        height={video.height}
        durationSec={video.durationSec}
        messages={messages}
      />
    </Suspense>
  );
}