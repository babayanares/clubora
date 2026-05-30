const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createClub, getClubs, getClub, joinClub } = require('../controllers/clubs');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', requireAuth, createClub);
router.post('/:id/join', requireAuth, joinClub);

module.exports = router;
