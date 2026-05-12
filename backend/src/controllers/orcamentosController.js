const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  pedido_id: z.number().int(),
  ref: z.string().min(1),
  data_emissao: z.string().optional(),
  data_validade: z.string().optional(),
  estado: z.string().optional(),
  observacoes: z.string().optional(),
});

const include = { itens: { include: { peca: true, servico: true } } };

async function listar(req, res, next) {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include,
      orderBy: { criado_em: 'desc' },
    });
    res.json(orcamentos);
  } catch (err) { next(err); }
}

async function obter(req, res, next) {
  try {
    const orcamento = await prisma.orcamento.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include,
    });
    res.json(orcamento);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const orcamento = await prisma.orcamento.create({ data: dados, include });
    res.status(201).json(orcamento);
  } catch (err) { next(err); }
}

async function ativar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const orcamento = await prisma.orcamento.findUniqueOrThrow({ where: { id } });

    // Desativa todos os outros orçamentos do mesmo pedido
    await prisma.orcamento.updateMany({
      where: { pedido_id: orcamento.pedido_id },
      data: { ativo: false },
    });

    const atualizado = await prisma.orcamento.update({
      where: { id },
      data: { ativo: true, estado: 'Aprovado' },
      include,
    });
    res.json(atualizado);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await prisma.orcamento.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, ativar, eliminar };
