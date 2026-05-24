const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  ref: z.string().min(1),
  denominacao: z.string().optional().nullable(),
  plano: z.string().optional(),
  orgao: z.string().optional(),
  parte: z.string().optional(),
  materia_prima_id: z.number().int().optional(),
  forma: z.enum(['quadrado', 'redondo_macico', 'redondo_oco']).optional(),
  comprimento: z.number().optional(),
  largura: z.number().optional(),
  altura: z.number().optional(),
  diametro_ext: z.number().optional(),
  diametro_int: z.number().optional(),
  nota_descritiva: z.string().optional(),
  imagem: z.string().optional(),
});

async function listar(req, res, next) {
  try {
    const pecas = await prisma.peca.findMany({
      orderBy: { ref: 'asc' },
      include: { materia_prima: true },
    });
    res.json(pecas);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const peca = await prisma.peca.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { materia_prima: true },
    });
    res.json(peca);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { pedido_id, ...body } = req.body;
    const dados = schema.parse(body);
    const peca = await prisma.peca.create({ data: dados });
    if (pedido_id) {
      await prisma.pecaPedido.upsert({
        where: { peca_id_pedido_id: { peca_id: peca.id, pedido_id: Number(pedido_id) } },
        create: { peca_id: peca.id, pedido_id: Number(pedido_id) },
        update: {},
      });
    }
    res.status(201).json(peca);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const { pedido_id, ...body } = req.body;
    const dados = schema.partial().parse(body);
    const peca = await prisma.peca.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    if (pedido_id) {
      await prisma.pecaPedido.upsert({
        where: { peca_id_pedido_id: { peca_id: peca.id, pedido_id: Number(pedido_id) } },
        create: { peca_id: peca.id, pedido_id: Number(pedido_id) },
        update: {},
      });
    }
    res.json(peca);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.peca.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, eliminar };
