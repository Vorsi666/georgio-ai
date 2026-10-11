import { useEffect, useState } from "react";
import AppShell from "./components/shell/AppShell";
import AuthPage from "./pages/AuthPage";
import MemoryGraphPage from "./pages/MemoryGraphPage";
import WorkspacePage from "./pages/WorkspacePage";
import LandingPage from "./pages/LandingPage";
import { getSession, signOut } from "./utils/cloudbase";
import type { SessionUser } from "./utils/cloudbase";
import { isPageId } from "./lib/pages";
import type { PageId } from "./lib/pages";

export default function App() {
  const [page, setPage] = useState<PageId>("beranda");
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  // Only getSession() counts as proof of login — never the deprecated login state.
  useEffect(() => {
    void getSession().then(setUser);
  }, []);

  // Session can expire in another tab; keep the header honest.
  useEffect(() => {
    const onStorage = () => void getSession().then(setUser);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    if (raw && isPageId(raw)) setPage(raw);
  }

  useEffect(() => {
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function go(next: PageId) {
    setPage(next);
    window.location.hash = next;
  }

  if (authOpen) {
    return (
      <AuthPage
        onBack={() => {
          void getSession().then(setUser);
          setAuthOpen(false);
        }}
      />
    );
  }

  const authSlot = user ? (
    <div className="flex items-center gap-space-sm">
      <span
        className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-label-md text-label-md"
        title={user.email || user.name}
      >
        {(user.name || "?").slice(0, 1).toUpperCase()}
      </span>
      <button
        type="button"
        onClick={() => void signOut().then(() => setUser(null))}
        title="Keluar"
        aria-label="Keluar dari akun"
        className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 transition-colors"
      >
        <span className="material-symbols-outlined text-lg leading-none">logout</span>
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setAuthOpen(true)}
      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-primary-fixed/40 transition-colors"
      title="Masuk"
      aria-label="Masuk ke akun"
    >
      <span className="material-symbols-outlined text-lg leading-none">account_circle</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased">
      <AppShell page={page} onNavigate={go} onNewConversation={() => go("chat-workspace")} authSlot={authSlot} />

      <div className="pl-64 max-lg:pl-0">
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="relative w-full flex-1 flex flex-col px-space-md lg:px-space-xl py-space-md gap-space-lg">
            {page === "beranda" && <LandingPage onNavigate={go} />}
            {page === "memory-graph" && (
              <MemoryGraphPage signedIn={user !== null} onSignIn={() => setAuthOpen(true)} />
            )}
            {page === "agent-capabilities" && (
              <WorkspacePage
                id="agent-capabilities"
                title="Agent Capabilities"
                subtitle="4 agen standby · siap didelegasikan"
                icon="neurology"
                badge="MULTI-AGENT"
              />
            )}
            {page === "knowledge-base" && (
              <WorkspacePage
                id="knowledge-base"
                title="Knowledge Base"
                subtitle="RAG retrieval · dokumen internal"
                icon="dataset"
                badge="RAG"
                accent="tertiary"
              />
            )}
            {page === "agent-orchestrator" && (
              <WorkspacePage
                id="agent-orchestrator"
                title="Agent Orchestrator"
                subtitle="Delegasi multi-agen"
                icon="account_tree"
                accent="secondary"
              />
            )}
            {page === "prompt-studio" && (
              <WorkspacePage
                id="prompt-studio"
                title="Prompt Studio"
                subtitle="Terminal · template prompt"
                icon="terminal"
              />
            )}
            {page === "system-settings" && (
              <WorkspacePage
                id="system-settings"
                title="System Settings"
                subtitle="Konfigurasi sistem"
                icon="tune"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}