import { forwardModerationRequest } from "@/lib/moderation-proxy";

export async function GET() {
  return forwardModerationRequest("/moderation/incidents");
}
