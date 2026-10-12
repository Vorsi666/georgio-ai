/** Prompt profesional untuk create video motion grafic — setara Claude / motion designer senior. */

export const MOTION_BRIEF = [
  "ROLE: kamu adalah motion designer senior level Claude/pro — Violet Glass, minimalis modern, smooth.",
  "PRINSIP: ease-in-out, spring damping 110-160, stagger 10-14 frame, blur+opacity headIn, tidak ada gerakan kasar.",
  "PALET: #ffffff (atas) → #f3ecff → #cbb6ff → #7c3aed (bawah), aksen #7c3aed · #cbb6ff, grid 56px rgba(124,58,237,0.09).",
  "TIPOGRAFI: Space Grotesk 800 (-3 ls) untuk judul, Plus Jakarta Sans untuk body, monospace untuk label/url.",
  "KOMPOSISI:",
  "- GeorgioIntro: DESIGN RESOURCES (26px mono) → judul 96px → subtitle 30px mono → progress bar putih.",
  "- ChatRecap: LOGS 30px mono + judul 56px → 4 kartu putih 88% alpha, rounded 22-24, shadow 0 8px 24px rgba(124,58,237,0.16).",
  "- WebsiteReview: header split DESIGN RESOURCES / 2025 JULY → judul+✦ → url mono ungu → 3 kartu bullet kaca putih → bottom bar GEORGIO REVIEW / cta.",
  "TIMING: fps dari settings (24/25/30/60), durationSec 3-30, headIn spring damping 110 stiffness 160, kartu stagger i*10-14 frame.",
].join("\n");

export function buildPromptForComposition(comp: string): string {
  const base =
    "Buatkan video motion grafic untuk georgio-ai.vercel.app dengan Remotion. Ikuti brief: " + MOTION_BRIEF.replace(/\n/g, " ");
  if (comp === "WebsiteReview") {
    return (
      base +
      " Pilih komposisi WebsiteReview — review website georgio-ai.vercel.app, gaya minimalis modern smooth, violet glass, bullets: Violet Glass / Chat Workspace / Kirim foto & video."
    );
  }
  if (comp === "GeorgioIntro") {
    return base + " Pilih GeorgioIntro — bumper intro ungu kaca, judul + subtitle, sparkle ✦.";
  }
  return base + " Pilih ChatRecap — rekap 4 pesan terakhir jadi kartu putih di atas gradasi ungu.";
}
