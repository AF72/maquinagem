const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  servico_id:     z.number().int(),
  pedido_id:      z.number().int(),
  fornecedor_id:  z.number().int().optional().nullable(),
  quantidade:     z.number().positive().default(1),
  preco_unitario: z.number().min(0).default(0),
});

async function listar(req, res, next) {
  try {
    const { pedido_id } = req.query;
    const where = pedido_id ? { pedido_id: Number(pedido_id) } : {};
    const items = await prisma.servicoPedido.findMany({
      where,
      include: { servico: true, fornecedor: true },
      orderBy: { criado_em: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const item = await prisma.servicoPedido.create({
      data: dados,
      include: { servico: true, fornecedor: true },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const updateSchema = z.object({
      fornecedor_id:  z.number().int().optional().nullable(),
      quantidade:     z.number().positive().optional(),
      preco_unitario: z.number().min(0).optional(),
    });
    const dados = updateSchema.parse(req.body);
    const item = await prisma.servicoPedido.update({
      where: { id: Number(req.params.id) },
      data: dados,
      include: { servico: true, fornecedor: true },
    });
    res.json(item);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.servicoPedido.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
