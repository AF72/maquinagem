const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  pedido_id:     z.number().int(),
  ref:           z.string().min(1),
  data_emissao:  z.string().optional(),
  data_validade: z.string().optional(),
  estado:        z.string().optional(),
  observacoes:   z.string().optional(),
  ativo:         z.boolean().optional(),
  total_liquido: z.number().optional(),
});

const include = { itens: { include: { peca: true } } };

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
    if (dados.ativo) {
      await prisma.orcamento.updateMany({
        where: { pedido_id: dados.pedido_id },
        data: { ativo: false },
      });
    }
    const orcamento = await prisma.orcamento.create({ data: dados, include });
    res.status(201).json(orcamento);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const dados = schema.partial().parse(req.body);
    if (dados.ativo) {
      const orc = await prisma.orcamento.findUnique({ where: { id } });
      await prisma.orcamento.updateMany({
        where: { pedido_id: orc.pedido_id, id: { not: id } },
        data: { ativo: false },
      });
    }
    const atualizado = await prisma.orcamento.update({ where: { id }, data: dados, include });
    if (atualizado.ativo && atualizado.estado === 'Aprovado' && atualizado.total_liquido != null) {
      await prisma.pedido.update({
        where: { id: atualizado.pedido_id },
        data: { custo_liquido: atualizado.total_liquido },
      });
    }
    res.json(atualizado);
  } catch (err) { next(err); }
}

async function salvarItens(req, res, next) {
  try {
    const id = Number(req.params.id);
    const itens = z.array(z.object({
      peca_id:        z.number().int(),
      quantidade:     z.number(),
      valor_unitario: z.number(),
    })).parse(req.body);

    await prisma.orcamentoItem.deleteMany({ where: { orcamento_id: id } });
    if (itens.length > 0) {
      await prisma.orcamentoItem.createMany({
        data: itens.map(i => ({
          orcamento_id:   id,
          item_tipo:      'peca',
          peca_id:        i.peca_id,
          quantidade:     i.quantidade,
          valor_unitario: i.valor_unitario,
        })),
      });
    }

    const todos = await prisma.orcamentoItem.findMany({ where: { orcamento_id: id } });
    const total = todos.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
    await prisma.orcamento.update({ where: { id }, data: { total_liquido: total } });

    const orc = await prisma.orcamento.findUnique({ where: { id }, include });
    res.json(orc);
  } catch (err) { next(err); }
}

async function ativar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const orcamento = await prisma.orcamento.findUniqueOrThrow({ where: { id } });
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

module.exports = { listar, obter, criar, atualizar, salvarItens, ativar, eliminar };
