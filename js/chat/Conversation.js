import Client from "./Client.js";

class Conversation {
  constructor({ connectUrl = '', chatUrl = '', protocol = 'ws' }) {
    this.connectUrl = connectUrl;
    this.chatUrl = chatUrl;
    this.protocol = protocol;
    this.Client = null;
    this.connectSocket = null;
    this.chatSocket = null;
    this.onStart = null;

    // method binding
    this.setUp = this.setUp.bind(this);
    this.connect = this.connect.bind(this);
    this.start = this.start.bind(this);

    this.setUp();
  }

  setUp() {
    this.connect();
    this.Client = new Client(null, this);
    return this;
  }

  connect() {
    try {
      this.connectSocket = new WebSocket(`${this.protocol}://${this.connectUrl}`);
      this.chatSocket = new WebSocket(`${this.protocol}://${this.chatUrl}`);
    } catch (error) {
      console.log(error.message);
    }
    return this;
  }

  start(startCallback) {
    this.onStart = startCallback || this.onStart;
    this.onStart({
      connectSocket: this.connectSocket,
      chatSocket: this.chatSocket,
    });
    return this;
  }
}

export default Conversation;