function setStorage(key, value) {
    localStorage.setItem(key, value);
}

function getStorage(key) {
    return localStorage.getItem(key) || '';
}

async function fetchData(url, option) {
    const response = await fetch(url, option);
    const json = await response.json();
    return json;
}

function setActiveTarget(user) {
    $('#target').val(user);
}

function getActiveTarget() {
    return $('#target').val();
}

function setActiveUser(user) {
    $('#from').val(user);
}

function getActiveUser() {
    return $('#from').val();
}

function displayDefaultActiveTarget(activeTarget) {
    if (!activeTarget) return;
    $(`.contact-item`).each(function(index, el) {
        let input = $(el).find('input');
        if ($(input).val() == activeTarget) 
            $(el).addClass('active');
    });
}


function loadUsers(users = [], lastChats = {}) {

    function lastChatFor(target) {
        let defaultData = {
            message: 'No message',
            time: null,
        };

        // check lastChasts is empty object
        if (Object.keys(lastChats).length <= 0) return defaultData;

        // get target last chat
        let lastChat = lastChats.to[target] || [];
        if (lastChat.length > 0) {
            let { message, time, user } = lastChat[lastChat.length - 1];
            message = user === lastChats.from
                        ? `<i class="fas fa-check"></i> ${message}`
                        : message;
            return { ...defaultData, message, time };
        }
        
        return defaultData
    }

    // set user select
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
        const content = contactItemContent.cloneNode(true);
        const { message, time } = lastChatFor(user.name);
        content.querySelector('.user-thumb-name').innerHTML = user.name;
        content.querySelector('.user-thumb-message').innerHTML = message;
        content.querySelector('.user-thumb-message_time').innerHTML = time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '';
        content.querySelector('[name="userThumbName"]').value = user.name;
        $('.contact-lists').append(content);
    });
}

export {
    setStorage,
    getStorage,
    fetchData,
    setActiveTarget,
    getActiveTarget,
    setActiveUser,
    getActiveUser,
    loadUsers,
    displayDefaultActiveTarget,
};