const express = require('express');
const { listarPorPedido, upsert, listarPorPeca } = require('../controllers/historicoPrecosController');

const router = express.Router();

router.get('/pedido/:pedidoId', listarPorPedido);
router.get('/peca/:pecaId',    listarPorPeca);
router.post('/',               upsert);

module.exports = router;
