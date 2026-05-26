const router = require('express').Router();

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ user: null, id: req.params.id });
});

module.exports = router;
