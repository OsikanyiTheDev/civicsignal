import Link from "next/link";

import { CivicHeader } from "@/components/civic-header";

export default function PrivacyPage() {
  return (
    <>
      <CivicHeader />
      <main className="privacy-page">
        <article className="shell privacy-shell">
          <Link className="incident-back" href="/"><span aria-hidden="true">←</span> Back to CivicSignal</Link>
          <p className="signal-label">Privacy and evidence notice</p>
          <h1>Share useful information. Protect people.</h1>
          <p className="privacy-lead">CivicSignal is a community information tool. This page explains what a report may contain, what becomes public, and how private photo evidence is handled.</p>
          <section><h2>What is public</h2><ul><li>Issue title, category, general area, and description</li><li>Public report status and status timeline</li><li>Exact map point only when a reporter checks the explicit public-location consent box</li><li>Photo evidence only after a moderator approves it for public display</li></ul></section>
          <section><h2>What stays private</h2><ul><li>Private photo evidence waiting for review</li><li>Cognito account identity details and internal moderator records</li><li>Unapproved evidence keys and moderation operations</li></ul></section>
          <section><h2>Evidence retention</h2><p>Private evidence is configured to expire automatically after <strong>90 days</strong>. Approved evidence may also expire after this retention period, so public evidence should not be treated as a permanent archive.</p></section>
          <section><h2>Do not submit</h2><ul><li>Medical, financial, or identity documents</li><li>Photos of children or people without appropriate consent</li><li>Private homes or sensitive sites as exact public pins</li><li>Emergency requests requiring immediate response</li></ul></section>
          <section><h2>Emergency situations</h2><p>CivicSignal is not an emergency service and does not guarantee that a report will receive an official response. For immediate danger, contact local emergency services.</p></section>
        </article>
      </main>
    </>
  );
}
