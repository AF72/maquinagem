const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  num: z.string().min(1),
  pedido_id: z.number().int(),
  operador: z.string().optional(),
  estado: z.enum(['Em curso', 'Concluída', 'Cancelada']).optional(),
  prazo: z.string().optional(),
  mo_obra: z.number().optional(),
  notas: z.string().optional(),
});

const include = { pedido: { include: { dados_pedido: true } } };

async function listar(req, res, next) {
  try {
    const ordens = await prisma.ordemTrabalho.findMany({
      include,
      orderBy: { criado_em: 'desc' },
    });
    res.json(ordens);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const ordem = await prisma.ordemTrabalho.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include,
    });
    res.json(ordem);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const ordem = await prisma.ordemTrabalho.create({ data: dados, include });
    res.status(201).json(ordem);
  } catch (err) { next(err); }
}

async function concluir(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ordem = await prisma.ordemTrabalho.update({
      where: { id },
      data: { estado: 'Concluída', concluido_em: new Date() },
    });
    await prisma.pedido.update({
      where: { id: ordem.pedido_id },
      data: { estado_pedido: 'Concluido' },
    });
    res.json(ordem);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.ordemTrabalho.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, concluir, eliminar };
