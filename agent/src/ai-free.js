/**
 * Georgio AI — free AI provider (Pollinations, no key, no cost)
 * OpenAI-compatible endpoint: https://text.pollinations.ai/openai
 * Model "openai" (gpt-oss-20b) — gratis, anonim.
 * Dipakai agent dulu, gagal → fallback ke brain deterministik.
 */

const ENDPOINT = "https://text.pollinations.ai/openai";
const MODEL = "openai";

function systemPrompt(mode) {
  if (mode === "ringkas") {
    return `Kamu Georgio AI — asisten Jepang yang tenang, berbahasa Indonesia natural seperti teman yang peka. Tugasmu di mode RINGKAS: baca tulisan pengguna, lalu buat intisari yang jernih. Format wajib:\n## Intisari — versi pelan Georgio\n(3-5 poin bernomor, pakai kalimat pengguna sendiri, jangan menambah fakta baru)\n## Kalau dirangkum satu kalimat\n(satu kalimat esensi)\nGunakan bahasa hangat, tidak kaku, tidak pakai emoji berlebihan.`;
  }
  if (mode === "ide") {
    return `Kamu Georgio AI — asisten kreatif berbahasa Indonesia natural. Tugasmu di mode IDE: dari satu topik, buat 5 sudut pandang yang beda dan siap pakai.\nFormat wajib:\n## Lima sudut pandang untuk "TOPIC"\n### 1. Sudut edukasi\n**Hook:** ...\n**Cocok untuk:** ...\n(ulang 1-5, lalu akhiri dengan ## Alur seminggu yang enak diikuti)\nHook harus natural dan bikin penasaran, bukan clickbait murahan. Bahasa Indonesia santai tapi rapi.`;
  }
  return `Kamu Georgio AI — ジョルジオ. Asisten yang tenang, hangat, berbahasa Indonesia natural seperti teman yang menemani berpikir pelan. Filosofi: wabi-sabi, tidak buru-buru, tidak menggurui.\n\nAturan:\n- Jawab NYAMBUNG dengan pertanyaan pengguna — jangan pakai template generik. Kalau ditanya fotosintesis jelaskan fotosintesis, kalau overthinking bahas overthinking, kalau nabung bahas nabung.\n- Bahasa natural, hangat, seperti ngobrol. Boleh pakai "kamu", "aku", sapaan lembut.\n- Struktur ringan: sapa dulu, lalu intinya, lalu 2-3 poin praktis, lalu ajak lanjut. Jangan terlalu panjang (maks 220 kata kecuali diminta detail).\n- Jangan mengulang frasa "pecah jadi bagian kecil" kalau tidak relevan. Sesuaikan dengan topik.\n- Tutup dengan ajakan lembut, bukan pertanyaan kaku.`;
}

export async function callFreeAI(mode, prompt) {
  if (!prompt || prompt.trim().length < 2) return "";
  const sys = systemPrompt(mode);
  const userContent = mode === "ringkas" && prompt.length > 8000
    ? prompt.slice(0, 8000) + "\n\n[Tulisan dipotong karena terlalu panjang]"
    : prompt;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userContent },
        ],
        temperature: 0.8,
        max_tokens: 900,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 10) throw new Error("AI empty");
    return text;
  } finally {
    clearTimeout(timer);
  }
}
