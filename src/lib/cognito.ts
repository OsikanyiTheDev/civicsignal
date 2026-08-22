export type CognitoAppConfig = {
  clientId: string;
  region: string;
  apiUrl: string;
};

export type CognitoHostedUiConfig = CognitoAppConfig & {
  hostedUiDomain: string;
  redirectUri: string;
  logoutUri: string;
};

export const ID_TOKEN_COOKIE = "civicsignal_id_token";
export const AUTH_STATE_COOKIE = "civicsignal_auth_state";

export function getCognitoAppConfig(): CognitoAppConfig | null {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const apiUrl = process.env.CIVICSIGNAL_API_URL || process.env.NEXT_PUBLIC_CIVICSIGNAL_API_URL;
  const region = process.env.COGNITO_AWS_REGION || "us-east-1";

  if (!clientId || !apiUrl) return null;

  return {
    clientId,
    region,
    apiUrl: apiUrl.replace(/\/$/, ""),
  };
}

export function getCognitoHostedUiConfig(): CognitoHostedUiConfig | null {
  const app = getCognitoAppConfig();
  const hostedUiDomain = process.env.COGNITO_HOSTED_UI_DOMAIN;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;
  const logoutUri = process.env.COGNITO_LOGOUT_URI;

  if (!app || !hostedUiDomain || !redirectUri || !logoutUri) return null;

  return {
    ...app,
    hostedUiDomain: hostedUiDomain.replace(/^https:\/\//, "").replace(/\/$/, ""),
    redirectUri,
    logoutUri,
  };
}

export type JwtClaims = {
  sub?: string;
  email?: string;
  "cognito:groups"?: string[] | string;
};

export function decodeJwtClaims(token: string): JwtClaims {
  try {
    const [, payload] = token.split(".");
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64url").toString("utf8")) as JwtClaims;
  } catch {
    return {};
  }
}

export function claimGroups(token: string): string[] {
  const groups = decodeJwtClaims(token)["cognito:groups"];
  if (Array.isArray(groups)) return groups;
  if (typeof groups === "string") {
    try {
      const parsed = JSON.parse(groups);
      return Array.isArray(parsed) ? parsed : groups.split(",").map((group) => group.trim()).filter(Boolean);
    } catch {
      const normalized = groups.trim().replace(/^\[/, "").replace(/\]$/, "");
      return normalized.split(",").map((group) => group.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
    }
  }
  return [];
}

export async function cognitoPublicRequest<T>(region: string, target: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "content-type": "application/x-amz-json-1.1",
      "x-amz-target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json() as { message?: string; __type?: string } & T;
  if (!response.ok) {
    const message = data.message || data.__type || "Unable to complete the authentication request.";
    throw new Error(message.replace(/^\w+#/, ""));
  }
  return data;
}
