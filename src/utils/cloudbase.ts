/**
 * Georgio AI — runtime config.
 * VITE_AGENT_URL: base URL agent server (e.g. https://xxx.trycloudflare.com).
 * Kosong = mode lokal. Default 127.0.0.1 ditangani di lib/agui-client.ts.
 */
export const AGENT_URL = (import.meta.env.VITE_AGENT_URL as string | undefined)?.trim() ?? "";
export const APP_NAME = "Georgio AI";
export const APP_TAGLINE = "pikiran tenang, jawaban jernih — 静かな思考";
