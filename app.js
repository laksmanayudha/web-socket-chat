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

function getChats() {
  chatDisplay
  .changeHeader(getActiveTarget())
  .setUserAndTarget(getActiveUser(), getActiveTarget())
  .showLoading()
  .getMessages(`http://${api}/chats`, { 
    user: getActiveUser(), 
    target: getActiveTarget()
  })
  .then((messages) => {
    messages = messages.map((message) => ({
      ...message, 
      time: dayjs(message.time).format('DD MMM YYYY HH:mm:ss')
    }));
    
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
    getChats();
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

  // get chats
  getChats();
});