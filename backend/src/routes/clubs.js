const router = require('express').Router();

// GET /api/clubs
router.get('/', (req, res) => {
  res.json({ clubs: [] });
});

// GET /api/clubs/:id
router.get('/:id', (req, res) => {
  res.json({ club: null, id: req.params.id });
});

// POST /api/clubs
router.post('/', (req, res) => {
  res.json({ message: 'Create club — not yet implemented' });
});

module.exports = router;
