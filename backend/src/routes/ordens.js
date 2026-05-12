const router = require('express').Router();
const c = require('../controllers/ordensController');

router.get('/', c.listar);
router.get('/:id', c.obter);
router.post('/', c.criar);
router.patch('/:id/concluir', c.concluir);
router.delete('/:id', c.eliminar);

module.exports = router;
