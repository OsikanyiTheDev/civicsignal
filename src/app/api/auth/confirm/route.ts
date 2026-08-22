import { NextRequest, NextResponse } from "next/server";

import { cognitoPublicRequest, getCognitoAppConfig } from "@/lib/cognito";

export async function POST(request: NextRequest) {
  const config = getCognitoAppConfig();
  if (!config) {
    return NextResponse.json({ message: "Secure sign-up is not configured yet." }, { status: 503 });
  }

  const { email, code } = await request.json() as { email?: string; code?: string };
  if (!email || !code) {
    return NextResponse.json({ message: "Email and verification code are required." }, { status: 400 });
  }

  try {
    await cognitoPublicRequest(config.region, "ConfirmSignUp", {
      ClientId: config.clientId,
      Username: email.trim().toLowerCase(),
      ConfirmationCode: code.trim(),
    });
    return NextResponse.json({ confirmed: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to confirm the email." }, { status: 400 });
  }
}
