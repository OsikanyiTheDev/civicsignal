import { NextRequest } from "next/server";

import { forwardModerationRequest } from "@/lib/moderation-proxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardModerationRequest(`/moderation/incidents/${id}/status`, "PATCH", await request.text());
}
