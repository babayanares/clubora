const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { getStats, getAdminClubs, deleteAdminClub, getAdminUsers } = require('../controllers/admin');

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/clubs', getAdminClubs);
router.delete('/clubs/:id', deleteAdminClub);
router.get('/users', getAdminUsers);

module.exports = router;
