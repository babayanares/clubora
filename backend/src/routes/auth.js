const router = require('express').Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint — not yet implemented' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint — not yet implemented' });
});

module.exports = router;
