const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createClub, getClubs, getClub, joinClub, leaveClub } = require('../controllers/clubs');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', requireAuth, createClub);
router.post('/:id/join', requireAuth, joinClub);
router.delete('/:id/leave', requireAuth, leaveClub);

module.exports = router;
