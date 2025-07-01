let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: prompt('Digite seu nome de usuário:') };
let selectedUser = null;

const socket = new WebSocket('ws://localhost:8080');
const userList = document.getElementById('user-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

// Simulação de status (em um servidor real, isso viria via WebSocket)
const userStatus = new Map();

socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'register', username: currentUser.username }));
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'userlist') {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const followedUsers = storedUsers.filter(u => currentUser.following.includes(u.id)).map(u => u.username);
        userList.innerHTML = data.users
            .filter(u => followedUsers.includes(u))
            .map(u => {
                const user = storedUsers.find(su => su.username === u);
                const status = userStatus.get(u) || 'offline';
                return `<li onclick="selectUser('${u}')" style="cursor: pointer;">
                    <img src="${user.avatar || 'https://via.placeholder.com/30'}" alt="${u}" class="user-avatar" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
                    <span>${u}</span>
                    <span class="status-dot ${status}"></span>
                </li>`;
            })
            .join('');
    } else if (data.type === 'message') {
        displayMessage(data.from, data.message, data.from !== currentUser.username ? 'received' : 'sent');
        typingIndicator.style.display = 'none';
    } else if (data.type === 'typing') {
        if (data.from !== currentUser.username && data.to === currentUser.username) {
            typingIndicator.style.display = 'block';
        }
    } else if (data.type === 'stoptyping') {
        if (data.from !== currentUser.username && data.to === currentUser.username) {
            typingIndicator.style.display = 'none';
        }
    } else if (data.type === 'status') {
        userStatus.set(data.username, data.status);
        updateUserList();
    }
};

function updateUserList() {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const followedUsers = storedUsers.filter(u => currentUser.following.includes(u.id)).map(u => u.username);
    userList.innerHTML = followedUsers
        .map(u => {
            const user = storedUsers.find(su => su.username === u);
            const status = userStatus.get(u) || 'offline';
            return `<li onclick="selectUser('${u}')" style="cursor: pointer;">
                <img src="${user.avatar || 'https://via.placeholder.com/30'}" alt="${u}" class="user-avatar" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
                <span>${u}</span>
                <span class="status-dot ${status}"></span>
            </li>`;
        })
        .join('');
}

function selectUser(username) {
    selectedUser = username;
    chatMessages.innerHTML = '';
}

function displayMessage(from, message, className) {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = `${from}: ${message}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

messageInput.addEventListener('input', () => {
    if (messageInput.value && selectedUser) {
        socket.send(JSON.stringify({ type: 'typing', from: currentUser.username, to: selectedUser }));
    } else {
        socket.send(JSON.stringify({ type: 'stoptyping', from: currentUser.username, to: selectedUser }));
    }
});

sendBtn.addEventListener('click', () => {
    if (messageInput.value && selectedUser) {
        socket.send(JSON.stringify({ type: 'message', from: currentUser.username, to: selectedUser, message: messageInput.value }));
        displayMessage(currentUser.username, messageInput.value, 'sent');
        messageInput.value = '';
        socket.send(JSON.stringify({ type: 'stoptyping', from: currentUser.username, to: selectedUser }));
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value && selectedUser) {
        sendBtn.click();
    }
});

function handleNavClick(event, target) {
    event.preventDefault();
    const overlay = document.getElementById('stripe-overlay');
    overlay.classList.add('animate');
    setTimeout(() => {
        window.location.href = target;
        overlay.classList.remove('animate');
    }, 500);
}