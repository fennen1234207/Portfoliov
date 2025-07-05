let currentUser = null;

async function loginUser(username, password) {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = jwt_decode(data.token);
            updateAuthUI();
            document.getElementById('authModal').style.display = 'none';
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        alert(`Ошибка входа: ${error.message}`);
    }
}

async function registerUser(username, password) {
    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь войдите.');
            document.getElementById('modalTitle').textContent = 'Вход';
            document.getElementById('submitAuth').textContent = 'Войти';
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        alert(`Ошибка регистрации: ${error.message}`);
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        const user = users.find(u => u.id === currentUser.id);
        authButtons.innerHTML = `
            <span>Привет, ${user.username}!</span>
            <button id="logoutBtn">Выйти</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    } else {
        authButtons.innerHTML = `
            <button id="loginBtn">Вход</button>
            <button id="registerBtn">Регистрация</button>
        `;
        // Перепривязываем события
        document.getElementById('loginBtn').addEventListener('click', showLoginModal);
        document.getElementById('registerBtn').addEventListener('click', showRegisterModal);
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateAuthUI();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            currentUser = jwt_decode(token);
            updateAuthUI();
        } catch {
            localStorage.removeItem('token');
        }
    }
});