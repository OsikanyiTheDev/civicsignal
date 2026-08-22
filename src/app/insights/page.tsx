import Link from "next/link";

import { CivicHeader } from "@/components/civic-header";
import { CommunityInsights } from "@/components/community-insights";

export default function InsightsPage() {
  return (
    <>
      <CivicHeader />
      <main className="insights-page">
        <div className="shell insights-shell">
          <Link className="incident-back" href="/"><span aria-hidden="true">←</span> Back to the community board</Link>
          <CommunityInsights />
        </div>
      </main>
    </>
  );
}
