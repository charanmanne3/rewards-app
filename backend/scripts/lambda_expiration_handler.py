"""
AWS Lambda entry point for scheduled expiration cleanup.

EventBridge rule (daily or hourly) → this function → RDS.

Package: copy `app/` + `scripts/` + install requirements into a Lambda layer.
"""

from scripts.run_expiration_cleanup import main


def handler(event, context):  # noqa: ARG001
    return {"statusCode": 200, "body": {"exit_code": main()}}
