import { useState } from "react";
import type { FormEvent } from "react";
import { hasCloudBase, signIn, signUp } from "../utils/cloudbase";

type Mode = "signin" | "signup";

const PRESETS = [
  "Buat prototype komponen Button interactive dengan kinetic feedback...",
  "Optimasi prompt system untuk memangkas latensi token model...",
];

/**
 * Account surface. Deliberately minimal: CloudBase owns the credential, the
 * browser only relays it, and no token is ever persisted locally.
 */
export default function AuthPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);

    const mail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
      setErr("Format email belum benar.");
      return;
    }
    if (password.length < 8) {
      setErr("Kata sandi minimal 8 karakter.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(mail, password);
        onBack();
      } else {
        await signUp(mail, password);
        setNotice("Akun dibuat. Sekarang masuk.");
        setMode("signin");
      }
    } catch (e2) {
      const code = e2 instanceof Error ? e2.message : "";
      if (code === "NEEDS_OTP") {
        setErr("Provider email butuh verifikasi OTP. Cek email lalu masuk.");
      } else if (code === "NO_ENV") {
        setErr("Backend belum dikonfigurasi.");
      } else {
        setErr("Email atau kata sandi tidak cocok.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      <div className="relative w-full min-h-screen overflow-hidden violet-wash">
        {/* Ambient ungu kaca */}
        <div className="violet-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-32 w-[680px] h-[680px] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 w-96 h-96 rounded-full bg-tertiary-container/25 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-margin py-space-xl min-h-screen flex items-center">
          <div className="grid grid-cols-12 gap-space-xl w-full items-center">
            {/* Editorial left column */}
            <div className="col-span-12 lg:col-span-5 flex flex-col items-start gap-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full glass shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="font-label-md text-label-md text-primary font-semibold tracking-wide">
                  Secure Identity Gateway
                </span>
              </div>
              <h1 className="display-tight font-headline-xl text-headline-xl text-on-surface">
                Masuk ke
                <br />
                <span className="text-primary">Georgio✦</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md leading-relaxed">
                Satu akun untuk seluruh workspace: chat, memory graph, dan prompt studio.
                Kredensial tidak pernah disimpan di perangkat ini.
              </p>
              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                {PRESETS.map((p) => (
                  <span
                    key={p}
                    className="px-space-md py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm"
                  >
                    {p.split(" ").slice(0, 4).join(" ")}…
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onBack}
                className="mt-space-sm inline-flex items-center gap-space-xs font-label-lg text-label-lg text-secondary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
                Kembali ke aplikasi
              </button>
            </div>

            {/* Auth card */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="glass rounded-[28px] shadow-xl p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-tertiary-container flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-xl leading-none">lock</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        {mode === "signin" ? "Sign In" : "Create Account"}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        Password minimal 8 karakter
                      </span>
                    </div>
                  </div>
                  <div
                    className="inline-flex bg-surface-container-low rounded-full p-0.5"
                    role="tablist"
                    aria-label="Pilih mode autentikasi"
                  >
                    {(["signin", "signup"] as Mode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => {
                          setMode(m);
                          setErr(null);
                          setNotice(null);
                        }}
                        className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors ${
                          mode === m
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {m === "signin" ? "Masuk" : "Daftar"}
                      </button>
                    ))}
                  </div>
                </div>

                {!hasCloudBase && (
                  <p className="rounded-xl bg-tertiary-fixed/40 px-space-md py-space-sm font-body-sm text-body-sm text-tertiary">
                    Backend belum dikonfigurasi. Set VITE_CLOUDBASE_ENV_ID lalu deploy ulang.
                  </p>
                )}

                <form onSubmit={submit} className="flex flex-col gap-space-md" noValidate>
                  <label className="flex flex-col gap-space-xs">
                    <span className="font-label-md text-label-md text-on-surface-variant">Email</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@contoh.com"
                      className="w-full rounded-xl bg-surface-container-low border border-transparent px-space-md py-space-sm font-body-lg text-body-lg text-on-surface placeholder:text-outline outline-none transition-colors focus:border-primary focus:bg-surface-container-lowest"
                    />
                  </label>

                  <label className="flex flex-col gap-space-xs">
                    <span className="font-label-md text-label-md text-on-surface-variant">Kata Sandi</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={8}
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-surface-container-low border border-transparent px-space-md py-space-sm font-body-lg text-body-lg text-on-surface placeholder:text-outline outline-none transition-colors focus:border-primary focus:bg-surface-container-lowest"
                    />
                  </label>

                  {err && (
                    <p
                      role="alert"
                      className="rounded-xl bg-error-container px-space-md py-space-sm font-body-sm text-body-sm text-on-error-container flex items-center gap-space-xs"
                    >
                      <span className="material-symbols-outlined text-base leading-none">error</span>
                      {err}
                    </p>
                  )}
                  {notice && (
                    <p
                      role="status"
                      className="rounded-xl bg-secondary-container px-space-md py-space-sm font-body-sm text-body-sm text-on-secondary-container"
                    >
                      {notice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy || !hasCloudBase}
                    className="inline-flex items-center justify-center gap-space-xs rounded-full bg-on-surface text-white font-label-lg text-label-lg py-space-sm shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {busy ? (
                      <>
                        <span className="material-symbols-outlined text-base leading-none animate-spin">
                          progress_activity
                        </span>
                        Memproses…
                      </>
                    ) : mode === "signin" ? (
                      "Masuk dengan Aman"
                    ) : (
                      "Buat Akun"
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-space-xs pt-space-xs border-t border-surface-container-high">
                  <span className="material-symbols-outlined text-base leading-none text-primary">
                    verified_user
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    * Session diverifikasi · token tidak disimpan lokal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}