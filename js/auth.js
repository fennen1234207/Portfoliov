class Auth {
  constructor() {
    this.token = localStorage.getItem('token');
    this.userId = null;
    
    if (this.token) {
      this.decodeToken();
    }
    
    this.initForms();
    this.updateAuthUI();
  }
  
  decodeToken() {
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      this.userId = payload.id;
    } catch (e) {
      this.logout();
    }
  }
  
  async login(username, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.token = data.token;
        localStorage.setItem('token', this.token);
        this.decodeToken();
        this.updateAuthUI();
        return true;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login error: ${error.message}`);
      return false;
    }
  }
  
  async register(username, password) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        alert('Registration successful! Please login.');
        return true;
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration error: ${error.message}`);
      return false;
    }
  }
  
  logout() {
    localStorage.removeItem('token');
    this.token = null;
    this.userId = null;
    this.updateAuthUI();
  }
  
  updateAuthUI() {
    const authElements = document.querySelectorAll('.auth-element');
    
    authElements.forEach(element => {
      if (this.isAuthenticated()) {
        element.classList.add('authenticated');
        element.classList.remove('anonymous');
      } else {
        element.classList.add('anonymous');
        element.classList.remove('authenticated');
      }
    });
    
    const usernameDisplays = document.querySelectorAll('.username-display');
    if (this.isAuthenticated()) {
      // Здесь можно добавить запрос для получения имени пользователя
      usernameDisplays.forEach(el => el.textContent = 'User');
    } else {
      usernameDisplays.forEach(el => el.textContent = '');
    }
  }
  
  initForms() {
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (await this.login(username, password)) {
          window.location.href = 'index.html';
        }
      });
    }
    
    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        
        if (password !== confirm) {
          alert('Passwords do not match!');
          return;
        }
        
        if (await this.register(username, password)) {
          window.location.href = 'auth.html?tab=login';
        }
      });
    }
    
    // Обработка выхода
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
      button.addEventListener('click', () => this.logout());
    });
  }
  
  isAuthenticated() {
    return !!this.token;
  }
  
  async getAuthHeader() {
    if (!this.isAuthenticated()) return {};
    return { 'Authorization': `Bearer ${this.token}` };
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.auth = new Auth();
  
  // Переключение между вкладками
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab');
  
  if (activeTab === 'login' || activeTab === 'register') {
    document.getElementById(`${activeTab}Tab`).click();
  }
});