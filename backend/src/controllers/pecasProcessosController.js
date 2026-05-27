const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  peca_id:        z.number().int().positive(),
  processo_id:    z.number().int().positive(),
  ordem:          z.number().int().nonnegative(),
  tempo_estimado: z.coerce.number().nonnegative().nullable().optional(),
  unidade_tempo:  z.enum(['h', 'min']).optional().default('h'),
  notas:          z.string().nullable().optional(),
});

async function listar(req, res, next) {
  try {
    const registos = await prisma.pecaProcesso.findMany({
      orderBy: [{ peca_id: 'asc' }, { ordem: 'asc' }],
      include: { processo: true },
    });
    res.json(registos);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const registo = await prisma.pecaProcesso.create({
      data: dados,
      include: { processo: true },
    });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const dados = schema.partial().parse(req.body);
    const registo = await prisma.pecaProcesso.update({
      where: { id },
      data: dados,
      include: { processo: true },
    });
    res.json(registo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.pecaProcesso.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
