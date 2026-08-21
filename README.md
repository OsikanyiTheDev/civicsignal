# CivicSignal ⚡

> A community-first infrastructure incident and response hub built to make local issues more visible, trackable, and understandable.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-10242F?style=flat-square)](https://nextjs.org/)
[![Terraform](https://img.shields.io/badge/Infrastructure-Terraform-7043AC?style=flat-square)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/Backend-AWS%20Serverless-FF9900?style=flat-square)](https://aws.amazon.com/)
[![Status](https://img.shields.io/badge/status-prototype-087B78?style=flat-square)](./docs/PROJECT_PLAN.md)

## Why CivicSignal

Local infrastructure concerns—blocked drainage, streetlight outages, water interruptions, unsafe crossings, and waste issues—often move through fragmented calls, group chats, and social-media posts. The result is a lack of visibility, no shared status, and no clear record of what was reported.

CivicSignal gives a report a safer, structured path:

```text
Resident observation → validation → moderation queue → visible status → response update
```

It is intentionally designed as a **community coordination prototype**, not as a government agency, emergency service, or official public-safety authority.

## Current implementation

### Demonstrable frontend

- Responsive civic incident board with category, status, and text filters
- Local demonstration report flow that inserts a report into the active board
- Clear lifecycle states: `Submitted → Verified → In progress → Resolved`
- Explicit demo-data and emergency-service boundaries
- Privacy-first reporting guidance
- Architecture and security design represented in the interface

### AWS backend implementation in this repository

- Terraform modules for DynamoDB, private evidence storage, event routing, Lambda/API Gateway and observability
- Python 3.12 Lambda handlers for health, create, list, get, status-update and constrained upload-presign operations
- EventBridge event routing for submitted incidents
- SNS operations topic and CloudWatch alarms
- HTTP API throttling and AWS IAM protection for moderation-only routes
- Unit tests for public payload and status validation

> The AWS infrastructure is defined as code but is **not represented as a deployed public service** until an AWS account, approved bucket name, alert email, and production frontend origin are configured.

## Architecture

```text
Public frontend (Next.js / PWA)
          ↓
API Gateway HTTP API
          ↓
AWS Lambda handlers
          ↓
DynamoDB incidents table
          ↓
EventBridge → SNS operations notifications
          ↓
CloudWatch logs, alarms and API access logs

Private evidence path:
Trusted workflow → constrained presigned S3 upload → encrypted private bucket
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation details.

## Repository layout

```text
civicsignal/
├── src/                          # Next.js civic frontend
├── lambda/
│   ├── src/handlers/             # Python Lambda route handlers
│   ├── src/shared/               # validation, HTTP responses, DynamoDB access
│   └── tests/                    # standard-library unit tests
├── terraform/
│   ├── environments/dev/         # environment composition layer
│   └── modules/                  # reusable AWS modules
├── docs/                         # architecture, safety, API and deployment decisions
├── scripts/                      # packaging utilities
└── .github/workflows/            # CI quality gates
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run test:python
```

## Infrastructure workflow

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Edit evidence_bucket_name and allowed_origins.
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Do not deploy until you have reviewed [docs/SECURITY.md](docs/SECURITY.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Safety commitments

- No patient, financial, or sensitive personal data in public incident reports
- No precise home-address collection in the MVP
- Private S3 evidence bucket in the infrastructure design
- Moderation/status routes require AWS IAM in the current API design
- Clear emergency-service limitation in the product interface
- Demo data is clearly labelled; it is not a live municipal feed

## Built by

[Osikanyi Nana Yaw Essandoh](https://osikanyi-cloud-portfolio.vercel.app/) — Cloud Engineer · AWS · Terraform · Docker · CI/CD
