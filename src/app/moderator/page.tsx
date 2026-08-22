import Link from "next/link";

import { CivicHeader } from "@/components/civic-header";
import { ModerationDesk } from "@/components/moderation-desk";

export default function ModeratorPage() {
  return (
    <>
      <CivicHeader />
      <main className="moderator-page">
        <div className="shell moderator-shell">
          <Link className="incident-back" href="/"><span aria-hidden="true">←</span> Back to the public board</Link>
          <ModerationDesk />
        </div>
      </main>
    </>
  );
}
