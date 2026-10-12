import type { ChatMessage } from "./agui-client";
import type { RemotionCompositionId, RemotionSettings } from "./remotion-settings";
import { framesFromSettings, recapPropsFromThreads } from "./remotion-settings";

export interface RenderStage {
  /** 0..1 — 0 = mulai, 1 = selesai encode */
  progress: number;
  renderedFrames: number;
  encodedFrames: number;
  totalFrames: number;
  /** status yang enak dibacauser */
  status: string;
  etaMs: number | null;
}

export interface RenderOutcome {
  ok: boolean;
  /** data: URL MP4 — langsung bisa dipasang ke <video> */
  dataUrl?: string;
  mimeType?: string;
  bytes?: number;
  /** pesan jujur kalau gagal (mis. WebCodecs tidak didukung) */
  error?: string;
  /** true kalau peramban tidak punya WebCodecs/OffscreenCanvas */
  unsupported?: boolean;
}

const COMPOSITION_LABELS: Record<RemotionCompositionId, string> = {
  GeorgioIntro: "Georgio Intro",
  ChatRecap: "Chat Recap",
  WebsiteReview: "Website Review",
};

export function compositionLabel(id: RemotionCompositionId): string {
  return COMPOSITION_LABELS[id] ?? id;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Gagal membaca hasil render."));
    fr.onload = () => resolve(String(fr.result));
    fr.readAsDataURL(blob);
  });
}

/**
 * Render video Remotion langsung di browser (WebCodecs) → Blob MP4.
 * Tidak butuh GitHub Actions, tidak butuh server render. Progres dikirim per frame
 * supaya chat bisa menampilkan progres nyata (bukan bar palsu).
 */
export async function renderVideoInBrowser(
  compositionId: RemotionCompositionId,
  settings: Pick<RemotionSettings, "fps" | "durationSec" | "width" | "height">,
  messages: ChatMessage[],
  opts: {
    title?: string;
    subtitle?: string;
    onProgress?: (s: RenderStage) => void;
    signal?: AbortSignal;
  } = {},
): Promise<RenderOutcome> {
  const totalFrames = framesFromSettings({ fps: settings.fps, durationSec: settings.durationSec });

  if (typeof window === "undefined" || typeof window.VideoEncoder === "undefined") {
    return {
      ok: false,
      unsupported: true,
      error: "Browser ini belum mendukung WebCodecs — tidak bisa render MP4 di sini. Coba Chrome/Edge terbaru, atau render lewat GitHub Actions.",
    };
  }

  try {
    const { renderMediaOnWeb } = await import("@remotion/web-renderer");
    const { ChatRecap } = await import("../remotion/ChatRecap");
    const { GeorgioIntro } = await import("../remotion/GeorgioIntro");
    const { WebsiteReview, REVIEW_DEFAULT_PROPS } = await import("../remotion/WebsiteReview");
    const { INTRO_DEFAULT_PROPS } = await import("../remotion/GeorgioIntro");

    const recap = recapPropsFromThreads(messages);
    const Comp = compositionId === "ChatRecap" ? ChatRecap : compositionId === "WebsiteReview" ? WebsiteReview : GeorgioIntro;

    const inputProps =
      compositionId === "ChatRecap"
        ? { title: opts.title?.trim() || recap.title, lines: recap.lines }
        : compositionId === "WebsiteReview"
          ? {
              title: opts.title?.trim() || REVIEW_DEFAULT_PROPS.title,
              url: REVIEW_DEFAULT_PROPS.url,
              bullets: REVIEW_DEFAULT_PROPS.bullets,
              cta: REVIEW_DEFAULT_PROPS.cta,
            }
          : {
              title: opts.title?.trim() || INTRO_DEFAULT_PROPS.title,
              subtitle: opts.subtitle?.trim() || INTRO_DEFAULT_PROPS.subtitle,
            };

    const result = await renderMediaOnWeb({
      // composition wajib: id, component, durasi, ukuran, props
      composition: {
        id: compositionId,
        component: Comp as never,
        durationInFrames: totalFrames,
        fps: settings.fps,
        width: settings.width,
        height: settings.height,
        defaultProps: inputProps,
      },
      inputProps,
      videoCodec: "h264",
      onProgress: (p) => {
        opts.onProgress?.({
          progress: Math.min(1, Math.max(0, p.progress ?? 0)),
          renderedFrames: p.renderedFrames ?? 0,
          encodedFrames: p.encodedFrames ?? 0,
          totalFrames,
          status:
            (p.encodedFrames ?? 0) < totalFrames * 0.9
              ? "Merender frame…"
              : "Menyandikan video (encode)…",
          etaMs: typeof p.renderEstimatedTime === "number" && p.renderEstimatedTime > 0
            ? Math.round(p.renderEstimatedTime)
            : null,
        });
      },
      signal: opts.signal ?? null,
      // scale 1 supaya output persis seperti komposisi
      scale: 1,
      muted: true,
    });

    const blob = await result.getBlob();
    const dataUrl = await blobToDataUrl(blob);
    return { ok: true, dataUrl, mimeType: blob.type || "video/mp4", bytes: blob.size };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.signal?.aborted) return { ok: false, error: "Render dibatalkan." };
    return { ok: false, error: `Render gagal: ${message}` };
  }
}

export function formatEta(ms: number | null): string {
  if (!ms || ms <= 0) return "";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s} dtk`;
  const m = Math.floor(s / 60);
  return `${m} mnt ${s % 60} dtk`;
}