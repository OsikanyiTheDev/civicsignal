# CivicSignal Architecture

## Design goal

CivicSignal is designed to make community infrastructure reports structured and visible without exposing private evidence or implying that a report is an official response.

## Request path

```text
Browser / PWA
  ↓
CloudFront or Vercel-hosted Next.js frontend
  ↓
API Gateway HTTP API
  ↓
Lambda handler
  ↓
DynamoDB incidents table
  ↓
EventBridge custom bus
  ↓
SNS operations notification
```

## Verified photo-evidence path

```text
Verified reporter
  ↓
Cognito email sign-in
  ↓
JWT-protected POST /reports/with-evidence
  ↓
Constrained S3 presigned POST
  ↓
Private S3 bucket
  ↓
Encryption + versioning + public access block
  ↓
Pending private review
```

Text-only reports remain public. Photo evidence requires a verified Cognito sign-in and is never shown automatically on the public board. See [PHOTO_EVIDENCE.md](PHOTO_EVIDENCE.md).

## Data model

The DynamoDB table uses a composite primary key:

```text
PK = INCIDENT#{incident_id}
SK = METADATA
```

A global secondary index supports lifecycle queries:

```text
GSI1PK = STATUS#{status}
GSI1SK = {updated_at}#{incident_id}
```

Current status values:

```text
Submitted
Verified
In progress
Resolved
```

## API routes

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /health` | Public | Service health response |
| `GET /incidents` | Public | Bounded public incident board |
| `GET /incidents/{id}` | Public | Public incident details |
| `POST /incidents` | Public | Validated new community report |
| `POST /uploads/presign` | AWS IAM | Trusted evidence-upload form |
| `PATCH /incidents/{id}/status` | AWS IAM | Moderation and status update |

## Operational controls

- API Gateway default throttling limits
- CloudWatch logs for HTTP API and every Lambda handler
- CloudWatch alarms for Lambda errors and API 5XX responses
- EventBridge rule for `IncidentSubmitted`
- SNS operations topic for notifications
- Terraform tags identifying project, environment, ownership and purpose

## Deliberate future decisions

The following are not marked complete in the current implementation:

- Cognito user journeys and moderator role model
- Image malware scanning policy
- Verified partner/authority workflow
- Geospatial query model and map provider
- Pagination/cursor strategy for a large public board
- Data retention, deletion, and community moderation policy
- Multi-region disaster-recovery requirements
