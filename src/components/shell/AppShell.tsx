import { PRIMARY_NAV, WORKSPACE_NAV } from "../../lib/pages";
import type { PageId } from "../../lib/pages";

interface Props {
  page: PageId;
  onNavigate: (p: PageId) => void;
  onNewConversation: () => void;
  authSlot: React.ReactNode;
}

/**
 * Fixed header + fixed sidebar, mirroring `desain Georgio agent/chat.html`:
 * header h-16 / backdrop-blur, sidebar top-16 left-0 w-64, main offset pl-64.
 */
export default function AppShell({ page, onNavigate, onNewConversation, authSlot }: Props) {
  return (
    <>
      <header className="glass fixed top-0 left-0 right-0 z-50 shadow-[0_1px_8px_rgba(124,58,237,0.08)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-tertiary-container text-white shadow-md">
                <span className="material-symbols-outlined text-lg leading-none">neurology</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Georgio Agent</span>
                <span className="text-primary font-headline-sm text-headline-sm leading-none">*</span>
              </div>
            </div>
            <div className="hidden xl:inline-flex items-center gap-space-xs px-space-sm py-space-xs bg-primary/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary font-medium tracking-wider">v2.4 ACTIVE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-space-lg h-full">
            {PRIMARY_NAV.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`h-full flex items-center px-space-xs font-body-md text-body-md transition-colors ${
                    active
                      ? "text-primary font-semibold border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={onNewConversation}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_4px_16px_rgba(124,58,237,0.35)] hover:bg-on-surface transition-all"
            >
              <span className="material-symbols-outlined text-lg leading-none">add</span>
              <span className="hidden sm:inline">New Conversation</span>
            </button>
            {authSlot}
          </div>
        </div>
      </header>

      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white/60 backdrop-blur-xl shadow-[1px_0_8px_rgba(124,58,237,0.06)] z-40 flex flex-col justify-between py-space-md max-lg:hidden border-r border-white/60">
        <div className="flex flex-col gap-space-sm px-space-md">
          <div className="px-space-sm py-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Workspaces
            </span>
          </div>
          <nav className="flex flex-col gap-space-xs">
            {WORKSPACE_NAV.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-space-sm px-space-sm py-space-sm rounded-2xl transition-all text-left ${
                    active
                      ? "bg-primary text-white font-semibold shadow-md"
                      : "text-on-surface-variant hover:bg-primary/5 hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg leading-none ${
                      active ? "text-white" : "text-primary/60"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-space-md flex flex-col gap-space-xs">
          <div className="glass p-space-sm rounded-2xl shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-[0.14em]">Cognitive Load</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">28%</span>
            </div>
            <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-tertiary-container rounded-full w-[28%]" />
            </div>
            <div className="flex items-center justify-between text-outline-variant pt-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">4 Active Sub-agents</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">0.4s Latency</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("system-settings")}
            className={`flex items-center gap-space-sm px-space-sm py-space-sm rounded-2xl transition-all text-left ${
              page === "system-settings"
                ? "bg-primary text-white font-semibold shadow-md"
                : "text-on-surface-variant hover:bg-primary/5 hover:text-on-surface"
            }`}
          >
            <span className={`material-symbols-outlined text-lg leading-none ${page === "system-settings" ? "text-white" : "text-primary/60"}`}>tune</span>
            <span className="font-body-md text-body-md">System Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}