const router = require('express').Router();
const c = require('../controllers/historicoPrecosProcessosController');

router.get('/',      c.listar);
router.post('/',     c.criar);
router.delete('/:id', c.eliminar);

module.exports = router;
