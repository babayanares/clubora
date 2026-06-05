const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getNotifications, markAllRead } = require('../controllers/notifications');

router.get('/', requireAuth, getNotifications);
router.patch('/read-all', requireAuth, markAllRead);

module.exports = router;
