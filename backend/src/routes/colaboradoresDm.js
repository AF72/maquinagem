const router = require('express').Router();
const c = require('../controllers/colaboradoresDmController');

router.get('/', c.listar);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.eliminar);
router.patch('/:id/password', c.definirPassword);

module.exports = router;
