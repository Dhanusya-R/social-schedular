const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/social-scheduler';
const JWT_SECRET = process.env.JWT_SECRET || 'social-scheduler-secret';

app.use(cors({ origin: true }));
app.use(express.json());

let dbReady = false;
let users = [];
let posts = [];
let accounts = [
  { id: '1', platform: 'Instagram', username: '@brandstudio', status: 'Connected', timezone: 'UTC-5' },
  { id: '2', platform: 'LinkedIn', username: 'Brand Studio', status: 'Connected', timezone: 'UTC-8' },
  { id: '3', platform: 'X', username: '@brandstudio', status: 'Pending', timezone: 'UTC+0' },
];

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    dbReady = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB not available, continuing with in-memory data:', error.message);
    dbReady = false;
  }
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbReady });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id: `${Date.now()}`, name, email, password: hashedPassword };
  users.push(user);

  res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((entry) => entry.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/accounts', authMiddleware, (req, res) => {
  res.json({ accounts });
});

app.post('/api/accounts', authMiddleware, (req, res) => {
  const { platform, username, timezone } = req.body;
  if (!platform || !username) {
    return res.status(400).json({ message: 'Platform and username are required' });
  }

  const newAccount = {
    id: `${Date.now()}`,
    platform,
    username,
    status: 'Connected',
    timezone: timezone || 'UTC+0',
  };

  accounts.push(newAccount);
  res.status(201).json({ account: newAccount });
});

app.get('/api/posts', authMiddleware, (req, res) => {
  res.json({ posts });
});

app.post('/api/posts', authMiddleware, (req, res) => {
  const { platform, caption, scheduledFor, status } = req.body;
  if (!platform || !caption || !scheduledFor) {
    return res.status(400).json({ message: 'Platform, caption and scheduled time are required' });
  }

  const newPost = {
    id: `${Date.now()}`,
    platform,
    caption,
    scheduledFor,
    status: status || 'Scheduled',
    owner: req.user.email,
  };

  posts.unshift(newPost);
  res.status(201).json({ post: newPost });
});

app.post('/api/ai/composer', authMiddleware, async (req, res) => {
  const { prompt, tone = 'friendly', platform = 'Instagram' } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are a social media copywriter for ${platform}. Write concise, ${tone} content.` },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content || 'A polished post draft will appear here.';
      return res.json({ draft: content.trim() });
    } catch (error) {
      console.error(error);
    }
  }

  const fallback = `Here is a ${tone} ${platform} draft based on your prompt: ${prompt} — designed to feel warm, clear and ready for your next campaign.`;
  res.json({ draft: fallback });
});

app.get('/api/insights', authMiddleware, async (req, res) => {
  if (process.env.ZERION_API_KEY) {
    try {
      const response = await fetch('https://api.zerion.io/v1/markets', {
        headers: {
          Authorization: `Bearer ${process.env.ZERION_API_KEY}`,
        },
      });
      const payload = await response.json();
      return res.json({ insights: payload });
    } catch (error) {
      console.error(error);
    }
  }

  res.json({
    insights: {
      summary: 'Campaign health looks strong. Your audience engagement is up 14% week over week.',
      trend: '+14% engagement',
      recommendation: 'Post a short video and a customer story to maintain momentum.',
    },
  });
});

connectDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
