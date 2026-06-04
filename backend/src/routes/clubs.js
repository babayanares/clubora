const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createClub, getClubs, getClub, joinClub, leaveClub } = require('../controllers/clubs');
const { getPosts, createPost } = require('../controllers/posts');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', requireAuth, createClub);
router.post('/:id/join', requireAuth, joinClub);
router.delete('/:id/leave', requireAuth, leaveClub);
router.get('/:id/posts', getPosts);
router.post('/:id/posts', requireAuth, createPost);

module.exports = router;
