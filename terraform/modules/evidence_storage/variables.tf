variable "bucket_name" {
  type        = string
  description = "Globally unique private evidence bucket name."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Approved browser origins for constrained presigned POST uploads."
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
