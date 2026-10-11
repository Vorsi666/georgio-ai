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
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-md">
                <span className="material-symbols-outlined text-lg leading-none">neurology</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Georgio Agent</span>
                <span className="text-primary font-headline-sm text-headline-sm leading-none">*</span>
              </div>
            </div>
            <div className="hidden xl:inline-flex items-center gap-space-xs px-space-sm py-space-xs bg-primary-fixed/30 rounded-full">
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
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_4px_16px_rgba(0,72,204,0.2)] hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-lg leading-none">add</span>
              <span className="hidden sm:inline">New Conversation</span>
            </button>
            {authSlot}
          </div>
        </div>
      </header>

      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-surface-container-low shadow-[1px_0_8px_rgba(0,0,0,0.02)] z-40 flex flex-col justify-between py-space-md max-lg:hidden">
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
                  className={`flex items-center gap-space-sm px-space-sm py-space-sm rounded-lg transition-all text-left ${
                    active
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg leading-none ${
                      active ? "text-primary" : "text-secondary"
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
          <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline">COGNITIVE LOAD</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">28%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[28%]" />
            </div>
            <div className="flex items-center justify-between text-outline-variant pt-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">4 Active Sub-agents</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">0.4s Latency</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("system-settings")}
            className={`flex items-center gap-space-sm px-space-sm py-space-sm rounded-lg transition-all text-left ${
              page === "system-settings"
                ? "bg-secondary-container text-on-secondary-container font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-lg leading-none text-secondary">tune</span>
            <span className="font-body-md text-body-md">System Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}