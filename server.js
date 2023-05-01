const http = new require('http');
const url = new require('url');
const ws = new require('ws');
const wss = new ws.Server({ noServer: true });

let clients = [];

const users = [
    {
        name: 'Yudha',
        id: 'yudha',
    },
    {
        name: 'Santhi',
        id: 'santhi',
    },
    {
        name: 'Laksmana',
        id: 'laksmana',
    },
];

const chats = [
    {
        id: 1,
        user: users[1].name,
        target: users[0].name,
        message: 'Hi',
        time: +new Date('2023-03-28 08:10:00')
    },
    {
        id: 2,
        user: users[0].name,
        target: users[1].name,
        message: 'How are you?',
        time: +new Date('2023-03-28 09:10:00')
    },
];

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function debug(state) {
    console.log('\n')
    console.log(`[${state}]`);
    console.log(clients.map(({ user, id }) => ({ user, id })));
    console.log('=========================================')
    console.log('\n')
}

function withThrottling(callback, delay = 1500) {
    setTimeout(() => {
        callback()
    }, delay);
}

function onSocketConnect(ws) {

    ws.on('message', function (message) {
        message = JSON.parse(message.toString());

        // close all other connection related to user
        let newClients = [];
        for (let client of clients) {
            if (client.user === message.user && client.id !== message.id) {
                client.socket.close(1000, 'another connection are made.');
                continue;
            }

            newClients.push(client);
        }

        // set new clients
        clients = newClients;

        // check if client change user
        const client = clients.find((el) => el.id === message.id);
        if (!client) {
            // prepare data
            const id = makeid(10);

            // add user
            clients = [...clients, {
                user: message.user,
                socket: ws,
                id
            }];

            // send response
            const data = {
                status: 'success',
                type: 'connect',
                message: 'connection added',
                data: {
                    user: message.user,
                    id
                }
            };

            ws.send(JSON.stringify(data));
            debug('connect-message');
            return;
        }

        client.user = message.user;
        client.socket = ws;

        // send response
        const data = {
            status: 'success',
            type: 'connect',
            message: 'change user',
            data: {
                user: client.user,
                id: client.id
            }
        }

        client.socket.send(JSON.stringify(data));
        debug('connect-message');
        return;
    });

    ws.on('close', function (message) {
        clients = clients.filter((client) => client.socket !== ws);
        debug('connect-closed');
    });
}

function onChat(ws) {

    ws.on('message', function (message) {
        message = JSON.parse(message.toString());

        // check client still connected
        let client = clients.find((el) => el.id === message.id);
        if (!client) {
            ws.close(1000, 'You are disconnected');
            return;
        };

        const newChat = {
            user: message.user,
            target: message.target,
            time: message.time,
            message: message.message
        }

        chats.push(newChat);

        // get target client
        let clientTarget = clients.find((el) => el.user == message.target);
        if (!clientTarget) {
            // send back if target not found
            const data = {
                status: 'fail',
                type: 'message',
                message: 'offline',
                data: {
                    chat: newChat
                }
            }
            client.socket.send(JSON.stringify(data));
            return;
        }

        // send to target
        const data = {
            status: 'success',
            type: 'message',
            message: '',
            data: {
                chat: newChat
            }
        }

        clientTarget.socket.send(JSON.stringify({...data, message: 'received'}));
        client.socket.send(JSON.stringify({...data, message: 'sent'}));
        return;
    });

    ws.on('close', function () {
        clients = clients.filter((client) => client.socket !== ws);
        debug('chat-closed');
    });
}

function writeHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
}

const server = http.createServer((req, res) => {
    writeHeaders(res);
    let data = {};
    const { pathname } = url.parse(req.url);

    if (req.method == 'POST') {
        switch (pathname) {
            case '/users':
                let body = "";
                req.on('data', (chunk) => body += chunk);
                req.on('end', () => {
                    try {
                        // get body 
                        body = JSON.parse(body);
                        if (!body.user) throw new Error("No User Data Sent");

                        // check if user exists
                        const isUserExists = users.find((user) => user.name == body.user);
                        if (isUserExists) throw new Error("User Already Exists");

                        // add user
                        const user = {
                            name: body.user,
                            id: +new Date()
                        }
                        users.push(user);

                        // response
                        data = {
                            status: 'success',
                            message: 'Success Add User',
                            data: { user }
                        };
                    } catch (error) {
                        // response
                        data = {
                            status: 'fail',
                            message: error.message,
                            data: null
                        };
                    }
                    res.end(JSON.stringify(data));
                });
                break;
            default:
                break;
        }
    }

    if (req.method == 'GET') {
        switch (pathname) {
            case '/ws-connect':
                if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
                    data = {
                        status: 'fail',
                        message: 'No Upgrade Data',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }

                if (!req.headers.connection.match(/\bupgrade\b/i)) {
                    data = {
                        status: 'fail',
                        message: 'No Connection Upgrade',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }

                withThrottling(() => {
                    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
                });
                break;

            case '/ws-chat':
                if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
                    data = {
                        status: 'fail',
                        message: 'No Upgrade Data',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }

                if (!req.headers.connection.match(/\bupgrade\b/i)) {
                    data = {
                        status: 'fail',
                        message: 'No Connection Upgrade',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }

                wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onChat);
                break;

            case '/users':
                data = {
                    status: 'success',
                    message: 'Success Get Users',
                    data: { users },
                };
                res.end(JSON.stringify(data));
                break;

            case '/chats':
                let body = "";
                req.on('data', (chunk) => body += chunk);
                req.on('end', () => {
                    const queryParams = new URLSearchParams(url.parse(req.url).query);
                    const user = queryParams.get('user');
                    const target = queryParams.get('target');

                    const chatData = chats.filter((chat) =>
                        (chat.user === user && chat.target === target) ||
                        (chat.user === target && chat.target === user)
                    );

                    data = {
                        status: 'success',
                        message: 'Success Get Chats',
                        data: {
                            chats: chatData
                        },
                    };

                    setTimeout(() => {
                        res.end(JSON.stringify(data));
                    }, 300);
                });
                break;

            default:
                data = {
                    status: 'fail',
                    message: 'Service Not Found',
                    data: null,
                };
                res.end(JSON.stringify(data));
                break;
        }
    }
}).listen(8080, () => {
    console.log('Running on http://localhost:8080');
});