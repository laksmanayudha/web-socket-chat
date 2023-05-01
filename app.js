import {
  setStorage,
  getStorage,
  fetchData,
  setActiveTarget,
  getActiveTarget,
  setActiveUser,
  getActiveUser,
  displayDefaultActiveTarget,
  loadUsers,
} from './js/helper.js';

import {
  Client,
  Conversation,
  ChatDisplay
} from './js/chat/index.js'

let users = [];
const api = 'localhost:8080';
const RENDER_EVENT = 'RENDER_EVENT';
const chatDisplay = new ChatDisplay('#chatDisplay');
const conversation = new Conversation({ connectUrl: `${api}/ws-connect`, chatUrl: `${api}/ws-chat` });
const client = conversation.Client;

// start conversation
conversation.start(({ connectSocket, chatSocket }) => {

  // connect socket
  connectSocket.addEventListener('open', function(e) {

    if (client.isOffline) { // for reconnect
      client
        .setId(getStorage('id'))
        .from(getActiveUser())
        .to(getActiveTarget())
        .connect();
    }
    
    console.log(`connect-socket [open]: web socket connection established.`);
  });

  connectSocket.addEventListener('message', function(e) {
    const response = JSON.parse(e.data);
    const { status, type,  message, data } = response

    if (type == 'connect') {
      const { user, id } = data;
      
      setStorage('id', id); // save connection id
      client.setId(id);
      client.isOffline = false;
      chatDisplay.showOnline();
      getChats();

      console.log(`connect-socket [message]: ${message} for user ${user}.`);
    }

    if (type == 'message') {
      const { chat } = data;

      if (message == 'offline') console.log(`connect-socket [message]: User ${chat.target} offline.`);
      if (message == 'sent') console.log(`connect-socket [message]: Message sent to ${chat.target}`);
      if (message == 'received') {
        if (client.user === chat.target && getActiveTarget() === chat.user && getActiveTarget() !== client.user) 
          chatDisplay.insertMessage('left', {
            user: chat.user,
            message: chat.message,
            time: chat.time,
          });
        
        if (client.user === chat.target && getActiveTarget() !== chat.user && getActiveTarget !== client.user) 
          chatDisplay.notify({
            user: chat.user,
            message: chat.message,
            time: chat.time,
          });
        console.log(`connect-socket [message]: Message received from ${chat.user}`);
      }
    }
  });

  connectSocket.addEventListener('close', function(e) {
    client.isOffline = true;
    chatDisplay.showOffline();
    console.log(`connect-socket [close]: connection died, because ${e.reason}`);
    chatSocket.close(1000, e.reason);
  });

  // chat socket
  chatSocket.addEventListener('close', function(e) {
    console.log(`chat-socket [close]: connection died, because ${e.reason}`);
  });
});

function getChats() {
  chatDisplay
    .changeHeaderLeft(`To: ${client.target || ''}`)
    .changeHeaderRight(`I'm <strong>${client.user || ''}</strong>`)
    .setUserAndTarget(client.user, client.target);
  
  if (client.isOffline) return;
  chatDisplay
    .showLoading()
    .getMessages(`http://${api}/chats`, { 
      user: client.user, 
      target: client.target
    })
    .then((messages) => {
      chatDisplay
        .hideLoading()
        .display(messages)
    });
}

$(document).ready(async function (e) {

  // event listeners
  document.addEventListener(RENDER_EVENT, function () {
    loadUsers(users);
    setActiveUser(getStorage('user'));
    setActiveTarget(getStorage('target'));
    displayDefaultActiveTarget(getStorage('target'));

    $('.contact-item').on('click', function (e) {
      const target = $(this).find('input').val();
      $('.contact-item').removeClass('active');
      $(this).addClass('active');

      setActiveTarget(target);
      setStorage('target', target);
      client.to(target);

      getChats()
    });
  });

  $('#openSidebar').on('click', function (e) {
    $('.sidebar').addClass('sidebar--open');
  });

  $('#closeSidebar').on('click', function (e) {
    $('.sidebar').removeClass('sidebar--open');
  });

  $('#from').on('change', function (e) {
    setStorage('user', e.target.value);

    if (client.isOffline) {
      client
        .from(e.target.value)
        .reconnect();
      return;
    }

    client
      .from(e.target.value)
      .connect();
  });

  $('#reconnect').on('click', function(e) {
    client.reconnect();
  });

  $('#addUserForm').on('submit', async function (e) {
    e.preventDefault();
    const data = $(this).serializeArray()[0];
    const user = data.value;

    if (!user) return;
    try {
      const response = await fetchData(`http://${api}/users`, {
        method: 'POST',
        body: JSON.stringify({ user })
      });

      if (response.status != 'success') throw new Error(response.message);

      //  add users if not error
      users = [...users, response.data.user];

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: response.message,
        showConfirmButton: false,
        timer: 1500
      });

    } catch (error) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: error.message,
        showConfirmButton: false,
        timer: 1500
      });
    }

    // reset input form
    $(this).find('input').val('');
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  $('#chatForm').on('submit', function (e) {
    e.preventDefault();
    const message = $(this).serializeArray()[0].value;
    const time = +new Date();
    if (!message) return;

    // insert message
    chatDisplay.insertMessage('right', { message, time });

    // clear chat form
    $(this).find('input').val('');

    // sent to target
    try {
      client
        .to(getActiveTarget())
        .send(message, time);
    } catch(error) {
      console.log(error.message);
    }
  });

  // get users
  try {
    const response = await fetchData(`http://${api}/users`);
    const { data } = response;
    users = data.users;
  } catch (error) {
    console.log(error.message)
  }

  // render to display users on UI
  document.dispatchEvent(new Event(RENDER_EVENT));

  // set client then connect
  client
    .setId(getStorage('id'))
    .from(getActiveUser())
    .to(getActiveTarget())
    .connect();
});

// protect send chat when offline (retry send), pop up send chat when offline 
// target last chat