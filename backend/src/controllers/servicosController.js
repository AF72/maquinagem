const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  ref:          z.string().min(1),
  tipo_servico: z.string().min(1),
  descricao:    z.string().optional().nullable(),
  unidade:      z.enum(['und', 'H', 'kg']).default('und'),
});

async function listar(req, res, next) {
  try {
    const servicos = await prisma.servico.findMany({ orderBy: { ref: 'asc' } });
    res.json(servicos);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const servico = await prisma.servico.findUniqueOrThrow({ where: { id: Number(req.params.id) } });
    res.json(servico);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const servico = await prisma.servico.create({ data: dados });
    res.status(201).json(servico);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const servico = await prisma.servico.update({ where: { id: Number(req.params.id) }, data: dados });
    res.json(servico);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.servico.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, eliminar };
