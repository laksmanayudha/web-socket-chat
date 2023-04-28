async function displayTargetUsers() {
    const response = await fetchData(`${api}/users`);
    if (!response) return;
    const { data: { users } } = response;
    
    // set from select
    $('#from').html('');
    const option = document.createElement('option');
    option.value = '';
    option.innerHTML = 'Select User';

    $('#from').append(option);
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.name;
        option.innerHTML = user.name;
        $('#from').append(option);
    });

    // set target
    $('.contact-lists').html('');
    const contactItemContent = document.querySelector('#contactItem').content;
    users.forEach(user => {
        let content = contactItemContent.cloneNode(true);
        content.querySelector('.user-thumb-display').innerHTML = user.name;
        content.querySelector('[name="userThumbName"]').innerHTML = user.name;
        content.querySelector('[name="userThumbName"]').value = user.name;
        $('.contact-lists').append(content);
    });
}

function displayActiveTarget() {
    const activeTarget = getActiveTarget();
    if (!activeTarget) return;

    $(`.contact-item`).each(function(index, el) {
        let input = $(el).find('input');
        if ($(input).val() == activeTarget) {
            $(el).addClass('active');
            changeChatHeader(activeTarget);
        };
    });
}

function insertMessage({ user, chat, time, type }) {
    const chatContainer = document.getElementById('chatContainer');
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
    content.querySelector('#chat').innerHTML = chat;
    content.querySelector('#time').innerHTML = time;

    // append chat
    chatContainer.append(content);

    return content;
}

function changeChatHeader(data) {
    $('#directChatTitle').html(data);
}

function setDynamicListeners() {
    $('.contact-item').on('click', function(e) {
        let target = $(this).find('input').val();
        $('.contact-item').removeClass('active');
        $(this).addClass('active');
        setActiveTarget(target);
        changeChatHeader(target);
        displayActiveChat();
    });
}

async function render() {
    await displayTargetUsers();
    displayActiveTarget();
    displayActiveChat();
    setDynamicListeners();
}

async function displayActiveChat() {

    const user = getActiveUser();
    const target = getActiveTarget();

    $('.lds-dual-ring ').removeClass('d-none'); 
    const response = await fetchData(`${api}/chats?user=${user}&target=${target}`);
    const { status, message, data: { chats } } = response;

    if (chats.length > 0) {
        $('#chatContainer').html('');
        chats.forEach((chat) => {   
            if (user == chat.user) {
                insertMessage({
                    user: chat.user,
                    chat: chat.chat,
                    time: dayjs(chat.time).format('DD MMM YYYY HH:mm:ss'),
                    type: 'right'
                });
            } else {
                insertMessage({
                    user: chat.user,
                    chat: chat.chat,
                    time: dayjs(chat.time).format('DD MMM YYYY HH:mm:ss'),
                    type: 'left'
                });
            }
        });
    } else {
        $('#chatContainer').html(`
            <div class="d-flex text-muted justify-content-center mt-2">
                <small>No Chat Available</small>
            </div>
        `);
    }

    $('.lds-dual-ring ').addClass('d-none');
}

$(document).ready(async function(e) {
    render();
    connectWebSocket();

    $('#openSidebar').on('click', function(e) {
        $('.sidebar').addClass('sidebar--open');
    });
    
    $('#closeSidebar').on('click', function(e) {
        $('.sidebar').removeClass('sidebar--open');
    });

    $('#from').on('change', function(e) {
        connectWebSocket();
        setActiveUser(e.target.value);
        displayActiveChat()
    });

    $('#addUserForm').on('submit', async function(e) {
        e.preventDefault();
        const data = $(this).serializeArray()[0];
        const user = data.value;

        if (!user) return;
        const response = await fetchData(`${api}/users`, {
            method: 'POST',
            body: JSON.stringify({ user })
        });

        // display user target
        if (response.status == 'success') {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: response.message,
                showConfirmButton: false,
                timer: 1500
            });

            // render ui
            render();
        } else {
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: response.message,
                showConfirmButton: false,
                timer: 1500
            });
        }

        // reset input form
        $(this).find('input').val('');
    });

    $('#chatForm').on('submit', function(e) {
        e.preventDefault();
        const formInput = $(this).serializeArray();
        const data = {};

        formInput.forEach(input => {
            data[input.name] = input.value
        });

        const { user, target, chat } = data;

        if (!user || !target || !chat) return;
        
        // send chat
        socket.send(JSON.stringify(data));
    });
});