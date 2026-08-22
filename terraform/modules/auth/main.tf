resource "aws_cognito_user_pool" "reporters" {
  name = "${var.name_prefix}-reporters"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OFF"

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-reporters"
    Purpose = "verified-photo-evidence-reporting"
  })
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.name_prefix}-web"
  user_pool_id = aws_cognito_user_pool.reporters.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  supported_identity_providers         = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
  ]
}

resource "aws_cognito_user_pool_domain" "hosted_ui" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.reporters.id
}

resource "aws_cognito_user_group" "roles" {
  for_each = {
    Reporter      = 40
    Responder     = 30
    Moderator     = 20
    Administrator = 10
  }

  user_pool_id = aws_cognito_user_pool.reporters.id
  name         = each.key
  description  = "CivicSignal ${lower(each.key)} role"
  precedence   = each.value
}
