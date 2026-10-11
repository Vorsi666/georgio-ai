# 🌸 Georgio AI — ジョルジオ — pikiran tenang, jawaban jernih

Studio AI Jepang yang tenang — **Ngobrol**, **Ringkas**, **Ide** — dengan jawaban natural yang mengalir live (SSE, protokol AG-UI).

- Frontend: React 19 + Vite + Tailwind · palet washi/sumi/akane, font Shippori Mincho + Zen Kaku Gothic New
- Backend: `agent/` — custom AG-UI adapter di atas `@cloudbase/agent-server` + plugin AI gratis (Pollinations, no key)
- Tanpa API key: otak deterministik topic-router + fallback demo lokal tetap nyambung

## ✨ Keamanan data — sudah diamankan sebelum deploy

- Tidak ada secret/API key di repo (Pollinations gratis, no key; `VITE_AGENT_URL` publik, bukan rahasia)
- `.gitignore` menutup: `node_modules`, `dist`, `.env*`, `.agent/.claude/.cursor` & tool IDE, `*.pem/*.key`, `cloudbaserc`
- Data chat disimpan **lokal** di browser (`localStorage` key `georgio-threads`) — tidak dikirim ke server pihak ketiga kecuali stream ke agent-mu sendiri

## Struktur

```
src/
  pages/LandingPage.tsx        landing Japanese wabi-sabi + fitur/cara pakai
  components/studio/Studio.tsx studio 3 mode (streaming, thread per-mode)
  lib/agui-client.ts           klien SSE minimal ke /send-message (raw fetch, no @ag-ui/client di frontend)
  lib/ai-free.ts               AI gratis browser (fallback saat agent mati)
  lib/demo-brain.ts            fallback deterministik (topic router) — mirror agent/src/brain.js
agent/
  src/brain.js                 topic router (overthinking, nabung, fotosintesis, fokus, teknologi, cinta)
  src/ai-free.js              AI gratis server (Pollinations) — coba dulu sebelum fallback
  src/agent.js                GeorgioAgent (AbstractAgent → AG-UI events)
  src/index.js                server entry (port 9000, ENABLE_CORS)
  scf_bootstrap                startup CloudBase
```

## Jalankan lokal

```bash
# 1. frontend
npm install
npm run dev            # http://127.0.0.1:5173

# 2. agent (terminal lain)
cd agent && npm install
ENABLE_CORS=true PORT=9000 node src/index.js   # health: http://127.0.0.1:9000/healthz
```

Frontend otomatis pakai `http://127.0.0.1:9000` saat dibuka dari `127.0.0.1`. Tanpa agent, fallback AI gratis → fallback deterministik tetap jalan.

## Build & preview

```bash
VITE_AGENT_URL=https://your-agent.trycloudflare.com npm run build
npm run preview -- --port 4173 --host 127.0.0.1
```

`vercel.json` sudah ada (SPA rewrite ke `index.html`).

## Deploy

- **Vercel (frontend):** import repo GitHub → framework Vite → env `VITE_AGENT_URL` (kosong = fallback AI gratis, isi = pakai agent live)
- **Agent (opsional):** bisa di mana saja yang bisa `node` (VPS, CloudBase via `manageAgent` runtime `Nodejs20.19`, dll). Butuh `ENABLE_CORS=true` kalau beda origin.

## Lisensi

MIT
