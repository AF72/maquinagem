const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  ref_wnr:  z.string().optional(),
  peso_esp: z.number().optional(),
  ref_din:  z.string().optional(),
  ref_bs:   z.string().optional(),
  ref_afnor:z.string().optional(),
  ref_une:  z.string().optional(),
  ref_aisi: z.string().optional(),
  ref_jis:  z.string().optional(),
  tipo_tt:  z.string().optional(),
});

async function listar(req, res, next) {
  try {
    const lista = await prisma.materiaPrima.findMany({ orderBy: { ref_din: 'asc' } });
    res.json(lista);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const registo = await prisma.materiaPrima.create({ data: dados });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const registo = await prisma.materiaPrima.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(registo);
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar };
