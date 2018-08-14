// Enable WebSockets for CometD
var window = {};
window.WebSocket = require('ws');

require('cometd-nodejs-client').adapt();
const cometdlib = require('cometd');


export default class CometdClient {

  constructor(logger = console) {
    this.logger = logger;
    this.cometd = new cometdlib.CometD();
    this.subscriptions = [];
  }

  configure(config) {
    this.cometd.configure(config);
  }

  connect() {
    this.logger.debug('Connecting to CometD server...');
    return new Promise((resolve, reject) => {
      this.cometd.handshake(handshake => {
        if (handshake.successful) {
          this.logger.debug('Successfully connected to CometD server.');
          resolve();
        } else {
          const error = 'Unable to connect to CometD ' + JSON.stringify(handshake);
          this.logger.error(error);
          reject(error);
        }
      });
    });
  }

  subscribe(topic, onMessageCallback) {
    this.logger.debug('Subscribing to '+ topic);
    return new Promise((resolve, reject) => {
      const subscription = this.cometd.subscribe(topic, onMessageCallback, null, subResponse => {
        if (subResponse.successful) {
          this.logger.debug('Successfully subscribed to '+ topic);
          resolve(subscription);
        } else {
          const error = 'Failed to subscribe to '+ subResponse.subscription +', reason: '+ subResponse.error;
          this.logger.error(error);
          reject(error);
        }
      });
      this.subscriptions.push(subscription);
    });
  }

  unsubscribe(subscription) {
    this.logger.debug('Unsubscribing from '+ subscription.channel);
    return new Promise((resolve, reject) => {
      this.cometd.unsubscribe(subscription, unsubResponse => {
        if (unsubResponse.successful) {
          this.logger.debug('Successfully unsubscribed from '+ subscription.channel);
          resolve();
        } else {
          const error = 'Failed to unsubscribe from '+ subscription.channel +', reason: '+ unsubResponse.error;
          this.logger.error(error);
          reject(error);
        }
      });
    });
  }

  batch(cometdPromises) {
    return new Promise((resolve, reject) => {
      this.cometd.startBatch();
      Promise.all(cometdPromises).then(() => {
        this.cometd.endBatch();
        resolve();
      }).catch(e => {
        this.cometd.endBatch();
        reject(e);
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.logger.debug('Batch unsubscribing...');
      const cometdPromises = this.subscriptions.map(subscription => (this.unsubscribe(subscription)) );
      this.batch(cometdPromises).then(() => {
        this.logger.debug('Disconnecting...');
        this.cometd.disconnect(false, null, () => {
          this.logger.debug('Successfully disconnected');
          resolve();
        });
      });
    });
  }
}
