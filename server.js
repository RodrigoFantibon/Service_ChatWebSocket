const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });
const port = 8000;

const chats = []
const connections = []

app.get('/user/:user_id', (req, res) => {
    res.send(chats.filter(chat => Number(chat.user_id) === Number(req.params.user_id)))
})

app.get('/ong/:ong_id', (req, res) => {
    res.send(chats.filter(chat => Number(chat.ong_id) === Number(req.params.ong_id)))
})

app.get('/chat/:chat_id/messages', (req, res) => {
    res.send(chats.find(chat => chat.chat_id === req.params.chat_id).messages)
})

app.get('/chats', (req, res) => {
    res.send(chats)
})

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

wsServer.on('connection', (ws) => {
    ws.on('message', (message) => {
        const msg = JSON.parse(Buffer.from(message).toString())
        const { 
            type = 'message',
            user_type = undefined,
            chat_id = uuidv4(), 
            user_id, 
            ong_id, 
            id,
            message: msgContent 
        } = msg

        if(type === 'identification') {
            connections.push({
                user_type,
                id,
                ws
            })
        } else {
            const chat = chats.find(chat => chat.chat_id === chat_id)
            
            if (chat) {
                chat.messages.push({
                    user_id,
                    ong_id,
                    message: msgContent
                })
            } else {
                chats.push({
                    chat_id,
                    user_id,
                    ong_id,
                    messages: [
                        {
                            user_id,
                            ong_id,
                            message: msgContent
                        }
                    ]
                })
            }

            connections.forEach(connection => {
                if (connection.user_type === 'user' && connection.id === ong_id) {
                    connection.ws.send(JSON.stringify(msg))
                } else if (connection.user_type === 'ong' && connection.id === user_id) {
                    connection.ws.send(JSON.stringify(msg))
                }
            })
        }

    });
});




// const chats = [
//     {
//         "chat_id": "8asd8asd8-asdas6das-asdasa",
//         "user_id": "1",
//         "ong_id": "1",
//         "messages": [],
//     }
// ]









// A new client connection request received
// wsServer.on('connection', function(connection) {
//   // Generate a unique code for every user
//   const userId = uuidv4();
//   console.log(`Recieved a new connection.`);

//   // Store the new connection and handle messages
//   clients[userId] = connection;
//   console.log(connection)
//   connection.on('message', data => onMessage(connection, data))
//   console.log(`${userId} connected.`);
// });

// {
//     '8asd8asd8-asdas6das-asdasa': connection,
//     'asdasd-asdas6das-asdasa': connection
// }

// ['8asd8asd8-asdas6das-asdasa', 'asdasd-asdas6das-asdasa']