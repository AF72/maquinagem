const router = require('express').Router();
const c = require('../controllers/materiaPrimaController');

router.get('/', c.listar);
router.post('/', c.criar);
router.put('/:id', c.atualizar);

module.exports = router;
