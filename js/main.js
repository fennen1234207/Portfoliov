async function loadDemonList() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <section class="demon-list">
            <h2>Топ демонов</h2>
            <div class="search-container">
                <input type="text" id="demonSearch" placeholder="Поиск демонов">
                <select id="difficultyFilter">
                    <option value="all">Все сложности</option>
                    <option value="Easy">Easy Demon</option>
                    <option value="Medium">Medium Demon</option>
                    <option value="Hard">Hard Demon</option>
                    <option value="Insane">Insane Demon</option>
                    <option value="Extreme">Extreme Demon</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Сложность</th>
                        <th>Создатель</th>
                        <th>Очки</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody id="demonTableBody">
                    <!-- Демоны будут загружены здесь -->
                </tbody>
            </table>
        </section>
    `;

    try {
        const response = await fetch('http://localhost:3001/api/demons');
        const demons = await response.json();
        
        const tbody = document.getElementById('demonTableBody');
        demons.forEach((demon, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${demon.name}</td>
                <td class="difficulty-${demon.difficulty.toLowerCase()}">${demon.difficulty}</td>
                <td>${demon.creator}</td>
                <td>${demon.points}</td>
                <td>
                    ${currentUser 
                        ? `<button class="complete-btn" data-id="${demon.id}">Пройден</button>`
                        : '<span>Войдите</span>'}
                </td>
            `;
            tbody.appendChild(row);
        });

        // Обработчики для кнопок
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const demonId = parseInt(btn.dataset.id);
                try {
                    const response = await fetch('http://localhost:3001/api/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ demonId })
                    });
                    
                    if (response.ok) {
                        alert('Демон отмечен как пройденный!');
                        loadDemonList(); // Обновляем список
                    } else {
                        const error = await response.json();
                        throw new Error(error.error);
                    }
                } catch (error) {
                    alert(`Ошибка: ${error.message}`);
                }
            });
        });

        // Поиск и фильтрация
        document.getElementById('demonSearch').addEventListener('input', filterDemons);
        document.getElementById('difficultyFilter').addEventListener('change', filterDemons);

        function filterDemons() {
            const searchTerm = document.getElementById('demonSearch').value.toLowerCase();
            const difficulty = document.getElementById('difficultyFilter').value;
            
            Array.from(tbody.children).forEach(row => {
                const name = row.cells[1].textContent.toLowerCase();
                const demonDifficulty = row.cells[2].textContent;
                const matchesSearch = name.includes(searchTerm);
                const matchesDifficulty = difficulty === 'all' || demonDifficulty === difficulty;
                
                row.style.display = matchesSearch && matchesDifficulty ? '' : 'none';
            });
        }
    } catch (error) {
        console.error('Error loading demons:', error);
    }
}