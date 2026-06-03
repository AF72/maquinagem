const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  processo_id: z.number().int().positive(),
  custo_hora:  z.coerce.number().nonnegative(),
  data:        z.string().optional(),
  notas:       z.string().nullable().optional(),
});

async function listar(req, res, next) {
  try {
    const where = req.query.processo_id
      ? { processo_id: Number(req.query.processo_id) }
      : {};
    const registos = await prisma.historicoPrecoProcesso.findMany({
      where,
      orderBy: [{ processo_id: 'asc' }, { data: 'desc' }, { criado_em: 'desc' }],
    });
    res.json(registos);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { data: dataStr, ...rest } = schema.parse(req.body);
    const dados = { ...rest };
    if (dataStr) dados.data = new Date(dataStr);
    const registo = await prisma.historicoPrecoProcesso.create({ data: dados });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.historicoPrecoProcesso.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, eliminar };
