output "event_bus_name" {
  value = aws_cloudwatch_event_bus.civicsignal.name
}

output "event_bus_arn" {
  value = aws_cloudwatch_event_bus.civicsignal.arn
}

output "operations_topic_arn" {
  value = aws_sns_topic.operations.arn
}
