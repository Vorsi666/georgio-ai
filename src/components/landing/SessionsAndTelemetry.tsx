/**
 * Recent sessions + live telemetry — ported from
 * `desain Georgio agent/Halaman.html` ("Recent Sessions & Activity Summary").
 * Sessions come from the browser's real chat threads, so the list is not fake.
 */
import type { AgentMode, ChatMessage } from "../../lib/agui-client";

export interface SessionSummary {
  id: string;
  title: string;
  agents: string;
  when: string;
  icon: string;
  iconBg: string;
  state: "done" | "saved" | "active";
}

const MODE_AGENTS: Record<AgentMode, string> = {
  tanya: "Orchestrator",
  ringkas: "Analyst",
  ide: "Strategist",
};

function firstUserLine(messages: ChatMessage[]): string | null {
  for (const m of messages) {
    if (m.role === "user" && m.content.trim()) {
      const t = m.content.trim().replace(/\s+/g, " ");
      return t.length > 58 ? `${t.slice(0, 58)}…` : t;
    }
  }
  return null;
}

function relativeTime(ts: number): string {
  if (!ts) return "baru saja";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit yang lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam yang lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function SessionsAndTelemetry({
  threads,
  onOpen,
}: {
  threads: Record<AgentMode, ChatMessage[]>;
  onOpen: () => void;
}) {
  const sessions: SessionSummary[] = (Object.keys(threads) as AgentMode[]).flatMap((mode) => {
    const msgs = threads[mode];
    const title = firstUserLine(msgs);
    if (!title) return [];
    const last = msgs[msgs.length - 1];
    return [
      {
        id: mode,
        title,
        agents: MODE_AGENTS[mode],
        when: relativeTime(last?.at ?? 0),
        icon: mode === "tanya" ? "description" : mode === "ringkas" ? "draw" : "lightbulb",
        iconBg:
          mode === "tanya"
            ? "bg-primary-fixed"
            : mode === "ringkas"
              ? "bg-secondary-fixed"
              : "bg-tertiary-fixed",
        state: last?.role === "assistant" && last.content ? ("done" as const) : ("active" as const),
      },
    ];
  });

  const rows: SessionSummary[] = sessions.length
    ? sessions
    : [
        {
          id: "empty",
          title: "Belum ada percakapan",
          agents: "Orchestrator",
          when: "mulai dari Chat Workspace",
          icon: "description",
          iconBg: "bg-surface-container-highest",
          state: "saved",
        },
      ];

  return (
    <section className="w-full px-margin py-space-xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-space-xl">
        {/* Left: recent conversations */}
        <div className="w-full lg:w-7/12 flex flex-col space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                <span className="text-primary font-bold">* LOGS</span>
                <span>—</span>
                <span>Riwayat Percakapan</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">Sesi Aktif Terakhir</h3>
            </div>
            <span className="font-label-md text-label-md text-primary">{sessions.length} sesi</span>
          </div>

          <div className="space-y-space-sm">
            {rows.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={s.id === "empty" ? onOpen : onOpen}
                className="w-full p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-space-md text-left"
              >
                <div className="flex items-center gap-space-md min-w-0">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-primary` + " " + s.iconBg}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate">
                      {s.title}
                    </h4>
                    <div className="flex items-center gap-space-sm mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                        {s.agents}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">{s.when}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.state === "done" ? "bg-emerald-500" : s.state === "active" ? "bg-primary" : "bg-outline"
                    }`}
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                    {s.state === "done" ? "Selesai" : s.state === "active" ? "Berjalan" : "Tersimpan"}
                  </span>
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">
                    chevron_right
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: telemetry inspector */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Agent Network Telemetry
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary">LIVE / ASYNC</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Status alokasi beban agen otonom pada klaster Georgio Cloud saat ini:
            </p>

            <div className="space-y-space-md">
              {[
                { label: "Memory Buffer (Vector DB)", value: "42% / 64GB", pct: "w-[42%]", bar: "bg-primary" },
                { label: "Inference Concurrency", value: "18 Threads Active", pct: "w-[75%]", bar: "bg-primary-container" },
                { label: "Auto-Refinement Feedback", value: "Optimal (99.8%)", pct: "w-[96%]", bar: "bg-tertiary-container", accent: true },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between font-label-sm text-label-sm mb-1">
                    <span className="text-on-surface font-medium">{row.label}</span>
                    <span className={`font-bold ${row.accent ? "text-tertiary" : "text-primary"}`}>
                      {row.value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.pct} ${row.bar}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-space-lg p-space-md rounded-2xl bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant space-y-1">
              <div className="text-primary font-semibold">* SYSTEM HEURISTIC NOTE:</div>
              <div className="leading-relaxed">
                &quot;All agent sub-routines running with continuous contextual memory caching. Next scheduled
                refinement pass queued for 03:00 WIB.&quot;
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="mt-space-lg w-full inline-flex items-center justify-center gap-space-xs rounded-full bg-inverse-surface text-inverse-on-surface font-label-lg text-label-lg py-space-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base leading-none">terminal</span>
            Buka Terminal
          </button>
        </div>
      </div>
    </section>
  );
}