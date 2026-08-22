import { forwardModerationRequest } from "@/lib/moderation-proxy";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardModerationRequest(`/incidents/${id}/confirm`, "POST", "{}");
}
