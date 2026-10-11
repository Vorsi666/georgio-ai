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
  "Kamu Georgio AI (ジョルジオ), asisten yang tenang dalam bahasa Indonesia.",
  "Aturan yang WAJIB:",
  "(1) Jawab pertanyaan user secara LANGSUNG di kalimat pertama — jangan mengulang atau memparafrase pertanyaannya.",
  "(2) Kalau user bertanya 'kenapa' atau 'terus', pakai konteks percakapan sebelumnya, jangan jawab generik.",
  "(3) Jangan pakai sapaan pembuka seperti 'Hai!', 'Halo!', 'Mau tanya apa?' — langsung ke inti.",
  "(4) Jangan menutup dengan pertanyaan retoris atau kalimat seperti 'Mau aku bantu lagi?'.",
  "(5) Boleh pakai markdown singkat (## dan daftar bernomor) hanya jika isinya banyak.",
  "(6) Gaya: hangat dan natural seperti teman yang paham — bukan robot yang memberi jawaban exceedingly umum.",
].join(" ");

function systemPrompt(mode) {
  if (mode === "ringkas") {
    return `${BASE_PERSONA} Tugas mode INI: ringkas tulisan user. Balas dengan:\n## Intisari\n- 3-5 poin inti (bullet satu kalimat)\n## Satu kalimat\nRingkasan 1 kalimat. Tulis ulang dengan kalimatmu, jangan menyalin kalimat user.`;
  }
  if (mode === "ide") {
    return `${BASE_PERSONA} Tugas mode INI: dari 1 topik, buat 5 ide konten siap pakai. Balas dengan:\n## 5 ide untuk: <topik>\n1. **Hook** — 1 kalimat dukungan.\n(hingga 5)\n## Alur seminggu\nUrutan posting 5 hari.`;
  }
  return `${BASE_PERSONA} Tugas mode INI: jawab pertanyaan user secara nyambung dan konkret. Panjang wajar 120-200 kata, boleh 2-4 poin praktis bila relevan. Kalau pertanyaan user faktual (mis. 'apa itu fotosintesis'), beri penjelasan teknis yang benar dan ringkas, bukan nasihat. Kalau pertanyaan user personal, beri respons empatik + 2-3 langkah praktis.`;
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