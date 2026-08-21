variable "name_prefix" {
  type        = string
  description = "Prefix for event and notification resources."
}

variable "alert_email" {
  type        = string
  description = "Optional operations email. SNS confirmation is required after apply."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
