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
    if (!confirm('Tem certeza que deseja limpar todos os usuários? Esta ação não pode ser desfeita, exceto para o usuário Admin.')) {
        return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = storedUsers.find(u => u.username === 'Admin');
    localStorage.setItem('users', JSON.stringify([adminUser]));
    loadUsers();
    alert('Todos os usuários, exceto o Admin, foram removidos.');
}

function addPost() {
    const postContent = document.getElementById('post-content').value;
    if (!postContent || !currentUser) {
        alert('Faça login e escreva uma mensagem!');
        return;
    }

    const postsDiv = document.getElementById('posts');
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.innerHTML = `
        <h4>${currentUser.name}</h4>
        <p>${postContent}</p>
        <small>${new Date().toLocaleString()}</small>
    `;
    postsDiv.prepend(postDiv);
    document.getElementById('post-content').value = '';
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
    } else if (window.location.pathname.includes('index.html') || window.location.pathname.includes('users.html')) {
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
        showSection('home');
        loadProfiles();
    } else if (window.location.pathname.includes('users.html')) {
        loadUsers();
    }
});