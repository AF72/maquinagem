const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/login', c.login);
router.post('/alterar-password', auth, c.alterarPassword);
router.post('/setup', c.setup);

module.exports = router;
