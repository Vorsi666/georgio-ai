const Footer = () => {
  return (
    <footer className="border-t border-sumi/10 bg-sumi text-washi">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              Georgio<span className="font-light"> AI</span>
            </p>
            <p className="mt-1 font-body text-sm tracking-[0.3em] text-washi/40">ジョルジオ・エーアイ — 静かな思考</p>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-washi/60">
              Asisten yang tenang. Tanya apa saja, minta diringkas, atau cari ide — dijawab perlahan,
              mengalir, seperti ngobrol di pagi yang hening.
            </p>
          </div>
          <div className="flex gap-10 font-body text-sm">
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-widest text-washi/30">NAVIGASI</p>
              <a href="#studio" className="block text-washi/70 hover:text-washi">Studio</a>
              <a href="#fitur" className="block text-washi/70 hover:text-washi">Fitur</a>
              <a href="#cara" className="block text-washi/70 hover:text-washi">Cara pakai</a>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-widest text-washi/30">TEKNOLOGI</p>
              <p className="text-washi/40">AG-UI · SSE</p>
              <p className="text-washi/40">React + Vite</p>
              <a href="https://docs.cloudbase.net" target="_blank" rel="noopener noreferrer" className="block text-washi/40 hover:text-washi">CloudBase</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-washi/10 pt-6 font-mono text-xs text-washi/30 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Georgio AI · Dibuat dengan ketenangan</span>
          <span className="tracking-widest">一期一会 · ichi-go ichi-e</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
