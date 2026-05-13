const router = require('express').Router();
const c = require('../controllers/pecasPedidosController');

router.get('/', c.listar);

module.exports = router;
