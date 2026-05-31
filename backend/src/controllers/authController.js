const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'maquinagest_drawmech_2026_secret';

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
      JWT_SECRET,
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

const setupSchema = z.object({
  nome:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
});

// Endpoint de arranque único — aplica colunas em falta e cria o primeiro admin
async function setup(req, res, next) {
  try {
    // Garante que as colunas de autenticação existem na BD
    await prisma.$executeRawUnsafe(`
      ALTER TABLE colaboradores_dm
        ADD COLUMN IF NOT EXISTS email VARCHAR(150),
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'operador',
        ADD COLUMN IF NOT EXISTS primeiro_login BOOLEAN NOT NULL DEFAULT true
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS colaboradores_dm_email_key ON colaboradores_dm(email)
    `);

    const adminExistente = await prisma.$queryRaw`
      SELECT id FROM colaboradores_dm WHERE role = 'admin' LIMIT 1
    `;
    if (adminExistente.length > 0) {
      return res.status(403).json({ erro: 'Setup já foi realizado. Este endpoint está desativado.' });
    }

    const { nome, email, password } = setupSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 12);

    await prisma.$executeRawUnsafe(
      `INSERT INTO colaboradores_dm (nome, email, password_hash, role, primeiro_login, estado)
       VALUES ($1, $2, $3, 'admin', false, 'ativo')`,
      nome, email, hash
    );

    res.status(201).json({ mensagem: 'Colunas criadas e admin configurado com sucesso.' });
  } catch (err) { next(err); }
}

module.exports = { login, alterarPassword, setup };
