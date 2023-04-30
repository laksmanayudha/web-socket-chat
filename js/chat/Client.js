class Client {
  constructor(user = '', conversation) {
    this.user = user;
    this.target = null;
    this.conversation = conversation;
    this.id = null;

    // method binding
    this.setId = this.setId.bind(this);
    this.from = this.from.bind(this);
    this.to = this.to.bind(this);
    this.send = this.send.bind(this);
    this.connect = this.connect.bind(this);
    this.reconnect = this.reconnect.bind(this);
  }

  setId(id) {
    this.id = id;
    return this;
  }

  from(user) {
    this.user = user;
    this.connect();
    return this;
  }

  to(target) {
    this.target = target;
    return this;
  }

  send(message, time = +new Date()) {
    if (!this.user || !this.target) return this;
    const { chatSocket } = this.conversation;

    try {
      chatSocket.send(JSON.stringify({
        id: this.id,
        user: this.user,
        target: this.target,
        time,
        message,
      }));
    } catch (error) {
      console.log(error.message)
    }

    return this;
  }

  connect() {
    if (!this.user) return this;
    const { connectSocket } = this.conversation;

    try {
      connectSocket.send(JSON.stringify({ user: this.user, id: this.id }));
    } catch (error) {
      console.log(error.message);
    }

    return this;
  }

  reconnect() {
    this.conversation.connect().start();
    return this;
  }
}

export default Client;