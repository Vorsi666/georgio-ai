import Studio from "../components/studio/Studio";
import type { AgentMode, ChatMessage } from "../lib/agui-client";
import type { RemotionSettings } from "../lib/remotion-settings";

/**
 * Chat Workspace — the dedicated agent surface.
 * Kept separate from Beranda so the landing page stays a pure showcase and the
 * chat gets the full height of the viewport.
 */
export default function ChatWorkspacePage({
  threads,
  onThreadsChange,
  remotion,
}: {
  threads: Record<AgentMode, ChatMessage[]>;
  onThreadsChange?: (t: Record<AgentMode, ChatMessage[]>) => void;
  remotion?: RemotionSettings;
}) {
  return (
    <div className="w-full">
      <Studio threads={threads} onThreadsChange={onThreadsChange} variant="standalone" remotion={remotion} />
    </div>
  );
}
