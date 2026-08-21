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

## Moderation routes

### `PATCH /incidents/{id}/status`

Requires AWS IAM authorization in the Terraform route configuration.

```json
{ "status": "In progress" }
```

### `POST /uploads/presign`

Requires AWS IAM authorization in the current implementation.

```json
{ "content_type": "image/jpeg" }
```

Returns a five-minute constrained S3 POST policy for private evidence storage.
