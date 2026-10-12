import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AgentMode, ChatMessage } from "../../lib/agui-client";
import { rid, streamAgentReply } from "../../lib/agui-client";
import { streamDemoReply } from "../../lib/demo-brain";
import { callFreeAIWeb } from "../../lib/ai-free";
import { FeedbackRow } from "./QuickSuggestions";
import { SUGGESTIONS } from "./QuickSuggestions";

const MODE_META: Record<AgentMode, { label: string; hint: string; placeholder: string; icon: string }> = {
  tanya: {
    label: "Ngobrol",
    hint: "Tanya apa saja — Georgio menjawab dengan tenang dan terstruktur.",
    placeholder: "Tanya Georgio apa saja…",
    icon: "forum",
  },
  ringkas: {
    label: "Ringkas",
    hint: "Tempel tulisan panjang, Georgio ambil intisarinya.",
    placeholder: "Tempel artikel atau tulisan panjang…",
    icon: "content_cut",
  },
};

const MODES: AgentMode[] = ["tanya", "ringkas"];

function loadThreads(): Record<AgentMode, ChatMessage[]> {
  const empty: Record<AgentMode, ChatMessage[]> = { tanya: [], ringkas: [] };
  try {
    const raw = localStorage.getItem("georgio-threads") ?? localStorage.getItem("ruangtanya-threads");
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<AgentMode, ChatMessage[]>>;
      return {
        tanya: Array.isArray(parsed.tanya) ? parsed.tanya : [],
        ringkas: Array.isArray(parsed.ringkas) ? parsed.ringkas : [],
      };
    }
  } catch {
    /* corrupted storage must never block the studio */
  }
  return empty;
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
  threads: controlledThreads,
  onThreadsChange,
  variant = "embedded",
}: {
  /** When provided, threads live in the parent so chat survives navigation. */
  threads?: Record<AgentMode, ChatMessage[]>;
  onThreadsChange?: (t: Record<AgentMode, ChatMessage[]>) => void;
  /** Standalone fills the viewport; embedded keeps the compact landing height. */
  variant?: "standalone" | "embedded";
}) {
  const [mode, setMode] = useState<AgentMode>("tanya");
  const [localThreads, setLocalThreads] = useState<Record<AgentMode, ChatMessage[]>>(loadThreads);
  const controlled = controlledThreads !== undefined;
  const threads = controlledThreads ?? localThreads;
  type Threads = Record<AgentMode, ChatMessage[]>;
  const setThreads: (
    updater: Threads | ((prev: Threads) => Threads),
  ) => void = controlled
    ? (updater) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: Threads) => Threads)(controlledThreads)
            : updater;
        onThreadsChange?.(next);
      }
    : (updater) =>
        setLocalThreads((prev) =>
          typeof updater === "function" ? (updater as (p: Threads) => Threads)(prev) : updater,
        );
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const messages = threads[mode];
  const standalone = variant === "standalone";
  const isEmpty = messages.length === 0;

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

  // Auto-grow composer like Gemini (1 line -> max ~6 lines, then scroll)
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

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

  const statusText =
    live === null ? "menunggu sapaan pertama" : live ? "agent live — streaming" : "AI gratis di browser";

  const composer = (
    <div className="w-full">
      <div className="flex w-full items-end gap-2 rounded-[28px] border border-surface-container-high bg-surface-container-lowest py-2 pl-5 pr-2 shadow-md transition-shadow focus-within:shadow-lg focus-within:border-primary/30">
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={MODE_META[mode].placeholder}
          aria-label="Tanya Georgio"
          className="max-h-40 flex-1 bg-transparent py-2.5 font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:outline-none resize-none leading-relaxed"
        />
        {running ? (
          <button
            type="button"
            onClick={stop}
            title="Hentikan"
            aria-label="Hentikan jawaban"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-on-surface text-surface-container-lowest transition-transform hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl leading-none">stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim()}
            title="Kirim"
            aria-label="Kirim pesan"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-all hover:bg-primary-container hover:scale-105 active:scale-95 disabled:opacity-25 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-xl leading-none">arrow_upward</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-2">
      {/* Gemini-style slim top bar: mode switch + history action */}
      <div className="flex items-center justify-between gap-2 px-1 py-1">
        <div
          role="tablist"
          aria-label="Mode Georgio"
          className="inline-flex items-center gap-0.5 rounded-full bg-surface-container-low p-1"
        >
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => !running && setMode(m)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-label-lg text-label-lg transition-all ${
                  active
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-base leading-none ${active ? "text-primary" : ""}`}>
                  {MODE_META[m].icon}
                </span>
                {MODE_META[m].label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm md:inline-flex ${
              running ? "text-primary" : "text-outline"
            }`}
            title={statusText}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-primary" : "bg-outline-variant"}`} />
            {live === null ? "Siap" : live ? "Live" : "Gratis"}
          </span>
          <button
            type="button"
            onClick={clearThread}
            disabled={running || messages.length === 0}
            title="Chat baru"
            aria-label="Mulai chat baru"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-xl leading-none">edit_square</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        /* ---------- Gemini empty state: centered greeting + hero composer ---------- */
        <div className="flex flex-col items-center px-2 pb-6 pt-10 sm:pt-16">
          <h1 className="max-w-2xl text-center font-headline-lg text-headline-lg text-on-surface sm:text-[44px] sm:leading-[52px]">
            Tulis apa adanya.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary-container bg-clip-text text-transparent">
              Georgio yang merapikan.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-center font-body-md text-body-md text-on-surface-variant">
            {MODE_META[mode].hint}
          </p>
          <div className="mt-8 w-full max-w-3xl">{composer}</div>
          <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
            {(SUGGESTIONS[mode] ?? SUGGESTIONS.tanya).slice(0, 4).map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setInput(s.text)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="min-w-0">
                  <span className="block truncate font-body-md text-body-md text-on-surface">{s.label}</span>
                  <span className="mt-0.5 line-clamp-1 block font-body-sm text-body-sm text-outline">
                    {s.text}
                  </span>
                </span>
                <span className="material-symbols-outlined shrink-0 text-lg text-outline transition-colors group-hover:text-primary">
                  arrow_outward
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ---------- Gemini thread: plain AI text, pill user bubble ---------- */
        <div
          className={
            standalone
              ? "flex h-[calc(100vh-11rem)] flex-col overflow-hidden"
              : "flex flex-col"
          }
        >
          <div
            className={
              standalone
                ? "min-h-0 flex-1 overflow-y-auto px-2"
                : "max-h-[62vh] min-h-[320px] overflow-y-auto px-2"
            }
            role="log"
            aria-live="polite"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 py-6">
              {messages.map((m, i) => {
                const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-[22px] rounded-br-md bg-surface-container px-5 py-3 sm:max-w-[75%]">
                        <p className="whitespace-pre-wrap break-words font-body-lg text-body-lg leading-relaxed text-on-surface">
                          {m.content}
                        </p>
                      </div>
                    </div>
                  );
                }
                const streaming = isLastAssistant && running && !m.content;
                const thinking = m.content === "…";
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary">
                        <span className="material-symbols-outlined text-sm leading-none">smart_toy</span>
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Georgio · {MODE_META[mode].label}
                      </span>
                    </div>
                    <div className="pl-8 font-body-lg text-body-lg leading-[1.75] text-on-surface">
                      {streaming || thinking || !m.content ? (
                        <span className="inline-flex items-center gap-1.5 py-2" aria-label="Georgio sedang mengetik">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-primary/70"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-primary/40"
                            style={{ animationDelay: "300ms" }}
                          />
                        </span>
                      ) : (
                        renderRich(m.content, m.id)
                      )}
                    </div>
                    {isLastAssistant && m.content && m.content !== "…" && (
                      <div className="pl-8 pt-1">
                        <FeedbackRow />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Slim Gemini composer */}
          <div className="sticky bottom-0 bg-gradient-to-t from-surface via-surface to-transparent px-2 pb-1 pt-4">
            <div className="mx-auto w-full max-w-3xl">
              {composer}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
