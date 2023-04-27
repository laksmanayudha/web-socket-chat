const http = new require('http');
const ws = new require('ws');
const wss = new ws.Server({ noServer: true });

let clients = [];

const chats = [];
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
]

function onSocketConnect(ws) {
    ws.on('message', function(message) {
        message = JSON.parse(message.toString());
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

http.createServer((req, res) => {
    writeHeaders(res);
    let data = {}

    if (req.method == 'POST') {

    }

    if (req.method == 'GET') {
        switch(req.url) {
            case '/websocket':
                if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
                    data = {
                        status: 'fail',
                        message: 'no upgrade data',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }
            
                if (!req.headers.connection.match(/\bupgrade\b/i)) {
                    data = {
                        status: 'fail',
                        message: 'no connection upgrade',
                        data: null,
                    }
                    res.end(JSON.stringify(data));
                    return;
                }
        
                wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
                break;

            case '/users':
                data = {
                    status: 'success',
                    message: 'success get users',
                    data: { users },
                };
                res.end(JSON.stringify(data));
                break;

            default:
                data = {
                    status: 'fail',
                    message: 'service not found',
                    data: null,
                };
                res.end(JSON.stringify(data));
                break;
        }
    }
}).listen(8080, () => {
    console.log('Running on http://localhost:8080');
});