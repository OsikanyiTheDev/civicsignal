# CivicSignal Security & Safety Decisions

## Product boundary

CivicSignal is a community coordination prototype. It must never present a community report as verified emergency guidance, a government instruction, or an official public-safety response.

The UI must always make this boundary visible.

## Data minimisation

The MVP report collects only:

- Issue category
- General area or landmark
- Short title and description
- Reporter-selected urgency

It intentionally does **not** collect names, phone numbers, financial information, medical information, or precise home addresses.

## Public API controls

- API Gateway throttling protects public report routes from basic burst abuse.
- Lambda validation constrains category, urgency and text lengths.
- Status changes use `AWS_IAM` authorization in the Terraform API routes.
- Upload-presign uses `AWS_IAM` authorization until an authenticated public upload flow is designed.

## Evidence handling

The Terraform evidence bucket is private by default:

- Public access block enabled
- Bucket owner enforced
- Server-side encryption enabled
- Versioning enabled
- Presigned POST upload limited to supported image MIME types and 5 MB
- Incomplete multipart uploads expire

Evidence should never be exposed via a public bucket or a predictable public URL.

## Before real public launch

Complete these decisions before accepting real community submissions:

1. Add Cognito authentication and least-privilege user roles.
2. Define verified moderator and responder access rules.
3. Add image scanning and harmful-content moderation controls.
4. Define consent, data-retention, deletion, and abuse-report policies.
5. Add rate limiting/WAF strategy appropriate for the chosen API type.
6. Add incident escalation and emergency-service guidance reviewed for the deployment region.
7. Perform threat modelling and an accessibility review.
