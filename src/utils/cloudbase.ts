/**
 * Georgio Agent — CloudBase runtime (auth + database).
 *
 * Security posture (why this file looks defensive):
 * - The browser only ever holds a *publishable* access key. No secret key,
 *   no service credential, ever reaches the bundle.
 * - Every user-scoped DB call is gated on a real `getSession()` result. A
 *   populated `getLoginState()` is NOT proof of login, so we never use it.
 * - Queries are owner-scoped at the rule layer; the client only filters for UX.
 * - Nothing sensitive (tokens, uid maps) is written to localStorage.
 */
import cloudbase from "@cloudbase/js-sdk";

const ENV_ID = (import.meta.env.VITE_CLOUDBASE_ENV_ID as string | undefined)?.trim() ?? "";
const ACCESS_KEY = (import.meta.env.VITE_CLOUDBASE_ACCESS_KEY as string | undefined)?.trim() ?? "";

/** True only when the app is configured to talk to a real environment. */
export const hasCloudBase = ENV_ID.length > 0;

type Sdk = ReturnType<typeof cloudbase.init>;

let app: Sdk | null = null;

function getApp(): Sdk | null {
  if (!hasCloudBase) return null;
  if (!app) {
    app = cloudbase.init(
      ACCESS_KEY.length > 0 ? { env: ENV_ID, accessKey: ACCESS_KEY } : { env: ENV_ID },
    );
  }
  return app;
}

function requireAuth() {
  const a = getApp();
  if (!a) throw new Error("NO_ENV");
  return a.auth;
}

function requireDb() {
  const a = getApp();
  if (!a) throw new Error("NO_ENV");
  // SDK v3: database is a factory, not a namespace property.
  return a.database();
}

/* --------------------------------- auth --------------------------------- */

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
}

/**
 * Reliable login proof. `getSession()` resolves `session === undefined` when
 * nobody is signed in — unlike the deprecated `getLoginState()`.
 */
export async function getSession(): Promise<SessionUser | null> {
  if (!hasCloudBase) return null;
  try {
    const auth = requireAuth();
    const state = await auth.getSession();
    const session = (state as { session?: unknown }).session;
    if (!session) return null;
    const raw = session as { user?: unknown };
    const u = raw.user as
      | { uid?: string; sub?: string; name?: string; email?: string; anonymous?: boolean }
      | undefined;
    // Anonymous sessions are not a real account — never treat them as logged in.
    if (!u || u.anonymous === true) return null;
    const uid = u.uid ?? u.sub ?? "";
    if (!uid) return null;
    return { uid, name: u.name ?? u.email ?? "Pengguna", email: u.email ?? "" };
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  const auth = requireAuth();
  await auth.signInWithPassword({ username: email, password });
  const u = await getSession();
  if (!u) throw new Error("SESSION_MISSING");
  return u;
}

export async function signUp(email: string, password: string): Promise<void> {
  const auth = requireAuth();
  // Registration may require an OTP depending on the enabled email provider;
  // the returned payload tells us which path the environment uses.
  const res = (await auth.signUp({ email, password })) as {
    data?: { verifyOtp?: boolean };
  };
  if (res?.data?.verifyOtp === true) {
    throw new Error("NEEDS_OTP");
  }
}

export async function signOut(): Promise<void> {
  if (!hasCloudBase) return;
  try {
    await requireAuth().signOut();
  } catch {
    /* session already gone */
  }
}

/* ------------------------------- database ------------------------------- */

export interface MemoryRecord {
  _id: string;
  title: string;
  body: string;
  kind: string;
  tags: string[];
  createdAt: number;
}

const COLLECTION = "georgio_memory";

const asString = (v: unknown, max: number): string =>
  typeof v === "string" ? v.slice(0, max) : "";

function toRecord(d: Record<string, unknown>): MemoryRecord {
  const tags = Array.isArray(d.tags) ? d.tags.filter((t): t is string => typeof t === "string").slice(0, 8) : [];
  return {
    _id: String(d._id ?? ""),
    title: asString(d.title, 140),
    body: asString(d.body, 20000),
    kind: asString(d.kind, 24) || "note",
    tags,
    createdAt: Number(d.createdAt ?? 0),
  };
}

/** Persist a memory. Security rules restrict writes to the caller's own docs. */
export async function saveMemory(input: {
  title: string;
  body: string;
  kind: string;
  tags?: string[];
}): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  const db = requireDb();
  await db.collection(COLLECTION).add({
    title: input.title.slice(0, 140),
    body: input.body.slice(0, 20000),
    kind: input.kind.slice(0, 24),
    tags: (input.tags ?? []).slice(0, 8),
    createdAt: Date.now(),
  });
}

export async function listMemories(limit = 20): Promise<MemoryRecord[]> {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  const db = requireDb();
  const res = await db
    .collection(COLLECTION)
    .where({})
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 50))
    .get();
  const data = (res.data ?? []) as Array<Record<string, unknown>>;
  return data.map(toRecord);
}

export async function deleteMemory(id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error("BAD_ID");
  const db = requireDb();
  await db.collection(COLLECTION).doc(id).remove();
}