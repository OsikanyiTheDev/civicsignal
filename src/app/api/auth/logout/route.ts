import { NextResponse } from "next/server";

import { ID_TOKEN_COOKIE } from "@/lib/cognito";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(ID_TOKEN_COOKIE);
  return response;
}
