import type { FC } from "react";
import { Composition } from "remotion";
import { ChatRecap, RECAP_DEFAULT_PROPS } from "./ChatRecap";
import { GeorgioIntro, INTRO_DEFAULT_PROPS } from "./GeorgioIntro";

/** Root komposisi Remotion — dipakai Studio (`remotion studio`) & render CLI. */
export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="GeorgioIntro"
        // Remotion 4 mengetik component sebagai LooseComponentType — cast sekali di sini.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={GeorgioIntro as any}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={INTRO_DEFAULT_PROPS}
      />
      <Composition
        id="ChatRecap"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={ChatRecap as any}
        durationInFrames={240}
        fps={30}
        width={1280}
        height={720}
        defaultProps={RECAP_DEFAULT_PROPS}
      />
    </>
  );
};
