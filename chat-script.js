let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: prompt('Digite seu nome de usuário:') };
   let selectedUser = null;

   const socket = new WebSocket('ws://localhost:8080');
   const userList = document.getElementById('user-list');
   const chatMessages = document.getElementById('chat-messages');
   const messageInput = document.getElementById('message-input');
   const sendBtn = document.getElementById('send-btn');
   const typingIndicator = document.getElementById('typing-indicator');

   socket.onopen = () => {
       socket.send(JSON.stringify({ type: 'register', username: currentUser.username }));
   };

   socket.onmessage = (event) => {
       const data = JSON.parse(event.data);
       if (data.type === 'userlist') {
           userList.innerHTML = data.users
               .filter(u => u !== currentUser.username)
               .map(u => `<li onclick="selectUser('${u}')" style="cursor: pointer;">${u}</li>`)
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
       }
   };

   function selectUser(username) {
       selectedUser = username;
       chatMessages.innerHTML = ''; // Limpa o chat ao trocar de usuário
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

   // Integração com o sistema existente
   function handleNavClick(event, target) {
       event.preventDefault();
       const overlay = document.getElementById('stripe-overlay');
       overlay.classList.add('animate');
       setTimeout(() => {
           window.location.href = target;
           overlay.classList.remove('animate');
       }, 500);
   }