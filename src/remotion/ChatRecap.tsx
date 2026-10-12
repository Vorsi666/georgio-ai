import type { CSSProperties, FC } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ChatRecapProps {
  title: string;
  lines: string[];
}

export const RECAP_DEFAULT_PROPS: ChatRecapProps = {
  title: "Recap Ngobrol",
  lines: ["Tanya apa saja — Georgio menjawab dengan tenang.", "Tempel tulisan panjang untuk diringkas.", "Kirim foto & video langsung di chat."],
};

const BG: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f2ecff 50%, #a583f5 85%, #7c3aed 100%)",
};

export const ChatRecap: FC<ChatRecapProps> = ({ title, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = lines.slice(0, 4);

  const headIn = spring({ frame, fps, config: { damping: 100, stiffness: 140 } });

  return (
    <AbsoluteFill style={BG}>
      <AbsoluteFill
        style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, gap: 22 }}
      >
        <div
          style={{
            opacity: headIn,
            transform: `translateY(${interpolate(headIn, [0, 1], [30, 0])}px)`,
            display: "flex",
            alignItems: "baseline",
            gap: 18,
          }}
        >
          <span style={{ fontSize: 30, letterSpacing: 8, color: "#6d6a86", fontFamily: "monospace" }}>✦ LOGS</span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1,
              color: "#171321",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {title}
          </span>
        </div>
        {shown.map((line, i) => {
          const local = Math.max(0, frame - 10 - i * 14);
          const p = spring({ frame: local, fps, config: { damping: 100, stiffness: 160 } });
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                background: "rgba(255,255,255,0.88)",
                borderRadius: 24,
                padding: "24px 32px",
                fontSize: 30,
                lineHeight: 1.4,
                color: "#171321",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 8px 28px rgba(124,58,237,0.18)",
              }}
            >
              {line}
            </div>
          );
        })}
        <div style={{ fontSize: 24, letterSpacing: 4, color: "rgba(255,255,255,0.9)", fontFamily: "monospace" }}>
          GEORGIO RECAP · SAVE IT FOR LATER
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
