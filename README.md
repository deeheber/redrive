# Redrive demo
This is an example stack to demo how to setup a redrive policy should something fail as it is going through the pipeline.

## Architecture
Setup with the [event fork pipeline](https://aws.amazon.com/blogs/compute/enriching-event-driven-architectures-with-aws-event-fork-pipelines/) in mind.

The core setup contains the following:
  - SNS topic
  - SQS queue
  - Lambda function

*Note*: You'll likely have multiple SQS queues/Lambdas connected to the core SNS topic entry point in an enterprise prod environment...but I'm just showing one pipeline in this demo for simplicity purposes.

![redrive-architecture](https://user-images.githubusercontent.com/12616554/156620986-b47945c8-408b-4b3c-859d-1fb8f6e24a39.png)

## Redrive
In the event that an error is thrown, the Lambda will retry the code three times and then send it to the Dead Letter Queue (DLQ).

Once all errors have been cleaned up, you can then run the redrive function manually from the AWS Lambda console to feed the previously failed messages from thee DLQ back into the Queue to retry the job.

## Deploy Directions
Deploy this stack to your AWS account using the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html)

1. Install [NodeJS](https://nodejs.org/en/) and the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html) on your computer if you don't have it installed yet
2. Clone this repo
3. Run [`sam build`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) and [`sam deploy --guided`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
4. Start sending messages to your Topic. This can be done in the AWS Console or by using the AWS CLI.
