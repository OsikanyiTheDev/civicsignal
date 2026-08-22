import { NextRequest, NextResponse } from "next/server";

import { cognitoPublicRequest, getCognitoAppConfig, ID_TOKEN_COOKIE } from "@/lib/cognito";

type InitiateAuthResponse = {
  AuthenticationResult?: {
    IdToken?: string;
    ExpiresIn?: number;
  };
  ChallengeName?: string;
};

export async function POST(request: NextRequest) {
  const config = getCognitoAppConfig();
  if (!config) {
    return NextResponse.json({ message: "Secure sign-in is not configured yet." }, { status: 503 });
  }

  const { email, password } = await request.json() as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await cognitoPublicRequest<InitiateAuthResponse>(config.region, "InitiateAuth", {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: config.clientId,
      AuthParameters: {
        USERNAME: email.trim().toLowerCase(),
        PASSWORD: password,
      },
    });

    const idToken = result.AuthenticationResult?.IdToken;
    if (!idToken) {
      return NextResponse.json({ message: "A sign-in challenge is required before continuing." }, { status: 409 });
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ID_TOKEN_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.AuthenticationResult?.ExpiresIn || 3600,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to sign in." }, { status: 401 });
  }
}
