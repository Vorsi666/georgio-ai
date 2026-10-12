import type { RemotionCompositionId } from "./remotion-settings";

/**
 * Deteksi intent "buat video" dari prompt user.
 * Harus sinkron dengan detektor di `demo-brain.ts` / `agent/src/brain.js` (termasuk typo riview/grafic).
 */
const VIDEO_INTENT =
  /(buat|bikin|create|render|buatkan|tolong|generate).*(video|remotion|riview|review|recap|intro|motion)|video.*(riview|review|recap|intro|remotion|motion|website|georgio)|motion.*(grafic|graphic|minimalis|modern|smooth)/i;

/** Budget: user tidak boleh gagal render karena satu file lokal yang besar. */
const MAX_LOCAL_BUDGET_BYTES = 2 * 1024 * 1024 * 1024;

export function detectVideoIntent(raw: string): boolean {
  return VIDEO_INTENT.test(raw ?? "");
}

/** Pilih komposisi paling pas dari prompt: review website > intro > recap. */
export function compositionFromPrompt(raw: string, current: RemotionCompositionId): RemotionCompositionId {
  const p = (raw ?? "").toLowerCase();
  if (/(riview|review|website|georgio|tampilan|landing)/.test(p)) return "WebsiteReview";
  if (/\bintro\b|pembuka|opening|bumper/.test(p)) return "GeorgioIntro";
  if (/(recap|rekap|rangkuman|summary)/.test(p)) return "ChatRecap";
  return current;
}

/**
 * Kalau user lampirkan file besar, idealnya di-upload dulu; selama ini masih lokal,
 * jadi render video di browser butuh kuota storage. Ini pemeriksa yang jujur — bukan diam-diam gagal.
 */
export function canRenderVideoInBrowser(estimatedBytes: number): { ok: boolean; reason?: string } {
  if (estimatedBytes > MAX_LOCAL_BUDGET_BYTES) {
    return { ok: false, reason: "Total lampiran terlalu besar untuk dirender di browser. Render lewat GitHub Actions." };
  }
  return { ok: true };
}