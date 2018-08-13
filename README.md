# CometD client for Node.js that adds support for promises

## Installation
Add the client to your project by running:<br/>
`npm install cometd-node-promise-client`

## Usage

1) Instatiate the CometD client

1.a) with the default console logger:
```js
// 
const cometd = new CometdClient());
```

OR

1.b) with the Winston logger:
```js
Winston.loggers.add('COMETD', {
  console: { level: 'info', colorize: true, label: 'COMETD' }
});
const cometd = new CometdClient(Winston.loggers.get('COMETD'));
```

2) Configure the CometD client
```js
cometd.configure({
    url: cometdServerUrl,
    requestHeaders: { Authorization: 'Bearer ' + this.session.access_token }, // Optional parameter if you wan to pass additional headers
    appendMessageTypeToURL: false
});
```

3) Handshake with the CometD server and subscribe to a `topicName` topic:
```js
cometd.connect().then(() => {
    // Connection succeeded
    cometd.subscribe(topicName, onMessageReceived).then(subscription => {
        // This promise resolves when the client has succesfully subscribed
    });
});
```

The `onMessageReceived` callback function is executed each time a `topicName` message is received.

Alternatively you can batch subscriptions:
```js
const cometdPromises = [
    cometd.subscribe(topic1, onMessage1Received),
    cometd.subscribe(topic2, onMessage2Received)
];
cometd.batch(cometdPromises).then(() => {
    // This promise resolves when the batch is processed
});
```

4) If you wish to unsusbribe from a topic:
```js
cometd.unsubscribe(subscription).then(() => {
    // This promise resolves when the client has succesfully unsubscribed
});
```

5) When you no longer need your CometD client, disconnect from the server:
```js
cometd.disconnect().then(() => {
    // This promise resolves when the client has succesfully disconnected
});
```

Disconnect unsubscribes from all subscriptions.
