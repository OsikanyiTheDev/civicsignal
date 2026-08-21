import { BellRing, Cloud, Database, FileUp, Gauge, ShieldCheck, Workflow } from "lucide-react";

const layers = [
  { label: "Community", detail: "Public report · status lookup", icon: Cloud, emoji: "🧑🏾‍🤝‍🧑🏽", tone: "cyan" },
  { label: "Protect", detail: "WAF · abuse controls · validation", icon: ShieldCheck, emoji: "🛡️", tone: "violet" },
  { label: "Respond", detail: "API Gateway · Lambda", icon: Workflow, emoji: "⚡", tone: "orange" },
  { label: "Record", detail: "DynamoDB · encrypted S3 evidence", icon: Database, emoji: "🗃️", tone: "blue" },
  { label: "Route", detail: "EventBridge · SQS · SNS", icon: BellRing, emoji: "📣", tone: "green" },
  { label: "Observe", detail: "CloudWatch logs · alarms", icon: Gauge, emoji: "📡", tone: "cyan" },
];

export function ResponseArchitecture() {
  return (
    <div className="response-architecture" id="architecture">
      <div className="architecture-kicker"><FileUp size={16} /> Implementation-ready AWS design</div>
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
        {layers.map(({ label, detail, icon: Icon, emoji, tone }, index) => (
          <article className={`architecture-layer tone-${tone}`} key={label}>
            <span className="architecture-order">0{index + 1}</span>
            <div className="architecture-layer-icon"><Icon size={19} /></div>
            <p>{emoji} {label}</p>
            <strong>{detail}</strong>
          </article>
        ))}
      </div>
      <div className="architecture-note"><span>🔐</span> Designed to minimise personal data, keep evidence private, and make response status visible without promising official intervention.</div>
    </div>
  );
}
