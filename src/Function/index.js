exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  // Uncomment to throw error to send to the DLQ intentionally
  // throw new Error('This is a test failure...going to the DLQ');

  console.log('Message successfully delivered and processed');
};
