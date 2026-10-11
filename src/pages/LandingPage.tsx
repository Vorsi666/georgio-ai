import HeroSection from "../components/landing/HeroSection";
import MetricsBand from "../components/landing/MetricsBand";
import FeaturesSection, { AgentsSection } from "../components/landing/FeaturesSection";
import SessionsAndTelemetry from "../components/landing/SessionsAndTelemetry";
import { ClosingBanner, LandingFooter } from "../components/landing/ClosingBanner";
import type { PageId } from "../lib/pages";
import type { AgentMode, ChatMessage } from "../lib/agui-client";

interface Props {
  onNavigate: (p: PageId) => void;
  threads: Record<AgentMode, ChatMessage[]>;
}

/**
 * Beranda — pure showcase. The chat lives on its own Chat Workspace page,
 * so this page is only marketing surface + recent-session history.
 */
export default function LandingPage({ onNavigate, threads }: Props) {
  return (
    <>
      <div className="w-full flex flex-col gap-space-xl">
        <HeroSection onNavigate={onNavigate} />

        <MetricsBand />

        <FeaturesSection />

        <AgentsSection onNavigate={onNavigate} />

        <SessionsAndTelemetry threads={threads} onOpen={() => onNavigate("chat-workspace")} />

        <ClosingBanner onNavigate={onNavigate} />
      </div>
      <LandingFooter />
    </>
  );
}