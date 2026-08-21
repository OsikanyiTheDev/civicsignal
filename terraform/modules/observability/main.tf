resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each            = var.lambda_function_names
  alarm_name          = "${var.name_prefix}-${each.key}-errors"
  alarm_description   = "CivicSignal Lambda function returned one or more errors."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = each.value
  }

  alarm_actions = [var.operations_topic_arn]
  ok_actions    = [var.operations_topic_arn]
  tags          = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_server_errors" {
  alarm_name          = "${var.name_prefix}-api-5xx"
  alarm_description   = "CivicSignal HTTP API returned 5XX responses."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xx"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = var.api_id
  }

  alarm_actions = [var.operations_topic_arn]
  ok_actions    = [var.operations_topic_arn]
  tags          = var.tags
}
