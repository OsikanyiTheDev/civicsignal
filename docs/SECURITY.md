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
- Optional browser GPS coordinates only after an explicit public-location consent check

It intentionally does **not** collect names, phone numbers, financial information, or medical information. Users must not submit a private home or sensitive location as an exact public pin.

## Public API controls

- API Gateway throttling protects public report routes from basic burst abuse.
- Lambda validation constrains category, urgency and text lengths.
- Status changes use `AWS_IAM` authorization in the Terraform API routes.
- Photo evidence uses Cognito JWT authorization and a constrained presigned S3 POST after verified email sign-in.

## Evidence handling

The Terraform evidence bucket is private by default:

- Public access block enabled
- Bucket owner enforced
- Server-side encryption enabled
- Versioning enabled
- Presigned POST upload limited to supported image MIME types and 5 MB
- Incomplete multipart uploads expire

Evidence should never be exposed via a public bucket or a predictable public URL.

## Before broad public promotion

Cognito email verification is now part of private photo evidence. Complete these further decisions before broad public promotion:

1. Define moderator and responder groups with least-privilege permissions.
2. Add image scanning and harmful-content moderation controls.
3. Define consent, data-retention, deletion, and abuse-report policies.
4. Add rate-limit monitoring and bot-protection strategy appropriate for the chosen API type.
5. Add incident escalation and emergency-service guidance reviewed for the deployment region.
6. Perform threat modelling and an accessibility review.
