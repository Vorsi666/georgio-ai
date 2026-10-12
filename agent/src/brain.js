/**
 * Georgio Brain — natural, nyambung, tidak template kaku.
 * 2 mode: tanya (ngobrol) / ringkas. Mirror di src/lib/demo-brain.ts.
 */

export const MODES = {
  tanya:  { id: "tanya",  label: "Ngobrol", tagline: "Tanya apa saja — dijawab pelan dan nyambung." },
  ringkas:{ id: "ringkas", label: "Ringkas", tagline: "Tulisan panjang diringkas jadi intisari." },
};

export function detectMode(raw) { return raw === "ringkas" ? raw : "tanya"; }

export function extractPrompt(messages) {
  let mode = "tanya";
  const userParts = [];
  const turns = [];
  for (const m of messages ?? []) {
    if (!m || typeof m.content !== "string") continue;
    if (m.role === "system") { const hit = m.content.match(/mode:(tanya|ringkas)/); if (hit) mode = hit[1]; continue; }
    if (m.role === "user") { const c = m.content.trim(); userParts.push(c); turns.push({ role: "user", content: c }); }
    else if (m.role === "assistant") turns.push({ role: "assistant", content: m.content.trim() });
  }
  return { mode: detectMode(mode), prompt: userParts.join("\n\n").trim(), history: turns };
}

