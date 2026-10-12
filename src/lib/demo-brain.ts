/**
 * Demo brain — mirror of agent/src/brain.js for Georgio AI.
 * Natural, nyambung, tidak template kaku. Sinkron dengan agent/src/brain.js.
 */
import type { AgentMode } from "./agui-client";

export const MODES = {
  tanya:  { id: "tanya" as const,  label: "Ngobrol", tagline: "Tanya apa saja — dijawab pelan dan nyambung." },
  ringkas:{ id: "ringkas" as const, label: "Ringkas", tagline: "Tulisan panjang diringkas jadi intisari." },
};

export function detectMode(raw: unknown): AgentMode { return raw === "ringkas" ? raw : "tanya"; }

export function extractPrompt(messages: Array<{ role?: string; content?: string }>): { mode: AgentMode; prompt: string } {
  let mode: AgentMode = "tanya";
  const userParts: string[] = [];
  for (const m of messages ?? []) {
    if (!m || typeof m.content !== "string") continue;
    if (m.role === "system") { const hit = m.content.match(/mode:(tanya|ringkas)/); if (hit) mode = hit[1] as AgentMode; continue; }
    if (m.role === "user") userParts.push(m.content.trim());
  }
  return { mode: detectMode(mode), prompt: userParts.join("\n\n").trim() };
}

