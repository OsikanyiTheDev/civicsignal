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

## Evidence path

```text
Trusted moderation workflow
  ↓
POST /uploads/presign  [AWS_IAM protected]
  ↓
Constrained S3 presigned POST
  ↓
Private S3 bucket
  ↓
Encryption + versioning + public access block
```

Public evidence upload is deliberately deferred. It should not be enabled until the project has a Cognito identity design, abuse controls, malware scanning decision, retention policy, and moderation workflow.

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
