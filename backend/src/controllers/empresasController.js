const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  nome: z.string().min(1),
  nif: z.string().nullable().optional(),
  morada: z.string().nullable().optional(),
  codigo_postal: z.string().nullable().optional(),
  localidade: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  tel: z.string().nullable().optional(),
});

async function listar(req, res, next) {
  try {
    const empresas = await prisma.empresa.findMany({ orderBy: { nome: 'asc' } });
    res.json(empresas);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const empresa = await prisma.empresa.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { colaboradores: true },
    });
    res.json(empresa);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const empresa = await prisma.empresa.create({ data: dados });
    res.status(201).json(empresa);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const empresa = await prisma.empresa.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(empresa);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.empresa.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, eliminar };
