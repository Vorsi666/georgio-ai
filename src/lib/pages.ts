export type PageId =
  | "beranda"
  | "chat-workspace"
  | "agent-capabilities"
  | "knowledge-base"
  | "agent-orchestrator"
  | "prompt-studio"
  | "memory-graph"
  | "system-settings";

export const PRIMARY_NAV: { id: PageId; label: string }[] = [
  { id: "beranda", label: "Beranda" },
  { id: "chat-workspace", label: "Chat Workspace" },
  { id: "agent-capabilities", label: "Agent Capabilities" },
  { id: "knowledge-base", label: "Knowledge Base" },
];

export const WORKSPACE_NAV: { id: PageId; label: string; icon: string }[] = [
  { id: "chat-workspace", label: "Active Session", icon: "smart_toy" },
  { id: "agent-orchestrator", label: "Agent Orchestrator", icon: "account_tree" },
  { id: "prompt-studio", label: "Prompt Studio", icon: "terminal" },
  { id: "memory-graph", label: "Memory Graph", icon: "hub" },
];

export const SYSTEM_NAV: { id: PageId; label: string; icon: string }[] = [
  { id: "system-settings", label: "System Settings", icon: "tune" },
];

export const ALL_PAGES: PageId[] = [
  "beranda",
  "chat-workspace",
  "agent-capabilities",
  "knowledge-base",
  "agent-orchestrator",
  "prompt-studio",
  "memory-graph",
  "system-settings",
];

export function isPageId(v: string): v is PageId {
  return (ALL_PAGES as string[]).includes(v);
}