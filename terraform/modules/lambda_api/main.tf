data "archive_file" "api" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/civicsignal-api.zip"
}

locals {
  functions = {
    health = {
      handler   = "handlers.health.lambda_handler"
      route_key = "GET /health"
      auth      = "NONE"
    }
    list_incidents = {
      handler   = "handlers.list_incidents.lambda_handler"
      route_key = "GET /incidents"
      auth      = "NONE"
    }
    get_incident = {
      handler   = "handlers.get_incident.lambda_handler"
      route_key = "GET /incidents/{id}"
      auth      = "NONE"
    }
    create_incident = {
      handler   = "handlers.create_incident.lambda_handler"
      route_key = "POST /incidents"
      auth      = "NONE"
    }
    create_incident_with_evidence = {
      handler   = "handlers.create_incident_with_evidence.lambda_handler"
      route_key = "POST /reports/with-evidence"
      auth      = "JWT"
    }
    get_public_evidence = {
      handler   = "handlers.get_public_evidence.lambda_handler"
      route_key = "GET /incidents/{id}/evidence"
      auth      = "NONE"
    }
    list_moderation_incidents = {
      handler   = "handlers.list_moderation_incidents.lambda_handler"
      route_key = "GET /moderation/incidents"
      auth      = "JWT"
    }
    get_moderation_evidence = {
      handler   = "handlers.get_moderation_evidence.lambda_handler"
      route_key = "GET /moderation/incidents/{id}/evidence"
      auth      = "JWT"
    }
    review_evidence = {
      handler   = "handlers.review_evidence.lambda_handler"
      route_key = "POST /moderation/incidents/{id}/evidence/review"
      auth      = "JWT"
    }
    update_status_moderation = {
      handler   = "handlers.update_status_moderation.lambda_handler"
      route_key = "PATCH /moderation/incidents/{id}/status"
      auth      = "JWT"
    }
    request_upload = {
      handler   = "handlers.request_upload.lambda_handler"
      route_key = "POST /uploads/presign"
      auth      = "AWS_IAM"
    }
    update_status = {
      handler   = "handlers.update_incident_status.lambda_handler"
      route_key = "PATCH /incidents/{id}/status"
      auth      = "AWS_IAM"
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "${var.name_prefix}-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "api_data_access" {
  name = "${var.name_prefix}-api-data-access"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "IncidentsTable"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [var.incidents_table_arn, "${var.incidents_table_arn}/index/*"]
      },
      {
        Sid    = "PrivateEvidenceUpload"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
        ]
        Resource = "${var.evidence_bucket_arn}/pending-evidence/*"
      },
      {
        Sid      = "PublishIncidentEvent"
        Effect   = "Allow"
        Action   = ["events:PutEvents"]
        Resource = var.event_bus_arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each          = local.functions
  name              = "/aws/lambda/${var.name_prefix}-${each.key}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_lambda_function" "api" {
  for_each         = local.functions
  function_name    = "${var.name_prefix}-${each.key}"
  description      = "CivicSignal ${replace(each.key, "_", " ")} API handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  role             = aws_iam_role.lambda.arn
  handler          = each.value.handler
  runtime          = "python3.12"
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      INCIDENTS_TABLE = var.incidents_table_name
      EVIDENCE_BUCKET = var.evidence_bucket_name
      EVENT_BUS_NAME  = var.event_bus_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-${each.key}"
    Purpose = "civicsignal-api"
  })
}

resource "aws_apigatewayv2_api" "public" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "CivicSignal community infrastructure incident API"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_origins     = var.allowed_origins
    max_age           = 300
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-api"
    Purpose = "community-signal-api"
  })
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.public.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.name_prefix}-photo-evidence-jwt"

  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.public.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      sourceIp         = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  for_each               = local.functions
  api_id                 = aws_apigatewayv2_api.public.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api[each.key].invoke_arn
  payload_format_version = "2.0"
  integration_method     = "POST"
}

resource "aws_apigatewayv2_route" "lambda" {
  for_each           = local.functions
  api_id             = aws_apigatewayv2_api.public.id
  route_key          = each.value.route_key
  target             = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
  authorization_type = each.value.auth
  authorizer_id      = each.value.auth == "JWT" ? aws_apigatewayv2_authorizer.cognito.id : null
}

resource "aws_lambda_permission" "api_gateway" {
  for_each      = local.functions
  statement_id  = "AllowApiGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.public.execution_arn}/*/*"
}
