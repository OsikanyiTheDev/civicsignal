import { BellRing, CheckCircle2, FileText, ImagePlus, MessageCircleMore, ShieldCheck } from "lucide-react";

const stages = [
  { label: "Share", detail: "Describe the issue and general area", icon: MessageCircleMore, emoji: "🗣️", tone: "cyan" },
  { label: "Check", detail: "Reports enter a review path", icon: ShieldCheck, emoji: "🔎", tone: "violet" },
  { label: "Track", detail: "Follow Submitted, Verified or Resolved", icon: CheckCircle2, emoji: "📍", tone: "orange" },
  { label: "Protect", detail: "Evidence stays private while reviewed", icon: ImagePlus, emoji: "🔐", tone: "blue" },
  { label: "Update", detail: "Clear status changes stay visible", icon: BellRing, emoji: "📡", tone: "green" },
  { label: "Learn", detail: "Patterns can guide better follow-up", icon: FileText, emoji: "🌱", tone: "cyan" },
];

export function ResponseArchitecture() {
  return (
    <div className="response-architecture" id="architecture">
      <div className="architecture-kicker"><MessageCircleMore size={16} /> What happens after you report</div>
      <svg className="response-architecture-lines" viewBox="0 0 1060 250" preserveAspectRatio="none" aria-hidden="true">
        <path d="M83 119 H963" />
        <path d="M253 119 V192" />
        <path d="M612 119 V44" />
        <circle cx="83" cy="119" r="4" />
        <circle cx="253" cy="119" r="4" />
        <circle cx="432" cy="119" r="4" />
        <circle cx="612" cy="119" r="4" />
        <circle cx="793" cy="119" r="4" />
        <circle cx="963" cy="119" r="4" />
      </svg>
      <div className="architecture-layer-grid">
        {stages.map(({ label, detail, icon: Icon, emoji, tone }, index) => (
          <article className={`architecture-layer tone-${tone}`} key={label}>
            <span className="architecture-order">0{index + 1}</span>
            <div className="architecture-layer-icon"><Icon size={19} /></div>
            <p>{emoji} {label}</p>
            <strong>{detail}</strong>
          </article>
        ))}
      </div>
      <div className="architecture-note"><span>🧭</span> CivicSignal makes a report easier to follow. It does not promise that every report will receive an official response.</div>
    </div>
  );
}
