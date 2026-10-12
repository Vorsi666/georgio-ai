import type { ChatMessage } from "./agui-client";

export type RemotionCompositionId = "GeorgioIntro" | "ChatRecap" | "WebsiteReview";

export interface RemotionSettings {
  enabled: boolean;
  composition: RemotionCompositionId;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
}

export const REMOTION_DEFAULTS: RemotionSettings = {
  enabled: true,
  composition: "ChatRecap",
  fps: 30,
  width: 1280,
  height: 720,
  durationSec: 8,
};

export const FPS_OPTIONS = [24, 25, 30, 60];

export const RESOLUTION_PRESETS = [
  { label: "HD · 1280×720", width: 1280, height: 720 },
  { label: "Full HD · 1920×1080", width: 1920, height: 1080 },
  { label: "Vertikal · 1080×1920", width: 1080, height: 1920 },
];

const KEY = "georgio-remotion-settings";

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.round(n) : fallback;
  return Math.min(max, Math.max(min, v));
}

export function loadRemotionSettings(): RemotionSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...REMOTION_DEFAULTS };
    const p = JSON.parse(raw) as Partial<RemotionSettings>;
    return {
      enabled: p.enabled !== false,
      composition:
        p.composition === "GeorgioIntro" || p.composition === "WebsiteReview" ? p.composition : "ChatRecap",
      fps: FPS_OPTIONS.includes(p.fps as number) ? (p.fps as number) : REMOTION_DEFAULTS.fps,
      width: clampInt(p.width, 480, 3840, REMOTION_DEFAULTS.width),
      height: clampInt(p.height, 480, 2160, REMOTION_DEFAULTS.height),
      durationSec: clampInt(p.durationSec, 3, 30, REMOTION_DEFAULTS.durationSec),
    };
  } catch {
    return { ...REMOTION_DEFAULTS };
  }
}

export function saveRemotionSettings(s: RemotionSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* penyimpanan penuh — preview tetap jalan di memori */
  }
}

export function framesFromSettings(s: Pick<RemotionSettings, "fps" | "durationSec">): number {
  return Math.max(30, Math.round(s.fps * s.durationSec));
}

/** Bangun props ChatRecap dari thread chat — 4 pesan user terakhir. */
export function recapPropsFromThreads(messages: ChatMessage[]): { title: string; lines: string[] } {
  const lines: string[] = [];
  for (let i = messages.length - 1; i >= 0 && lines.length < 4; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const t = m.content.trim().replace(/\s+/g, " ");
    if (t) lines.unshift(t.length > 90 ? `${t.slice(0, 90)}…` : t);
    else if (m.attachments?.length) lines.unshift(`📷 ${m.attachments.length} lampiran foto/video`);
  }
  return {
    title: "Recap Ngobrol",
    lines: lines.length > 0 ? lines : ["Mulai ngobrol, lalu buat videonya."],
  };
}
