import Studio from "../components/studio/Studio";
import { ArrowDown, ArrowUpRight, Leaf, PenLine, Sparkles, Waves } from "lucide-react";

const FEATURES = [
  {
    no: "一",
    title: "Mengalir, bukan menyembur",
    body: "Jawaban muncul perlahan, kata demi kata. Kamu bisa hentikan kapan saja — seperti menyela teman yang sedang bercerita. Tenang, tidak tergesa.",
    Icon: Waves,
  },
  {
    no: "二",
    title: "Satu pikiran, tiga cara",
    body: "Mau ngobrol bebas, minta diringkas, atau cari ide? Cukup ganti mode. Riwayatmu tetap tersimpan, tidak hilang saat pindah.",
    Icon: Sparkles,
  },
  {
    no: "三",
    title: "Tetap ada, bahkan offline",
    body: "Belum terhubung ke server? Georgio tetap menjawab dengan pikirannya sendiri. Begitu terhubung, ia otomatis beralih ke versi live.",
    Icon: Leaf,
  },
];

const STEPS = [
  { no: "1", title: "Pilih suasana", body: "Ngobrol, ringkas, atau cari ide — sesuai yang kamu butuhkan saat ini." },
  { no: "2", title: "Tulis apa adanya", body: "Satu kalimat jujur sudah cukup. Tidak perlu sempurna." },
  { no: "3", title: "Dengarkan jawabannya", body: "Georgio merangkai jawaban dengan tenang, terstruktur, dan mudah dicerna." },
];

