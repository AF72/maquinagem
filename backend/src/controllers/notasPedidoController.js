const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

async function listar(req, res, next) {
  try {
    const lista = await prisma.notaPedido.findMany({ orderBy: { criado_em: 'asc' } });
    res.json(lista);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { pedido_id, colaborador_dm_id, nota } = z.object({
      pedido_id:        z.number().int(),
      colaborador_dm_id: z.number().int(),
      nota:             z.string().min(1),
    }).parse(req.body);
    const registo = await prisma.notaPedido.create({
      data: { pedido_id, colaborador_dm_id, nota, data: new Date() },
    });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.notaPedido.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, eliminar };
