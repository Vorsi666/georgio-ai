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
}

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

function sysFor(mode: string): string {
  if (mode === "ringkas")
    return (
      BASE_PERSONA +
      "\n\nTugas mode INI: ringkas tulisan user. Balas dengan:\n## Intisari\n- 3-5 poin inti (bullet satu kalimat)\n## Satu kalimat\nRingkasan 1 kalimat. Tulis ulang dengan kalimatmu, jangan menyalin kalimat user."
    );
  return (
    BASE_PERSONA +
    "\n\nTugas mode INI: jawab pertanyaan user secara nyambung dan konkret. Panjang wajar 120-200 kata, boleh 2-4 poin praktis bila relevan. Kalau pertanyaan user faktual (mis. 'apa itu fotosintesis'), beri penjelasan teknis yang benar dan ringkas, bukan nasihat. Kalau pertanyaan user personal, beri respons empatik + 2-3 langkah praktis."
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
    .map((t) => ({ role: t.role, content: t.content.slice(0, 4000) }));

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