/**
 * Georgio AI — free AI for browser (Pollinations, no key)
 * Dipakai saat live agent tidak terjangkau.
 */

const ENDPOINT = "https://text.pollinations.ai/openai";
const MODEL = "openai";

function sysFor(mode: string) {
  if (mode === "ringkas") return `Kamu Georgio AI — asisten Jepang tenang, bahasa Indonesia natural. Tugas: ringkas tulisan pengguna jadi intisari. Format:\n## Intisari — versi pelan Georgio\n(3-5 poin bernomor)\n## Kalau dirangkum satu kalimat\n(satu kalimat)\nBahasa hangat, tidak kaku.`;
  if (mode === "ide") return `Kamu Georgio AI — kreatif, bahasa Indonesia natural. Dari satu topik buat 5 sudut pandang beda siap pakai, lengkap hook & format. Akhiri ## Alur seminggu. Bahasa santai rapi.`;
  return `Kamu Georgio AI — ジョルジオ, teman yang tenang, bahasa Indonesia natural hangat. Jawab NYAMBUNG dengan pertanyaan (jangan template generik). Struktur ringan: sapa → inti → 2-3 poin praktis → ajak lanjut. Maks 220 kata kecuali diminta detail. Jangan ulang frasa kaku.`;
}

export async function callFreeAIWeb(mode: string, prompt: string): Promise<string> {
  if (!prompt.trim() || prompt.trim().length < 2) return "";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: sysFor(mode) },
          { role: "user", content: prompt.slice(0, 7000) },
        ],
        temperature: 0.8,
        max_tokens: 900,
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json() as { choices?: { message?: { content?: string } }[] };
    const text = j.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 10) throw new Error("empty");
    return text;
  } finally { clearTimeout(t); }
}
