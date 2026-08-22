variable "name_prefix" {
  type        = string
  description = "Prefix for Cognito resources."
}

variable "aws_region" {
  type        = string
  description = "AWS region used to build the Cognito issuer and hosted UI URL."
}

variable "domain_prefix" {
  type        = string
  description = "Globally unique Cognito Hosted UI domain prefix."
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed OAuth callback URLs for the CivicSignal web application."
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed OAuth sign-out return URLs for the CivicSignal web application."
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
