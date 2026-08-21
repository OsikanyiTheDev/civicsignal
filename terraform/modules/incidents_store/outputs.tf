output "table_name" {
  value = aws_dynamodb_table.incidents.name
}

output "table_arn" {
  value = aws_dynamodb_table.incidents.arn
}
