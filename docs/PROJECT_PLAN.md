# CivicSignal Delivery Plan

## Stage 0 — Foundation ✅

- Project identity, repository, README and product boundary
- Responsive incident-board frontend with local demonstration flow
- Terraform module structure
- Python Lambda API handlers and validation tests
- CI workflow

## Stage 1 — AWS Dev Environment

- Bootstrap Terraform remote state
- Configure a unique evidence bucket name
- Deploy DynamoDB, private S3, EventBridge, SNS, Lambda and HTTP API
- Confirm operational email subscription
- Configure Vercel frontend origin in API/S3 CORS

## Stage 2 — Real API Integration

- Replace local demo adapter with `NEXT_PUBLIC_CIVICSIGNAL_API_URL`
- Load public incident board from `GET /incidents`
- Submit validated reports to `POST /incidents`
- Add error state and retry experience

## Stage 3 — Verified Evidence & Moderator Security

- Cognito email-verification and Hosted UI sign-in for private photo evidence
- JWT-protected `POST /reports/with-evidence` route
- Private constrained photo upload after authenticated report creation
- Next: Cognito groups for moderator, responder and administrator workflows
- Next: verified status updates, audit events, image scanning and moderation dashboard

## Stage 4 — Civic Readiness

- Stakeholder review with a community group or local organisation
- Plain-language privacy notice
- Accessibility review with real users
- Data-retention and moderation policy
- Incident escalation and emergency-service messaging review

## Success is not a download count

CivicSignal should only be considered useful after it has a clear community owner, a safe moderation policy, a trustworthy status workflow, and an accountable response process.
