const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  ref:             z.string().nullable().optional(),
  equipamento:     z.string().nullable().optional(),
  orgao:           z.string().nullable().optional(),
  parte:           z.string().nullable().optional(),
  breve_descricao: z.string().nullable().optional(),
  imagem:          z.string().nullable().optional(),
  tipo_contacto:   z.string().nullable().optional(),
  ordem_compra:    z.string().nullable().optional(),
  data_rececao_oc: z.string().nullish(),
});

async function listar(req, res, next) {
  try {
    const dados = await prisma.dadosPedido.findMany({ orderBy: { ref: 'asc' } });
    res.json(dados);
  } catch (err) { next(err); }
}

function parseDados(dados) {
  if (dados.data_rececao_oc) {
    dados.data_rececao_oc = new Date(dados.data_rececao_oc);
  }
  return dados;
}

async function criar(req, res, next) {
  try {
    const dados = parseDados(schema.parse(req.body));
    const registo = await prisma.dadosPedido.create({ data: dados });
    res.status(201).json(registo);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = parseDados(schema.partial().parse(req.body));
    const registo = await prisma.dadosPedido.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(registo);
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar };
