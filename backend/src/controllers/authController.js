const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const alterarPasswordSchema = z.object({
  password_atual: z.string().min(1),
  password_nova: z.string().min(8, 'A nova password deve ter pelo menos 8 caracteres'),
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const utilizador = await prisma.colaboradorDm.findUnique({ where: { email } });

    if (!utilizador || !utilizador.password_hash) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    if (utilizador.estado !== 'ativo') {
      return res.status(403).json({ erro: 'Conta inativa. Contacte o administrador.' });
    }

    const ok = await bcrypt.compare(password, utilizador.password_hash);
    if (!ok) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: utilizador.id, role: utilizador.role, nome: utilizador.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      utilizador: {
        id: utilizador.id,
        nome: utilizador.nome,
        role: utilizador.role,
        primeiro_login: utilizador.primeiro_login,
      },
    });
  } catch (err) { next(err); }
}

async function alterarPassword(req, res, next) {
  try {
    const { password_atual, password_nova } = alterarPasswordSchema.parse(req.body);
    const id = req.utilizador.id;

    const utilizador = await prisma.colaboradorDm.findUnique({ where: { id } });
    if (!utilizador) return res.status(404).json({ erro: 'Utilizador não encontrado' });

    const ok = await bcrypt.compare(password_atual, utilizador.password_hash);
    if (!ok) return res.status(401).json({ erro: 'Password atual incorreta' });

    const hash = await bcrypt.hash(password_nova, 12);
    await prisma.colaboradorDm.update({
      where: { id },
      data: { password_hash: hash, primeiro_login: false },
    });

    res.json({ mensagem: 'Password alterada com sucesso' });
  } catch (err) { next(err); }
}

module.exports = { login, alterarPassword };
