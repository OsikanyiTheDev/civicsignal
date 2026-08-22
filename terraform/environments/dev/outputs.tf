output "api_url" {
  description = "HTTP API base URL for NEXT_PUBLIC_CIVICSIGNAL_API_URL."
  value       = module.api.api_endpoint
}

output "incidents_table_name" {
  value = module.incidents_store.table_name
}

output "evidence_bucket_name" {
  value = module.evidence_storage.bucket_name
}

output "alarm_names" {
  value = module.observability.alarm_names
}

output "cognito_user_pool_id" {
  value = module.auth.user_pool_id
}

output "cognito_user_pool_client_id" {
  value = module.auth.user_pool_client_id
}

output "cognito_hosted_ui_domain" {
  value = module.auth.hosted_ui_domain
}
