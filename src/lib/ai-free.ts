/**
 * Georgio AI — free AI for browser (Pollinations, no key).
 *
 * Reality check that shaped this file: the anonymous tier is NOT reliable.
 * Observed: `402 Payment Required` on many calls, interleaved with successes,
 * and permanently failing on some models. A single failed call used to drop the
 * user straight onto the offline template, which is why replies felt vague and
 * "tidak sesuai". So: retry, rotate models, and only then fall back.
 */

const ENDPOINT = "https://text.pollinations.ai/openai";

/** Ordered by observed reliability; rotated through on failure. */
const MODELS = ["openai", "openai-fast", "openai-large", "openai"] as const;
type Model = (typeof MODELS)[number];

const PER_ATTEMPT_MS = 20000;
const MAX_ROUNDS = 2;

export interface AITurn {
  role: "user" | "assistant";
  content: string;
  attachments?: { kind: string; name: string }[];
}

const BASE_PERSONA = [
  "Kamu Georgio AI (ジョルジオ), asisten serbaguna yang tenang dalam bahasa Indonesia.",
  "MISI: jawab SEMUA jenis pertanyaan dengan benar — apapun topiknya (teknologi, sains, sejarah, matematika, coding, kesehatan umum, finansial, hubungan, akademik, hukum umum, kreatif, dll).",
  "KEMAMPUAN VIDEO: kamu BISA membuat video dengan Remotion. Komposisi yang ada: GeorgioIntro (bumper 1920×1080) dan ChatRecap (rekap obrolan 1280×720). Semua setting disimpan di localStorage (georgio-remotion-settings) dan preview Player jalan di Vercel.",
  "Aturan WAJIB:",
  "(1) Jawab pertanyaan user secara LANGSUNG di kalimat pertama — jangan mengulang atau memparafrase pertanyaannya.",
  "(2) Kalau user bertanya 'kenapa' atau 'terus', pakai konteks percakapan sebelumnya, jangan jawab generik.",
  "(3) Jangan pakai sapaan pembuka seperti 'Hai!', 'Halo!', 'Mau tanya apa?' — langsung ke inti. Sapa hanya kalau user menyapa dulu.",
  "(4) Model teks ini TIDAK bisa melihat isi foto/video — kalau user melampirkan file, akui nama filenya, jangan berpura-pura melihat isinya, lalu bantu dari teks/konteks yang ada.",
  "(5) Jangan menutup dengan pertanyaan retoris seperti 'Mau aku bantu lagi?'. Akhiri natural.",
  "(6) Boleh pakai markdown singkat (##, **, daftar) hanya jika isinya banyak dan butuh struktur.",
  "(7) LARANGAN: jangan jawab 'aku hanya bisa jawab topik X' atau 'coba tanya topik lain' — kamu WAJIB jawab topik apapun.",
  "(8) Kalau pertanyaan faktual / cara / definisi → jelaskan dengan benar, ringkas, dan contoh bila perlu.",
  "(9) Kalau pertanyaan opini / kreatif / curhat → beri jawaban empatik + langkah praktis atau ide konkret.",
  "(10) Gaya: hangat, jelas, dan natural seperti teman yang paham — bukan robot template.",
  "(11) KETIKA USER MINTA VIDEO — kata kunci: buat video, bikin video, render, remotion, recap, intro, buatkan videonya, tolong videokan — kamu JANGAN menolak. Jawab: konfirmasi komposisi (Intro/Recap), sebut setting saat ini (resolusi/fps/durasi dari localStorage), dan beri instruksi: preview di System Settings (Player), render MP4 final via GitHub Actions (hanya di GitHub/Vercel, bukan di DSH). Beri perintah: Actions → Render Remotion Video → Run workflow.",
].join(" ");

function sysFor(mode: string): string {
  if (mode === "ringkas")
    return (
      BASE_PERSONA +
      "\n\nMODE RINGKAS: Tugasmu merangkum tulisan user apa pun (artikel, chat panjang, kode, catatan). " +
      "Balas dengan:\n## Intisari\n- 3-6 poin inti (satu kalimat tiap poin, pakai bahasamu sendiri, jangan copy-paste kalimat user)\n## Satu kalimat\nRingkasan 1 kalimat. Jika tulisan terlalu pendek (< 80 karakter), minta user kirim versi lebih lengkap dengan sopan." +
      "\n\nJika user minta ringkasan dalam bentuk VIDEO, tambahkan di akhir: 'Mau aku buatkan video Recap dari ringkasan ini? Bilang: buatkan video recap.'"
    );
  return (
    BASE_PERSONA +
    "\n\nMODE TANYA (UNIVERSAL): Jawab pertanyaan user apa pun secara lengkap dan akurat. " +
    "Panjang wajar 120-280 kata. Kalau cocok, beri 2-4 poin praktis / langkah / contoh. " +
    "Jangan tolak topik. Jika pertanyaan sensitif (medis/hukum), beri informasi umum yang membantu + saran konsultasi profesional, tetap jawab." +
    "\n\nJika user minta VIDEO (buat/bikin/render video, remotion, recap, intro), JAWAB DENGAN FORMAT VIDEO: konfirmasi (Siap! Aku siapkan ChatRecap/GeorgioIntro), sebut 2-3 setting (resolusi/fps/durasi), arahkan ke System Settings untuk preview Player, dan beri cara render final: GitHub Actions → Render Remotion Video → Run workflow (hanya di GitHub/Vercel)."
  );
}

async function attempt(model: Model, messages: unknown[], signal: AbortSignal): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 900 }),
    signal,
  });
  if (!res.ok) throw new Error(String(res.status));
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = j.choices?.[0]?.message?.content?.trim();
  if (!text || text.length < 10) throw new Error("empty");
  return text;
}

/**
 * Call the free AI with history. Returns "" only after every attempt failed,
 * letting the caller fall back without the user ever seeing a broken state.
 */
export async function callFreeAIWeb(mode: string, history: AITurn[]): Promise<string> {
  const turns = (history ?? []).filter(
    (t) => t && typeof t.content === "string" && t.content.trim().length > 0,
  );
  if (turns.length === 0) return "";

  const wire = turns
    .slice(-8) // recent window keeps the model focused on the real question
    .map((t) => {
      const files = (t.attachments ?? [])
        .map((a) => `[${a.kind === "image" ? "foto" : "video"}: ${a.name}]`)
        .join(" ");
      const text = t.content.trim();
      const content = text && files ? `${text}\n(lampiran: ${files})` : text || (files ? `(lampiran: ${files})` : "");
      return { role: t.role, content: content.slice(0, 4000) };
    });

  const messages = [{ role: "system", content: sysFor(mode) }, ...wire];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    for (const model of MODELS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), PER_ATTEMPT_MS);
      try {
        const out = await attempt(model, messages, ctrl.signal);
        return out;
      } catch {
        // try next model immediately; the anonymous tier fails often
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return "";
}