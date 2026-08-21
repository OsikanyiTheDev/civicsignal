# CivicSignal — Local AWS Development Deployment

Use this guide on your own computer, where AWS credentials are already configured. Do not copy AWS access keys into GitHub, `.tfvars`, the frontend, or chat.

## 0. Confirm the AWS identity

```bash
aws sts get-caller-identity
```

If you use more than one AWS profile, set the intended development profile first:

```bash
export AWS_PROFILE=your-development-profile
aws sts get-caller-identity
```

Confirm that this is the AWS account you intend to use before continuing.

## 1. Clone the current repository

```bash
git clone https://github.com/OsikanyiTheDev/civicsignal.git
cd civicsignal

git log --oneline -6
```

Expected recent commits include the Terraform infrastructure, cost guardrail, and state bootstrap work.

## 2. Confirm the existing Terraform state bucket

You selected an existing state bucket. Verify that it exists and that you can access it:

```bash
aws s3 ls s3://REPLACE_WITH_YOUR_EXISTING_STATE_BUCKET
aws s3api get-bucket-versioning --bucket REPLACE_WITH_YOUR_EXISTING_STATE_BUCKET
```

Use a unique state key for CivicSignal. Do **not** reuse another project’s state file.

Create `terraform/environments/dev/backend.tf` from this template:

```hcl
terraform {
  backend "s3" {
    bucket       = "REPLACE_WITH_YOUR_EXISTING_STATE_BUCKET"
    key          = "civicsignal/dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

> If the bucket is not in `us-east-1`, replace `region` with the bucket’s actual region.

## 3. Configure the development environment

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
# Replace ACCOUNT_ID after running aws sts get-caller-identity.
evidence_bucket_name = "civicsignal-evidence-ACCOUNT_ID-2026"

allowed_origins = [
  "http://localhost:3000"
]

alert_email        = "jillskillion@gmail.com"
monthly_budget_usd = 10
```

Do not add a Vercel origin until the frontend is deployed. Add it later as a second item in `allowed_origins`.

## 4. Initialise and validate Terraform

```bash
terraform init
terraform fmt -recursive
terraform validate
```

## 5. Create a plan — stop here first

```bash
terraform plan -out=tfplan
terraform show tfplan
```

Review the plan before applying. It should include only expected serverless resources:

- DynamoDB incidents table
- Private encrypted S3 evidence bucket
- SNS topic and optional email subscription
- EventBridge custom bus and rule
- Lambda functions
- API Gateway HTTP API
- CloudWatch log groups and alarms
- Optional $10 monthly AWS Budget alert

It should **not** create EC2, NAT Gateway, RDS, ALB, or other unexpected resources.

## 6. Before apply

Send the readable `terraform show tfplan` output or screenshots for review. Then confirm:

- The AWS account ID is correct
- The evidence bucket name is unique
- The state key is `civicsignal/dev/terraform.tfstate`
- Alert email is correct
- The $10 budget guardrail is intentional
- No unexpected paid networking or compute resources appear

Only then run:

```bash
terraform apply tfplan
```

## 7. After apply

```bash
terraform output -raw api_url
```

Keep the API URL private until we configure the frontend’s `NEXT_PUBLIC_CIVICSIGNAL_API_URL` and add the final Vercel domain to the API/S3 CORS allow-list.
