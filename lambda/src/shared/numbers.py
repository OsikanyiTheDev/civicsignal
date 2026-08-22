from decimal import Decimal


def dynamodb_decimal(value: float) -> Decimal:
    """Convert a browser/API float to the Decimal type required by boto3 DynamoDB."""
    return Decimal(str(value))
