import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AgentMode, ChatMessage } from "../../lib/agui-client";
import { rid, streamAgentReply } from "../../lib/agui-client";
import { streamDemoReply } from "../../lib/demo-brain";
import { callFreeAIWeb } from "../../lib/ai-free";
import { QuickSuggestions, FeedbackRow } from "./QuickSuggestions";

const MODE_META: Record<AgentMode, { label: string; hint: string; placeholder: string; icon: string }> = {
  tanya: {
    label: "Ngobrol",
    hint: "Tanya apa saja — Georgio menjawab dengan tenang dan terstruktur.",
    placeholder: "Ketik pesan atau instruksi untuk Georgio Agent…",
    icon: "forum",
  },
  ringkas: {
    label: "Ringkas",
    hint: "Tempel tulisan panjang, Georgio ambil intisarinya.",
    placeholder: "Tempel artikel, catatan, atau tulisan panjang di sini…",
    icon: "content_cut",
  },
  ide: {
    label: "Ide",
    hint: "Satu topik jadi lima sudut pandang — siap pakai.",
    placeholder: "Tulis satu topik… mis. kedai kopi kecil",
    icon: "lightbulb",
  },
};

const MODES: AgentMode[] = ["tanya", "ringkas", "ide"];

function loadThreads(): Record<AgentMode, ChatMessage[]> {
  try {
    const raw = localStorage.getItem("georgio-threads");
    if (raw) return JSON.parse(raw) as Record<AgentMode, ChatMessage[]>;
    const old = localStorage.getItem("ruangtanya-threads");
    if (old) return JSON.parse(old) as Record<AgentMode, ChatMessage[]>;
  } catch {
    /* corrupted storage must never block the studio */
  }
  return { tanya: [], ringkas: [], ide: [] };
}

/** Minimal inline markdown — no HTML injection, text is escaped by React. */
function inline(text: string, key: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${key}-b${i}`} className="font-semibold text-on-surface">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={`${key}-c${i}`} className="rounded bg-surface-container-high px-1 py-0.5 font-label-md text-label-md text-on-surface">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${key}-t${i}`}>{p}</span>;
  });
}

function renderRich(text: string, keyPrefix: string) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const k = `${keyPrefix}-${i}`;
    if (line.startsWith("### ")) {
      out.push(
        <h4 key={k} className="mb-1 mt-space-md font-headline-sm text-headline-sm text-on-surface">
          {inline(line.slice(4), `${k}-t`)}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      out.push(
        <h3
          key={k}
          className="mb-1 mt-space-md flex items-center gap-space-xs font-headline-sm text-headline-sm text-primary"
        >
          <span className="material-symbols-outlined text-base leading-none">asterisk</span>
          {inline(line.slice(3), `${k}-t`)}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      out.push(
        <p key={k} className="flex gap-space-sm pl-space-sm">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
          <span>{inline(line.slice(2), `${k}-t`)}</span>
        </p>,
      );
    } else if (/^\d+\.\s/.test(line)) {
      const m = /^(\d+)\.\s(.*)$/.exec(line);
      out.push(
        <p key={k} className="flex gap-space-sm pl-space-sm">
          <span className="font-label-sm text-label-sm text-primary">{m?.[1] ?? ""}</span>
          <span>{inline(m?.[2] ?? "", `${k}-t`)}</span>
        </p>,
      );
    } else if (line.trim().length > 0) {
      out.push(
        <p key={k} className="mb-1">
          {inline(line, `${k}-t`)}
        </p>,
      );
    }
  }
  return out;
}

