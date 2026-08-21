resource "aws_cloudwatch_event_bus" "civicsignal" {
  name = "${var.name_prefix}-events"

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-events"
    Purpose = "incident-event-routing"
  })
}

resource "aws_sns_topic" "operations" {
  name              = "${var.name_prefix}-operations"
  display_name      = "CivicSignal Operations"
  kms_master_key_id = "alias/aws/sns"

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-operations"
    Purpose = "operational-notifications"
  })
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.operations.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_event_rule" "incident_submitted" {
  name           = "${var.name_prefix}-incident-submitted"
  event_bus_name = aws_cloudwatch_event_bus.civicsignal.name
  description    = "Routes submitted CivicSignal incidents to the operations topic."

  event_pattern = jsonencode({
    source      = ["civicsignal.incidents"]
    detail-type = ["IncidentSubmitted"]
  })
}

resource "aws_cloudwatch_event_target" "operations_topic" {
  rule           = aws_cloudwatch_event_rule.incident_submitted.name
  event_bus_name = aws_cloudwatch_event_bus.civicsignal.name
  target_id      = "operations-sns"
  arn            = aws_sns_topic.operations.arn
}

resource "aws_sns_topic_policy" "allow_eventbridge" {
  arn = aws_sns_topic.operations.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgePublish"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.operations.arn
        Condition = {
          ArnEquals = { "aws:SourceArn" = aws_cloudwatch_event_rule.incident_submitted.arn }
        }
      }
    ]
  })
}
