const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  nome: z.string().min(1),
  cc: z.string().optional(),
  morada: z.string().optional(),
  codigo_postal: z.string().optional(),
  localidade: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().optional(),
});

async function listar(req, res, next) {
  try {
    const particulares = await prisma.particular.findMany({ orderBy: { nome: 'asc' } });
    res.json(particulares);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const particular = await prisma.particular.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
    });
    res.json(particular);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const particular = await prisma.particular.create({ data: dados });
    res.status(201).json(particular);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const particular = await prisma.particular.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(particular);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.particular.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, eliminar };
