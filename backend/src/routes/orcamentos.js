const router = require('express').Router();
const c = require('../controllers/orcamentosController');

router.get('/', c.listar);
router.get('/:id', c.obter);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.post('/:id/itens', c.salvarItens);
router.patch('/:id/ativar', c.ativar);
router.delete('/:id', c.eliminar);

module.exports = router;
