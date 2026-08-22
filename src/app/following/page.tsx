import Link from "next/link";

import { CivicHeader } from "@/components/civic-header";
import { FollowingIssues } from "@/components/following-issues";

export default function FollowingPage() {
  return (
    <>
      <CivicHeader />
      <main className="following-page">
        <div className="shell following-shell">
          <Link className="incident-back" href="/"><span aria-hidden="true">←</span> Back to the community board</Link>
          <p className="signal-label">Signed-in community member</p>
          <h1>My followed issues</h1>
          <p className="following-lead">Return to the reports you care about and check their latest public status.</p>
          <FollowingIssues />
        </div>
      </main>
    </>
  );
}
