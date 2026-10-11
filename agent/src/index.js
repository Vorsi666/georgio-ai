/** Georgio AI server entry — listens on 9000 (CloudBase Agent default). */
import { run } from "@cloudbase/agent-server";
import { GeorgioAgent } from "./agent.js";

const port = Number(process.env.PORT ?? 9000);
const enableCors = process.env.ENABLE_CORS === "true";

run({
  createAgent: () => ({ agent: new GeorgioAgent() }),
  port,
  ...(enableCors ? { cors: true } : {}),
});
