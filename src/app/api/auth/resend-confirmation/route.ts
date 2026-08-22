import { NextRequest, NextResponse } from "next/server";

import { cognitoPublicRequest, getCognitoAppConfig } from "@/lib/cognito";

export async function POST(request: NextRequest) {
  const config = getCognitoAppConfig();
  if (!config) {
    return NextResponse.json({ message: "Secure sign-up is not configured yet." }, { status: 503 });
  }

  const { email } = await request.json() as { email?: string };
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    await cognitoPublicRequest(config.region, "ResendConfirmationCode", {
      ClientId: config.clientId,
      Username: email.trim().toLowerCase(),
    });
    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to resend the code." }, { status: 400 });
  }
}