function sentences(t: string): string[] {
  return t.replace(/\s+/g," ").match(/[^.!?…\n]+[.!?…]+["”)]?|\S[^.!?…\n]*$/g)?.map(s=>s.trim()).filter(Boolean) ?? [];
}
function keywords(t: string, n=5): string[] {
  const stop = new Set("yang dan di ke dari untuk dengan pada adalah ini itu sebagai oleh karena atau juga tidak akan ada bisa dapat dalam mereka kita kamu saya dia nya lah kah pun per hal cara agar supaya tentang antara setelah sebelum jika kalau saat ketika mana apa siapa berapa bagaimana mengapa yakni yaitu serta maupun tanpa sudah telah sedang masih hanya saja pun".split(" "));
  const freq=new Map<string,number>();
  for (const w of t.toLowerCase().replace(/[^a-zà-ÿ0-9\s-]/gi," ").split(/\s+/)) {
    const word=w.trim(); if (word.length<4||stop.has(word)) continue;
    freq.set(word,(freq.get(word)??0)+1);
  }
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([w])=>w);
}
const low=(t:string)=>t.toLowerCase();

function topicAnswer(prompt: string, keys: string[]): string {
  const p = low(prompt);
  const q = prompt.length>180 ? prompt.slice(0,180).trimEnd()+"…" : prompt;
  if (/(overthink|cemas|anxiety|khawatir|stress|tidur|insomnia|gelisah|panik)/.test(p)) {
    return [
      `Hai, makasih sudah cerita soal *"${q}"* — kedengeran kamu lagi capek banget kepalanya muter terus ya.`,
      ``,
      `## Kenapa bisa overthinking tiap malam?`,
      ``,
      `Malam itu sepi, jadi pikiran yang siang harinya ketahan jadi muncul semua. Bukan kamu yang salah — otak lagi coba "beres-beres" tapi caranya muter di tempat.`,
      ``,
      `## 3 hal yang biasanya ngaruh banget`,
      ``,
      `1. **Tulis dulu sebelum tidur (5 menit saja)** — ambil kertas, tulis apa yang mengganjal tanpa diedit. Begitu ditulis, otak merasa "oke, sudah disimpan, bisa istirahat".`,
      `2. **Kasih jeda layar 30 menit** — ganti scrolling dengan napas pelan 4-7-8 (tarik 4 detik, tahan 7, buang 8).`,
      `3. **Bikin "wadah khawatir"** — janji sama diri: "nanti jam 10 pagi aku pikirin". Anehnya, besok pagi masalah itu sering terasa lebih kecil.`,
      ``,
      `## Coba malam ini`,
      ``,
      `Ambil satu saja dari tiga di atas. Misal malam ini coba tulis 3 hal yang mengganjal, lalu tutup buku dan tarik napas pelan 3 kali. Tidak perlu sempurna — cukup kasih ruang buat dirimu bernapas.`,
      ``,
      `Mau cerita lebih spesifik? Misal yang paling sering kepikiran itu soal kerja, hubungan, atau hal lain — aku temani urai pelan-pelan.`,
    ].join("\n");
  }
  if (/(nabung|tabung|uang|duit|hemat|finansial|investasi|gaji|budget)/.test(p)) {
    return [
      `Pertanyaan *"${q}"* ini jujur banget — banyak yang ngerasa susah nabung, bukan cuma kamu.`,
      ``,
      `## Cara paling pelan tapi jalan`,
      ``,
      `Lupakan target besar dulu. Mulai dari **1 juta pertama** dengan cara yang tidak menyiksa:`,
      ``,
      `1. **Pisah di awal, bukan sisa** — begitu gajian, langsung pindah 10–15% ke rekening beda (bisa auto-debet).`,
      `2. **Pakai aturan 24 jam** — kalau mau beli yang tidak perlu, tunda 24 jam.`,
      `3. **Bikin "celengan terlihat"** — pakai toples kaca / spreadsheet sederhana. Lihat saldo naik pelan-pelan itu nagih.`,
      ``,
      `## Contoh hitungan kecil`,
      ``,
      `Kalau sisihin 35 ribu per hari (sekitar satu kopi susu), sebulan jadi ~1 juta. Tidak perlu langsung segitu — mulai dari 15 ribu dulu juga oke, yang penting konsisten.`,
      ``,
      `Mau aku bantu bikin simulasi sesuai gaji kamu? Bilang kisaran gaji & pengeluaran, nanti aku hitung bareng.`,
    ].join("\n");
  }
  if (/(fotosintesis|sintesis|klorofil|tumbuhan|biologi|sains|ilmiah)/.test(p)) {
    return [
      `Kamu nanya *"${q}"* — ini salah satu proses paling indah di alam.`,
      ``,
      `## Apa itu fotosintesis?`,
      ``,
      `Sederhananya: **cara tumbuhan bikin makanannya sendiri pakai cahaya matahari**. Daun menyerap cahaya lewat zat hijau bernama klorofil, lalu mengubah air + karbon dioksida jadi gula (energi) + oksigen.`,
      ``,
      `Rumus pelannya: *air + CO₂ + cahaya → gula + oksigen*`,
      ``,
      `## Kenapa penting buat kita?`,
      ``,
      `1. **Oksigen yang kita hirup** sebagian besar dari sini.`,
      `2. **Makanan kita** — nasi, sayur, buah, semua berawal dari energi matahari yang disimpan tumbuhan.`,
      `3. **Penyeimbang bumi** — menyerap CO₂, jadi bantu redam panas.`,
      ``,
      `## Analogi biar kebayang`,
      ``,
      `Bayangin daun seperti dapur kecil: matahari adalah kompor, air & CO₂ adalah bahan, klorofil adalah kokinya, dan gula adalah masakannya. Oksigen? Itu aroma harum yang keluar dari dapur — bonus buat kita.`,
      ``,
      `Mau lanjut ke bagian mana? Proses di dalam daun, atau kenapa fotosintesis cuma terjadi kalau ada cahaya?`,
    ].join("\n");
  }
  if (/(fokus|konsentrasi|produktif|belajar|kerja|distraksi|hp|prokrastinasi)/.test(p)) {
    return [
      `Soal *"${q}"* — ini masalah hampir semua orang di zaman HP ini, jadi kamu tidak sendirian.`,
      ``,
      `## Kenapa susah fokus 2 jam?`,
      ``,
      `Otak kita didesain untuk ganti fokus tiap beberapa menit. Jadi bukan kamu yang lemah — lingkungannya yang terlalu menggoda.`,
      ``,
      `## Cara pelan yang sering berhasil`,
      ``,
      `1. **Bikin "mode fokus" 25 menit dulu, bukan 2 jam** — pakai timer (pomodoro).`,
      `2. **HP di luar jangkauan tangan** — taruh di ruangan lain, jarak 2 meter turunkan godaan 50%.`,
      `3. **Tentukan 1 tugas saja** — tulis di kertas: "25 menit ini aku hanya kerjain ___".`,
      ``,
      `## Coba hari ini`,
      ``,
      `Pilih satu tugas kecil, set timer 25 menit, taruh HP jauh. Dua ronde saja sudah 50 menit fokus — lumayan banget.`,
      ``,
      `Mau aku bantu bikin jadwal fokus sesuai jam kerja kamu?`,
    ].join("\n");
  }
  if (/( ai |artificial|teknologi|coding|program|website|aplikasi|chatgpt)/.test(p)) {
    return [
      `Menarik — kamu nanya soal *"${q}"*`,
      ``,
      `## Jawaban jujurnya`,
      ``,
      `AI itu seperti asisten yang sudah baca banyak buku, jadi bisa bantu merangkai jawaban cepat. Tapi ia tidak "paham" seperti manusia — ia menebak kata selanjutnya yang paling masuk akal.`,
      ``,
      `## Kapan AI sangat membantu, kapan tidak`,
      ``,
      `1. **Bagus untuk:** riset awal, bikin draf, merangkum, cari ide.`,
      `2. **Perlu hati-hati:** fakta penting, angka, hukum, kesehatan — selalu cek ulang.`,
      `3. **Cara pakai yang enak:** pakai AI untuk 70% draf, lalu kamu poles 30% dengan gayamu sendiri.`,
      ``,
      `Kalau kamu mau bikin sesuatu pakai AI (website, konten, otomasi), cerita aja mau bikin apa — nanti aku bantu langkah pelannya.`,
    ].join("\n");
  }
  if (/(cinta|suka sama|pacar|hubungan|putus|kangen|rindu|sayang)/.test(p)) {
    return [
      `Soal *"${q}"* — ini hal yang pelan dan tidak bisa buru-buru ya.`,
      ``,
      `## Yang biasanya bikin bingung`,
      ``,
      `Perasaan itu campuran antara harapan dan takut kecewa. Jadi wajar kalau hati bilang "mau dekat" tapi kepala bilang "nanti dulu".`,
      ``,
      `## Coba pelan-pelan begini`,
      ``,
      `1. **Kenali dulu apa yang kamu rasakan** — tulis 3 hal yang kamu suka dari dia, dan 1 hal yang bikin ragu.`,
      `2. **Beri ruang, bukan tekanan** — obrolan ringan yang konsisten lebih bermakna.`,
      `3. **Lihat aksinya, bukan katanya** — apakah dia juga usaha meluangkan waktu?`,
      ``,
      `Kalau mau, cerita sedikit konteksnya — sudah kenal berapa lama, situasinya gimana — nanti aku temani mikir pelan-pelan, tanpa nge-judge.`,
    ].join("\n");
  }
  const keyStr = keys.slice(0,3).join(" · ");
  return [
    `Makasih sudah cerita — kamu nanya soal *"${q}"* ya.`,
    ``,
    `## Kalau dirangkum pelan`,
    ``,
    `Inti dari pertanyaanmu ada di sekitar **${keyStr || "satu hal yang lagi kamu pikirin"}**. Daripada langsung lompat ke jawaban besar, coba kita lihat dari dekat dulu: apa sebenarnya yang paling mengganjal dari itu?`,
    ``,
    `## Coba kita urai bareng (3 langkah kecil)`,
    ``,
    `1. **Tulis ulang dengan kata-katamu** — satu kalimat: "Sebenarnya aku mau ___ karena ___."`,
    `2. **Pecah jadi 2–3 bagian kecil** — mana yang bisa dicek hari ini, mana yang butuh tanya orang lain, mana yang cuma butuh waktu.`,
    `3. **Coba satu hal 15 menit** — pilih yang paling kecil dan lakukan hari ini.`,
    ``,
    `## Biar kebayang`,
    ``,
    `Misal dari pertanyaanmu: ambil versi paling sederhana, terapkan ke satu situasi hari ini, lalu lihat rasanya.`,
    ``,
    `Kalau kamu kasih sedikit konteks lagi — misal situasinya gimana, yang sudah dicoba apa — aku bisa kasih jawaban yang lebih pas. Mau cerita sedikit lagi?`,
  ].join("\n");
}

function answerTanya(prompt: string): string {
  if (!prompt) return "Hai — aku Georgio. Tulis apa yang ada di pikiranmu, nanti kita urai bareng pelan-pelan.";
  return topicAnswer(prompt, keywords(prompt,4));
}
function answerRingkas(prompt: string): string {
  if (!prompt) return "Tempel tulisan yang mau diringkas — artikel, catatan, atau curhatan panjang. Nanti aku ambil intinya dengan pelan.";
  if (prompt.length<120) return [`Tulisan yang kamu kirim masih pendek — ${prompt.length.toLocaleString("id-ID")} karakter.`,`Coba beri aku minimal satu paragraf (sekitar 4–5 kalimat), biar ringkasannya terasa utuh.`].join("\n\n");
  const sents=sentences(prompt); const keys=keywords(prompt,3);
  const words=prompt.split(/\s+/).filter(Boolean).length;
  const bullets=sents.slice(0,5).map((s,i)=>`${i+1}. ${s}`);
  return [`## Intisari — versi pelan Georgio`,`Tulisanmu sekitar ${words.toLocaleString("id-ID")} kata, membahas **${keys.join(" · ")||"satu gagasan utama"}**. Kalau dibaca pelan, ini poin-poin yang paling penting:`,``, ...bullets, ...(sents.length>5 ? [`…dan ${sents.length-5} kalimat pendukung lainnya.`]:[]), ``, `## Kalau dirangkum satu kalimat`, ``, `${sents[0]??prompt.slice(0,140)}`].join("\n");
}
export function demoReply(mode: AgentMode, prompt: string): string {
  if (mode==="ringkas") return answerRingkas(prompt);
  return answerTanya(prompt);
}
export async function streamDemoReply(mode: AgentMode, prompt: string, onToken: (d:string)=>void, signal?: AbortSignal): Promise<string> {
  const full=demoReply(mode,prompt); const words=full.split(/(\s+)/); let buf="";
  for (const w of words) { if(signal?.aborted) break; buf+=w; if(buf.length>=26){ onToken(buf); buf=""; await new Promise(r=>setTimeout(r,16)); } }
  if(buf) onToken(buf); return full;
}
