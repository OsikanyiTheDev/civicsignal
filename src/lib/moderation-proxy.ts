import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCognitoAppConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function forwardModerationRequest(path: string, method = "GET", body?: string) {
  const config = getCognitoAppConfig();
  const cookieStore = await cookies();
  const idToken = cookieStore.get(ID_TOKEN_COOKIE)?.value;

  if (!config || !idToken) {
    return NextResponse.json({ message: "Sign in is required for CivicSignal operations." }, { status: 401 });
  }

  const apiResponse = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${idToken}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body } : {}),
    cache: "no-store",
  });

  const responseBody = await apiResponse.text();
  return new NextResponse(responseBody, {
    status: apiResponse.status,
    headers: { "content-type": "application/json" },
  });
}
