const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const ESTADOS = ['Orçamentar', 'Pendente', 'Produção', 'Faturar', 'Concluido', 'Cancelado'];

const schema = z.object({
  ref: z.string().min(1),
  cliente_tipo: z.enum(['colaborador', 'particular']),
  colaborador_id: z.number().int().nullable().optional(),
  particular_id: z.number().int().nullable().optional(),
  dados_pedido_id: z.number().int(),
  estado_pedido: z.enum(ESTADOS).optional(),
  data_pedido: z.string().optional(),
  observacoes: z.string().optional(),
  custo_liquido: z.number().optional(),
});

const include = {
  dados_pedido: true,
  colaborador: { include: { empresa: true } },
  particular: true,
  ordens: true,
  orcamentos: true,
};

async function listar(req, res, next) {
  try {
    const { estado } = req.query;
    const pedidos = await prisma.pedido.findMany({
      where: estado ? { estado_pedido: estado } : undefined,
      include,
      orderBy: { criado_em: 'desc' },
    });
    res.json(pedidos);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const pedido = await prisma.pedido.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { ...include, notas: { include: { colaborador_dm: true } } },
    });
    res.json(pedido);
  } catch (err) { next(err); }
}

function parseDados(dados) {
  if (dados.data_pedido) {
    dados.data_pedido = new Date(dados.data_pedido);
  }
  return dados;
}

async function criar(req, res, next) {
  try {
    const dados = parseDados(schema.parse(req.body));
    const pedido = await prisma.pedido.create({ data: dados, include });
    res.status(201).json(pedido);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = parseDados(schema.partial().parse(req.body));
    const pedido = await prisma.pedido.update({
      where: { id: Number(req.params.id) },
      data: dados,
      include,
    });
    res.json(pedido);
  } catch (err) { next(err); }
}

async function atualizarEstado(req, res, next) {
  try {
    const { estado_pedido } = z.object({ estado_pedido: z.enum(ESTADOS) }).parse(req.body);
    const pedido = await prisma.pedido.update({
      where: { id: Number(req.params.id) },
      data: { estado_pedido },
    });
    res.json(pedido);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.pedido.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, atualizarEstado, eliminar };
