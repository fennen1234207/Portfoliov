document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Переключение между вкладками
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Обработка входа
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('https://your-api-url.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                alert('Ошибка входа: ' + (data.error || 'Неверные данные'));
            }
        })
        .catch(error => console.error('Login error:', error));
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        if (password !== confirm) {
            alert('Пароли не совпадают!');
            return;
        }

        fetch('https://your-api-url.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Регистрация успешна! Теперь войдите.');
                loginTab.click();
            } else {
                alert('Ошибка регистрации: ' + (data.error || 'Неизвестная ошибка'));
            }
        })
        .catch(error => console.error('Registration error:', error));
    });
});