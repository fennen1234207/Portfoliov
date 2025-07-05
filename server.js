require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Схемы Mongoose
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const DemonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Insane', 'Extreme'], required: true },
  creator: { type: String, required: true },
  points: { type: Number, required: true },
  verificationVideo: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const PlayerStatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  demonsCompleted: [{ 
    demon: { type: mongoose.Schema.Types.ObjectId, ref: 'Demon' },
    completedAt: { type: Date, default: Date.now },
    verification: { type: String }
  }],
  totalPoints: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);
const Demon = mongoose.model('Demon', DemonSchema);
const PlayerStat = mongoose.model('PlayerStat', PlayerStatSchema);

// Middleware аутентификации
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API Endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    const playerStat = new PlayerStat({ user: user._id });
    await playerStat.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/demons', async (req, res) => {
  try {
    const demons = await Demon.find().sort({ points: -1 });
    res.json(demons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/demons', authenticateToken, async (req, res) => {
  try {
    const demon = new Demon({ ...req.body, addedBy: req.user.id });
    await demon.save();
    res.status(201).json(demon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const players = await PlayerStat.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { totalPoints: -1 } },
      { $limit: 100 },
      {
        $project: {
          username: '$user.username',
          demonsCompleted: { $size: '$demonsCompleted' },
          totalPoints: 1
        }
      }
    ]);
    
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/complete', authenticateToken, async (req, res) => {
  try {
    const { demonId, verificationLink } = req.body;
    
    const demon = await Demon.findById(demonId);
    if (!demon) return res.status(404).json({ error: 'Demon not found' });
    
    const playerStat = await PlayerStat.findOne({ user: req.user.id });
    
    if (playerStat.demonsCompleted.some(d => d.demon.equals(demonId))) {
      return res.status(400).json({ error: 'Demon already completed' });
    }
    
    playerStat.demonsCompleted.push({ 
      demon: demonId, 
      verification: verificationLink 
    });
    playerStat.totalPoints += demon.points;
    
    await playerStat.save();
    res.json({ 
      message: 'Demon completed successfully',
      totalPoints: playerStat.totalPoints
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});