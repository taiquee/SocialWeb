let currentUser = null;
let pendingSignup = null;

function initializeAdmin() {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (!storedUsers.some(u => u.username === 'Admin')) {
        const adminUser = {
            id: 'user0',
            name: 'Admin',
            email: 'admin@ifesconnect.com',
            username: 'Admin',
            password: 'taiquematheus',
            bio: 'Administrador do IFES Connect',
            avatar: 'https://via.placeholder.com/100',
            isAdmin: true
        };
        storedUsers.push(adminUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
    }
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function initiateSignup() {
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const bio = document.getElementById('signup-bio').value;

    if (!email || !username || !password || !bio) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.some(u => u.email === email || u.username === username)) {
        alert('Email ou usuário já cadastrado!');
        return;
    }

    pendingSignup = { email, username, password, bio };
    const code = generateVerificationCode();
    localStorage.setItem('verificationCode', code); // B9YT56PR6XVLWKL1RLP9VY1Y

    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "taiquerz@gmail.com",
        Password: "33805D9906D90665964ED74114979E74B227",
        To: email,
        From: "taiquerz@gmail.com",
        Subject: "IFES Connect - Código de Verificação",
        Body: `Seu código de verificação é: <b>${code}</b>`
    }).then(
        message => {
            if (message === "OK") {
                document.getElementById('signup-form').classList.add('hidden');
                document.getElementById('verify-form').classList.remove('hidden');
            } else {
                alert('Erro ao enviar o email. Tente novamente.');
            }
        }
    );
}

function verifyEmail() {
    const enteredCode = document.getElementById('verify-code').value;
    const storedCode = localStorage.getItem('verificationCode');

    if (enteredCode === storedCode) {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: 'user' + (storedUsers.length + 1),
            name: pendingSignup.username,
            email: pendingSignup.email,
            username: pendingSignup.username,
            password: pendingSignup.password,
            bio: pendingSignup.bio,
            avatar: 'https://via.placeholder.com/100',
            isAdmin: false
        };
        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
        localStorage.removeItem('verificationCode');
        pendingSignup = null;
        alert('Cadastro realizado com sucesso! Faça login.');
        window.location.href = 'login.html';
    } else {
        alert('Código inválido! Tente novamente.');
    }
}

function login() {
    const emailOrUsername = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find(u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password);

    if (!user) {
        alert('Email/usuário ou senha incorretos!');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function updateUserStatus() {
    const statusDiv = document.getElementById('user-status');
    if (statusDiv && currentUser) {
        statusDiv.textContent = `Conectado como ${currentUser.username}`;
    } else if (statusDiv) {
        statusDiv.textContent = '';
    }
}

function updateNavLinks() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;
    const usersLink = navLinks.querySelector('a[href="users.html"]');
    const profileLink = navLinks.querySelector('a[href="profile.html"]');
    if (currentUser) {
        if (!profileLink && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="profile.html" onclick="handleNavClick(event, \'profile.html\')">Meu Perfil</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
        if (currentUser.isAdmin && !usersLink) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="users.html" onclick="handleNavClick(event, \'users.html\')">Usuários</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
    } else {
        if (usersLink) usersLink.parentElement.remove();
        if (profileLink) profileLink.parentElement.remove();
    }
}

function loadProfiles() {
    const profileGrid = document.querySelector('.profile-grid');
    if (!profileGrid) return;
    profileGrid.innerHTML = '';
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.forEach(user => {
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');
        profileCard.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}">
            <h3>${user.name}</h3>
            <p>${user.bio}</p>
            <a href="#profile-${user.id}">Ver Perfil</a>
        `;
        profileGrid.appendChild(profileCard);
    });
}

function loadUsers() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    usersList.innerHTML = '';
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.bio}</td>
            <td>${user.password}</td>
        `;
        usersList.appendChild(row);
    });
}

function clearAllUsers() {
    if (!confirm('Tem certeza que deseja limpar todos os usuários? Esta ação não pode ser desfeita, exceto para o usuário Admin.')) {
        return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = storedUsers.find(u => u.username === 'Admin');
    localStorage.setItem('users', JSON.stringify([adminUser]));
    localStorage.removeItem('posts');
    loadUsers();
    alert('Todos os usuários, exceto o Admin, e todas as postagens foram removidos.');
}

function createPost() {
    const postContent = document.getElementById('post-content').value;
    if (!postContent || !currentUser) {
        alert('Faça login e escreva uma mensagem!');
        return;
    }

    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const newPost = {
        id: 'post' + (storedPosts.length + 1),
        userId: currentUser.id,
        username: currentUser.username,
        content: postContent,
        timestamp: new Date().toLocaleString(),
        comments: []
    };

    storedPosts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(storedPosts));
    document.getElementById('post-content').value = '';
    alert('Postagem criada com sucesso!');
    window.location.href = 'index.html#feed';
}

function addComment(postId) {
    const commentContent = document.getElementById(`comment-content-${postId}`).value;
    if (!commentContent || !currentUser) {
        alert('Faça login e escreva um comentário!');
        return;
    }

    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const post = storedPosts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            id: 'comment' + (post.comments.length + 1),
            userId: currentUser.id,
            username: currentUser.username,
            content: commentContent,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('posts', JSON.stringify(storedPosts));
        document.getElementById(`comment-content-${postId}`).value = '';
        loadPosts();
    }
}

