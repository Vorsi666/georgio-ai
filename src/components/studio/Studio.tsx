import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Eraser, HelpCircle, Lightbulb, Scissors, SendHorizontal, Square } from "lucide-react";
import type { AgentMode, ChatMessage } from "../../lib/agui-client";
import { rid, streamAgentReply } from "../../lib/agui-client";
import { streamDemoReply } from "../../lib/demo-brain";
import { callFreeAIWeb } from "../../lib/ai-free";

const MODE_META: Record<AgentMode, { label: string; hint: string; placeholder: string; Icon: typeof HelpCircle }> = {
  tanya: {
    label: "Ngobrol",
    hint: "Tanya apa saja — Georgio menjawab dengan tenang dan terstruktur.",
    placeholder: "Tulis apa yang ada di pikiranmu…",
    Icon: HelpCircle,
  },
  ringkas: {
    label: "Ringkas",
    hint: "Tempel tulisan panjang, Georgio ambil intisarinya.",
    placeholder: "Tempel artikel, catatan, atau tulisan panjang di sini…",
    Icon: Scissors,
  },
  ide: {
    label: "Ide",
    hint: "Satu topik jadi lima sudut pandang — siap pakai.",
    placeholder: "Tulis satu topik… mis. kedai kopi kecil",
    Icon: Lightbulb,
  },
};

const MODES: AgentMode[] = ["tanya", "ringkas", "ide"];

function modeLabel(mode: AgentMode): string {
  return MODE_META[mode].label;
}

function loadThreads(): Record<AgentMode, ChatMessage[]> {
  try {
    const raw = localStorage.getItem("georgio-threads");
    if (raw) return JSON.parse(raw) as Record<AgentMode, ChatMessage[]>;
    // migrate old key
    const old = localStorage.getItem("ruangtanya-threads");
    if (old) return JSON.parse(old) as Record<AgentMode, ChatMessage[]>;
  } catch { /* ignore */ }
  return { tanya: [], ringkas: [], ide: [] };
}

function renderRich(text: string, keyPrefix: string) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const k = `${keyPrefix}-${i}`;
    if (line.startsWith("### ")) {
      out.push(<h4 key={k} className="mb-1 mt-5 font-display text-[1.02rem] font-medium text-sumi">{inline(line.slice(4), `${k}-t`)}</h4>);
    } else if (line.startsWith("## ")) {
      out.push(
        <h3 key={k} className="mb-1 mt-5 flex items-center gap-2 font-display text-[1.08rem] font-medium text-sumi">
          <span className="h-3 w-px shrink-0 bg-akane/60" aria-hidden />
          {inline(line.slice(3), `${k}-t`)}
        </h3>,
      );
    } else if (/^\d+\.\s/.test(line)) {
      out.push(
        <p key={k} className="my-1.5 flex gap-2 font-body text-sm leading-relaxed">
          <span className="font-mono text-xs text-akane">{line.match(/^\d+/)?.[0]}.</span>
          <span>{inline(line.replace(/^\d+\.\s*/, ""), `${k}-t`)}</span>
        </p>,
      );
    } else if (line.trim() === "---") {
      out.push(<hr key={k} className="my-5 border-t border-sumi/[0.06]" />);
    } else if (line.trim() === "") {
      out.push(<div key={k} className="h-2" />);
    } else {
      out.push(<p key={k} className="my-1 font-body text-[0.93rem] leading-relaxed text-sumi/80">{inline(line, `${k}-t`)}</p>);
    }
  }
  return out;
}

