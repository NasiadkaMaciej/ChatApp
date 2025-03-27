const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
app.set("trust proxy", true);

let rooms = {};
const clients = new Map();

wss.on('connection', (ws) => {
	let userData = {
		username: null,
		room: null
	};

	clients.set(ws, userData);

	ws.send(JSON.stringify({
		type: 'roomList',
		data: Object.keys(rooms)
	}));

	ws.on('message', (message) => {
		try {
			const msg = JSON.parse(message);

			switch (msg.type) {
				// ToDo: Functions for handling messages
				case 'joinRoom':
					userData.username = msg.data.username;
					userData.room = msg.data.room;

					if (!rooms[userData.room])
						rooms[userData.room] = [];

					rooms[userData.room].push(userData.username);

					broadcastRoomList();

					broadcastToRoom(userData.room, {
						type: 'message',
						data: `${userData.username} joined the chat.`
					});

					broadcastUserList(userData.room);
					break;

				case 'sendMessage':
					if (userData.room) {
						broadcastToRoom(userData.room, {
							type: 'message',
							data: `${userData.username}: ${msg.data}`
						});
					}
					break;
				case 'rooms':
					broadcastRoomList();
					break;
			}
		} catch (e) { console.error('Error parsing message:', e); }
	});

	ws.on('close', () => {
		const { username, room } = userData;

		if (room && username && rooms[room]) {
			rooms[room] = rooms[room].filter(user => user !== username);

			broadcastToRoom(room, {
				type: 'message',
				data: `${username} left the chat.`
			});

			broadcastUserList(room);

			// Remove empty rooms
			if (rooms[room].length === 0) {
				delete rooms[room];
				broadcastRoomList();
			}
		}

		clients.delete(ws);
	});

	function broadcastToRoom(roomName, message) {
		clients.forEach((data, client) => {
			if (data.room === roomName && client.readyState === WebSocket.OPEN)
				client.send(JSON.stringify(message));
		});
	}

	function broadcastUserList(roomName) {
		broadcastToRoom(roomName, {
			type: 'userList',
			data: rooms[roomName]
		});
	}

	function broadcastRoomList() {
		const roomList = Object.keys(rooms);
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN)
				client.send(JSON.stringify({
					type: 'roomList',
					data: roomList
				}));
		});
	}
});


server.listen(3001, () => {
	console.log('Server is running on http://localhost:3001');
});