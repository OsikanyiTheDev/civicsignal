import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { claimGroups, decodeJwtClaims, getCognitoAppConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function GET() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get(ID_TOKEN_COOKIE)?.value;
  const claims = idToken ? decodeJwtClaims(idToken) : {};
  return NextResponse.json({
    available: Boolean(getCognitoAppConfig()),
    authenticated: Boolean(idToken),
    email: claims.email || null,
    groups: idToken ? claimGroups(idToken) : [],
  });
}
