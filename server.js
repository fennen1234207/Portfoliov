const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'your_super_secret_key_here';
let users = [];
let demons = [
    {id: 1, name: 'Bloodbath', difficulty: 'Extreme', creator: 'Riot', points: 100},
    {id: 2, name: 'Sakupen Circles', difficulty: 'Extreme', creator: 'Noobas', points: 95}
];
let playerStats = [];

// Регистрация
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);
    playerStats.push({ userId: newUser.id, demonsCompleted: [], totalPoints: 0 });
    
    res.status(201).json({ message: 'User created' });
});

// Вход
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token });
});

// Получить демонов
app.get('/api/demons', (req, res) => {
    res.json(demons);
});

// Получить игроков
app.get('/api/players', (req, res) => {
    const players = playerStats.map(stat => {
        const user = users.find(u => u.id === stat.userId);
        return {
            username: user.username,
            demonsCompleted: stat.demonsCompleted.length,
            totalPoints: stat.totalPoints
        };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
    
    res.json(players);
});

// Отметить пройденный демон
app.post('/api/complete', authenticateToken, (req, res) => {
    const { demonId } = req.body;
    const userId = req.user.id;
    
    const demon = demons.find(d => d.id === demonId);
    if (!demon) return res.status(404).json({ error: 'Demon not found' });

    const playerStat = playerStats.find(stat => stat.userId === userId);
    if (playerStat.demonsCompleted.includes(demonId)) {
        return res.status(400).json({ error: 'Demon already completed' });
    }

    playerStat.demonsCompleted.push(demonId);
    playerStat.totalPoints += demon.points;
    
    res.json({ message: 'Demon completed', totalPoints: playerStat.totalPoints });
});

// Middleware аутентификации
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(3001, () => console.log('Server running on port 3001'));