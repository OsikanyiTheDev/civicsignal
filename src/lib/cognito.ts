export type CognitoConfig = {
  hostedUiDomain: string;
  clientId: string;
  redirectUri: string;
  logoutUri: string;
  apiUrl: string;
};

export const ID_TOKEN_COOKIE = "civicsignal_id_token";
export const AUTH_STATE_COOKIE = "civicsignal_auth_state";

export function getCognitoConfig(): CognitoConfig | null {
  const hostedUiDomain = process.env.COGNITO_HOSTED_UI_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;
  const logoutUri = process.env.COGNITO_LOGOUT_URI;
  const apiUrl = process.env.CIVICSIGNAL_API_URL || process.env.NEXT_PUBLIC_CIVICSIGNAL_API_URL;

  if (!hostedUiDomain || !clientId || !redirectUri || !logoutUri || !apiUrl) {
    return null;
  }

  return {
    hostedUiDomain: hostedUiDomain.replace(/^https:\/\//, "").replace(/\/$/, ""),
    clientId,
    redirectUri,
    logoutUri,
    apiUrl: apiUrl.replace(/\/$/, ""),
  };
}
