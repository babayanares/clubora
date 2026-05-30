const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/users');

router.get('/:id', requireAuth, getProfile);
router.patch('/:id', requireAuth, updateProfile);

module.exports = router;