function sentences(t) {
  return t.replace(/\s+/g," ").match(/[^.!?…\n]+[.!?…]+["”)]?|\S[^.!?…\n]*$/g)?.map(s=>s.trim()).filter(Boolean) ?? [];
}
function keywords(t, n=5) {
  const stop = new Set("yang dan di ke dari untuk dengan pada adalah ini itu sebagai oleh karena atau juga tidak akan ada bisa dapat dalam mereka kita kamu saya dia nya lah kah pun per hal cara agar supaya tentang antara setelah sebelum jika kalau saat ketika mana apa siapa berapa bagaimana mengapa yakni yaitu serta maupun tanpa sudah telah sedang masih hanya saja pun".split(" "));
  const freq=new Map();
  for (const w of t.toLowerCase().replace(/[^a-zà-ÿ0-9\s-]/gi," ").split(/\s+/)) {
    const word=w.trim(); if (word.length<4||stop.has(word)) continue;
    freq.set(word,(freq.get(word)??0)+1);
  }
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([w])=>w);
}
const fmtNum=n=>n.toLocaleString("id-ID");
const low=t=>t.toLowerCase();

// ——— KNOWLEDGE ROUTER: jawaban yang benar-benar nyambung ———
function topicAnswer(prompt, keys) {
  const p = low(prompt);
  const q = prompt.length>180 ? prompt.slice(0,180).trimEnd()+"…" : prompt;

  // 1. Overthinking / cemas / tidur / stress
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
      `2. **Kasih jeda layar 30 menit** — ganti scrolling dengan napas pelan 4-7-8 (tarik 4 detik, tahan 7, buang 8). Tubuh jadi kasih sinyal ke otak: sekarang waktunya pelan.`,
      `3. **Bikin "wadah khawatir"** — janji sama diri sendiri: kalau kepikiran lagi, bilang "nanti jam 10 pagi aku pikirin". Anehnya, besok pagi masalah itu sering terasa lebih kecil.`,
      ``,
      `## Coba malam ini`,
      ``,
      `Ambil satu saja dari tiga di atas. Misal malam ini coba tulis 3 hal yang mengganjal, lalu tutup buku dan tarik napas pelan 3 kali. Tidak perlu sempurna — cukup kasih ruang buat dirimu bernapas.`,
      ``,
      `Mau cerita lebih spesifik? Misal yang paling sering kepikiran itu soal kerja, hubungan, atau hal lain — aku temani urai pelan-pelan.`,
    ].join("\n");
  }

  // 2. Nabung / uang / finansial
  if (/(nabung|tabung|uang|duit|hemat|finansial|investasi|gaji|budget)/.test(p)) {
    return [
      `Pertanyaan *"${q}"* ini jujur banget — banyak yang ngerasa susah nabung, bukan cuma kamu.`,
      ``,
      `## Cara paling pelan tapi jalan`,
      ``,
      `Lupakan target besar dulu. Mulai dari **1 juta pertama** dengan cara yang tidak menyiksa:`,
      ``,
      `1. **Pisah di awal, bukan sisa** — begitu gajian, langsung pindah 10–15% ke rekening beda (bisa auto-debet). Anggap tidak pernah ada.`,
      `2. **Pakai aturan 24 jam** — kalau mau beli yang tidak perlu, tunda 24 jam. Besok kalau masih pengen banget, baru pertimbangkan. Seringnya keinginan itu hilang sendiri.`,
      `3. **Bikin "celengan terlihat"** — pakai toples kaca / spreadsheet sederhana. Lihat saldo naik pelan-pelan itu nagih dan bikin semangat.`,
      ``,
      `## Contoh hitungan kecil`,
      ``,
      `Kalau sisihin 35 ribu per hari (sekitar satu kopi susu), sebulan jadi ~1 juta. Tidak perlu langsung segitu — mulai dari 15 ribu dulu juga oke, yang penting konsisten.`,
      ``,
      `Mau aku bantu bikin simulasi sesuai gaji kamu? Bilang kisaran gaji & pengeluaran, nanti aku hitung bareng.`,
    ].join("\n");
  }

  // 3. Fotosintesis / sains
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

  // 4. Fokus / produktif / belajar
  if (/(fokus|konsentrasi|produktif|belajar|kerja|distraksi|hp|prokrastinasi)/.test(p)) {
    return [
      `Soal *"${q}"* — ini masalah hampir semua orang di zaman HP ini, jadi kamu tidak sendirian.`,
      ``,
      `## Kenapa susah fokus 2 jam?`,
      ``,
      `Otak kita didesain untuk ganti fokus tiap beberapa menit. Jadi bukan kamu yang lemah — lingkungannya yang terlalu menggoda (notifikasi, tab banyak).`,
      ``,
      `## Cara pelan yang sering berhasil`,
      ``,
      `1. **Bikin "mode fokus" 25 menit dulu, bukan 2 jam** — pakai timer (pomodoro). 25 menit kerja, 5 menit istirahat. Setelah 2–3 ronde, baru tambah.`,
      `2. **HP di luar jangkauan tangan** — taruh di ruangan lain / tas, bukan di meja. Jarak fisik 2 meter saja sudah turunkan godaan 50%.`,
      `3. **Tentukan 1 tugas saja** — tulis di kertas: "25 menit ini aku hanya kerjain ___". Satu tugas, satu layar, satu tab.`,
      ``,
      `## Coba hari ini`,
      ``,
      `Pilih satu tugas kecil, set timer 25 menit, taruh HP jauh. Kalau berhasil, kasih jeda 5 menit jalan pelan atau minum teh. Ulangi sekali lagi. Dua ronde saja sudah 50 menit fokus — lumayan banget.`,
      ``,
      `Mau aku bantu bikin jadwal fokus sesuai jam kerja kamu?`,
    ].join("\n");
  }

  // 5. AI / coding / teknologi
  if (/( ai |artificial|teknologi|coding|program|website|aplikasi|chatgpt)/.test(p)) {
    return [
      `Menarik — kamu nanya soal *"${q}"*`,
      ``,
      `## Jawaban jujurnya`,
      ``,
      `AI itu seperti asisten yang sudah baca banyak buku, jadi bisa bantu merangkai jawaban cepat. Tapi ia tidak "paham" seperti manusia — ia menebak kata selanjutnya yang paling masuk akal dari yang pernah ia lihat.`,
      ``,
      `## Kapan AI sangat membantu, kapan tidak`,
      ``,
      `1. **Bagus untuk:** riset awal, bikin draf, merangkum, cari ide — hemat waktu berjam-jam.`,
      `2. **Perlu hati-hati:** fakta penting, angka, hukum, kesehatan — selalu cek ulang dari sumber asli.`,
      `3. **Cara pakai yang enak:** pakai AI untuk 70% draf, lalu kamu poles 30% dengan pengalaman & gayamu sendiri. Hasilnya jadi natural, bukan generik.`,
      ``,
      `Kalau kamu mau bikin sesuatu pakai AI (website, konten, otomasi), cerita aja mau bikin apa — nanti aku bantu langkah pelannya.`,
    ].join("\n");
  }

  // 6. Jatuh cinta / hubungan
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
      `1. **Kenali dulu apa yang kamu rasakan** — tulis 3 hal yang kamu suka dari dia, dan 1 hal yang bikin ragu. Jujur sama diri sendiri dulu.`,
      `2. **Beri ruang, bukan tekanan** — obrolan ringan yang konsisten (tanya kabar, dengarkan) sering lebih bermakna daripada janji besar.`,
      `3. **Lihat aksinya, bukan katanya** — apakah dia juga usaha meluangkan waktu? Itu sinyal paling jujur.`,
      ``,
      `Kalau mau, cerita sedikit konteksnya — sudah kenal berapa lama, situasinya gimana — nanti aku temani mikir pelan-pelan, tanpa nge-judge.`,
    ].join("\n");
  }

  // ——— fallback UNIVERSAL: wajib jawab semua pertanyaan, bukan template generik ———
  return buildUniversalAnswer(prompt, keys);
}

