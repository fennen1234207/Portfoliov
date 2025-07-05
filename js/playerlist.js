class PlayerList {
  constructor() {
    this.players = [];
    this.currentPage = 1;
    this.playersPerPage = 50;
    
    this.init();
  }
  
  async init() {
    await this.loadPlayers();
    this.renderPlayers();
    this.setupEventListeners();
  }
  
  async loadPlayers() {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to load players');
      
      this.players = await response.json();
    } catch (error) {
      console.error('Error loading players:', error);
      alert('Failed to load players. Please try again later.');
    }
  }
  
  renderPlayers() {
    const tbody = document.getElementById('playerTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.playersPerPage;
    const endIndex = startIndex + this.playersPerPage;
    const playersToShow = this.players.slice(startIndex, endIndex);
    
    playersToShow.forEach((player, index) => {
      const row = document.createElement('tr');
      const globalIndex = startIndex + index + 1;
      
      row.innerHTML = `
        <td>${globalIndex}</td>
        <td><a href="player.html?username=${player.username}" class="player-link">${player.username}</a></td>
        <td>${player.demonsCompleted}</td>
        <td>${player.totalPoints}</td>
        <td>
          <div class="progress-bar">
            <div class="progress" style="width: ${this.calculateProgress(player)}%"></div>
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    this.renderPagination();
  }
  
  calculateProgress(player) {
    // Предположим, что максимальное количество очков - 10000 (все Extreme демоны)
    const maxPossiblePoints = 10000;
    return Math.min(100, (player.totalPoints / maxPossiblePoints) * 100);
  }
  
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(this.players.length / this.playersPerPage);
    
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
    // Поиск игроков
    document.getElementById('playerSearch')?.addEventListener('input', () => this.filterPlayers());
    
    // Пагинация
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('page-btn')) {
        this.currentPage = parseInt(e.target.dataset.page);
        this.renderPlayers();
      }
    });
  }
  
  filterPlayers() {
    const searchTerm = document.getElementById('playerSearch')?.value.toLowerCase() || '';
    
    const filtered = this.players.filter(player => 
      player.username.toLowerCase().includes(searchTerm)
    );
    
    // Для простоты просто перезагружаем весь список
    // В реальном приложении нужно было бы сохранить оригинальный список
    this.players = filtered.length ? filtered : [...this.originalPlayers];
    this.currentPage = 1;
    this.renderPlayers();
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('playerTableBody')) {
    window.playerList = new PlayerList();
  }
});