export default function Studio({
  onThreadsChange,
}: {
  /** Lift threads up so the landing page can render the real session list. */
  onThreadsChange?: (t: Record<AgentMode, ChatMessage[]>) => void;
}) {
  const [mode, setMode] = useState<AgentMode>("tanya");
  const [threads, setThreads] = useState<Record<AgentMode, ChatMessage[]>>(loadThreads);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messages = threads[mode];

  useEffect(() => {
    try {
      localStorage.setItem("georgio-threads", JSON.stringify(threads));
    } catch {
      /* storage full or blocked — chat still works in-memory */
    }
    onThreadsChange?.(threads);
  }, [threads, onThreadsChange]);

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

    patch("…");
    let acc = "";

    try {
      // 1) live agent (AG-UI SSE) when VITE_AGENT_URL is configured
      const full = await streamAgentReply(base, mode, {
        signal: ctrl.signal,
        onToken: (d) => {
          acc += d;
          patch(acc);
        },
        onError: () => {},
      });
      acc = full;
      setLive(true);
    } catch {
      // 2) free AI in-browser, WITH conversation history so follow-ups stay on topic
      try {
        acc = "";
        const history = base.map((m) => ({ role: m.role, content: m.content }));
        const text = await callFreeAIWeb(mode, history);
        if (text && text.length > 20) {
          const reply = `${MODE_META[mode].label} · Georgio AI\n\n${text}`;
          for (const chunk of reply.match(/.{1,28}(\s+|$)/g) ?? [reply]) {
            if (ctrl.signal.aborted) break;
            acc += chunk;
            patch(acc);
            await new Promise((r) => setTimeout(r, 14));
          }
          setLive(false);
        } else {
          throw new Error("empty");
        }
      } catch {
        // 3) deterministic offline brain — never leave the user with a broken bubble
        try {
          await streamDemoReply(mode, prompt, (d) => {
            acc += d;
            patch(acc);
          }, ctrl.signal);
          setLive(false);
        } catch {
          patch("Maaf, ada yang tersendat. Coba kirim lagi ya.");
        }
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [input, running, mode, threads]);

  const clearThread = useCallback(() => {
    setThreads((t) => ({ ...t, [mode]: [] }));
  }, [mode]);

  return (
    <section className="w-full flex flex-col gap-space-lg">
      {/* Session sub-header */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary">
            <span className="material-symbols-outlined text-2xl leading-none">smart_toy</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Georgio Agent v2.4</span>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary text-on-primary font-medium tracking-wider">
                ULTRA MODE
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-outline font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Online &amp; Siap Membantu
              <span className="text-outline-variant">•</span>
              <span className="hidden sm:inline">Kontekstual 128k Tokens</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative inline-flex items-center bg-surface-container-low hover:bg-surface-container rounded-full px-space-md py-space-xs transition-colors">
            <span className="material-symbols-outlined text-primary text-base mr-1.5">auto_awesome</span>
            <span className="font-label-lg text-label-lg text-on-surface">Free AI Fallback</span>
            <span className="material-symbols-outlined text-outline text-sm ml-1">expand_more</span>
          </div>
          <button
            type="button"
            onClick={clearThread}
            disabled={running || messages.length === 0}
            className="inline-flex items-center gap-1 px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-base leading-none">ink_eraser</span>
            Bersihkan
          </button>
        </div>
      </section>

      {/* Mode rail */}
      <div className="flex flex-col sm:flex-row gap-space-sm">
        {MODES.map((m, idx) => {
          const active = mode === m;
          const meta = MODE_META[m];
          return (
            <button
              key={m}
              type="button"
              onClick={() => !running && setMode(m)}
              aria-pressed={active}
              className={`flex flex-1 items-start gap-space-sm rounded-xl p-space-md text-left transition-all ${
                active
                  ? "bg-secondary-container text-on-secondary-container shadow-sm"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? "bg-primary text-on-primary" : "bg-surface-container-high text-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-lg leading-none">{meta.icon}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-space-xs">
                  <span className="font-headline-sm text-headline-sm">{meta.label}</span>
                  <span className="font-label-sm text-label-sm opacity-60">0{idx + 1}</span>
                </span>
                <span className="mt-0.5 block font-body-sm text-body-sm opacity-75">{meta.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Chat canvas */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-space-md py-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-primary" : "bg-primary"}`} />
            <span className="font-headline-sm text-headline-sm text-on-surface">{MODE_META[mode].label}</span>
            <span className="hidden font-label-sm text-label-sm text-outline sm:inline">
              {MODES.indexOf(mode) + 1} / 3 · {mode}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline">
            {live === null ? "menunggu sapaan pertama" : live ? "● agent live — streaming" : "● AI gratis di browser"}
          </span>
        </div>

        <div
          className="flex-1 min-h-[320px] max-h-[56vh] overflow-y-auto px-space-md py-space-md flex flex-col gap-space-lg"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center gap-space-md">
              <p className="font-headline-lg text-headline-lg text-on-surface">
                Tulis apa adanya.
                <br />
                <span className="text-primary">Georgio yang merapikan.</span>
              </p>
              <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
                {MODE_META[mode].hint} Pilih salah satu contoh di bawah untuk mengisi.
              </p>
              <div className="flex flex-wrap gap-space-xs">
                {(
                  mode === "tanya"
                    ? ["Buat analisis tren visual UI design 2025", "Apa bedanya tabungan dan deposito?"]
                    : mode === "ringkas"
                      ? ["Tempel tulisan panjangmu di sini…"]
                      : ["kedai kopi kecil di gang", "tips hemat anak kos"]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="px-space-md py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all hover:bg-primary hover:text-on-primary"
                  >
                    {s.length > 42 ? s.slice(0, 42) + "…" : s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
              return m.role === "user" ? (
                <article key={m.id} className="flex flex-row-reverse items-start gap-space-md max-w-4xl self-end w-full">
                  <div className="max-w-2xl flex flex-col items-end gap-space-xs">
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
                      <span className="font-semibold text-on-surface">You</span>
                    </div>
                    <div className="p-space-lg rounded-2xl rounded-tr-xs bg-primary text-on-primary shadow-md">
                      <p className="font-body-lg text-body-lg leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    </div>
                  </div>
                </article>
              ) : (
                <article key={m.id} className="flex items-start gap-space-md max-w-5xl self-start w-full">
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md">
                      <span className="material-symbols-outlined text-xl leading-none">smart_toy</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                      <span className="text-tertiary font-bold text-[11px] leading-none">*</span>
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-space-sm min-w-0">
                    <div className="flex flex-wrap items-center gap-space-sm font-label-sm text-label-sm text-outline">
                      <span className="font-semibold text-primary">Georgio Agent</span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">
                        {MODE_META[mode].label}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-lowest rounded-2xl rounded-tl-xs p-space-lg shadow-sm">
                      <div className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                        {m.content ? (
                          renderRich(m.content, m.id)
                        ) : (
                          <span className="inline-flex gap-1 py-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-container-highest" />
                            <span
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-container-highest"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-container-highest"
                              style={{ animationDelay: "300ms" }}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  {isLastAssistant && m.content && <FeedbackRow />}
                </div>
                </article>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer — quick suggestion dock mirrors chat.html's floating dock */}
        <div className="px-space-md py-space-md border-t border-surface-container-high flex flex-col gap-space-sm">
          <QuickSuggestions mode={mode} onPick={setInput} />
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-sm flex flex-col gap-space-xs focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder={MODE_META[mode].placeholder}
              aria-label="Pesan untuk Georgio Agent"
              className="w-full bg-transparent px-space-sm py-space-xs font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-lg text-outline">psychology</span>
                <span className="font-label-sm text-label-sm text-secondary">Deep Reasoning ON</span>
              </div>
              {running ? (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center justify-center gap-space-xs rounded-full bg-tertiary-container text-on-tertiary-container font-label-lg text-label-lg px-space-lg py-space-sm shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-lg leading-none">stop_circle</span>
                  Hentikan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!input.trim()}
                  className="inline-flex items-center justify-center gap-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100"
                >
                  <span>Kirim</span>
                  <span className="material-symbols-outlined text-lg leading-none">arrow_upward</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-space-sm mt-space-sm font-label-sm text-label-sm text-outline">
            <span>* Riwayat lokal di browser ini</span>
            <span>•</span>
            <span>{live ? "agent live" : "AI gratis di browser"}</span>
          </div>
        </div>
      </section>
    </section>
  );
}