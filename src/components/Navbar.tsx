import { Link } from "react-router-dom";
import { ArrowUpRight, Flower2, MessagesSquare, Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-sumi/10 bg-washi/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-akane text-washi">
            <Flower2 className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-sumi">
            Georgio AI
            <span className="ml-2 hidden font-body text-[0.68rem] font-normal tracking-[0.2em] text-sumi/40 sm:inline">
              ジョルジオ
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <a href="#studio" className="hidden items-center gap-1.5 text-sumi/60 hover:text-akane sm:inline-flex">
            <MessagesSquare className="h-4 w-4" /> Studio
          </a>
          <a href="#fitur" className="hidden items-center gap-1.5 text-sumi/60 hover:text-akane sm:inline-flex">
            <Sparkles className="h-4 w-4" /> Fitur
          </a>
          <a
            href="#studio"
            className="inline-flex items-center gap-1.5 rounded-full bg-sumi px-5 py-2 font-body text-sm font-medium text-washi transition-opacity hover:opacity-90"
          >
            Coba sekarang <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
