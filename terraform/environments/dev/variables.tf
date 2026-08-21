variable "project_name" {
  type        = string
  description = "Project slug used in AWS resource names."
  default     = "civicsignal"
}

variable "environment" {
  type        = string
  description = "Deployment environment."
  default     = "dev"
}

variable "aws_region" {
  type        = string
  description = "AWS region for the serverless backend."
  default     = "us-east-1"
}

variable "allowed_origins" {
  type        = list(string)
  description = "Trusted frontend origins used by API Gateway and S3 CORS."
  default     = ["http://localhost:3000"]
}

variable "evidence_bucket_name" {
  type        = string
  description = "Globally unique private S3 evidence bucket name."
}

variable "alert_email" {
  type        = string
  description = "Optional operational alerts email. Confirm the SNS subscription after deployment."
  default     = ""
}

variable "monthly_budget_usd" {
  type        = number
  description = "Monthly AWS cost guardrail. A $10 default is used for the CivicSignal development environment."
  default     = 10
}
