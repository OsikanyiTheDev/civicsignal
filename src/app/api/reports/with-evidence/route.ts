import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getCognitoAppConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function POST(request: NextRequest) {
  const config = getCognitoAppConfig();
  const cookieStore = await cookies();
  const idToken = cookieStore.get(ID_TOKEN_COOKIE)?.value;

  if (!config || !idToken) {
    return NextResponse.json({ message: "Sign in is required before attaching private photo evidence." }, { status: 401 });
  }

  const body = await request.text();
  const apiResponse = await fetch(`${config.apiUrl}/reports/with-evidence`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${idToken}`,
    },
    body,
    cache: "no-store",
  });

  const responseBody = await apiResponse.text();
  return new NextResponse(responseBody, {
    status: apiResponse.status,
    headers: { "content-type": "application/json" },
  });
}
