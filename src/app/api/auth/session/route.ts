import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCognitoConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({
    available: Boolean(getCognitoConfig()),
    authenticated: Boolean(cookieStore.get(ID_TOKEN_COOKIE)?.value),
  });
}
