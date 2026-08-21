variable "name_prefix" {
  type        = string
  description = "Prefix used for the budget name."
}

variable "monthly_budget_usd" {
  type        = number
  description = "Monthly AWS cost guardrail in USD."
  default     = 5
}

variable "alert_email" {
  type        = string
  description = "Budget alert email. No budget resource is created when empty."
  default     = ""
}
