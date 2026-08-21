output "api_endpoint" {
  value = aws_apigatewayv2_api.public.api_endpoint
}

output "api_id" {
  value = aws_apigatewayv2_api.public.id
}

output "function_names" {
  value = { for key, function in aws_lambda_function.api : key => function.function_name }
}

output "function_arns" {
  value = { for key, function in aws_lambda_function.api : key => function.arn }
}
