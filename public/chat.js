const socket = new WebSocket('wss://chat.nasiadka.pl/ws');

const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const joinRoomButton = document.getElementById('joinRoomButton');
const chatContainer = document.getElementById('chatContainer');
const chat = document.getElementById('chat');
const inputMessage = document.getElementById('inputMessage');
const sendMessageButton = document.getElementById('sendMessageButton');
const userList = document.getElementById('userList');
const loginContainer = document.getElementById('loginContainer');
const currentRoomName = document.getElementById('currentRoomName');
const roomList = document.getElementById('roomList');

// Handle incoming messages
socket.addEventListener('message', (event) => {
	try {
		const message = JSON.parse(event.data);

		switch (message.type) {
			case 'message':
				receiveMessage(message.data);
				break;

			case 'userList':
				getUserList(message.data);
				break;

			case 'roomList':
				getRoomList(message.data);
				break;
		}
	} catch (e) {
		console.error('Error parsing message:', e);
	}
});

// Join room
joinRoomButton.addEventListener('click', () => {
	const username = usernameInput.value;
	const room = roomInput.value;

	if (username && room) {
		socket.send(JSON.stringify({
			type: 'joinRoom',
			data: { username, room }
		}));

		loginContainer.style.display = 'none';
		chatContainer.style.display = 'flex';
		currentRoomName.textContent = room;
	}
});

// Send message
sendMessageButton.addEventListener('click', () => {
	const message = inputMessage.value;
	if (message) {
		socket.send(JSON.stringify({
			type: 'sendMessage',
			data: message
		}));
		inputMessage.value = '';
	}
});

// Send message on enter
inputMessage.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') sendMessageButton.click();
});

// Receive message
function receiveMessage(message) {
	const messageElement = document.createElement('div');
	messageElement.classList.add('message');
	messageElement.textContent = message;
	chat.appendChild(messageElement);
	chat.scrollTop = chat.scrollHeight;
}
// Get user list
function getUserList(users) {
	userList.innerHTML = '';
	users.forEach(user => {
		const userElement = document.createElement('li');
		userElement.textContent = user;
		userList.appendChild(userElement);
	});
}
// Get room list
function getRoomList(rooms) {
	roomList.innerHTML = '';
	rooms.forEach(room => {
		const roomElement = document.createElement('li');
		roomElement.textContent = room;
		roomElement.style.cursor = 'pointer';
		roomElement.addEventListener('click', () => {
			roomInput.value = room;
		});
		roomList.appendChild(roomElement);
	});
};