export default function LandingPage() {
  return (
    <>
      {/* Washi masthead */}
      <div className="border-b border-sumi/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5 font-mono text-[0.68rem] tracking-[0.14em] text-sumi/40">
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">Georgio AI</span>
            <span className="h-3 w-px bg-sumi/15 max-sm:hidden" aria-hidden />
            <span>静かな思考 · Edisi Pertama</span>
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <span>一期一会</span>
            <span className="h-3 w-px bg-sumi/15" aria-hidden />
            <span>Tanpa login</span>
          </span>
          <span className="font-body text-[0.7rem] tracking-widest sm:hidden">ジョルジオ</span>
        </div>
      </div>

      {/* Hero — spacious, wabi-sabi */}
      <header className="relative mx-auto grid max-w-6xl grid-cols-12 gap-8 overflow-hidden px-5 pb-12 pt-10 lg:gap-6 lg:pb-14 lg:pt-16">
        {/* Left — headline */}
        <div className="col-span-12 lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sumi/10 bg-kigami/60 px-4 py-1.5 font-body text-xs tracking-wide text-sumi/70">
            <span className="h-2 w-2 animate-pulse rounded-full bg-akane" />
            Georgio sedang mendengarkan
            <span className="hidden font-mono text-[0.7rem] tracking-widest text-sumi/30 sm:inline">· LIVE</span>
          </div>

          <h1 className="font-display text-[2.7rem] font-semibold leading-[0.95] tracking-tight text-sumi sm:text-5xl lg:text-[4.4rem]">
            Pikiran
            <br />
            <span className="font-light italic text-take">tenang,</span>
            <br />
            <span className="relative inline-block">
              jawaban jernih.
              <span className="absolute -bottom-1 left-0 h-px w-full bg-akane/50" aria-hidden />
            </span>
          </h1>

          {/* Vertical jp accent — desktop only, absolute */}
          <p className="absolute right-6 top-10 hidden font-display text-sm tracking-[0.45em] text-sumi/10 lg:block" style={{ writingMode: "vertical-rl" }}>
            ジョルジオ・エーアイ
          </p>

          <p className="mt-6 max-w-[36rem] font-body text-[1.05rem] leading-relaxed text-sumi/60">
            Georgio bukan chatbot yang buru-buru. Ia mendengarkan dulu, merenung sebentar, lalu
            menjawab dengan tenang — seperti ngobrol pelan di pagi yang hening. Coba tanya apa saja,
            minta diringkas, atau cari ide.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#studio"
              className="inline-flex items-center gap-2 rounded-full bg-sumi px-7 py-3 font-body text-sm font-medium text-washi transition-opacity hover:opacity-90"
            >
              Mulai ngobrol <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#cara"
              className="inline-flex items-center gap-2 rounded-full border border-sumi/15 bg-transparent px-6 py-3 font-body text-sm font-medium text-sumi/70 transition-colors hover:border-sumi/25 hover:text-sumi"
            >
              Lihat caranya
            </a>
          </div>

          <dl className="mt-10 flex gap-8 border-t border-sumi/[0.08] pt-6">
            {[
              ["3", "cara bicara"],
              ["Mengalir", "jawaban live"],
              ["Tanpa", "daftar & login"],
            ].map(([v, l]) => (
              <div key={l}>
                <dd className="font-display text-2xl font-medium text-sumi">{v}</dd>
                <dd className="font-body text-xs tracking-wide text-sumi/40">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — soft cards, wabi-sabi overlap */}
        <div className="relative col-span-12 flex flex-col gap-4 lg:col-span-4 lg:col-start-9 lg:pt-6">
          {/* Enso decoration */}
          <svg viewBox="0 0 100 100" className="absolute -right-8 -top-6 hidden h-40 w-40 text-sumi/[0.06] lg:block" aria-hidden>
            <path
              d="M50 12 A38 38 0 1 1 48 88 A30 30 0 1 0 50 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative rounded-2xl bg-sumi px-6 py-6 text-washi">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-washi/40">CONTOH JAWABAN</p>
            <p className="mt-3 font-display text-lg font-light leading-snug">
              “Jawaban yang baik itu seperti teh — diseduh pelan, baru terasa.”
            </p>
            <p className="mt-4 border-t border-washi/10 pt-3 font-body text-xs leading-relaxed text-washi/50">
              Georgio merangkai jawaban dalam bagian-bagian kecil, jadi mudah diikuti. Tidak menggurui, hanya menemani berpikir.
            </p>
            <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-akane" aria-hidden />
          </div>

          <div className="relative rounded-2xl border border-sumi/[0.08] bg-kigami/50 px-6 py-5 backdrop-blur">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-sumi/30">CONTOH IDE</p>
            <p className="mt-2 font-display text-[1.05rem] font-medium leading-snug text-sumi">
              Satu topik → lima sudut pandang,
              <br />
              <span className="font-light italic text-take">lengkap dengan hook & jadwal posting.</span>
            </p>
          </div>

          <p className="hidden px-2 font-body text-xs leading-relaxed text-sumi/30 lg:block">
            Tip: tulis apa adanya. “Gimana cara nabung 1 juta pertama?” sudah cukup untuk memulai.
          </p>
        </div>
      </header>

      <Studio />

      {/* Fitur — warm washi panel */}
      <section id="fitur" className="border-y border-sumi/[0.06] bg-kigami/30 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-mono text-xs tracking-[0.2em] text-akane">なぜ違うのか</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium leading-tight text-sumi sm:text-4xl">
            Bukan chatbot yang berisik.
            <br />
            <span className="font-light italic text-take">Ini teman berpikir yang tenang.</span>
          </h2>
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-sumi/50">
            Dibuat dengan filosofi Jepang: ruang kosong itu penting, jawaban tidak perlu berteriak, dan
            setiap kata punya tempatnya.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.no}
                className="rounded-2xl border border-sumi/[0.06] bg-washi p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-light text-akane/70">{f.no}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sumi/[0.04]">
                    <f.Icon className="h-4 w-4 text-sumi/60" />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-medium text-sumi">{f.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-sumi/55">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cara pakai — like tea ceremony steps */}
      <section id="cara" className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4">
            <p className="font-mono text-xs tracking-[0.2em] text-akane">使い方</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-sumi">
              Sesederhana
              <br />
              <span className="font-light italic">menyeduh teh.</span>
            </h2>
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-sumi/50">
              Tidak ada form panjang atau pengaturan rumit. Tiga langkah, lalu biarkan Georgio menemanimu berpikir.
            </p>
            <a
              href="#studio"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sumi px-6 py-3 font-body text-sm font-medium text-washi transition-opacity hover:opacity-90"
            >
              <PenLine className="h-4 w-4" /> Coba sekarang <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <ol className="col-span-12 lg:col-span-7 lg:col-start-6">
            {STEPS.map((s, i) => (
              <li
                key={s.no}
                className={`flex gap-5 border-t border-sumi/[0.06] py-7 ${i === 1 ? "lg:pl-10" : ""} ${i === 2 ? "lg:pl-4" : ""}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-akane font-display text-sm font-medium text-washi">
                  {s.no}
                </span>
                <div>
                  <h3 className="font-display text-base font-medium text-sumi">{s.title}</h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-sumi/55">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