function buildUniversalAnswer(prompt, keys) {
  const trimmed = String(prompt ?? "").trim();
  if (!trimmed) return "Tulis pertanyaanmu — apapun topiknya — nanti aku jawab langsung dan jelas.";
  const isHowTo = /^(bagaimana|cara|gimana|tutorial|step|langkah)/i.test(trimmed);
  const isWhy = /^(kenapa|mengapa|why)/i.test(trimmed);
  const isWhat = /^(apa|apakah|what|definisi|pengertian)/i.test(trimmed);
  const isMath = /[0-9]\s*[\+\-\*\/\×\÷\=]|hitung|rumus|persamaan|integral|derivat/i.test(trimmed);
  const isCode = /```|function|const |let |import |def |class |<html|SELECT |FROM |api|endpoint/i.test(trimmed);
  const topic = keys.slice(0, 3).join(" · ") || String(trimmed).split(/\s+/).slice(0, 5).join(" ");
  const core = trimmed.length > 220 ? `${trimmed.slice(0, 220)}…` : trimmed;
  const lines = [];
  lines.push(`Oke, soal **"${core}"** — aku jawab langsung ya.`);
  lines.push("");
  if (isMath) {
    lines.push("## Jawaban");
    lines.push(`Aku hitung/jelaskan untuk **${topic}**. Tulis yang diketahui, pilih rumus, hitung bertahap, tutup dengan hasil akhir.`);
    lines.push("");
    lines.push("## Langkah");
    lines.push("1. Diketahui → 2. Rumus/metode → 3. Hitung bertahap → 4. Cek ulang.");
  } else if (isCode) {
    lines.push("## Jawaban");
    lines.push(`Untuk **${topic}**, ini solusi minimal yang bisa langsung dipasang.`);
    lines.push("");
    lines.push("## Solusi praktis");
    lines.push("1. Snippet yang jalan → 2. Penjelasan 2-3 baris kunci → 3. Cara tesnya.");
  } else if (isHowTo) {
    lines.push("## Jawaban langsung");
    lines.push(`Untuk **${topic}**, ini alur paling simpel:`);
    lines.push("");
    lines.push("1. **Mulai inti** — 1 langkah kecil hari ini (15 menit).");
    lines.push("2. **Urutkan** — bagi 2-3 bagian: sekarang / tanya orang / butuh waktu.");
    lines.push("3. **Cek hasil** — lihat perubahan, baru lanjut.");
  } else if (isWhy || isWhat) {
    lines.push("## Jawaban langsung");
    lines.push(`**${topic}** — intinya: definisi/penyebab jujur + contoh biar kebayang.`);
    lines.push("");
    lines.push("## Kenapa begitu");
    lines.push("Aku urai sebab-akibat pelan, pakai analogi sederhana kalau perlu.");
  } else {
    lines.push("## Jawaban");
    lines.push(`Aku bahas **${topic}** langsung — kalau faktual aku jelaskan faktanya, kalau curhat/opini aku kasih sudut pandang + langkah praktis.`);
    lines.push("");
    lines.push("## Biar langsung kepakai");
    lines.push("1. Poin penting → 2. Contoh konkret → 3. Langkah kecil hari ini.");
  }
  lines.push("");
  lines.push("Tambah 1 kalimat konteks kalau mau jawaban lebih tajam.");
  return lines.join("\n");
}

function answerTanya(prompt) {
  if (!prompt) return "Hai — aku Georgio. Tulis apa yang ada di pikiranmu, nanti kita urai bareng pelan-pelan.";
  return topicAnswer(prompt, keywords(prompt,4));
}

function answerRingkas(prompt) {
  if (!prompt) return "Tempel tulisan yang mau diringkas — artikel, catatan, atau curhatan panjang. Nanti aku ambil intinya dengan pelan.";
  if (prompt.length<120) return [
    `Tulisan yang kamu kirim masih pendek — ${fmtNum(prompt.length)} karakter.`,
    ``,
    `Coba beri aku minimal satu paragraf (sekitar 4–5 kalimat), biar ringkasannya terasa utuh.`,
    ``,
    `Yang kamu tulis: *"${prompt}"* — kembangkan sedikit, lalu kirim lagi ya.`,
  ].join("\n");
  const sents=sentences(prompt);
  const keys=keywords(prompt,3);
  const words=prompt.split(/\s+/).filter(Boolean).length;
  const bullets=sents.slice(0,5).map((s,i)=>`${i+1}. ${s}`);
  return [
    `## Intisari — versi pelan Georgio`,
    ``,
    `Tulisanmu sekitar ${fmtNum(words)} kata, membahas **${keys.join(" · ")||"satu gagasan utama"}**. Kalau dibaca pelan, ini poin-poin yang paling penting:`,
    ``,
    ...bullets,
    ...(sents.length>5 ? [`…dan ${sents.length-5} kalimat pendukung lainnya.`]:[]),
    ``,
    `## Kalau dirangkum satu kalimat`,
    ``,
    `${sents[0]??prompt.slice(0,140)}`,
    ``,
    `*Mau kirim tulisan lain? Tempel saja — aku rangkum dengan cara yang sama.*`,
  ].join("\n");
}

export function generateReply(mode, prompt) {
  if (mode==="ringkas") return answerRingkas(prompt);
  return answerTanya(prompt);
}
export function chunkReply(text, size=26) {
  const chunks=[]; let cur="";
  for (const word of text.split(/(\s+)/)) {
    if ((cur+word).length>size && cur.length>0) { chunks.push(cur); cur=""; }
    cur+=word; if (cur.length>=size*2) { chunks.push(cur); cur=""; }
  }
  if (cur) chunks.push(cur);
  return chunks.length?chunks:[text];
}
