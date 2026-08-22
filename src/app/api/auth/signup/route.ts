import { NextRequest, NextResponse } from "next/server";

import { cognitoPublicRequest, getCognitoAppConfig } from "@/lib/cognito";

type SignUpResponse = {
  UserConfirmed?: boolean;
};

export async function POST(request: NextRequest) {
  const config = getCognitoAppConfig();
  if (!config) {
    return NextResponse.json({ message: "Secure sign-up is not configured yet." }, { status: 503 });
  }

  const { email, password } = await request.json() as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await cognitoPublicRequest<SignUpResponse>(config.region, "SignUp", {
      ClientId: config.clientId,
      Username: email.trim().toLowerCase(),
      Password: password,
      UserAttributes: [{ Name: "email", Value: email.trim().toLowerCase() }],
    });
    return NextResponse.json({ confirmationRequired: !result.UserConfirmed });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to create the account." }, { status: 400 });
  }
}
