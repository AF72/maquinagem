const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  empresa_id: z.number().int(),
  nome: z.string().min(1),
  cargo: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().optional(),
  ativo: z.boolean().optional(),
});

async function listar(req, res, next) {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      include: { empresa: true },
      orderBy: { nome: 'asc' },
    });
    res.json(colaboradores);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const colaborador = await prisma.colaborador.create({
      data: dados,
      include: { empresa: true },
    });
    res.status(201).json(colaborador);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const colaborador = await prisma.colaborador.update({
      where: { id: Number(req.params.id) },
      data: dados,
      include: { empresa: true },
    });
    res.json(colaborador);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.colaborador.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
