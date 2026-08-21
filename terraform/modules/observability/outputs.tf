output "alarm_names" {
  value = concat(
    [for alarm in aws_cloudwatch_metric_alarm.lambda_errors : alarm.alarm_name],
    [aws_cloudwatch_metric_alarm.api_server_errors.alarm_name]
  )
}
