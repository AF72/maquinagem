const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  materia_prima_id: z.number().int().positive(),
  preco_kg:         z.coerce.number().positive(),
  data:             z.string().optional(),
  notas:            z.string().nullable().optional(),
});

async function listar(req, res, next) {
  try {
    const where = req.query.materia_prima_id
      ? { materia_prima_id: Number(req.query.materia_prima_id) }
      : {};
    const registos = await prisma.historicoPrecoMp.findMany({
      where,
      orderBy: [{ materia_prima_id: 'asc' }, { data: 'desc' }, { criado_em: 'desc' }],
    });
    res.json(registos);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { data: dataStr, ...rest } = schema.parse(req.body);
    const dados = { ...rest };
    if (dataStr) dados.data = new Date(dataStr);
    const registo = await prisma.historicoPrecoMp.create({ data: dados });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.historicoPrecoMp.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, eliminar };
