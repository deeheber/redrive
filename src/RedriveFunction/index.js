const aws = require('aws-sdk');
const sqs = new aws.SQS();

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  const receiveParams = {
    QueueUrl: process.env.DLQ_URL,
    MaxNumberOfMessages: 10
  };

  let DLQMessages;

  try {
    DLQMessages = await sqs.receiveMessage(receiveParams).promise();
    console.log('MESSAGE RECEIVE SUCCESS');
    console.log(JSON.stringify(DLQMessages, undefined, 2));
  } catch (err) {
    console.log('ERROR RECEIVING MESSAGES THE FIRST TIME');
    console.log(err.message);
    console.log(JSON.stringify(err, null, 2));
    throw new Error('Error on initial message receive');
  }

  do {
    if (!DLQMessages.Messages) {
      console.log(`NO MESSAGES FOUND IN ${process.env.DLQ_URL}`);
      // Exit the function early due to no messages in the queue
      return {
        statusCode: 200,
        headers: {},
        body: `No messages in ${event.inboundQueue}`
      };
    }

    console.log(`RECEIVED ${DLQMessages.Messages.length} MESSAGES`);

    DLQMessages.Messages.forEach(async message => {
      // Send message
      const sendParams = {
        MessageBody: message.Body,
        QueueUrl: process.env.QUEUE_URL
      };

      console.log(`SENDING: ${JSON.stringify(sendParams, null, 2)}`);

      try {
        await sqs.sendMessage(sendParams).promise();
        console.log('MESSAGE SEND SUCCESS');
      } catch (err) {
        console.log('ERROR SENDING MESSAGE');
        console.log(err.message);
        console.log(JSON.stringify(err, null, 2));
      }

      // Delete message
      const deleteParams = {
        QueueUrl: process.env.DLQ_URL,
        ReceiptHandle: message.ReceiptHandle
      };

      console.log(`DELETING: ${JSON.stringify(deleteParams, null, 2)}`);

      try {
        await sqs.deleteMessage(deleteParams).promise();
        console.log('MESSAGE DELETE SUCCESS');
      } catch (err) {
        console.log('ERROR DELETING MESSAGE');
        console.log(err.message);
        console.log(JSON.stringify(err, null, 2));
      }
    });

    // See if there are any more messages in the DLQ
    try {
      DLQMessages = await sqs.receiveMessage(receiveParams).promise();
    } catch (err) {
      console.log('ERROR RECEIVING MESSAGES');
      console.log(err.message);
      console.log(JSON.stringify(err, null, 2));
    }
  } while (DLQMessages.Messages);
};
