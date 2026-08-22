module "incidents_store" {
  source      = "../../modules/incidents_store"
  name_prefix = local.name_prefix
  tags        = local.common_tags
}

module "evidence_storage" {
  source          = "../../modules/evidence_storage"
  bucket_name     = var.evidence_bucket_name
  allowed_origins = var.allowed_origins
  tags            = local.common_tags
}

module "notifications" {
  source      = "../../modules/notifications"
  name_prefix = local.name_prefix
  alert_email = var.alert_email
  tags        = local.common_tags
}

module "auth" {
  source        = "../../modules/auth"
  name_prefix   = local.name_prefix
  aws_region    = var.aws_region
  domain_prefix = var.cognito_domain_prefix
  callback_urls = var.auth_callback_urls
  logout_urls   = var.auth_logout_urls
  tags          = local.common_tags
}

module "api" {
  source                      = "../../modules/lambda_api"
  name_prefix                 = local.name_prefix
  lambda_source_dir           = abspath("${path.root}/../../../lambda/src")
  incidents_table_name        = module.incidents_store.table_name
  incidents_table_arn         = module.incidents_store.table_arn
  evidence_bucket_name        = module.evidence_storage.bucket_name
  evidence_bucket_arn         = module.evidence_storage.bucket_arn
  event_bus_name              = module.notifications.event_bus_name
  event_bus_arn               = module.notifications.event_bus_arn
  allowed_origins             = var.allowed_origins
  aws_region                  = var.aws_region
  cognito_user_pool_id        = module.auth.user_pool_id
  cognito_user_pool_client_id = module.auth.user_pool_client_id
  tags                        = local.common_tags
}

module "observability" {
  source                = "../../modules/observability"
  name_prefix           = local.name_prefix
  lambda_function_names = module.api.function_names
  api_id                = module.api.api_id
  operations_topic_arn  = module.notifications.operations_topic_arn
  tags                  = local.common_tags
}

module "cost_control" {
  source             = "../../modules/cost_control"
  name_prefix        = local.name_prefix
  monthly_budget_usd = var.monthly_budget_usd
  alert_email        = var.alert_email
}
