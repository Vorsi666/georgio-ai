import Studio from "../components/studio/Studio";
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
  onThreadsChange?: (t: Record<AgentMode, ChatMessage[]>) => void;
}

/**
 * Beranda — composes the sections ported from `desain Georgio agent/`.
 * Each section lives in its own component under components/landing/.
 */
export default function LandingPage({ onNavigate, threads, onThreadsChange }: Props) {
  return (
    <>
      <div className="w-full flex flex-col gap-space-xl">
        <HeroSection onNavigate={onNavigate} />

        <MetricsBand />

        <Studio onThreadsChange={onThreadsChange} />

        <FeaturesSection />

        <AgentsSection onNavigate={onNavigate} />

        <SessionsAndTelemetry threads={threads} onOpen={() => onNavigate("chat-workspace")} />

        <ClosingBanner onNavigate={onNavigate} />
      </div>
      <LandingFooter />
    </>
  );
}