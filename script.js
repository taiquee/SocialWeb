let currentUser = null;
let pendingSignup = null;

function initializeAdmin() {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (!storedUsers.some(u => u.username === 'Admin')) {
        const adminUser = {
            id: 'user0',
            username: 'Admin',
            displayName: 'Administrador',
            email: 'admin@connecta.com',
            password: 'taiquematheus',
            bio: 'Administrador do Connecta',
            avatar: 'https://via.placeholder.com/100',
            isAdmin: true,
            followers: [],
            following: []
        };
        storedUsers.push(adminUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
        console.log('Admin inicializado:', adminUser);
    }
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

    if (!validateEmailFormat(email)) {
        alert('Formato de email inválido! Exemplo: usuario@dominio.com');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.some(u => u.email === email || u.username === username)) {
        alert('Email ou usuário já cadastrado!');
        return;
    }

    pendingSignup = { email, username, password, bio };
    const code = generateVerificationCode();
    localStorage.setItem('verificationCode', code);

    $.ajax({
        url: 'https://api.brevo.com/v3/smtp/email',
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': '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',
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            sender: { name: 'Connecta', email: 'taiquerz@gmail.com' },
            to: [{ email: email }],
            subject: 'Connecta - Código de Verificação',
            htmlContent: `<p>Seu código de verificação é: <b>${code}</b></p>`
        }),
        success: function(response) {
            console.log('Email de verificação enviado:', response);
            localStorage.setItem('pendingSignup', JSON.stringify(pendingSignup));
            window.location.href = 'verify.html';
        },
        error: function(xhr) {
            console.error('Erro ao enviar email:', xhr.responseText);
            alert('Erro ao enviar o email de verificação. Verifique as credenciais ou tente novamente.');
            localStorage.removeItem('verificationCode');
            pendingSignup = null;
        }
    });
}

function verifyEmail() {
    const enteredCode = document.getElementById('verify-code').value;
    const storedCode = localStorage.getItem('verificationCode');
    pendingSignup = JSON.parse(localStorage.getItem('pendingSignup'));

    if (enteredCode === storedCode && pendingSignup) {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: 'user' + (storedUsers.length + 1),
            username: pendingSignup.username,
            displayName: pendingSignup.username,
            email: pendingSignup.email,
            password: pendingSignup.password,
            bio: pendingSignup.bio,
            avatar: 'https://via.placeholder.com/100',
            isAdmin: false,
            followers: [],
            following: []
        };
        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
        localStorage.removeItem('verificationCode');
        localStorage.removeItem('pendingSignup');
        pendingSignup = null;
        console.log('Usuário cadastrado:', newUser);
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
    console.log('Usuário logado:', user);
    window.location.href = 'index.html';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    console.log('Usuário deslogado');
    window.location.href = 'login.html';
}

function updateUserStatus() {
    const statusDiv = document.getElementById('user-status');
    if (statusDiv && currentUser) {
        statusDiv.innerHTML = `
            <img src="${currentUser.avatar}" alt="Profile Picture" class="profile-pic">
            Conectado como <strong>${currentUser.displayName || currentUser.username}</strong>
        `;
        console.log('Status do usuário atualizado:', currentUser.displayName || currentUser.username);
    } else if (statusDiv) {
        statusDiv.innerHTML = '';
    }
}

