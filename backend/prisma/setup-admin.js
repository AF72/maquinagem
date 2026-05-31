/**
 * Cria ou atualiza o primeiro utilizador administrador.
 * Uso: node prisma/setup-admin.js
 *
 * Pede os dados em modo interativo e define email + password + role=admin
 * na tabela colaboradores_dm.
 *
 * Nota: o colaborador tem de existir previamente na tabela (criado via UI ou seed).
 * Se não existir, é criado com os dados fornecidos.
 */

require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('\n=== Setup Administrador MaquinaGest ===\n');

  const nome = await ask('Nome do administrador: ');
  const email = await ask('Email de login: ');
  const password = await ask('Password (mín. 8 caracteres): ');

  if (password.length < 8) {
    console.error('\nErro: a password deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  // Tenta encontrar por email ou criar novo
  const existente = await prisma.colaboradorDm.findUnique({ where: { email } });

  if (existente) {
    await prisma.colaboradorDm.update({
      where: { email },
      data: { password_hash: hash, role: 'admin', primeiro_login: false, estado: 'ativo' },
    });
    console.log(`\nAdmin atualizado: ${existente.nome} (${email})`);
  } else {
    await prisma.colaboradorDm.create({
      data: { nome, email, password_hash: hash, role: 'admin', primeiro_login: false, estado: 'ativo' },
    });
    console.log(`\nAdmin criado: ${nome} (${email})`);
  }

  console.log('Pode agora iniciar a aplicação e fazer login.\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); rl.close(); });
