/**
 * Georgio AI — free AI provider (Pollinations, no key, no cost)
 * OpenAI-compatible endpoint: https://text.pollinations.ai/openai
 * Model "openai" (gpt-oss-20b) — gratis, anonim.
 *
 * Answer quality comes from two things:
 * 1. Sending the real conversation history, so follow-ups resolve against context.
 * 2. A system prompt that bans question-restating and template filler, which is
 *    what previously made replies read vague and off-topic.
 */

const ENDPOINT = "https://text.pollinations.ai/openai";

/** Ordered by observed reliability; rotated through on failure. */
const MODELS = ["openai", "openai-fast", "openai-large", "openai"];
const PER_ATTEMPT_MS = 20000;
const MAX_ROUNDS = 2;

const BASE_PERSONA = [
  "Kamu Georgio AI (ジョルジオ), asisten serbaguna yang tenang dalam bahasa Indonesia.",
  "MISI: jawab SEMUA jenis pertanyaan dengan benar — apapun topiknya (teknologi, sains, sejarah, matematika, coding, kesehatan umum, finansial, hubungan, akademik, hukum umum, kreatif, dll).",
  "KEMAMPUAN VIDEO: kamu BISA membuat video dengan Remotion. Komposisi yang ada: GeorgioIntro (bumper 1920x1080) dan ChatRecap (rekap obrolan 1280x720). Semua setting disimpan di localStorage (georgio-remotion-settings) dan preview Player jalan di Vercel.",
  "Aturan WAJIB:",
  "(1) Jawab pertanyaan user secara LANGSUNG di kalimat pertama — jangan mengulang atau memparafrase pertanyaannya.",
  "(2) Kalau user bertanya 'kenapa' atau 'terus', pakai konteks percakapan sebelumnya, jangan jawab generik.",
  "(3) Jangan pakai sapaan pembuka seperti 'Hai!', 'Halo!', 'Mau tanya apa?' — langsung ke inti. Sapa hanya kalau user menyapa dulu.",
  "(4) Jangan menutup dengan pertanyaan retoris seperti 'Mau aku bantu lagi?'. Akhiri natural.",
  "(5) Boleh pakai markdown singkat (##, **, daftar) hanya jika isinya banyak dan butuh struktur.",
  "(6) LARANGAN: jangan jawab 'aku hanya bisa jawab topik X' — kamu WAJIB jawab topik apapun.",
  "(7) Kalau pertanyaan faktual/cara/definisi → jelaskan dengan benar, ringkas, contoh bila perlu.",
  "(8) Kalau pertanyaan opini/kreatif/curhat → beri jawaban empatik + langkah praktis atau ide konkret.",
  "(9) KETIKA USER MINTA VIDEO — kata kunci: buat video, bikin video, render, remotion, recap, intro, buatkan videonya, tolong videokan — kamu JANGAN menolak. Jawab: konfirmasi komposisi (Intro/Recap), sebut setting saat ini (resolusi/fps/durasi dari localStorage), dan beri instruksi: preview di System Settings (Player), render MP4 final via GitHub Actions (hanya di GitHub/Vercel, bukan di DSH). Beri perintah: Actions → Render Remotion Video → Run workflow.",
  "(10) Gaya: hangat, jelas, natural seperti teman yang paham — bukan robot template.",
].join(" ");

function systemPrompt(mode) {
  if (mode === "ringkas") {
    return `${BASE_PERSONA} MODE RINGKAS: Tugasmu merangkum tulisan user apa pun. Balas dengan:\n## Intisari\n- 3-6 poin inti (satu kalimat tiap poin, pakai bahasamu sendiri)\n## Satu kalimat\nRingkasan 1 kalimat. Jika user minta ringkasan dalam bentuk VIDEO, tambahkan di akhir: 'Mau aku buatkan video Recap dari ringkasan ini? Bilang: buatkan video recap.'`;
  }
  return `${BASE_PERSONA} MODE TANYA (UNIVERSAL): Jawab pertanyaan user apa pun secara lengkap dan akurat. Panjang 120-280 kata. Kalau cocok, beri 2-4 poin praktis/langkah/contoh. Jangan tolak topik. Jika pertanyaan sensitif (medis/hukum), beri info umum + saran konsultasi profesional, tetap jawab. Jika user minta VIDEO (buat/bikin/render video, remotion, recap, intro), JAWAB DENGAN FORMAT VIDEO: konfirmasi (Siap! Aku siapkan ChatRecap/GeorgioIntro), sebut 2-3 setting (resolusi/fps/durasi), arahkan ke System Settings untuk preview Player, dan beri cara render final: GitHub Actions → Render Remotion Video → Run workflow (hanya di GitHub/Vercel).`;
}

/**
 * @param {string} mode
 * @param {Array<{role: string, content: string}>} history  full conversation, oldest first
 * @returns {Promise<string>} "" only when every attempt failed
 */
export async function callFreeAI(mode, history) {
  const turns = (history ?? [])
    .filter((t) => t && typeof t.content === "string" && t.content.trim().length > 0)
    .map((t) => ({
      role: t.role === "assistant" ? "assistant" : "user",
      content: t.content.length > 4000 ? t.content.slice(0, 4000) + "\n\n[Pesan dipotong]" : t.content,
    }));
  if (turns.length === 0) return "";

  const recent = turns.slice(-8);
  const messages = [{ role: "system", content: systemPrompt(mode) }, ...recent];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    for (const model of MODELS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PER_ATTEMPT_MS);
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 900,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text || text.length < 10) throw new Error("AI empty");
        return text;
      } catch {
        // anonymous tier fails often — immediately try the next model
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return "";
}