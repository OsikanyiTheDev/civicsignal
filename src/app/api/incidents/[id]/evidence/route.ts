import { NextRequest, NextResponse } from "next/server";

import { getCognitoAppConfig } from "@/lib/cognito";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const config = getCognitoAppConfig();
  const { id } = await params;
  if (!config) return NextResponse.json({ message: "Evidence service is unavailable." }, { status: 503 });

  const apiResponse = await fetch(`${config.apiUrl}/incidents/${id}/evidence`, { cache: "no-store" });
  const data = await apiResponse.json() as { evidence_url?: string; message?: string };
  if (!apiResponse.ok || !data.evidence_url) {
    return NextResponse.json({ message: data.message || "No approved public evidence is available." }, { status: apiResponse.status || 404 });
  }

  return NextResponse.redirect(data.evidence_url);
}
