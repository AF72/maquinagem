const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  descricao:  z.string().min(1),
  tipo:       z.string().min(1),
  custo_hora: z.coerce.number().nonnegative(),
  ativo:      z.boolean().optional().default(true),
});

async function _proximaRef() {
  const ultimo = await prisma.processo.findFirst({
    where: { ref: { startsWith: 'PRC' } },
    orderBy: { ref: 'desc' },
    select: { ref: true },
  });
  const n = ultimo ? (parseInt(ultimo.ref.replace('PRC', ''), 10) + 1) : 1;
  return 'PRC' + String(n).padStart(3, '0');
}

async function listar(req, res, next) {
  try {
    const processos = await prisma.processo.findMany({ orderBy: { ref: 'asc' } });
    res.json(processos);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const ref = await _proximaRef();
    const processo = await prisma.processo.create({ data: { ref, ...dados } });
    res.status(201).json(processo);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const dados = schema.partial().parse(req.body);
    const processo = await prisma.processo.update({ where: { id }, data: dados });
    res.json(processo);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.processo.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar };
