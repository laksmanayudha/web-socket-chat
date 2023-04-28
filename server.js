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
        chat: 'Hi',
        time: +new Date('2023-03-28 08:10:00')
    },
    {
        id: 2,
        user: users[0].name,
        target: users[1].name,
        chat: 'How are you?',
        time: +new Date('2023-03-28 09:10:00')
    },
];

function onSocketConnect(ws) {

    ws.on('message', function(message) {
        message = JSON.parse(message.toString())

        // add user client if not exist
        let client = clients.find((el) => el.user == message.user);
        if (!client) {
            client = {
                user: message.user,
                socket: ws
            }
            clients = [...clients, client];
        }

        // send response
        const data = {
            status: 'success',
            message: 'connect success',
            data: {
                user: message.user
            }
        }

        ws.send(JSON.stringify(data));
        return;
    });

    ws.on('close', function() {
        clients.filter((client) => client.socket !== ws);
    });
}

function onChat(ws) {

    ws.on('message', function(message) {
        message = JSON.parse(message.toString());
        message = {...message, time: +new Date()};
        chats.push(message);

        // add user client if not exist
        let client = clients.find((el) => el.user == message.user);
        if (!client) {
            client = {
                user: message.user,
                socket: ws
            }
            clients = [...clients, client];
        }

        // get target client
        let clientTarget = clients.find((el) => el.user == message.target);
        if (!clientTarget) {
            // send back if target not found
            const data = {
                status: 'fail',
                message: 'User Offline' 
            }
            client.socket.send(JSON.stringify(data));
            return;
        }

        // send to target
        const data = {
            status: 'success',
            message: 'message sent',
            data: message
        }
        clientTarget.socket.send(JSON.stringify(data));
        client.socket.send(JSON.stringify(data));
        return;
    });

    ws.on('close', function() {
        clients = [];
    });
}

function writeHeaders(res) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
    };
    
    res.writeHead(200, headers);
}

const server = http.createServer((req, res) => {
    writeHeaders(res);
    let data = {};
    const path = url.parse(req.url).pathname;

    if (req.method == 'POST') {
        switch(path) {
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
        switch(path) {
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
        
                wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
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