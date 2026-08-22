import { NextResponse } from "next/server";

import { getCognitoConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function GET(request: Request) {
  const config = getCognitoConfig();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(ID_TOKEN_COOKIE);

  if (!config) return response;

  const logoutUrl = new URL(`https://${config.hostedUiDomain}/logout`);
  logoutUrl.searchParams.set("client_id", config.clientId);
  logoutUrl.searchParams.set("logout_uri", config.logoutUri);
  return NextResponse.redirect(logoutUrl);
}
