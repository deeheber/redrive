const { SQSClient, ReceiveMessageCommand, SendMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
// TODO: replace this with your region
const client = new SQSClient({ region: 'us-west-2' });

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  while (true) {
    try {
      // Use long polling to avoid empty message reponses
      const receiveParams = {
        QueueUrl: process.env.DLQ_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 1
      };

      // Get messages from the DLQ
      // Continue looping until no more messages are left
      const DLQMessages = await client.send(new ReceiveMessageCommand(receiveParams));

      if (!DLQMessages.Messages || DLQMessages.Messages.length === 0) {
        console.log(`NO MESSAGES FOUND IN ${process.env.DLQ_URL}`);
        // Exit the loop since there aren't any messages left
        break;
      }

      console.log(`RECEIVED ${DLQMessages.Messages.length} MESSAGES`);

      for (const message of DLQMessages.Messages) {
        // Send message to original queue
        const outboundMessage = {
          MessageBody: message.Body,
          QueueUrl: process.env.QUEUE_URL
        };

        console.log(`SENDING: ${JSON.stringify(outboundMessage, null, 2)}`);
        await client.send(new SendMessageCommand(outboundMessage));
        console.log('SEND MESSAGE SUCCEEDED');

        // Delete message from DLQ
        const deleteParams = {
          QueueUrl: process.env.DLQ_URL,
          ReceiptHandle: message.ReceiptHandle
        };

        console.log(`DELETING: ${JSON.stringify(deleteParams, null, 2)}`);
        await client.send(new DeleteMessageCommand(deleteParams));
        console.log('DELETE MESSAGE SUCCEEDED');
      }
    } catch (err) {
      console.log(`AN ERROR OCCURED: ${err.message}`);
      console.log(JSON.stringify(err, null, 2));
      throw err;
    }
  }
};
