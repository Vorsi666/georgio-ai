/**
 * Demo brain — fallback when agent is unreachable.
 * Aim for natural, helpful responses similar to Claude/GPT.
 * Provide substantive answers with reasoning, examples, and actionable advice.
 * Keep responses concise but informative, avoid excessive templating.
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

/**
 * INTI: fallback WAJIB jawab semua pertanyaan, bukan cuma 6 topik.
 * 6 router di bawah tetap dipakai untuk jawaban “kaya”, tapi fallback tidak boleh template generik lagi.
 */
function buildUniversalAnswer(prompt: string, keys: string[]): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "Tulis pertanyaanmu — apapun topiknya — nanti aku jawab langsung dan jelas.";
  
  // More sophisticated topic extraction
  const words = trimmed.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const stopWords = new Set(["yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "adalah", "ini", "itu", "sebagai", "oleh", "karena", "atau", "juga", "tidak", "akan", "ada", "bisa", "dapat", "dalam", "mereka", "kita", "kamu", "saya", "dia", "nya", "lah", "kah", "pun", "per", "hal", "cara", "agar", "supaya", "tentang", "antara", "setelah", "sebelum", "jika", "kalau", "saat", "ketika", "mana", "apa", "siapa", "berapa", "bagaimana", "mengapa", "yakni", "yaitu", "serta", "maupun", "tanpa", "sudah", "telah", "sedang", "masih", "hanya", "saja", "pun"]);
  const meaningfulWords = words.filter(w => !stopWords.has(w));
  const topic = meaningfulWords.slice(0, 5).join(" ") || trimmed.split(/\s+/).slice(0, 5).join(" ");
  const core = trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;

  // More natural opening
  const openings = [
    `Mari kita bahas "${core}".`,
    `Baik, tentang "${core}" — `,
    `Pertanyaan bagus: "${core}".`,
    `Aku akan menjelaskan "${core}" dengan jelas.`,
    `Bagaimana dengan "${core}"? `
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];

  const lines: string[] = [opening, ""];
  
  // Better structured responses
  if (isMath) {
    lines.push("**Pemecahan Masalah Matematika**");
    lines.push("");
    lines.push(`Untuk menyelesaikan soal yang berkaitan dengan **${topic}**, berikut adalah pendekatan sistematis:`);
    lines.push("");
    lines.push("1. **Identifikasi yang diketahui dan yang ditanyakan**");
    lines.push("   - Tulislah semua informasi yang diberikan dalam soal");
    lines.push("   - Tentukanlah apa yang harus kita cari");
    lines.push("");
    lines.push("2. **Pilih rumus atau metode yang sesuai**");
    lines.push("   - Pertimbangkan konsep matematika yang terkait");
    lines.push("   - Jika perlu, ubah satuan agar konsisten");
    lines.push("");
    lines.push("3. **Lakukan perhitungan langkah demi langkah**");
    lines.push("   - Tampilkan setiap langkah secara jelas");
    lines.push("   - Sertakan penjelasan mengapa setiap langkah dilakukan");
    lines.push("");
    lines.push("4. **Periksa kembali hasilnya**");
    lines.push("   - Verifikasi apakah jawaban masuk akal");
    lines.push("   - Periksa kembali operasi aritmetika");
    lines.push("   - Pastikan satuan yang sesuai");
    lines.push("");
    lines.push("Jika kamu bisa berbagi spesifikasi soal lengkap (angka, kondisi, atau konteks spesifik), aku bisa bantu menyelesaikannya langkah demi langkah.");
  } else if (isCode) {
    lines.push("**Solusi Pemrograman yang Praktis**");
    lines.push("");
    lines.push(`Untuk masalah yang berkaitan dengan **${topic}**, berikut adalah pendekatan yang bisa langsung diterapkan:`);
    lines.push("");
    lines.push("1. **Pahami persyaratan masalah**");
    lines.push("   - Apa input yang diperlukan?");
    lines.push("   - Apa output yang diharapkan?");
    lines.push("   - Ada batasan khusus (waktu, memori, dll)?");
    lines.push("");
    lines.push("2. **Rancang algoritma atau pendekatan**");
    lines.push("   - Pertimbangkan struktur data yang sesuai");
    lines.push("   - Pertimbangkan kompleksitas waktu dan ruang");
    lines.push("   - Jika ada pustaka standar yang bisa digunakan, pertimbangkannya");
    lines.push("");
    lines.push("3. **Implementasi kode yang bersih**");
    lines.push("   - Tulislah kode yang mudah dibaca dan dipahami");
    lines.push("   - Gunakan penamaan variabel yang jelas");
    lines.push("   - Tambahkan komentar untuk bagian yang kompleks");
    lines.push("");
    lines.push("4. **Uji dan validasi**");
    lines.push("   - Uji dengan kasus contoh yang berbeda");
    lines.push("   - Periksa edge case");
    lines.push("   - Pastikan output sesuai ekspektasi");
    lines.push("");
    lines.push("Jika kamu bisa berbagi lebih detail tentang masalah spesifik yang kamu hadapi (bahasa pemrograman, konteks, atau contoh input/output), aku bisa memberikan solusi yang lebih tepat.");
  } else if (isHowTo) {
    lines.push("**Panduan Langkah demi Langkah**");
    lines.push("");
    lines.push(`Untuk mencapai tujuan terkait **${topic}**, berikut adalah pendekatan yang praktis dan dapat ditindaklanjuti:`);
    lines.push("");
    lines.push("1. **Mulai dengan fondasi yang kuat**");
    lines.push("   - Pahami dasar-dasar sebelum melanjutkan ke konsep lanjutan");
    lines.push("   - Fokus pada satu aspek pada satu waktu");
    lines.push("");
    lines.push("2. **Buat rencana belajar atau tindakan yang terstruktur**");
    lines.push("   - Bagi tujuan besar menjadi langkah-langkah kecil yang terukur");
    lines.push("   - Jadwalkan waktu konsisten untuk latihan atau implementasi");
    lines.push("");
    lines.push("3. **Latih secara konsisten dan dapatkan umpan balik**");
    lines.push("   - Terapkan apa yang kamu pelajari dalam konteks nyata");
    lines.push("   - Minta umpan balik dari orang yang lebih berpengalaman jika memungkinkan");
    lines.push("   - Catat kemajuan dan area yang perlu diperbaiki");
    lines.push("");
    lines.push("4. **Iterasi dan perbaiki berdasarkan hasil**");
    lines.push("   - Evaluasi secara berkala apa yang bekerja dan apa yang tidak");
    lines.push("   - Sesuaikan pendekatan berdasarkan hasil dan pengalaman");
    lines.push("   - Takut untuk mencoba pendekatan berbeda jika yang saat ini tidak efektif");
    lines.push("");
    lines.push("Jika kamu bisa berbagi lebih detail tentang latar belakang kamu, tujuan spesifik, atau keterbatasan waktu/sumber daya yang kamu hadapi, aku bisa membuatkan rencana yang lebih personalisasi.");
  } else if (isWhy || isWhat) {
    lines.push("**Penjelasan Komprehensif**");
    lines.push("");
    lines.push(`Mari kita jelajah **${topic}** dari berbagai sudut pandang untuk mendapatkan pemahaman yang menyeluruh:`);
    lines.push("");
    lines.push("1. **Definisi dan konsep dasar**");
    lines.push("   - Apa itu exactly?");
    lines.push("   - Sejarah atau asal usulnya jika relevan");
    lines.push("   - Konsep kunci yang perlu dipahami");
    lines.push("");
    lines.push("2. **Mekanisme atau prinsip kerja**");
    lines.push("   - Bagaimana itu bekerja?");
    lines.push("   - Prinsip atau hukum yang mengendalikannya");
    lines.push("   - Faktor-faktor yang memengaruhi perilakunya");
    lines.push("");
    lines.push("3. **Contoh konkret dan aplikasi nyata**");
    lines.push("   - Di mana kita menjumpainya dalam kehidupan sehari-hari?");
    lines.push("   - Bagaimana itu digunakan dalam industri atau bidang spesifik?");
    lines.push("   - Manfaat atau dampaknya apa?");
    lines.push("");
    lines.push("4. **Implikasi dan pertimbangan**");
    lines.push("   - Apakah ada batasan atau tantangan?");
    lines.push("   - Apakah ada pertimbangan etika atau keamanan?");
    lines.push("   - Apa tren atau perkembangan terkini?");
    lines.push("");
    lines.push("Jika kamu memiliki aspek spesifik dari topik ini yang ingin kamu gali lebih dalam (misalnya aplikasi tertentu, kontroversi, atau hubungan dengan topik lain), aku bisa fokuskan penjelasan tersebut.");
  } else {
    lines.push("**Penjelasan Seimbang dan Informative**");
    lines.push("");
    lines.push(`Mari kita bahas **${topic}** dengan pendekatan yang seimbang, mencakup berbagai aspek yang relevan:`);
    lines.push("");
    lines.push("1. **Konsep dasar dan latar belakang**");
    lines.push("   - Apa yang perlu kita ketahui sebagai fondasi?");
    lines.push("   - Sejarah atau konteks yang membantu memahaminya");
    lines.push("   - Perbedaan dengan konsep serupa jika ada");
    lines.push("");
    lines.push("2. **Aspek penting dan detail yang relevan**");
    lines.push("   - Apa elemen kunci yang membuatnya signifikan?");
    lines.push("   - Bagaimana ini berkaitan dengan topik-topik terkait?");
    lines.push("   - Apakah ada versi, jenis, atau klasifikasi yang relevan?");
    lines.push("");
    lines.push("3. **Manfaat, aplikasi, atau dampak**");
    lines.push("   - Di mana dan bagaimana ini berguna?");
    lines.push("   - Siapa yang biasanya terlibat atau menggunakannya?");
    lines.push("   - Apa hasil atau output yang dihasilkan?");
    lines.push("");
    lines.push("4. **Pertimbangan praktis dan langkah selanjutnya**");
    lines.push("   - Jika ingin mempelajari atau menerapkannya, dari mana sebaiknya memulai?");
    lines.push("   - Apa sumber daya yang recomendasi untuk pembelajaran lebih lanjut?");
    lines.push("   - Apakah ada praktek terbaik atau pedoman yang perlu diikuti?");
    lines.push("");
    lines.push("Agar aku bisa memberikan jawaban yang lebih spesifik dan berguna bagi kamu, bisakah kamu berbagi:");

    lines.push("   - Tujuan spesifik kamu ingin mencapai terkait topik ini?");
    lines.push("   - Tingkat pengalaman atau latar belakang kamu di area ini?");
    lines.push("   - Keterbatasan spesifik (waktu, sumber daya, keahlian teknis) yang perlu dipertimbangkan?");
    lines.push("   - Apakah ada aspek tertentu dari topik ini yang paling kamu minati atau ingin kamu fokuskan?");
  }
  
  lines.push("");
  lines.push("Jika ada sesuatu yang kurang jelas atau kamu ingin saya fokuskan pada aspek tertentu, jangan ragu untuk memberi tahu saya!");
  return lines.join("\n");
}

function topicAnswer(prompt: string, keys: string[]): string {
  const p = low(prompt);
  const q = prompt.length>180 ? prompt.slice(0,180).trimEnd()+"…" : prompt;
  // PRIORITAS 1 — intent video HARUS di atas, sebelum router "website" nyasar ke jawaban AI umum
  if (/(buat|bikin|create|render|buatkan|tolong).*(video|remotion|riview|review|recap|intro)|video.*(riview|review|recap|intro|remotion|motion|website|georgio)|motion.*(grafic|graphic|minimalis|modern|smooth)/i.test(prompt)) {
    const isIntro = /intro/i.test(prompt);
    const isReview = /(riview|review|website|georgio)/i.test(prompt);
    const comp = isReview ? "WebsiteReview" : isIntro ? "GeorgioIntro" : "ChatRecap";
    const hint = isReview ? "review website georgio-ai.vercel.app — motion grafic minimalis modern smooth" : isIntro ? "bumper pembuka ungu kaca" : "rekap 4 pesan terakhirmu jadi kartu";
    return [
      `Siap! 🎬 Aku siapkan **${comp}** — ${hint}.`,
      ``,
      `## Langkah di Vercel (preview langsung)`,
      `1. Buka **System Settings** → pilih **${comp}** → atur fps / resolusi / durasi → lihat **Preview Player** langsung muter.`,
      `2. Di chat, tombol **Buat video** juga bisa dipakai kalau ada pesan.`,
      ``,
      `## Render MP4 final — hanya di GitHub (bukan di DSH)`,
      `Buka **GitHub → Actions → Render Remotion Video → Run workflow** → pilih ${comp} → Run. Hasilnya jadi file \`.mp4\` sebagai artifact (hanya di GitHub/Vercel).`,
      ``,
      `Mau aku pakai **${comp}** sekarang? Bilang “buatkan video ${isReview ? "review" : isIntro ? "intro" : "recap"}” dan aku arahkan ke preview.`,
    ].join("\n");
  }
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
  return buildUniversalAnswer(prompt, keys);
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
