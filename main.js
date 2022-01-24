const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('user connected.');

    socket.on('disconnect', () => {
        console.log('user disconnected.');
    });


});


server.listen(3000, () => {
    console.log('listening on *:3000');
});