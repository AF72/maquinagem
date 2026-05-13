const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  nome:      z.string().min(1),
  funcao:    z.string().optional(),
  contacto:  z.string().optional(),
  estado:    z.enum(['ativo', 'inativo']).optional(),
});

async function listar(req, res, next) {
  try {
    const lista = await prisma.colaboradorDm.findMany({ orderBy: { nome: 'asc' } });
    res.json(lista);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const colaborador = await prisma.colaboradorDm.create({ data: dados });
    res.status(201).json(colaborador);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const colaborador = await prisma.colaboradorDm.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(colaborador);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.colaboradorDm.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
