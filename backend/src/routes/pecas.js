const router = require('express').Router();
const c = require('../controllers/pecasController');

router.get('/', c.listar);
router.get('/:id', c.obter);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
