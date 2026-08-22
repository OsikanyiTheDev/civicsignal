variable "bucket_name" {
  type        = string
  description = "Globally unique private evidence bucket name."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Approved browser origins for constrained presigned POST uploads."
}

variable "evidence_retention_days" {
  type        = number
  description = "Number of days before private photo evidence expires automatically."
  default     = 90
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
