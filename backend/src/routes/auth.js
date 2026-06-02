const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/login', c.login);
router.post('/alterar-password', auth, c.alterarPassword);
router.post('/setup', c.setup);
router.post('/migrate', c.migrate);
router.post('/reset-admin', c.resetAdmin);
router.get('/health', (req, res) => res.json({ jwt_secret_set: !!process.env.JWT_SECRET }));

module.exports = router;