function updateNavLinks() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;
    const usersLink = navLinks.querySelector('a[href="users.html"]');
    if (currentUser) {
        if (!usersLink && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html') && !window.location.pathname.includes('verify.html')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="profile.html" onclick="handleNavClick(event, \'profile.html\')"><i class="fas fa-user"></i> Meu Perfil</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
        if (currentUser.isAdmin && !usersLink) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="users.html" onclick="handleNavClick(event, \'users.html\')"><i class="fas fa-users"></i> Usuários</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
        if (!navLinks.querySelector('a[href="chat.html"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="chat.html" onclick="handleNavClick(event, \'chat.html\')"><i class="fas fa-comment"></i> Chat</a>';
            navLinks.insertBefore(li, navLinks.lastElementChild);
        }
    } else {
        if (usersLink) usersLink.parentElement.remove();
    }
    console.log('Links de navegação atualizados');
}

function followUser(userId) {
    if (!currentUser) {
        alert('Faça login para seguir usuários!');
        return;
    }
    if (userId === currentUser.id) {
        alert('Você não pode seguir a si mesmo!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userToFollow = storedUsers.find(u => u.id === userId);
    const currentUserIndex = storedUsers.findIndex(u => u.id === currentUser.id);

    if (!userToFollow || currentUserIndex === -1) {
        alert('Erro ao processar a ação.');
        return;
    }

    if (!userToFollow.followers.includes(currentUser.id)) {
        userToFollow.followers.push(currentUser.id);
        storedUsers[currentUserIndex].following.push(userId);
        localStorage.setItem('users', JSON.stringify(storedUsers));
        localStorage.setItem('currentUser', JSON.stringify(storedUsers[currentUserIndex]));
        currentUser = storedUsers[currentUserIndex];
        console.log(`Seguindo usuário: ${userToFollow.username}`);
        alert(`Você agora segue ${userToFollow.displayName || userToFollow.username}!`);
        if (window.location.pathname.includes('other-profile.html')) {
            loadOtherProfile(userId);
        }
    } else {
        alert('Você já segue este usuário!');
    }

    if (window.location.pathname.includes('search.html')) {
        loadSearchResults();
    } else if (window.location.pathname.includes('index.html')) {
        loadProfiles();
    } else if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
}

function unfollowUser(userId) {
    if (!currentUser) {
        alert('Faça login para deixar de seguir usuários!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userToUnfollow = storedUsers.find(u => u.id === userId);
    const currentUserIndex = storedUsers.findIndex(u => u.id === currentUser.id);

    if (!userToUnfollow || currentUserIndex === -1) {
        alert('Erro ao processar a ação.');
        return;
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== currentUser.id);
    storedUsers[currentUserIndex].following = storedUsers[currentUserIndex].following.filter(id => id !== userId);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    localStorage.setItem('currentUser', JSON.stringify(storedUsers[currentUserIndex]));
    currentUser = storedUsers[currentUserIndex];
    console.log(`Deixou de seguir usuário: ${userToUnfollow.username}`);
    alert(`Você deixou de seguir ${userToUnfollow.displayName || userToUnfollow.username}!`);
    if (window.location.pathname.includes('other-profile.html')) {
        loadOtherProfile(userId);
    }

    if (window.location.pathname.includes('search.html')) {
        loadSearchResults();
    } else if (window.location.pathname.includes('index.html')) {
        loadProfiles();
    } else if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
}

function sendMessage(userId) {
    if (!currentUser) {
        alert('Faça login para enviar mensagens!');
        return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const recipient = storedUsers.find(u => u.id === userId);
    if (!recipient) {
        alert('Usuário não encontrado!');
        return;
    }
    let message = prompt(`Digite sua mensagem para ${recipient.displayName || recipient.username}:`);
    if (message) {
        console.log(`Mensagem enviada de ${currentUser.username} para ${recipient.username}: ${message}`);
        alert(`Mensagem enviada para ${recipient.displayName || recipient.username}: "${message}" (funcionalidade pendente de backend)`);
    }
}

function searchProfiles() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
        console.error('Campo de busca (#search-input) não encontrado!');
        alert('Erro interno. Tente novamente.');
        return;
    }

    const query = searchInput.value.trim();
    if (!query.startsWith('@') || query.length <= 1) {
        alert('Digite um nome de usuário começando com @ (ex.: @usuario)');
        return;
    }

    console.log('Iniciando busca por:', query);
    const searchTerm = query.substring(1).toLowerCase();
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Usuários disponíveis:', storedUsers.map(u => u.username));
    const results = storedUsers.filter(user => user.username.toLowerCase().includes(searchTerm));

    console.log('Resultados da busca:', results);
    localStorage.setItem('searchResults', JSON.stringify(results));
    console.log('searchResults salvo em localStorage:', JSON.parse(localStorage.getItem('searchResults')));
    window.location.href = 'search.html';
}

function loadSearchResults() {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) {
        console.error('Div de resultados (#search-results) não encontrada!');
        return;
    }
    resultsDiv.innerHTML = '<h2>Resultados da Busca</h2>';

    const results = JSON.parse(localStorage.getItem('searchResults') || '[]');
    console.log('Carregando resultados do localStorage:', results);
    if (results.length === 0) {
        resultsDiv.innerHTML += '<p>Nenhum perfil encontrado.</p>';
        return;
    }

    results.forEach(user => {
        const isFollowing = currentUser && currentUser.following.includes(user.id);
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');
        profileCard.innerHTML = `
            <img src="${user.avatar}" alt="${user.displayName || user.username}">
            <h3>${user.displayName || user.username}</h3>
            <p>@${user.username}</p>
            <p>${user.bio}</p>
            <p>Seguidores: ${user.followers.length} | Seguindo: ${user.following.length}</p>
            ${currentUser && user.id !== currentUser.id ? `
                <button class="follow-btn ${isFollowing ? 'unfollow' : ''}" onclick="${isFollowing ? `unfollowUser('${user.id}')` : `followUser('${user.id}')`}">
                    ${isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                </button>
            ` : ''}
            <a href="other-profile.html?userId=${user.id}">Ver Perfil</a>
        `;
        resultsDiv.appendChild(profileCard);
        console.log('Cartão de perfil renderizado para:', user.username);
    });
}

function loadProfiles() {
    const profileGrid = document.querySelector('.profile-grid');
    if (!profileGrid) return;
    profileGrid.innerHTML = '';

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.forEach(user => {
        const isFollowing = currentUser && currentUser.following.includes(user.id);
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');
        profileCard.innerHTML = `
            <img src="${user.avatar}" alt="${user.displayName || user.username}">
            <h3>${user.displayName || user.username}</h3>
            <p>@${user.username}</p>
            <p>${user.bio}</p>
            <p>Seguidores: ${user.followers.length} | Seguindo: ${user.following.length}</p>
            ${currentUser && user.id !== currentUser.id ? `
                <button class="follow-btn ${isFollowing ? 'unfollow' : ''}" onclick="${isFollowing ? `unfollowUser('${user.id}')` : `followUser('${user.id}')`}">
                    ${isFollowing ? 'Deixar de Seguir' : 'Seguir'}
                </button>
            ` : ''}
            <a href="other-profile.html?userId=${user.id}">Ver Perfil</a>
        `;
        profileGrid.appendChild(profileCard);
    });
    console.log('Perfis carregados:', storedUsers.length);
}

function loadUsers() {
    const usersList = document.getElementById('users-list');
    if (!usersList) {
        console.error('Div de usuários (#users-list) não encontrada!');
        return;
    }
    usersList.innerHTML = '<tr><th>Usuário</th><th>Email</th><th>Bio</th><th>Senha</th></tr>';

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
    console.log('Usuários carregados em users.html:', storedUsers.length);
}

function clearAllUsers() {
    if (!confirm('Tem certeza que deseja limpar todos os usuários? Esta ação não pode ser desfeita, exceto para o usuário Admin.')) {
        return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = storedUsers.find(u => u.username === 'Admin');
    localStorage.setItem('users', JSON.stringify([adminUser]));
    localStorage.removeItem('posts');
    localStorage.removeItem('searchResults');
    loadUsers();
    console.log('Todos os usuários (exceto Admin) e posts removidos');
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
        displayName: currentUser.displayName || currentUser.username,
        content: postContent,
        timestamp: new Date().toLocaleString(),
        comments: []
    };

    storedPosts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(storedPosts));
    document.getElementById('post-content').value = '';
    console.log('Post criado:', newPost);
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
            displayName: currentUser.displayName || currentUser.username,
            content: commentContent,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('posts', JSON.stringify(storedPosts));
        document.getElementById(`comment-content-${postId}`).value = '';
        console.log('Comentário adicionado ao post:', postId);
        loadPosts();
    }
}

function loadPosts() {
    const postsDiv = document.getElementById('posts');
    if (!postsDiv) return;
    postsDiv.innerHTML = '';
    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const userPosts = storedPosts.filter(p => p.userId === (currentUser ? currentUser.id : ''));
    userPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.innerHTML = `
            <div class="post-header">
                <h4>${post.displayName || post.username} (@${post.username})</h4>
                <small>${post.timestamp}</small>
            </div>
            <p>${post.content}</p>
            <div class="comment-section">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.displayName || comment.username} (@${comment.username})</strong> - ${comment.timestamp}
                        <p>${comment.content}</p>
                    </div>
                `).join('')}
                ${currentUser && post.userId === currentUser.id ? `
                    <div class="comment-form">
                        <textarea id="comment-content-${post.id}" placeholder="Adicione um comentário..."></textarea>
                        <button onclick="addComment('${post.id}')">Comentar</button>
                    </div>
                ` : ''}
            </div>
        `;
        postsDiv.prepend(postDiv);
    });
    console.log('Posts carregados:', userPosts.length);
}

function loadProfile() {
    if (!currentUser) return;

    console.log('Carregando perfil:', currentUser);
    document.getElementById('username').value = currentUser.username;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('bio').value = currentUser.bio;
    document.getElementById('profile-pic-display').src = currentUser.avatar || 'https://via.placeholder.com/100';

    const postCount = JSON.parse(localStorage.getItem('posts') || '[]').filter(p => p.userId === currentUser.id).length;
    currentUser.posts = postCount;
    currentUser.followers = currentUser.followers || [];
    currentUser.following = currentUser.following || [];
    document.getElementById('posts-count').textContent = currentUser.posts;
    document.getElementById('followers-count').textContent = currentUser.followers.length;
    document.getElementById('following-count').textContent = currentUser.following.length;

    const profilePicInput = document.getElementById('profile-pic');
    if (profilePicInput) {
        profilePicInput.onchange = (event) => {
            const file = event.target.files[0];
            console.log('Arquivo selecionado:', file);
            if (file) {
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione uma imagem válida!');
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem deve ter menos de 2MB!');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('Imagem carregada:', e.target.result.substring(0, 50));
                    currentUser.avatar = e.target.result;
                    document.getElementById('profile-pic-display').src = currentUser.avatar;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    const userIndex = storedUsers.findIndex(u => u.id === currentUser.id);
                    if (userIndex !== -1) {
                        storedUsers[userIndex].avatar = currentUser.avatar;
                        localStorage.setItem('users', JSON.stringify(storedUsers));
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    } else {
        console.error('Input de foto de perfil não encontrado!');
    }
}

function loadOtherProfile(userId) {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find(u => u.id === userId);
    if (!user) {
        console.error('Usuário não encontrado:', userId);
        return;
    }

    const isFollowing = currentUser && currentUser.following.includes(user.id);
    document.getElementById('profile-picture-preview').src = user.avatar || 'https://via.placeholder.com/100';
    document.getElementById('profile-title').textContent = user.displayName || user.username;
    document.getElementById('profile-username').textContent = user.displayName || user.username;
    document.getElementById('profile-bio').textContent = user.bio || 'Nenhuma bio disponível';
    document.getElementById('post-count').textContent = JSON.parse(localStorage.getItem('posts') || '[]').filter(p => p.userId === user.id).length;
    document.getElementById('followers-count').textContent = user.followers.length;
    document.getElementById('following-count').textContent = user.following.length;
    document.getElementById('follow-btn').textContent = isFollowing ? 'Deixar de Seguir' : 'Seguir';
    document.getElementById('follow-btn').onclick = () => (isFollowing ? unfollowUser(userId) : followUser(userId));
    document.getElementById('message-btn').onclick = () => sendMessage(userId);

    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    const userPosts = JSON.parse(localStorage.getItem('posts') || '[]').filter(p => p.userId === user.id);
    userPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.innerHTML = `
            <div class="post-header">
                <h4>${post.displayName || post.username} (@${post.username})</h4>
                <small>${post.timestamp}</small>
            </div>
            <p>${post.content}</p>
            <div class="comment-section">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.displayName || comment.username} (@${comment.username})</strong> - ${comment.timestamp}
                        <p>${comment.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
        postsDiv.prepend(postDiv);
    });
    console.log('Perfil de outro usuário carregado:', user.username);
}

