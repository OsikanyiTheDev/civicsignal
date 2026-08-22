# CivicSignal API Contract

The Terraform implementation creates an API Gateway HTTP API. API base URL is emitted as the `api_url` Terraform output.

## Public routes

### `POST /incidents`

```json
{
  "title": "Blocked drainage near crossing",
  "area": "Central ward",
  "summary": "Standing water is blocking a busy pedestrian crossing after rainfall.",
  "category": "Drainage",
  "urgency": "High"
}
```

Validation constraints:

- `title`: 8–110 characters
- `area`: 2–80 characters
- `summary`: 20–600 characters
- category: Water, Drainage, Waste, Streetlight, Road safety, or Other
- urgency: Low, Medium, or High
- optional `location_precision`: `area_only` or `approximate`
- optional `latitude` and `longitude` only when `location_precision` is `approximate`; the API rounds them before storage

Success response: `201`

```json
{
  "message": "Signal received and queued for verification.",
  "incident": {
    "id": "uuid",
    "status": "Submitted"
  }
}
```

### `GET /incidents`

Returns the bounded public board for the MVP.

### `GET /incidents/{id}`

Returns a public incident record, excluding DynamoDB internal keys.

## Verified photo-evidence route

### `POST /reports/with-evidence`

Requires a valid Cognito JWT. The CivicSignal frontend keeps the token in an HttpOnly cookie and proxies this request server-side.

```json
{
  "title": "Blocked drainage near crossing",
  "area": "Central ward",
  "summary": "Standing water is blocking a busy pedestrian crossing after rainfall.",
  "category": "Drainage",
  "urgency": "High",
  "evidence_content_type": "image/jpeg"
}
```

The response creates the report and returns a five-minute constrained S3 POST policy. The browser uploads the selected image directly to the private bucket. The photo is not public.

## Internal moderation routes

### `PATCH /incidents/{id}/status`

Requires AWS IAM authorization in the current Terraform route configuration.

```json
{ "status": "In progress" }
```

### `POST /uploads/presign`

Remains AWS IAM protected for trusted internal evidence operations.
