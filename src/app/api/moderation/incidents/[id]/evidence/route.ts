import { forwardModerationRequest } from "@/lib/moderation-proxy";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardModerationRequest(`/moderation/incidents/${id}/evidence`);
}
