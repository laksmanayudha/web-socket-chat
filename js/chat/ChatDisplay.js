import { fetchData } from "../helper.js";

class ChatDisplay {
  constructor(element, user = null, target = null) {
    this.element = $(element);
    this.headerLeft = $(this.element.find('#chatHeaderLeft'));
    this.headerRight = $(this.element.find('#chatHeaderRight'));
    this.loader = $(this.element.find('#chatLoader'));
    this.container = $(this.element.find('#chatContainer'));
    this.messages = [];
    this.user = user;
    this.target = target;

    // method binding
    this.changeHeaderLeft = this.changeHeaderLeft.bind(this);
    this.changeHeaderRight = this.changeHeaderRight.bind(this);
    this.insertMessage = this.insertMessage.bind(this);
    this.notify = this.notify.bind(this);
    this.noMessage = this.noMessage.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.setMessages = this.setMessages.bind(this);
    this.setUserAndTarget = this.setUserAndTarget.bind(this);
    this.display = this.display.bind(this);
  }

  changeHeaderLeft(data) {
    this.headerLeft.html(data || 'Direct Chat');
    return this;
  }

  changeHeaderRight(data) {
    this.headerRight.html(data || 'I am User');
    return this;
  }

  insertMessage(type = 'right', {
    user = this.user, 
    target = this.target, 
    message = '', 
    time = +new Date() 
  }) {
    let template = null;

    if (type == 'left') {
        template = document.getElementById('leftMessage');
    } else {
        template = document.getElementById('rightMessage');
    }
    // clone template
    const content = template.content.cloneNode(true);
    
    // fill template
    content.querySelector('#name').innerHTML = user;
    content.querySelector('#chat').innerHTML = message;
    content.querySelector('#time').innerHTML = dayjs(time).format('DD MMM YYYY HH:mm');

    // append chat
    this.container.append(content);

    // scroll to bottom
    this.container.scrollTop(this.container.prop('scrollHeight'));

    return this;
  }

  notify({ 
    user = this.user, 
    target = this.target, 
    message = '', 
    time = +new Date() 
  }) {
    $(document).Toasts('create', {
      title: user,
      autohide: true,
      delay: 3000,
      body: message,
      icon: 'fas fa-user',
      class: 'bg-maroon'
    });
    return this;
  }

  noMessage() {
    this.container.html(`
      <div class="d-flex text-muted justify-content-center mt-2">
          <small>No Chat Available</small>
      </div>
    `);
    return this;
  }

  showLoading() {
    this.loader.removeClass('d-none')
    return this;
  }

  hideLoading() {
    this.loader.addClass('d-none');
    return this;
  }

  async getMessages(url = '', { user = '', target = '' }) {
    try {
      if (!user || !target) throw new Error('user or target not specified');

      const response = await fetchData(`${url}?user=${user}&target=${target}`);
      this.messages = response.data.chats;
    } catch (error) {
      console.log(error.message);
    }

    return this.messages;
  }

  setMessages(messages) {
    this.messages = messages;
    return this;
  }

  setUserAndTarget(user, target) {
    this.user = user;
    this.target = target;
    return this;
  }

  display(messages = null) {
    messages = messages || this.messages;

    if (messages.length <= 0) {
      this.noMessage();
      return this;
    } 

    this.container.html('');
    messages.forEach(message => {
      if (message.user === this.user) {
        this.insertMessage('right', message);
      } else {
        this.insertMessage('left', message);
      }
    });
    
    return this;
  }
}

export default ChatDisplay;