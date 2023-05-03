import {
  setStorage,
  getStorage,
  fetchData,
  setActiveTarget,
  getActiveTarget,
  setActiveUser,
  getActiveUser,
  displayDefaultActiveTarget,
  init,
} from './js/helper.js';

import {
  Conversation,
  ChatDisplay
} from './js/chat/index.js'

let USERS = [];
let LASTCHATS = {};
let UNREADS = [];
const API = 'localhost:8080';
const PROTOCOL = 'http';
const RENDER_EVENT = 'RENDER_EVENT';
const chatDisplay = new ChatDisplay('#chatDisplay');
const conversation = new Conversation({ connectUrl: `${API}/ws-connect`, chatUrl: `${API}/ws-chat` });
const client = conversation.Client;

// start conversation
conversation.start(({ connectSocket, chatSocket }) => {

  chatDisplay.showConnecting();

  // socket on open
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

  // socket on message
  connectSocket.addEventListener('message', async function(e) {
    const response = JSON.parse(e.data);
    const { status, type,  message, data } = response

    if (type == 'connect') { // on user connect
      const { user, id } = data;
      setStorage('id', id); // save connection id

      client.setId(id);
      client.isOffline = false;
      chatDisplay.showOnline();

      getChats(); // set current active chat
      await getLastChatsFor(client.user); // set last chat thumb for active user
      document.dispatchEvent(new Event(RENDER_EVENT));

      console.log(`connect-socket [message]: ${message} for user ${user}.`);
    }

    if (type == 'message') { // on message sent or received
      const { chat } = data;
      
      if (message == 'sent') {
        insertLastChat(chat.target, chat); // push last chat to related target
        console.log(`connect-socket [message]: Message sent to ${chat.target}`);
      }

      if (message == 'received') {
        if ( // target currently active, insert to chat container
            client.user === chat.target && 
            getActiveTarget() === chat.user && 
            getActiveTarget() !== client.user
        ){
          chatDisplay.insertMessage('left', {
            user: chat.user,
            message: chat.message,
            time: chat.time,
          });
        }
        
        if ( // target not active, notify the user, push to unread
            client.user === chat.target && 
            getActiveTarget() !== chat.user && 
            getActiveTarget !== client.user
        ){
          chatDisplay.notify({
            user: chat.user,
            message: chat.message,
            time: chat.time,
          });
          insertUnread(chat.id);
        }
        
        insertLastChat(chat.user, chat); // push last chat to related user
        console.log(`connect-socket [message]: Message received from ${chat.user}`);
      }
      
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  // socket on close
  connectSocket.addEventListener('close', function(e) {
    client.isOffline = true;
    chatDisplay.showOffline();
    console.log(`connect-socket [close]: connection died, because ${e.reason}`);
    chatSocket.close(1000, e.reason);
  });

  // socket on close
  chatSocket.addEventListener('close', function(e) {
    console.log(`chat-socket [close]: connection died, because ${e.reason}`);
  });
});

function insertUnread(chat) {
    UNREADS.push(chat);
}

function removeUnread(target) {
    if (Object.keys(LASTCHATS).length <= 0) return;
    let targetChats = LASTCHATS.to[target] || [];
    let removedChatids = targetChats.map(({ id }) => id);
    UNREADS = UNREADS.filter((unreadId) => !removedChatids.includes(unreadId));
}

function insertLastChat(target, chat) {
  if (LASTCHATS.to[target].find(({ id }) => id === chat.id)) return;
  LASTCHATS.to[target].push(chat);
}

function getChats() {
  chatDisplay
    .changeHeaderLeft(`To: ${client.target || ''}`)
    .changeHeaderRight(`I'm <strong>${client.user || ''}</strong>`)
    .setUserAndTarget(client.user, client.target);
  
  if (client.isOffline) return;
  chatDisplay
    .showLoading()
    .getMessages(`${PROTOCOL}://${API}/chats`, { 
      user: client.user, 
      target: client.target
    })
    .then((messages) => {
      chatDisplay
        .hideLoading()
        .display(messages)
    });
}

async function getUsers() {
  try {
    $('#refreshContact i').addClass('rotate');
    const response = await fetchData(`${PROTOCOL}://${API}/users`);
    const { data } = response;
    USERS = data.users;
  } catch (error) {
    console.log(error.message)
  }
  $('#refreshContact i').removeClass('rotate');
}

async function getLastChatsFor(user) {
  try {
    const { data } = await fetchData(`${PROTOCOL}://${API}/last-chats?forUser=${user}`);
    const toUser = {};
    data.lastChats.forEach(lastChat => { toUser[lastChat.name] = lastChat.chats });
    LASTCHATS = { from: user, to: toUser };
  } catch (error) {
    console.log(error.message);
  }
}

$(document).ready(async function (e) {

  // event listeners
  document.addEventListener(RENDER_EVENT, function () {
    init(USERS, LASTCHATS, UNREADS);
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

      getChats();
      removeUnread(client.target);
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
  });

  $('#openSidebar').on('click', function (e) {
    $('.sidebar').addClass('sidebar--open');
  });

  $('#closeSidebar').on('click', function (e) {
    $('.sidebar').removeClass('sidebar--open');
  });

  $('#refreshContact').on('click', async function(e) {
    e.preventDefault();
    await getUsers();
    document.dispatchEvent(new Event(RENDER_EVENT));
  })

  $('#from').on('change', function (e) {
    setStorage('user', e.target.value);

    if (client.isOffline) {
      $('#reconnect').click();
      return;
    }

    client
      .from(e.target.value)
      .connect();
  });

  $('#reconnect').on('click', function(e) {
    client
      .from(getActiveUser())
      .to(getActiveTarget())
      .reconnect();
  });

  $('#addUserForm').on('submit', async function (e) {
    e.preventDefault();
    const data = $(this).serializeArray()[0];
    const user = data.value;

    if (!user) return;
    try {
      const response = await fetchData(`${PROTOCOL}://${API}/users`, {
        method: 'POST',
        body: JSON.stringify({ user })
      });

      if (response.status != 'success') throw new Error(response.message);

      //  add users if not error
      USERS = [...USERS, response.data.user];

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

    $(this).find('input').val(''); // reset form add user
    await getLastChatsFor(client.user); //get last chat for new added user
    document.dispatchEvent(new Event(RENDER_EVENT)); // rerender
  });

  $('#chatForm').on('submit', function (e) {
    e.preventDefault();
    const message = $(this).serializeArray()[0].value;
    const time = +new Date();
    if (!message || !client.user || !client.target) return;

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

  // initial data
  await getUsers(); // get users

  // render to display users on UI
  document.dispatchEvent(new Event(RENDER_EVENT));

  // set client then connect
  client
    .setId(getStorage('id'))
    .from(getActiveUser())
    .to(getActiveTarget())
    .connect();
});