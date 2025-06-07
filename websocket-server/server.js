const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const users = new Map();

wss.on('connection', (ws) => {
    // Registra um novo usuário quando ele se conecta
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.type === 'register') {
            users.set(data.username, ws);
            broadcastUserList();
        } else if (data.type === 'message') {
            const targetWs = users.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({ type: 'message', from: data.from, message: data.message }));
            }
        } else if (data.type === 'typing') {
            const targetWs = users.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({ type: 'typing', from: data.from, to: data.to }));
            }
        } else if (data.type === 'stoptyping') {
            const targetWs = users.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({ type: 'stoptyping', from: data.from, to: data.to }));
            }
        }
    });

    // Remove o usuário quando a conexão é fechada
    ws.on('close', () => {
        for (let [user, conn] of users) {
            if (conn === ws) {
                users.delete(user);
                break;
            }
        }
        broadcastUserList();
    });

    // Envia a lista de usuários para todos os clientes conectados
    function broadcastUserList() {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'userlist', users: Array.from(users.keys()) }));
            }
        });
    }
});