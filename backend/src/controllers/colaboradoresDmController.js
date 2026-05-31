const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const CAMPOS_PUBLICOS = {
  id: true, nome: true, funcao: true, contacto: true,
  email: true, role: true, primeiro_login: true, estado: true, criado_em: true,
};

const schema = z.object({
  nome:     z.string().min(1),
  funcao:   z.string().optional(),
  contacto: z.string().optional(),
  email:    z.string().email().optional().nullable(),
  role:     z.enum(['admin', 'operador']).optional(),
  estado:   z.enum(['ativo', 'inativo']).optional(),
});

const definirPasswordSchema = z.object({
  password_temp: z.string().min(8, 'A password temporária deve ter pelo menos 8 caracteres'),
});

async function listar(req, res, next) {
  try {
    const lista = await prisma.colaboradorDm.findMany({
      select: CAMPOS_PUBLICOS,
      orderBy: { nome: 'asc' },
    });
    res.json(lista);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const colaborador = await prisma.colaboradorDm.create({
      data: dados,
      select: CAMPOS_PUBLICOS,
    });
    res.status(201).json(colaborador);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const dados = schema.partial().parse(req.body);
    const colaborador = await prisma.colaboradorDm.update({
      where: { id: Number(req.params.id) },
      data: dados,
      select: CAMPOS_PUBLICOS,
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

// Apenas admins podem definir a password temporária de outro colaborador
async function definirPassword(req, res, next) {
  try {
    if (req.utilizador.role !== 'admin') {
      return res.status(403).json({ erro: 'Apenas administradores podem definir passwords.' });
    }
    const { password_temp } = definirPasswordSchema.parse(req.body);
    const hash = await bcrypt.hash(password_temp, 12);
    await prisma.colaboradorDm.update({
      where: { id: Number(req.params.id) },
      data: { password_hash: hash, primeiro_login: true },
    });
    res.json({ mensagem: 'Password temporária definida. O colaborador deverá alterá-la no próximo acesso.' });
  } catch (err) { next(err); }
}

module.exports = { listar, criar, atualizar, eliminar, definirPassword };
