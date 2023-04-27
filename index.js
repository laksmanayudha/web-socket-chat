const http = new require('http');
const ws = new require('ws');
const wss = new ws.Server({ noServer: true });

let clients = [];

const database = [];

function onSocketConnect(ws) {
    ws.on('message', function(message) {
        message = JSON.parse(message.toString());
        database.push(message);

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

http.createServer((req, res) => {
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
        res.end('no upgrade');
        return;
    }

    if (!req.headers.connection.match(/\bupgrade\b/i)) {
        res.end('no connection upgrade');
        return;
    }

    if (req.url == '/websocket') {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    }
}).listen(8080, () => {
    console.log('Running on http://localhost:8080');
});