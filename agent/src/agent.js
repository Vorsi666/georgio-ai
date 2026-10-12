/**
 * GeorgioAgent — custom AG-UI adapter (extends AbstractAgent).
 * RUN_STARTED → TEXT_MESSAGE_START → TEXT_MESSAGE_CONTENT* → TEXT_MESSAGE_END → RUN_FINISHED
 * atau RUN_ERROR. Header sudah natural Jepang-Indonesia.
 */
import { AbstractAgent, EventType } from "@ag-ui/client";
import { Observable } from "rxjs";
import { chunkReply, extractPrompt, generateReply } from "./brain.js";
import { callFreeAI } from "./ai-free.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export class GeorgioAgent extends AbstractAgent {
  run(input) {
    return new Observable((subscriber) => {
      void this._run(subscriber, input).catch((err) => {
        subscriber.next(
          { type: EventType.RUN_ERROR, message: err instanceof Error ? err.message : String(err) },
        );
        subscriber.complete();
      });
    });
  }
  async _run(subscriber, input) {
    const { messages, runId, threadId } = input;
    const messageId = `msg-${Date.now().toString(36)}`;
    const emit = (e) => subscriber.next(e);
    emit({ type: EventType.RUN_STARTED, threadId, runId });
    emit({ type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" });
    try {
      const { mode, prompt, history } = extractPrompt(messages);
      const labels = { tanya: "Ngobrol", ringkas: "Ringkas" };
      let reply = "";
      try {
        reply = await callFreeAI(mode, history?.length ? history : [{ role: "user", content: prompt }]);
      } catch { /* fallback ke brain deterministik */ }
      if (!reply) reply = generateReply(mode, prompt);
      const header = `${labels[mode]} · Georgio AI\n\n`;
      for (const delta of chunkReply(header + reply)) {
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta });
        await delay(14);
      }
      emit({ type: EventType.TEXT_MESSAGE_END, messageId });
      emit({ type: EventType.RUN_FINISHED, threadId, runId });
    } catch (error) {
      emit({ type: EventType.RUN_ERROR, message: error instanceof Error ? error.message : "Georgio tersendat sebentar — coba kirim lagi ya." });
    }
    subscriber.complete();
  }
}
// compat: kode lama import RuangTanyaAgent tetap jalan
export const RuangTanyaAgent = GeorgioAgent;
