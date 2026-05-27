const express = require('express');
const { listar, criar, atualizar, eliminar } = require('../controllers/processosController');

const router = express.Router();

router.get('/',      listar);
router.post('/',     criar);
router.put('/:id',   atualizar);
router.delete('/:id', eliminar);

module.exports = router;
