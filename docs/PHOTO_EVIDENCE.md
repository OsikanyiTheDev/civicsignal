# Verified Private Photo Evidence

## Product decision

CivicSignal accepts text-only reports without an account. A photo is optional and requires verified email sign-in.

This prevents the public board from becoming an anonymous file-upload endpoint while keeping basic reporting accessible.

## User flow

```text
Text-only reporter
  → POST /incidents
  → Submitted status

Verified reporter with photo
  → Cognito sign-up / email verification / sign-in
  → POST /reports/with-evidence (JWT protected)
  → Private S3 presigned POST (JPG/PNG/WebP, ≤ 5 MB)
  → Submitted status + private evidence pending review
```

## What is public

- Incident title
- General area
- Category
- Description
- Urgency
- Public lifecycle status

## What remains private

- Cognito reporter subject
- S3 evidence key
- Uploaded photo
- Evidence-review metadata

Photo evidence is never rendered on the public board automatically.

## Security controls in this phase

- Cognito email verification
- OAuth authorization-code flow
- HttpOnly token cookie on the CivicSignal frontend
- API Gateway JWT authorizer for evidence reports
- JPEG, PNG, and WebP only
- 5 MB maximum file size
- Private encrypted S3 bucket
- Presigned POST expires after five minutes
- Evidence S3 key bound to the authenticated report identifier

## Remaining safety work

Before broad public promotion, add:

1. Image malware and harmful-content scanning
2. Moderation dashboard and reviewer roles
3. Evidence retention/deletion policy
4. Abuse reporting and rate-limit monitoring
5. Cognito group policy for moderators/responders
6. Clear privacy notice and terms for evidence contributors
