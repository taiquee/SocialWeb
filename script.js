let currentUser = null;

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

function signup() {
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

    const newUser = {
        id: 'user' + (storedUsers.length + 1),
        name: username,
        email: email,
        username: username,
        password: password,
        bio: bio,
        avatar: 'https://via.placeholder.com/100',
        isAdmin: false
    };

    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    alert('Cadastro realizado com sucesso! Faça login.');
    window.location.href = 'login.html';
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

function updateNavLinks() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;
    const usersLink = navLinks.querySelector('a[href="users.html"]');
    if (currentUser && currentUser.isAdmin) {
        if (!usersLink) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="users.html">Usuários</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
    } else {
        if (usersLink) {
            usersLink.parentElement.remove();
        }
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
    if (!confirm('Tem certeza que deseja limpar todos os usuários? Esta ação não pode be undone, exceto para o usuário Admin.')) {
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
        if (window.location.pathname.includes('users.html') && !currentUser.isAdmin) {
            window.location.href = 'index.html';
        }
    } else if (window.location.pathname.includes('index.html') || window.location.pathname.includes('users.html') || window.location.pathname.includes('create-post.html')) {
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
    }
});