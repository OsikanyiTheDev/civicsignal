import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CloudLightning,
  HeartHandshake,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { CivicHeader } from "@/components/civic-header";
import { LiveSignalBoard } from "@/components/live-signal-board";
import { ResponseArchitecture } from "@/components/response-architecture";

export default function HomePage() {
  return (
    <>
      <CivicHeader />
      <main>
        <section className="civic-hero" id="top">
          <div className="hero-grid-pattern" aria-hidden="true" />
          <div className="shell civic-hero-grid">
            <div className="civic-hero-copy">
              <p className="signal-label hero-label"><span className="pulse-dot" /> Community infrastructure visibility</p>
              <h1>Make local issues <em>visible</em> before they become invisible. <span aria-hidden="true">⚡</span></h1>
              <p className="civic-hero-lead">CivicSignal is a community-first incident and response hub for reporting infrastructure concerns, tracking their status, and giving residents a clearer view of what needs attention.</p>
              <div className="hero-actions">
                <a className="civic-button" href="#report">🚧 Report an issue <ArrowDownRight size={17} /></a>
                <a className="civic-button civic-button-ghost" href="#board">View live board <ArrowDownRight size={17} /></a>
              </div>
              <div className="hero-boundaries">
                <span><ShieldCheck size={15} /> Designed for privacy</span>
                <span><HeartHandshake size={15} /> Built for communities</span>
                <span><CircleAlert size={15} /> Not an emergency service</span>
              </div>
            </div>

            <div className="signal-hero-visual" aria-label="Illustration of a community signal moving through a response workflow">
              <div className="signal-orbit orbit-one" aria-hidden="true" />
              <div className="signal-orbit orbit-two" aria-hidden="true" />
              <div className="signal-core-card">
                <div className="core-card-top"><span>📍 COMMUNITY SIGNAL</span><span className="demo-pill">community board</span></div>
                <div className="core-card-icon"><MapPinned size={36} /></div>
                <h2>Reported. Routed. Visible.</h2>
                <p>A safer path from a local observation to a trackable response status.</p>
                <div className="core-card-flow"><span>💬 Report</span><i>→</i><span>🔎 Verify</span><i>→</i><span>📡 Update</span></div>
              </div>
              <div className="floating-signal signal-water"><span>💧</span><strong>Water</strong><small>New signal</small></div>
              <div className="floating-signal signal-road"><span>🚧</span><strong>Road safety</strong><small>Verified</small></div>
              <div className="floating-signal signal-light"><span>💡</span><strong>Streetlight</strong><small>In progress</small></div>
              <div className="floating-signal signal-waste"><span>♻️</span><strong>Waste</strong><small>Resolved</small></div>
              <div className="hero-visual-foot"><CloudLightning size={15} /> Community reporting · clear status · private evidence</div>
            </div>
          </div>
        </section>

        <section className="civic-intro-strip">
          <div className="shell civic-intro-grid">
            <p><Sparkles size={17} /> <strong>A community information tool.</strong> Share local concerns, follow status updates, and help make issues easier to see.</p>
            <span>🌍 Built for local communities</span>
            <span>🔐 Report with care</span>
            <span>📡 Clear status updates</span>
          </div>
        </section>

        <section className="section civic-purpose-section" id="how-it-works">
          <div className="shell purpose-grid">
            <div>
              <p className="signal-label">Why this exists</p>
              <h2>WhatsApp messages, calls, and posts are useful—but they are hard to track.</h2>
              <p className="section-lead">CivicSignal gives a local observation a structured path: report it, protect the data, verify the issue, publish an honest status, and make the next action easier to understand.</p>
            </div>
            <ol className="purpose-steps">
              <li><span>01</span><div><strong>🚧 A resident reports</strong><small>Category, area, short description, optional private photo evidence.</small></div></li>
              <li><span>02</span><div><strong>🔎 A verifier checks</strong><small>Reports enter a moderation queue before any official-facing update.</small></div></li>
              <li><span>03</span><div><strong>📡 The board updates</strong><small>Residents see Submitted, Verified, In progress, or Resolved—not silence.</small></div></li>
            </ol>
          </div>
        </section>

        <div className="shell">
          <LiveSignalBoard />
        </div>

        <section className="section architecture-section">
          <div className="shell">
            <div className="section-heading centered-heading">
              <p className="signal-label">Your report journey</p>
              <h2>One report can create a clearer shared picture. 🧭</h2>
              <p className="section-lead">CivicSignal helps people share an observation, understand what happens next, and follow the status without relying on scattered messages.</p>
            </div>
            <ResponseArchitecture />
          </div>
        </section>

        <section className="section safety-section" id="safety">
          <div className="shell safety-grid">
            <div className="safety-card safety-card-primary">
              <span className="safety-icon">🔐</span>
              <p className="signal-label">Safety boundary</p>
              <h2>Helpful technology should not collect more than it needs.</h2>
              <p>Reports are designed around the issue and its impact—not names, medical information, financial information, or precise home addresses. Evidence storage is private in the AWS architecture.</p>
            </div>
            <div className="safety-card">
              <LockKeyhole size={23} />
              <h3>Private evidence</h3>
              <p>Any photo evidence is kept private for review. It is not displayed publicly beside a community report.</p>
            </div>
            <div className="safety-card">
              <ShieldCheck size={23} />
              <h3>Respectful reporting</h3>
              <p>Use clear, factual descriptions. Reports should focus on the issue, not on private details about people.</p>
            </div>
            <div className="safety-card">
              <CircleAlert size={23} />
              <h3>Clear limits</h3>
              <p>CivicSignal is a community information tool. It does not replace emergency services or official local guidance.</p>
            </div>
          </div>
        </section>

        <section className="civic-cta">
          <div className="shell civic-cta-inner">
            <div>
              <p className="signal-label">Take part</p>
              <h2>Help make the places around you easier to understand. 🌱</h2>
              <p>Share a clear local observation, avoid sensitive personal information, and check back for updates as reports move through the board.</p>
            </div>
            <div className="civic-cta-actions">
              <a className="civic-button" href="#report">Report a local issue <ArrowUpRight size={17} /></a>
              <a className="civic-button civic-button-ghost" href="#how-it-works">How it works <ArrowUpRight size={17} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="civic-footer">
        <div className="shell civic-footer-grid">
          <div><strong>CivicSignal</strong><span>Community Infrastructure Incident & Response Hub</span></div>
          <p>Community information tool · Not an emergency service</p>
          <div className="footer-safety-links"><a href="#safety">Report safely</a><a href="/privacy">Privacy notice</a></div>
        </div>
      </footer>
    </>
  );
}
