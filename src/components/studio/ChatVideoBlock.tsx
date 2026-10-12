import { lazy, Suspense } from "react";
import type { ChatMessage, ChatVideo } from "../../lib/agui-client";
import type { RemotionCompositionId } from "../../lib/remotion-settings";

// Preview.tsx sudah dipisah jadi chunk sendiri oleh vite advancedChunks,
// jadi lazy import di sini tidak menambah chunk baru — hanya menunda hidrasi.
const LazyPreview = lazy(() => import("../../remotion/Preview"));

const KNOWN: readonly RemotionCompositionId[] = ["GeorgioIntro", "ChatRecap", "WebsiteReview"];

export default function ChatVideoBlock({ video, messages }: { video: ChatVideo; messages: ChatMessage[] }) {
  const composition: RemotionCompositionId | null = (KNOWN as readonly string[]).includes(
    video.composition,
  )
    ? (video.composition as RemotionCompositionId)
    : null;

  // Komposisi tidak dikenal (mis. thread lama / data rusak): tampilkan honestly, bukan diam-diam fallback.
  if (!composition) {
    return (
      <div className="flex flex-col items-start gap-1 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/60 px-4 py-3">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline">Video</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Komposisi <code className="font-label-md text-label-md">{video.composition}</code> tidak dikenali — tidak bisa
          dirender di browser.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center rounded-2xl bg-primary/5 font-label-md text-label-md text-primary">
          Memuat video…
        </div>
      }
    >
      <LazyPreview
        composition={composition}
        fps={video.fps}
        width={video.width}
        height={video.height}
        durationSec={video.durationSec}
        messages={messages}
      />
    </Suspense>
  );
}