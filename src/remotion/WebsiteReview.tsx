import type { CSSProperties, FC } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ReviewProps {
  title: string;
  url: string;
  bullets: string[];
  cta: string;
}

export const REVIEW_DEFAULT_PROPS: ReviewProps = {
  title: "Georgio AI",
  url: "georgio-ai.vercel.app",
  bullets: ["Violet Glass — kaca ungu modern", "Chat Workspace — streaming ala Gemini", "Kirim foto & video · buat video Remotion"],
  cta: "georgio-ai.vercel.app · #chat",
};

const BG: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f3ecff 48%, #cbb6ff 82%, #7c3aed 100%)",
};

const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(124,58,237,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.09) 1px, transparent 1px)",
  backgroundSize: "56px 56px",
};

/** WebsiteReview — motion grafic minimalis modern smooth (violet glass). */
export const WebsiteReview: FC<ReviewProps> = ({ title, url, bullets, cta }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const headIn = spring({ frame, fps, config: { damping: 110, stiffness: 160 } });
  const urlIn = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 110 } });
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={BG}>
      <AbsoluteFill style={GRID} />
      {/* top label */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: 64 }}>
        <div
          style={{
            opacity: headIn,
            transform: `translateY(${interpolate(headIn, [0, 1], [20, 0])}px)`,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 26, letterSpacing: 9, color: "#6d6a86", fontFamily: "monospace" }}>DESIGN RESOURCES</span>
          <span style={{ fontSize: 24, letterSpacing: 6, color: "#7c3aed", fontFamily: "monospace" }}>2025 JULY</span>
        </div>

        <div
          style={{
            opacity: headIn,
            marginTop: 28,
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 0.95,
            color: "#171321",
            fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          {title}
          <span style={{ color: "#7c3aed" }}>✦</span>
        </div>
        <div
          style={{
            opacity: urlIn,
            marginTop: 10,
            fontSize: 30,
            letterSpacing: 4,
            color: "#7c3aed",
            fontFamily: "monospace",
          }}
        >
          {url}
        </div>

        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 18 }}>
          {bullets.slice(0, 3).map((b, i) => {
            const local = Math.max(0, frame - 14 - i * 10);
            const p = spring({ frame: local, fps, config: { damping: 110, stiffness: 180 } });
            return (
              <div
                key={i}
                style={{
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
                  background: "rgba(255,255,255,0.88)",
                  borderRadius: 22,
                  padding: "22px 28px",
                  fontSize: 28,
                  color: "#171321",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.16)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: "#7c3aed", flexShrink: 0 }} />
                {b}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* bottom bar */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 48 }}>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.45)", overflow: "hidden" }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: "#ffffff" }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            color: "rgba(255,255,255,0.92)",
            fontSize: 22,
            letterSpacing: 3,
            fontFamily: "monospace",
          }}
        >
          <span>GEORGIO REVIEW</span>
          <span>{cta}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
