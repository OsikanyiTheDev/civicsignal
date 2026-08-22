import { NextResponse } from "next/server";

import { getCognitoAppConfig } from "@/lib/cognito";

export async function GET() {
  const config = getCognitoAppConfig();
  if (!config) return NextResponse.json({ message: "Insights are unavailable." }, { status: 503 });

  const apiResponse = await fetch(`${config.apiUrl}/insights`, { cache: "no-store" });
  return new NextResponse(await apiResponse.text(), {
    status: apiResponse.status,
    headers: { "content-type": "application/json" },
  });
}
