# CivicSignal Deployment Guide

## Deployment modes

CivicSignal separates the public frontend from the AWS serverless backend:

```text
Next.js frontend → Vercel or CloudFront
AWS API → API Gateway + Lambda + DynamoDB + EventBridge + SNS
Private evidence → encrypted S3
```

This separation lets the interface be demonstrated before it accepts real community data.

## 1. Deploy the frontend preview

1. Push the repository to GitHub.
2. Import `OsikanyiTheDev/civicsignal` into Vercel.
3. Use the detected Next.js settings.
4. Set the temporary Vercel URL as `NEXT_PUBLIC_SITE_URL` after the first deployment.
5. Do not set `NEXT_PUBLIC_CIVICSIGNAL_API_URL` until the AWS API is deployed and tested.

The frontend will remain in clearly labelled demonstration mode without that API URL.

## 2. Prepare AWS safely

Before deployment, choose:

- A dedicated AWS account or isolated development environment
- A globally unique value for `evidence_bucket_name`
- An approved alert-email address
- The exact Vercel frontend URL for `allowed_origins`
- A remote Terraform state bucket that is encrypted, versioned, and private

### Bootstrap remote state first

If you are not intentionally reusing an existing Terraform state bucket, create a dedicated CivicSignal state bucket first:

```bash
cd terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars
# Edit state_bucket_name with a globally unique value.
terraform init
terraform plan
terraform apply
```

Then copy the output bucket name into `terraform/environments/dev/backend.tf` using the supplied `backend.tf.example` as a guide. The main environment uses S3 native lockfiles, encryption, versioning, and blocked public access.

### Configure a small development cost guardrail

The development Terraform environment includes an optional AWS Budget. When `alert_email` is set, it creates a monthly guardrail with alerts at 50% actual spend and 100% forecasted spend. The sample is set to **$10 USD** and can be changed before apply.

Copy the main environment sample configuration:

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

Then set a real bucket name and origin:

```hcl
evidence_bucket_name = "your-unique-civicsignal-private-evidence-bucket"

allowed_origins = [
  "https://your-civicsignal-frontend.vercel.app"
]
```

## 3. Review before apply

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Review the plan for:

- Correct AWS region and account
- No public S3 bucket policy or ACL
- Correct alert email
- Correct browser CORS origin
- Expected API throttle limits
- Expected SNS, EventBridge, Lambda and CloudWatch resources

Only then run:

```bash
terraform apply
```

## 4. Connect frontend to API

Copy the Terraform output:

```bash
terraform output -raw api_url
```

Add it in Vercel:

```text
NEXT_PUBLIC_CIVICSIGNAL_API_URL=https://your-api-id.execute-api.region.amazonaws.com
```

Redeploy the frontend after setting the variable.

## 5. Public-launch safety gate

Do not accept real community reports until the items in [SECURITY.md](SECURITY.md) are addressed, especially moderation, identity, retention, evidence scanning, and emergency-service guidance.