function loadPosts() {
    const postsDiv = document.getElementById('posts');
    if (!postsDiv) return;
    postsDiv.innerHTML = '';
    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    storedPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        if (currentUser && post.userId === currentUser.id) {
            postDiv.classList.add('own-post');
        }
        postDiv.innerHTML = `
            <div class="post-header">
                <h4>${post.username}</h4>
                <small>${post.timestamp}</small>
            </div>
            <p>${post.content}</p>
            <div class="comment-section">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.username}</strong> - ${comment.timestamp}
                        <p>${comment.content}</p>
                    </div>
                `).join('')}
                <div class="comment-form">
                    <textarea id="comment-content-${post.id}" placeholder="Adicione um comentário..."></textarea>
                    <button onclick="addComment('${post.id}')">Comentar</button>
                </div>
            </div>
        `;
        postsDiv.prepend(postDiv);
    });
}

function loadProfile() {
    if (!currentUser) return;
    document.getElementById('profile-username').value = currentUser.username;
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-bio').value = currentUser.bio;
    document.getElementById('profile-picture-preview').src = currentUser.avatar;
    document.getElementById('profile-picture').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profile-picture-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function updateProfile() {
    if (!currentUser) {
        alert('Faça login para atualizar o perfil!');
        return;
    }

    const username = document.getElementById('profile-username').value;
    const email = document.getElementById('profile-email').value;
    const bio = document.getElementById('profile-bio').value;
    const password = document.getElementById('profile-password').value;
    const avatar = document.getElementById('profile-picture-preview').src;

    if (!username || !email || !bio) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = storedUsers.find(u => (u.email === email || u.username === username) && u.id !== currentUser.id);
    if (existingUser) {
        alert('Email ou usuário já cadastrado por outro usuário!');
        return;
    }

    const updatedUser = {
        ...currentUser,
        username: username,
        name: username,
        email: email,
        bio: bio,
        avatar: avatar,
        password: password || currentUser.password
    };

    const updatedUsers = storedUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    currentUser = updatedUser;

    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = storedPosts.map(p => p.userId === currentUser.id ? { ...p, username: username } : p);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    alert('Perfil atualizado com sucesso!');
    window.location.href = 'profile.html';
}

function handleNavClick(event, target) {
    event.preventDefault();
    const overlay = document.getElementById('stripe-overlay');
    overlay.classList.add('animate');
    setTimeout(() => {
        if (target === 'logout') {
            logout();
        } else {
            window.location.href = target;
        }
        overlay.classList.remove('animate');
    }, 500);
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function checkLogin() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Bem-vindo, ${currentUser.name}!`;
        }
        updateNavLinks();
        updateUserStatus();
        if (window.location.pathname.includes('users.html') && !currentUser.isAdmin) {
            window.location.href = 'index.html';
        }
        if (window.location.pathname.includes('profile.html')) {
            loadProfile();
        }
    } else if (window.location.pathname.includes('index.html') || window.location.pathname.includes('users.html') || window.location.pathname.includes('create-post.html') || window.location.pathname.includes('profile.html')) {
        window.location.href = 'login.html';
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#profiles') {
        showSection('profiles');
        loadProfiles();
    } else if (hash === '#feed') {
        showSection('feed');
        loadPosts();
    } else if (hash === '#home') {
        showSection('home');
    } else if (hash.includes('profile-')) {
        showSection('profiles');
        loadProfiles();
    }
});

window.addEventListener('load', () => {
    initializeAdmin();
    checkLogin();
    if (window.location.pathname.includes('index.html')) {
        const hash = window.location.hash || '#home';
        showSection(hash.replace('#', ''));
        if (hash === '#feed') {
            loadPosts();
        } else if (hash === '#profiles') {
            loadProfiles();
        }
    } else if (window.location.pathname.includes('users.html')) {
        loadUsers();
    } else if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
});