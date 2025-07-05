document.addEventListener('DOMContentLoaded', function() {
    // Загрузка демонов
    fetch('https://your-api-url.com/api/demons')
        .then(response => response.json())
        .then(demons => {
            const tbody = document.getElementById('demonTableBody');
            demons.forEach((demon, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><a href="#" class="demon-link">${demon.name}</a></td>
                    <td><span class="difficulty-badge ${demon.difficulty.toLowerCase()}">${demon.difficulty}</span></td>
                    <td>${demon.creator}</td>
                    <td>${demon.points}</td>
                    <td>
                        <span class="status-badge ${getStatusClass(demon.status)}">
                            ${getStatusText(demon.status)}
                        </span>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Поиск и фильтрация
            document.getElementById('demonSearch').addEventListener('input', filterDemons);
            document.getElementById('difficultyFilter').addEventListener('change', filterDemons);
        })
        .catch(error => console.error('Error loading demons:', error));

    function filterDemons() {
        const searchTerm = document.getElementById('demonSearch').value.toLowerCase();
        const difficulty = document.getElementById('difficultyFilter').value;
        
        document.querySelectorAll('#demonTableBody tr').forEach(row => {
            const name = row.querySelector('.demon-link').textContent.toLowerCase();
            const demonDifficulty = row.querySelector('.difficulty-badge').textContent;
            const matchesSearch = name.includes(searchTerm);
            const matchesDifficulty = difficulty === 'all' || demonDifficulty === difficulty;
            
            row.style.display = matchesSearch && matchesDifficulty ? '' : 'none';
        });
    }

    function getStatusClass(status) {
        const statusClasses = {
            'completed': 'completed',
            'uncompleted': 'uncompleted',
            'progress': 'in-progress'
        };
        return statusClasses[status] || 'uncompleted';
    }

    function getStatusText(status) {
        const statusTexts = {
            'completed': 'Пройден',
            'uncompleted': 'Не пройден',
            'progress': 'В процессе'
        };
        return statusTexts[status] || 'Не пройден';
    }
});