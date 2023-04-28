const api = 'http://localhost:8080';

// connect socket
let socket = new WebSocket('ws://localhost:8080/ws-connect');

socket.onopen = function(e) {
    console.log('[ws-connect][open] web socket established');
}
socket.onmessage = function(e) {

    // handle communication
    let response = event.data;
    const { status, message, data: { user } } = JSON.parse(response);
    console.log(`[ws-connect][message] ${message} for user ${user}`);
}
socket.onclose = function(e) {
    console.log('[ws-connect][closed] web socket closed');
}

// socket chat
let socketChat = new WebSocket('ws://localhost:8080/ws-chat');


function connectWebSocket() {
    if (!getActiveUser()) return;

    socket.send(JSON.stringify({
        user: getActiveUser()
    }));
}