function inline(text: string, k: string) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={`${k}-${n++}`} className="font-medium text-sumi">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) parts.push(<em key={`${k}-${n++}`} className="italic text-sumi/70">{tok.slice(1, -1)}</em>);
    else parts.push(<code key={`${k}-${n++}`} className="rounded bg-sumi/[0.06] px-1 font-mono text-[0.82em]">{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function Studio() {
  const [mode, setMode] = useState<AgentMode>("tanya");
  const [threads, setThreads] = useState<Record<AgentMode, ChatMessage[]>>(loadThreads);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = threads[mode];

  useEffect(() => {
    try { localStorage.setItem("georgio-threads", JSON.stringify(threads)); } catch { /* ignore */ }
  }, [threads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, mode]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
  }, []);

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || running) return;
    setInput("");
    const userMsg: ChatMessage = { id: rid(), role: "user", content: prompt };
    const asstId = rid();
    const base = [...threads[mode], userMsg];
    setThreads((t) => ({ ...t, [mode]: [...base, { id: asstId, role: "assistant", content: "" }] }));
    setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const patch = (content: string) =>
      setThreads((t) => ({ ...t, [mode]: t[mode].map((m) => (m.id === asstId ? { ...m, content } : m)) }));
    // Free AI can take a few seconds (or retry): show it is thinking, not hung.
    patch("…");
    let acc = "";
    try {
      const full = await streamAgentReply(base, mode, {
        signal: ctrl.signal,
        onToken: (d) => { acc += d; patch(acc); },
        onError: () => {},
      });
      acc = full;
      setLive(true);
    } catch {
      // fallback 1: free AI (browser, no key) — jawaban benar-benar nyambung
      try {
        acc = "";
        // kirim riwayat, bukan cuma pesan terakhir — supaya "kenapa?"/"terus?" nyambung
        const history = base.map((m) => ({ role: m.role, content: m.content }));
        const text = await callFreeAIWeb(mode, history);
        if (text && text.length > 20) {
          const full = `${modeLabel(mode)} · Georgio AI\n\n${text}`;
          for (const ch of full.match(/.{1,28}(\s+|$)/g) ?? [full]) {
            if (ctrl.signal.aborted) break;
            acc += ch; patch(acc);
            await new Promise(r => setTimeout(r, 14));
          }
          setLive(false);
        } else throw new Error("empty");
      } catch {
        // fallback 2: deterministic brain (offline)
        try {
          acc = "";
          await streamDemoReply(mode, prompt, (d) => { acc += d; patch(acc); }, ctrl.signal);
          setLive(false);
        } catch { patch("Maaf, ada yang tersendat. Coba kirim lagi ya."); }
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  }, [input, running, threads, mode]);

  const clearThread = useCallback(() => setThreads((t) => ({ ...t, [mode]: [] })), [mode]);

  return (
    <section id="studio" className="relative mx-auto grid max-w-6xl grid-cols-12 gap-6 px-5 pb-20 pt-6">
      {/* Mode rail */}
      <div className="col-span-12 flex gap-2 lg:col-span-3 lg:flex-col">
        {(["tanya", "ringkas", "ide"] as AgentMode[]).map((m, idx) => {
          const { Icon } = MODE_META[m];
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => !running && setMode(m)}
              className={`flex flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition-all lg:flex-none ${
                active
                  ? "border-sumi bg-sumi text-washi shadow-[0_8px_24px_rgba(28,28,30,0.12)]"
                  : "border-sumi/[0.08] bg-washi text-sumi hover:border-sumi/15 hover:bg-kigami/40"
              }`}
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${active ? "bg-washi/15 text-washi" : "bg-sumi/[0.04] text-sumi/50"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-[1.02rem] font-medium">{MODE_META[m].label}</span>
                  <span className={`font-mono text-[0.62rem] tracking-widest ${active ? "text-washi/40" : "text-sumi/30"}`}>0{idx + 1}</span>
                </span>
                <span className={`mt-1 block font-body text-xs leading-relaxed ${active ? "text-washi/60" : "text-sumi/50"}`}>{MODE_META[m].hint}</span>
              </span>
            </button>
          );
        })}
        <p className="hidden pt-2 font-mono text-[0.65rem] leading-relaxed text-sumi/30 lg:block">
          {live === null ? "menunggu sapaan pertama" : live ? "● agent live — Georgio streaming" : "● AI gratis di browser — tetap menemani"}
          <br />riwayat tersimpan di browser ini
        </p>
      </div>

      {/* Chat panel */}
      <div className="col-span-12 lg:col-span-8 lg:col-start-5">
        <div className="overflow-hidden rounded-[1.5rem] border border-sumi/[0.08] bg-washi shadow-[0_12px_40px_rgba(28,28,30,0.08)]">
          <div className="flex items-center justify-between border-b border-sumi/[0.06] bg-kigami/20 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-akane" : live ? "bg-take" : "bg-kinari"}`} />
              <span className="font-display text-sm font-medium text-sumi">{MODE_META[mode].label}</span>
              <span className="hidden font-mono text-[0.62rem] tracking-widest text-sumi/30 sm:inline">{MODES.indexOf(mode) + 1} / 3 · {mode}</span>
            </div>
            <button onClick={clearThread} disabled={running || messages.length === 0} className="inline-flex items-center gap-1 font-body text-xs text-sumi/40 hover:text-akane disabled:opacity-30">
              <Eraser className="h-3.5 w-3.5" /> bersihkan
            </button>
          </div>

          <div className="h-[46vh] min-h-[320px] overflow-y-auto px-5 py-5" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-start justify-center gap-3 py-6">
                <p className="font-display text-2xl font-light leading-snug text-sumi">
                  Tulis apa adanya.
                  <br />
                  <span className="font-medium text-take">Georgio yang merapikan.</span>
                </p>
                <p className="max-w-md font-body text-sm leading-relaxed text-sumi/50">{MODE_META[mode].hint} Coba salah satu contoh — ketuk untuk mengisi.</p>
                <div className="flex flex-wrap gap-2">
                  {(mode === "tanya" ? ["Gimana biar fokus kerja 2 jam tanpa buka HP?", "Apa bedanya tabungan dan deposito sih?"] : mode === "ringkas" ? ["Tempel tulisan panjangmu di sini…"] : ["kedai kopi kecil di gang", "tips hemat anak kos"]).map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="rounded-full border border-sumi/10 bg-kigami/40 px-3.5 py-1.5 text-left font-body text-xs text-sumi/70 hover:border-akane/20 hover:text-akane">
                      {s.length > 42 ? s.slice(0, 42) + "…" : s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="mb-4 flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-sumi px-4 py-2.5 font-body text-sm leading-relaxed text-washi">{m.content}</div>
                </div>
              ) : (
                <div key={m.id} className="mb-5 flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-take font-display text-xs font-medium text-washi">G</div>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-sumi/[0.06] bg-kigami/30 px-4 py-3 font-body text-sm leading-relaxed text-sumi/80">
                    {m.content ? renderRich(m.content, m.id) : <span className="inline-flex gap-1 py-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sumi/20" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sumi/20" style={{ animationDelay: "150ms" }} /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sumi/20" style={{ animationDelay: "300ms" }} /></span>}
                  </div>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-sumi/[0.06] bg-kigami/10 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                rows={2}
                placeholder={MODE_META[mode].placeholder}
                className="max-h-32 flex-1 resize-none rounded-2xl border border-sumi/10 bg-washi px-4 py-3 font-body text-sm leading-relaxed outline-none placeholder:text-sumi/30 focus:border-sumi/20 focus:ring-1 focus:ring-sumi/10"
              />
              {running ? (
                <button onClick={stop} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-akane px-5 py-3 font-body text-sm font-medium text-washi"><Square className="h-4 w-4" /> Hentikan</button>
              ) : (
                <button onClick={() => void send()} disabled={!input.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sumi px-5 py-3 font-body text-sm font-medium text-washi transition-opacity hover:opacity-90 disabled:opacity-30">
                  <SendHorizontal className="h-4 w-4" /> Kirim
                </button>
              )}
            </div>
            <p className="mt-2 px-1 font-mono text-[0.62rem] text-sumi/30">enter · kirim · shift+enter · baris baru · {live === false || live === null ? "AI gratis di browser" : "agent live"} · tanpa login</p>
          </div>
        </div>
      </div>
    </section>
  );
}
