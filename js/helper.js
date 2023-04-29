function setStorage(key, value) {
    localStorage.setItem(key, value);
}

function getStorage(key) {
    return localStorage.getItem(key) || '';
}

async function fetchData(url, option) {
    let data = null;
    try {
        const response = await fetch(url, option);
        const json = await response.json();
        data = json;
    } catch (error) {
        console.log(error.message)
    }
    return data;
}

function setActiveTarget(user) {
    $('#target').val(user);
}

function getActiveTarget() {
    return $('#target').val();
}

function setActiveUser(user) {
    $('#user').val(user);
}

function getActiveUser() {
    return $('#user').val();
}