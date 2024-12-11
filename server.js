const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.set("trust proxy", true);

let rooms = {};

io.on('connection', (socket) => {
	socket.emit('roomList', Object.keys(rooms));

	let currentRoom = null;
	let username = null;

	socket.on('joinRoom', (data) => {
		username = data.username;
		currentRoom = data.room;

		if (!rooms[currentRoom])
			rooms[currentRoom] = [];

		rooms[currentRoom].push(username);
		socket.join(currentRoom);

		io.emit('roomList', Object.keys(rooms));

		io.to(currentRoom).emit('message', `${username} joined the chat.`);
		io.to(currentRoom).emit('userList', rooms[currentRoom]);

		socket.on('disconnect', () => {
			if (currentRoom) {
				rooms[currentRoom] = rooms[currentRoom].filter(user => user !== username);
				io.to(currentRoom).emit('message', `${username} left the chat.`);
				io.to(currentRoom).emit('userList', rooms[currentRoom]);

				if (rooms[currentRoom].length === 0) {
					delete rooms[currentRoom];
					io.emit('roomList', Object.keys(rooms));
				}
			}
		});
	});

	socket.on('sendMessage', (message) => {
		if (currentRoom) {
			io.to(currentRoom).emit('message', `${username}: ${message}`);
		}
	});
});


server.listen(3001, () => {
	console.log('Server is running on http://localhost:3001');
});