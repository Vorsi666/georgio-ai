/**
 * Minimal AG-UI SSE client for Georgio AI.
 *
 * Talks to the agent server's `/send-message` endpoint with the
 * RunAgentInput shape (threadId, runId, messages, tools, context, state,
 * forwardedProps) and parses TEXT_MESSAGE_* / RUN_* events from the stream.
 * No @ag-ui/client dependency — raw fetch + SSE parsing keeps the bundle lean.
 */

export type AgentMode = "tanya" | "ringkas" | "ide";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface WireMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamCallbacks {
  onToken: (delta: string) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;

export function agentUrl(): string {
  const envUrl = (import.meta.env.VITE_AGENT_URL as string | undefined)?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:9000";
  }
  return "";
}

/** Parse one SSE `data:` payload and fold it into the running text. */
function applyEvent(payload: string, acc: { text: string }): string | null {
  let evt: { type?: string; delta?: string; message?: string };
  try {
    evt = JSON.parse(payload) as typeof evt;
  } catch {
    return null;
  }
  switch (evt.type) {
    case "TEXT_MESSAGE_CONTENT":
      if (typeof evt.delta === "string") {
        acc.text += evt.delta;
        return evt.delta;
      }
      return null;
    case "RUN_ERROR":
      throw new Error(evt.message || "Agent mengembalikan error.");
    case "RUN_FINISHED":
    case "TEXT_MESSAGE_END":
    case "RUN_STARTED":
    case "TEXT_MESSAGE_START":
      return null;
    default:
      return null;
  }
}

/**
 * Send messages to the agent and stream the reply.
 * Resolves with the full assistant text when RUN finishes.
 */
export async function streamAgentReply(
  history: ChatMessage[],
  mode: AgentMode,
  cb: StreamCallbacks,
): Promise<string> {
  const base = agentUrl();
  if (!base) throw new Error("NO_AGENT_URL");

  const wire: WireMessage[] = [
    { id: rid(), role: "system", content: `mode:${mode}` },
    ...history.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
  ];

  const res = await fetch(`${base}/send-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      threadId: `web-${mode}`,
      runId: rid(),
      messages: wire,
      tools: [],
      context: [],
      state: {},
      forwardedProps: {},
    }),
    signal: cb.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Agent HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const acc = { text: "" };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const lines = part.split("\n").filter((l) => l.startsWith("data:"));
      if (lines.length === 0) continue;
      const payload = lines.map((l) => l.slice(5).trim()).join("\n");
      if (!payload || payload === "[DONE]") continue;
      const delta = applyEvent(payload, acc);
      if (delta) cb.onToken(delta);
    }
  }
  if (buffer.trim()) {
    const m = buffer.match(/data:\s*(\{.*\})/s);
    if (m) {
      const delta = applyEvent(m[1], acc);
      if (delta) cb.onToken(delta);
    }
  }
  return acc.text;
}

export { rid };
