variable "name_prefix" {
  type        = string
  description = "Name prefix for CivicSignal API resources."
}

variable "lambda_source_dir" {
  type        = string
  description = "Absolute path to the Lambda source directory to package."
}

variable "incidents_table_name" {
  type        = string
  description = "DynamoDB incidents table name."
}

variable "incidents_table_arn" {
  type        = string
  description = "DynamoDB incidents table ARN."
}

variable "evidence_bucket_name" {
  type        = string
  description = "Private evidence bucket name."
}

variable "evidence_bucket_arn" {
  type        = string
  description = "Private evidence bucket ARN."
}

variable "event_bus_name" {
  type        = string
  description = "EventBridge bus used for incident lifecycle events."
}

variable "event_bus_arn" {
  type        = string
  description = "EventBridge bus ARN used in Lambda IAM policy."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Browser origins allowed by HTTP API CORS."
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention for the API and Lambda functions."
  default     = 30
}

variable "throttling_burst_limit" {
  type        = number
  description = "API Gateway HTTP API burst throttle." 
  default     = 20
}

variable "throttling_rate_limit" {
  type        = number
  description = "API Gateway HTTP API steady-state requests per second." 
  default     = 10
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
