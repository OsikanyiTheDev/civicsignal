import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_STATE_COOKIE, getCognitoHostedUiConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function GET(request: NextRequest) {
  const config = getCognitoHostedUiConfig();
  const homeUrl = new URL("/", request.url);
  if (!config) {
    homeUrl.searchParams.set("auth", "unavailable");
    return NextResponse.redirect(homeUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(AUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    homeUrl.searchParams.set("auth", "invalid_request");
    return NextResponse.redirect(homeUrl);
  }

  const tokenResponse = await fetch(`https://${config.hostedUiDomain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      code,
      redirect_uri: config.redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    homeUrl.searchParams.set("auth", "token_exchange_failed");
    return NextResponse.redirect(homeUrl);
  }

  const tokens = await tokenResponse.json() as { id_token?: string; expires_in?: number };
  if (!tokens.id_token) {
    homeUrl.searchParams.set("auth", "token_missing");
    return NextResponse.redirect(homeUrl);
  }

  homeUrl.searchParams.set("auth", "signed_in");
  const response = NextResponse.redirect(homeUrl);
  response.cookies.set(ID_TOKEN_COOKIE, tokens.id_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in || 3600,
  });
  response.cookies.delete(AUTH_STATE_COOKIE);
  return response;
}
