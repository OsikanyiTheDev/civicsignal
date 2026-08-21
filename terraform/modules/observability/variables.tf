variable "name_prefix" {
  type        = string
  description = "Name prefix for alarms."
}

variable "lambda_function_names" {
  type        = map(string)
  description = "Map of Lambda handler keys to function names."
}

variable "api_id" {
  type        = string
  description = "HTTP API identifier for API Gateway metrics."
}

variable "operations_topic_arn" {
  type        = string
  description = "SNS topic ARN used for operational alarms."
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
