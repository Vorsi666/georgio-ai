import type { CSSProperties, FC } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface IntroProps {
  title: string;
  subtitle: string;
}

export const INTRO_DEFAULT_PROPS: IntroProps = {
  title: "Georgio AI",
  subtitle: "pikiran tenang · jawaban jernih",
};

const BG: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f4efff 45%, #c9b6fb 78%, #7c3aed 100%)",
};

const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(124,58,237,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.10) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export const GeorgioIntro: FC<IntroProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 100, stiffness: 140 } });
  const fade = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 100 } });
  const bar = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  const sparkle = interpolate(frame, [10, 28, 46], [0, 1, 0.45], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={BG}>
      <AbsoluteFill style={GRID} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 10, color: "#6d6a86", fontFamily: "sans-serif" }}>
          DESIGN RESOURCES
        </div>
        <div
          style={{
            opacity: rise,
            transform: `translateY(${interpolate(rise, [0, 1], [46, 0])}px)`,
            fontSize: 124,
            fontWeight: 800,
            letterSpacing: -4,
            color: "#171321",
            fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
            textAlign: "center",
          }}
        >
          {title}
          <span style={{ color: "#7c3aed", opacity: sparkle }}>✦</span>
        </div>
        <div
          style={{
            opacity: fade,
            marginTop: 14,
            fontSize: 34,
            letterSpacing: 7,
            color: "#7c3aed",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 60 }}>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.45)", overflow: "hidden" }}>
          <div style={{ width: `${bar * 100}%`, height: "100%", background: "#ffffff" }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            color: "rgba(255,255,255,0.92)",
            fontSize: 24,
            fontFamily: "monospace",
          }}
        >
          <span>GEORGIO INTRO</span>
          <span>{Math.round(bar * 100)}%</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
