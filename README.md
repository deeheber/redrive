# Redrive demo
This is an example stack to demo how to setup a redrive policy should something fail as it is going through the pipeline.

Deploy this stack to your AWS account using the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html)

## Architecture
Setup with the [event fork pipeline](https://aws.amazon.com/blogs/compute/enriching-event-driven-architectures-with-aws-event-fork-pipelines/) in mind.

The core setup contains the following:
  - SNS topic
  - SQS queue
  - Lambda function

*Note*: You'll likely have multiple SQS queues/Lambdas connected to the core SNS topic entry point in an enterprise prod environment...but I'm just showing one pipeline in this demo for simplicity purposes.

![visualization](https://user-images.githubusercontent.com/12616554/63967578-9526fc80-ca52-11e9-898b-34d85ab5babb.png)

## Redrive
In the event that an error is thrown, the Lambda will retry the code three times and then send it to the Dead Letter Queue (DLQ).

Once all errors have been cleaned up, you can then run the redrive function manually from the AWS Lambda console to feed the previously failed messages from thee DLQ back into the Queue to retry the job.
