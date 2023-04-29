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

function loadUsers(users) {

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
        let content = contactItemContent.cloneNode(true);
        content.querySelector('.user-thumb-display').innerHTML = user.name;
        content.querySelector('[name="userThumbName"]').innerHTML = user.name;
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