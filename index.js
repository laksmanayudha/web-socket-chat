const http = new require('http');
const ws = new require('ws');
const wss = new ws.Server({ noServer: true });

const clients = new Set();

const database = [];

function onSocketConnect(ws) {
    clients.add(ws);

    ws.on('message', function(message) {
        message = JSON.parse(message.toString());
        database.push(message);

        for (let client of clients) {
            client.send(JSON.stringify(message));
        }

        console.log(database);
    });

    ws.on('close', function() {
        clients.delete(ws);
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

    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
}).listen(8080, () => {
    console.log('Running on http://localhost:8080');
});