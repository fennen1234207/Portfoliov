class DemonList {
  constructor() {
    this.demons = [];
    this.filteredDemons = [];
    this.currentPage = 1;
    this.demonsPerPage = 50;
    
    this.init();
  }
  
  async init() {
    await this.loadDemons();
    this.renderDemons();
    this.setupEventListeners();
    
    // Проверка статуса демонов для авторизованных пользователей
    if (auth.isAuthenticated()) {
      this.loadPlayerProgress();
    }
  }
  
  async loadDemons() {
    try {
      const response = await fetch('/api/demons');
      if (!response.ok) throw new Error('Failed to load demons');
      
      this.demons = await response.json();
      this.filteredDemons = [...this.demons];
    } catch (error) {
      console.error('Error loading demons:', error);
      alert('Failed to load demons. Please try again later.');
    }
  }
  
  async loadPlayerProgress() {
    try {
      const headers = await auth.getAuthHeader();
      const response = await fetch('/api/player/stats', { headers });
      
      if (response.ok) {
        const data = await response.json();
        this.playerStats = data;
      }
    } catch (error) {
      console.error('Error loading player progress:', error);
    }
  }
  
  renderDemons() {
    const tbody = document.getElementById('demonTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.demonsPerPage;
    const endIndex = startIndex + this.demonsPerPage;
    const demonsToShow = this.filteredDemons.slice(startIndex, endIndex);
    
    demonsToShow.forEach((demon, index) => {
      const row = document.createElement('tr');
      const globalIndex = startIndex + index + 1;
      
      row.innerHTML = `
        <td>${globalIndex}</td>
        <td><a href="demon.html?id=${demon._id}" class="demon-link">${demon.name}</a></td>
        <td><span class="difficulty-badge ${demon.difficulty.toLowerCase()}">${demon.difficulty}</span></td>
        <td>${demon.creator}</td>
        <td>${demon.points}</td>
        <td>
          ${this.renderDemonStatus(demon._id)}
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    this.renderPagination();
  }
  
  renderDemonStatus(demonId) {
    if (!auth.isAuthenticated()) {
      return '<span class="status-badge uncompleted">Login to track</span>';
    }
    
    const isCompleted = this.playerStats?.demonsCompleted?.some(d => d.demon === demonId);
    
    if (isCompleted) {
      return '<span class="status-badge completed">Completed</span>';
    } else {
      return `
        <button class="complete-btn" data-id="${demonId}">
          Mark as completed
        </button>
      `;
    }
  }
  
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(this.filteredDemons.length / this.demonsPerPage);
    
    let html = '';
    if (this.currentPage > 1) {
      html += `<button class="page-btn" data-page="${this.currentPage - 1}">Previous</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }
    
    if (this.currentPage < totalPages) {
      html += `<button class="page-btn" data-page="${this.currentPage + 1}">Next</button>`;
    }
    
    pagination.innerHTML = html;
  }
  
  setupEventListeners() {
    // Поиск и фильтрация
    document.getElementById('demonSearch')?.addEventListener('input', () => this.filterDemons());
    document.getElementById('difficultyFilter')?.addEventListener('change', () => this.filterDemons());
    
    // Кнопки завершения демона
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('complete-btn')) {
        const demonId = e.target.dataset.id;
        await this.completeDemon(demonId);
      }
      
      if (e.target.classList.contains('page-btn')) {
        this.currentPage = parseInt(e.target.dataset.page);
        this.renderDemons();
      }
    });
  }
  
  async completeDemon(demonId) {
    if (!auth.isAuthenticated()) {
      alert('Please login to mark demons as completed');
      return;
    }
    
    const verificationLink = prompt('Enter verification link (YouTube, Google Drive, etc.):');
    if (!verificationLink) return;
    
    try {
      const headers = await auth.getAuthHeader();
      headers['Content-Type'] = 'application/json';
      
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          demonId, 
          verificationLink 
        })
      });
      
      if (response.ok) {
        alert('Demon marked as completed!');
        await this.loadPlayerProgress();
        this.renderDemons();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('Error completing demon:', error);
      alert(`Error: ${error.message}`);
    }
  }
  
  filterDemons() {
    const searchTerm = document.getElementById('demonSearch')?.value.toLowerCase() || '';
    const difficulty = document.getElementById('difficultyFilter')?.value || 'all';
    
    this.filteredDemons = this.demons.filter(demon => {
      const matchesSearch = demon.name.toLowerCase().includes(searchTerm) || 
                          demon.creator.toLowerCase().includes(searchTerm);
      const matchesDifficulty = difficulty === 'all' || demon.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });
    
    this.currentPage = 1;
    this.renderDemons();
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('demonTableBody')) {
    window.demonList = new DemonList();
  }
});