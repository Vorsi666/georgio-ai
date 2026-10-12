import { lazy, Suspense } from "react";
import type { ChatMessage, ChatVideo } from "../../lib/agui-client";

const LazyPreview = lazy(() => import("../../remotion/Preview"));

export default function ChatVideoBlock({ video, messages }: { video: ChatVideo; messages: ChatMessage[] }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center rounded-2xl bg-primary/5 font-label-md text-label-md text-primary">
          Memuat video…
        </div>
      }
    >
      <LazyPreview
        composition={video.composition as never}
        fps={video.fps}
        width={video.width}
        height={video.height}
        durationSec={video.durationSec}
        messages={messages}
      />
    </Suspense>
  );
}
