const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

async function listar(req, res, next) {
  try {
    const lista = await prisma.pecaPedido.findMany();
    res.json(lista);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { peca_id, pedido_id } = z.object({
      peca_id:   z.number().int(),
      pedido_id: z.number().int(),
    }).parse(req.body);
    const registo = await prisma.pecaPedido.upsert({
      where: { peca_id_pedido_id: { peca_id, pedido_id } },
      create: { peca_id, pedido_id },
      update: {},
    });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.pecaPedido.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, eliminar };
