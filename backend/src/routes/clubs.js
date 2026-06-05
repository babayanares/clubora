const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { createClub, getClubs, getClub, joinClub, leaveClub, approveRequest, rejectRequest, updateClub, deleteClub } = require('../controllers/clubs');
const { getPosts, createPost } = require('../controllers/posts');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', requireAuth, createClub);
router.patch('/:id', requireAuth, updateClub);
router.delete('/:id', requireAuth, deleteClub);
router.post('/:id/join', requireAuth, joinClub);
router.delete('/:id/leave', requireAuth, leaveClub);
router.patch('/:id/requests/:userId/approve', requireAuth, approveRequest);
router.delete('/:id/requests/:userId/reject', requireAuth, rejectRequest);
router.get('/:id/posts', getPosts);
router.post('/:id/posts', requireAuth, createPost);

module.exports = router;
