import { Suspense, useMemo, useState, lazy } from "react";
import { Player } from "@remotion/player";
import { ChatRecap, RECAP_DEFAULT_PROPS } from "./ChatRecap";
import { GeorgioIntro, INTRO_DEFAULT_PROPS } from "./GeorgioIntro";
import type { RemotionCompositionId } from "../lib/remotion-settings";
import { framesFromSettings, recapPropsFromThreads } from "../lib/remotion-settings";
import type { ChatMessage } from "../lib/agui-client";

export type { ChatRecapProps } from "./ChatRecap";
export type { IntroProps } from "./GeorgioIntro";

export interface PreviewProps {
  composition: RemotionCompositionId;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
  messages?: ChatMessage[];
  overrideTitle?: string;
  overrideSubtitle?: string;
}

export const COMPOSITION_META: Record<RemotionCompositionId, { label: string; hint: string }> = {
  ChatRecap: { label: "Chat Recap", hint: "4 pesan terakhirmu jadi kartu video." },
  GeorgioIntro: { label: "Georgio Intro", hint: "Bumper pembuka ungu kaca." },
};

function PreviewInner({ composition, fps, width, height, durationSec, messages, overrideTitle, overrideSubtitle }: PreviewProps) {
  const durationInFrames = framesFromSettings({ fps, durationSec });
  const [errKey, setErrKey] = useState(0);

  const inputProps = useMemo(() => {
    if (composition === "ChatRecap") {
      const recap = recapPropsFromThreads(messages ?? []);
      return { title: overrideTitle?.trim() || recap.title, lines: recap.lines };
    }
    return {
      title: overrideTitle?.trim() || INTRO_DEFAULT_PROPS.title,
      subtitle: overrideSubtitle?.trim() || INTRO_DEFAULT_PROPS.subtitle,
    };
  }, [composition, messages, overrideTitle, overrideSubtitle]);

  return (
    <Player
      key={`${composition}-${errKey}-${width}x${height}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={(composition === "ChatRecap" ? ChatRecap : GeorgioIntro) as any}
      inputProps={inputProps}
      durationInFrames={durationInFrames}
      fps={fps}
      compositionWidth={width}
      compositionHeight={height}
      controls
      loop
      autoPlay={false}
      acknowledgeRemotionLicense
      style={{ width: "100%", borderRadius: 20, overflow: "hidden", background: "#171321" }}
      errorFallback={({ error }: { error: Error }) => (
        <div className="flex flex-col items-center gap-2 rounded-[20px] bg-on-surface p-6 text-center text-white">
          <span className="material-symbols-outlined text-3xl">error</span>
          <p className="font-body-sm text-body-sm">Preview video gagal: {error.message}</p>
          <button
            type="button"
            onClick={() => setErrKey((k) => k + 1)}
            className="rounded-full bg-white px-4 py-1.5 font-label-md text-label-md text-on-surface"
          >
            Coba lagi
          </button>
        </div>
      )}
    />
  );
}

const LazyInner = lazy(() => Promise.resolve({ default: PreviewInner }));

/** Lazy wrapper + Suspense — Player tidak ikut membebani first paint. */
export default function RemotionPreview(props: PreviewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-[20px] bg-primary/5 font-label-md text-label-md text-primary">
          Memuat preview video…
        </div>
      }
    >
      <LazyInner {...props} />
    </Suspense>
  );
}

export { RECAP_DEFAULT_PROPS, INTRO_DEFAULT_PROPS };
