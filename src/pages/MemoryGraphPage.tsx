import { useCallback, useEffect, useState } from "react";
import { deleteMemory, listMemories, saveMemory } from "../utils/cloudbase";
import type { MemoryRecord } from "../utils/cloudbase";

interface Props {
  signedIn: boolean;
  onSignIn: () => void;
}

const KINDS = ["note", "insight", "prompt", "fact"] as const;

/**
 * Memory Graph — the database surface. Reads and writes are owner-scoped by
 * CloudBase security rules; this component only enforces the auth gate in the
 * UI and validates shape before it ever reaches the SDK.
 */
export default function MemoryGraph({ signedIn, onSignIn }: Props) {
  const [rows, setRows] = useState<MemoryRecord[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setRows([]);
      return;
    }
    setBusy(true);
    try {
      setRows(await listMemories(20));
      setErr(null);
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setErr(code === "AUTH_REQUIRED" ? "Sesi berakhir. Masuk lagi." : "Gagal memuat data.");
    } finally {
      setBusy(false);
    }
  }, [signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function add() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErr("Judul wajib diisi.");
      return;
    }
    setBusy(true);
    setErr(null);
    setStatus(null);
    try {
      await saveMemory({ title: cleanTitle, body: body.trim(), kind, tags: [] });
      setTitle("");
      setBody("");
      setStatus("已保存 · memory tersimpan.");
      await refresh();
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setErr(code === "AUTH_REQUIRED" ? "Masuk dulu untuk menyimpan." : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await deleteMemory(id);
      setRows((r) => r.filter((x) => x._id !== id));
    } catch {
      setErr("Gagal menghapus.");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-start gap-space-md">
        <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl leading-none">lock</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Memory Graph Terkunci</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Data pribadi disimpan owner-scoped. Masuk untuk membaca dan menulis memory milikmu sendiri.
        </p>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all"
        >
          <span className="material-symbols-outlined text-base leading-none">login</span>
          Masuk untuk Melanjutkan
        </button>
      </section>
    );
  }

  return (
    <div className="w-full flex flex-col gap-space-lg">
      {/* Composer */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary">
            <span className="material-symbols-outlined text-2xl leading-none">hub</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Memory Graph</span>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary text-on-primary font-medium tracking-wider">
                OWNER SCOPED
              </span>
            </div>
            <span className="font-label-md text-label-md text-outline">
              {rows.length} entri · data terisolasi per akun
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-space-md">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Judul memory…"
            aria-label="Judul memory"
            className="col-span-12 sm:col-span-5 rounded-xl bg-surface-container-low px-space-md py-space-sm font-body-lg text-body-lg text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Tipe memory"
            className="col-span-12 sm:col-span-3 rounded-xl bg-surface-container-low px-space-md py-space-sm font-label-lg text-label-lg text-on-surface outline-none focus:border-primary transition-colors"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div className="col-span-12 sm:col-span-4 flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => void add()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-space-xs rounded-full bg-primary text-on-primary font-label-lg text-label-lg py-space-sm px-space-lg shadow-md hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base leading-none">save</span>
              Simpan
            </button>
            {status && <span className="font-label-sm text-label-sm text-primary">{status}</span>}
            {err && (
              <span role="alert" className="font-label-sm text-label-sm text-error">
                {err}
              </span>
            )}
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={20000}
          placeholder="Isi memory, insight, atau fakta yang ingin kamu simpan…"
          aria-label="Isi memory"
          className="w-full resize-y rounded-xl bg-surface-container-low px-space-md py-space-sm font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
        />
      </section>

      {/* List */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-space-md py-space-xl text-center font-body-md text-body-md text-outline">
            Belum ada memory. Simpan yang pertama di atas.
          </p>
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {rows.map((r) => (
              <li
                key={r._id}
                className="group flex items-start justify-between gap-space-md px-space-md py-space-md transition-colors hover:bg-surface-container-low"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      {r.kind}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{r.title}</h3>
                  </div>
                  {r.body && (
                    <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {r.body}
                    </p>
                  )}
                  <span className="mt-space-xs inline-block font-label-sm text-label-sm text-outline">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : "—"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(r._id)}
                  disabled={busy}
                  aria-label={`Hapus memory ${r.title}`}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-lg leading-none">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}