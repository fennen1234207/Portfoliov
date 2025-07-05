document.addEventListener('DOMContentLoaded', function() {
    // Загрузка игроков
    fetch('https://your-api-url.com/api/players')
        .then(response => response.json())
        .then(players => {
            const tbody = document.getElementById('playerTableBody');
            players.forEach((player, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><a href="#" class="player-link">${player.username}</a></td>
                    <td>${player.demonsCompleted}</td>
                    <td>${player.totalPoints}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${player.progress}%"></div>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Поиск игроков
            document.getElementById('playerSearch').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#playerTableBody tr').forEach(row => {
                    const name = row.querySelector('.player-link').textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                });
            });
        })
        .catch(error => console.error('Error loading players:', error));
});