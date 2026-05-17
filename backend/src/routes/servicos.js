const express = require('express');
const { listar, obter, criar, atualizar, eliminar } = require('../controllers/servicosController');

const router = express.Router();

router.get('/',      listar);
router.get('/:id',   obter);
router.post('/',     criar);
router.put('/:id',   atualizar);
router.delete('/:id', eliminar);

module.exports = router;
