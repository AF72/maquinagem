const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const schema = z.object({
  ref:             z.string().min(1),
  equipamento:     z.string().optional(),
  orgao:           z.string().optional(),
  parte:           z.string().optional(),
  breve_descricao: z.string().optional(),
  imagem:          z.string().optional(),
  tipo_contacto:   z.string().optional(),
  ordem_compra:    z.string().optional(),
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