function updateProfile() {
    if (!currentUser) {
        alert('Faça login para atualizar o perfil!');
        return;
    }

    const displayName = document.getElementById('profile-display-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const password = document.getElementById('profile-password').value;
    const avatar = document.getElementById('profile-picture-preview').src;

    console.log('Atualizando perfil com:', { displayName, email, bio, avatar });

    if (!displayName || !email || !bio) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    if (bio.length > 160) {
        alert('A bio deve ter no máximo 160 caracteres!');
        return;
    }

    if (!validateEmailFormat(email)) {
        alert('Formato de email inválido!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = storedUsers.find(u => (u.email === email && u.id !== currentUser.id));
    if (existingUser) {
        alert('Email já cadastrado por outro usuário!');
        return;
    }

    const updatedUser = {
        ...currentUser,
        displayName: displayName,
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
    const updatedPosts = storedPosts.map(p => p.userId === currentUser.id ? { ...p, displayName: displayName } : p);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    console.log('Perfil atualizado:', updatedUser);
    alert('Perfil atualizado com sucesso!');
    window.location.href = 'profile.html';
}

function saveProfileChanges() {
    const username = $('#username').val();
    const email = $('#email').val();
    const bio = $('#bio').val();
    const newPassword = $('#new-password').val();

    if (!username || !email || !bio) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    if (bio.length > 160) {
        alert('A bio deve ter no máximo 160 caracteres!');
        return;
    }

    if (!validateEmailFormat(email)) {
        alert('Formato de email inválido!');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = storedUsers.find(u => (u.email === email && u.id !== currentUser.id));
    if (existingUser) {
        alert('Email já cadastrado por outro usuário!');
        return;
    }

    const updatedUser = {
        ...currentUser,
        username: username,
        email: email,
        bio: bio,
        password: newPassword || currentUser.password
    };

    const updatedUsers = storedUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    currentUser = updatedUser;

    const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const updatedPosts = storedPosts.map(p => p.userId === currentUser.id ? { ...p, username: username } : p);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    console.log('Perfil atualizado:', updatedUser);
    alert('Perfil atualizado com sucesso!');
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
            welcomeMessage.textContent = `Bem-vindo, ${currentUser.displayName || currentUser.username}!`;
        }
        updateNavLinks();
        updateUserStatus();
        if (window.location.pathname.includes('users.html') && !currentUser.isAdmin) {
            window.location.href = 'index.html';
        }
        if (window.location.pathname.includes('profile.html')) {
            loadProfile();
        }
        if (window.location.pathname.includes('search.html')) {
            loadSearchResults();
        }
        if (window.location.pathname.includes('other-profile.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userId');
            if (userId) loadOtherProfile(userId);
        }
    } else if (window.location.pathname.includes('index.html') || window.location.pathname.includes('users.html') || window.location.pathname.includes('create-post.html') || window.location.pathname.includes('profile.html') || window.location.pathname.includes('search.html') || window.location.pathname.includes('other-profile.html')) {
        window.location.href = 'login.html';
    }
    console.log('Verificação de login concluída. Usuário atual:', currentUser ? currentUser.username : 'Nenhum');
}

document.getElementById('menu-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('active');
});

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
    } else if (window.location.pathname.includes('search.html')) {
        loadSearchResults();
    } else if (window.location.pathname.includes('other-profile.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        if (userId) loadOtherProfile(userId);
    } else if (window.location.pathname.includes('verify.html')) {
        // Não carrega nada adicional em verify.html
    }
    updateUserStatus();
    console.log('Página carregada:', window.location.pathname);

    // Fundo animado com partículas
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particlesContainer.appendChild(particle);
    }
    document.body.appendChild(particlesContainer);

    // Bolinha que segue o cursor
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        cursorDot.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('active');
    });
});