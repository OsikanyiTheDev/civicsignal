import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { AUTH_STATE_COOKIE, getCognitoConfig } from "@/lib/cognito";

export async function GET() {
  const config = getCognitoConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/?auth=unavailable", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }

  const state = randomUUID();
  const loginUrl = new URL(`https://${config.hostedUiDomain}/login`);
  loginUrl.searchParams.set("client_id", config.clientId);
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set("scope", "openid email profile");
  loginUrl.searchParams.set("redirect_uri", config.redirectUri);
  loginUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(AUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
