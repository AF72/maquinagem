const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  nome:            z.string().min(1),
  nif:             z.string().optional().nullable(),
  morada:          z.string().optional().nullable(),
  codigo_postal:   z.string().optional().nullable(),
  localidade:      z.string().optional().nullable(),
  pessoa_contacto: z.string().optional().nullable(),
  email:           z.string().optional().nullable(),
  telf:            z.string().optional().nullable(),
});

async function listar(req, res, next) {
  try {
    const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
    res.json(fornecedores);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const fornecedor = await prisma.fornecedor.create({ data: dados });
    res.status(201).json(fornecedor);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const dados = schema.partial().parse(req.body);
    const fornecedor = await prisma.fornecedor.update({ where: { id }, data: dados });
    res.json(fornecedor);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.fornecedor.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
