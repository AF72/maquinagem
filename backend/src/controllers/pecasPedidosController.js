const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listar(req, res, next) {
  try {
    const lista = await prisma.pecaPedido.findMany();
    res.json(lista);
  } catch (err) { next(err); }
}

module.exports = { listar };
