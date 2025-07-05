class AuthSystem {
  constructor() {
    this.token = localStorage.getItem('gd-demonlist-token');
    this.user = null;
    this.init();
  }

  async init() {
    if (this.token) {
      await this.validateToken();
    }
    this.setupEventListeners();
    this.updateAuthUI();
  }

  async validateToken() {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Invalid token');
      
      this.user = await response.json();
      this.scheduleTokenRefresh();
    } catch (error) {
      this.clearSession();
    }
  }

  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('gd-demonlist-token', this.token);
      this.scheduleTokenRefresh();
      this.updateAuthUI();
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async register(username, email, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    } finally {
      this.clearSession();
    }
  }

  async requestPasswordReset(email) {
    // Реализация сброса пароля
  }

  async verifyEmail(token) {
    // Подтверждение email
  }

  clearSession() {
    localStorage.removeItem('gd-demonlist-token');
    this.token = null;
    this.user = null;
    clearTimeout(this.tokenRefreshTimeout);
    this.updateAuthUI();
  }

  scheduleTokenRefresh() {
    const jwtData = JSON.parse(atob(this.token.split('.')[1]));
    const expiresIn = (jwtData.exp * 1000) - Date.now() - 60000; // Обновить за 1 мин до истечения
    
    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, expiresIn);
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Token refresh failed');

      this.token = data.token;
      localStorage.setItem('gd-demonlist-token', this.token);
      this.scheduleTokenRefresh();
    } catch (error) {
      this.clearSession();
    }
  }

  setupEventListeners() {
    // Обработчики для всех форм
    document.querySelectorAll('.auth-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const action = form.dataset.action;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        let result;
        
        switch (action) {
          case 'login':
            result = await this.login(
              formData.get('email'), 
              formData.get('password')
            );
            break;
          case 'register':
            result = await this.register(
              formData.get('username'),
              formData.get('email'),
              formData.get('password')
            );
            break;
          // Другие действия...
        }
        
        submitBtn.disabled = false;
        
        if (result.success) {
          if (action === 'login') {
            window.location.href = '/dashboard';
          } else {
            this.showNotification('Success! Please check your email', 'success');
            form.reset();
          }
        } else {
          this.showError(form, result.message);
        }
      });
    });
  }

  updateAuthUI() {
    const authElements = document.querySelectorAll('[data-auth-state]');
    
    authElements.forEach(element => {
      const showWhen = element.dataset.authState;
      const shouldShow = (
        (showWhen === 'authenticated' && this.isAuthenticated()) ||
        (showWhen === 'anonymous' && !this.isAuthenticated())
      );
      
      element.style.display = shouldShow ? '' : 'none';
    });
    
    if (this.isAuthenticated()) {
      document.querySelectorAll('[data-user-prop]').forEach(element => {
        const prop = element.dataset.userProp;
        element.textContent = this.user[prop] || '';
      });
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  getAuthHeader() {
    return { 'Authorization': `Bearer ${this.token}` };
  }

  showError(form, message) {
    const errorElement = form.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }

  showNotification(message, type = 'info') {
    // Реализация системы уведомлений
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.auth = new AuthSystem();
});