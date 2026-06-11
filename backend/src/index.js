const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const clubsRouter = require('./routes/clubs');
const usersRouter = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// In dev, allow the Vite dev server origin. In prod, same-origin — CORS not needed.
if (!IS_PROD) {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
}

app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Serve Vite production build
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// SPA fallback — any non-API route serves index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong, please try again' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
