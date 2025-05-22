const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const teamRoutes = require('./routes/teams');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

const app = express();
const PORT = process.env.PORT || 5050;


app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/login', authRoutes);
app.use('/api/leads', leadRoutes);

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
