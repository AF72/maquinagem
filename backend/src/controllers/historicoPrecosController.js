const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  peca_id:       z.number().int(),
  pedido_id:     z.number().int(),
  fornecedor_id: z.number().int().optional().nullable(),
  preco_compra:  z.number().optional().nullable(),
  preco_venda:   z.number().optional().nullable(),
});

async function listarPorPedido(req, res, next) {
  try {
    const pedido_id = Number(req.params.pedidoId);
    const registos = await prisma.historicoPreco.findMany({
      where: { pedido_id },
      include: { fornecedor: true },
    });
    res.json(registos);
  } catch (err) { next(err); }
}

async function upsert(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const registo = await prisma.historicoPreco.upsert({
      where: { peca_id_pedido_id: { peca_id: dados.peca_id, pedido_id: dados.pedido_id } },
      update: {
        fornecedor_id: dados.fornecedor_id ?? null,
        preco_compra:  dados.preco_compra  ?? null,
        preco_venda:   dados.preco_venda   ?? null,
        data:          new Date(),
      },
      create: dados,
      include: { fornecedor: true },
    });
    res.json(registo);
  } catch (err) { next(err); }
}

async function listarPorPeca(req, res, next) {
  try {
    const peca_id = Number(req.params.pecaId);
    const registos = await prisma.historicoPreco.findMany({
      where: { peca_id },
      include: { fornecedor: true, pedido: true },
      orderBy: { data: 'desc' },
    });
    res.json(registos);
  } catch (err) { next(err); }
}

module.exports = { listarPorPedido, upsert, listarPorPeca };
