const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createClub, getClubs, getClub } = require('../controllers/clubs');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', requireAuth, createClub);

module.exports = router;
