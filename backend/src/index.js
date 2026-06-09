const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const clubsRouter = require('./routes/clubs');
const usersRouter = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Global error handler — catches unhandled errors so the server never crashes silently
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong, please try again' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
