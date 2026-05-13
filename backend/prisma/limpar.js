require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tabelas = process.argv.slice(2);

  if (tabelas.length === 0) {
    console.log('Uso: node prisma/limpar.js <tabela> [tabela2 ...]');
    console.log('Tabelas disponíveis: orcamentos  pecas  pedidos  ordens  clientes  tudo');
    process.exit(0);
  }

  const limparOrcamentos = async () => {
    const itens = await prisma.orcamentoItem.deleteMany();
    const orcs  = await prisma.orcamento.deleteMany();
    console.log(`  orcamento_itens: ${itens.count} registos apagados`);
    console.log(`  orcamentos:      ${orcs.count} registos apagados`);
  };

  const limparPecas = async () => {
    const pp   = await prisma.pecaPedido.deleteMany();
    const itens = await prisma.orcamentoItem.deleteMany();
    const pcs  = await prisma.peca.deleteMany();
    console.log(`  pecas_pedidos:   ${pp.count} registos apagados`);
    console.log(`  orcamento_itens: ${itens.count} registos apagados`);
    console.log(`  pecas:           ${pcs.count} registos apagados`);
  };

  for (const tabela of tabelas) {
    console.log(`\nA limpar: ${tabela}`);
    switch (tabela) {
      case 'orcamentos':
        await limparOrcamentos();
        break;
      case 'pecas':
        await limparPecas();
        break;
      case 'pedidos':
        await prisma.notaPedido.deleteMany();
        await limparOrcamentos();
        await prisma.pecaPedido.deleteMany();
        await prisma.ordemTrabalho.deleteMany();
        const peds = await prisma.pedido.deleteMany();
        await prisma.dadosPedido.deleteMany();
        console.log(`  pedidos: ${peds.count} registos apagados`);
        break;
      case 'ordens':
        const ots = await prisma.ordemTrabalho.deleteMany();
        console.log(`  ordens_trabalho: ${ots.count} registos apagados`);
        break;
      case 'clientes':
        await prisma.colaborador.deleteMany();
        await prisma.empresa.deleteMany();
        await prisma.particular.deleteMany();
        console.log('  empresas, colaboradores e particulares apagados');
        break;
      case 'tudo':
        await prisma.orcamentoItem.deleteMany();
        await prisma.orcamento.deleteMany();
        await prisma.notaPedido.deleteMany();
        await prisma.pecaPedido.deleteMany();
        await prisma.ordemTrabalho.deleteMany();
        await prisma.pedido.deleteMany();
        await prisma.dadosPedido.deleteMany();
        await prisma.colaborador.deleteMany();
        await prisma.peca.deleteMany();
        await prisma.materiaPrima.deleteMany();
        await prisma.servico.deleteMany();
        await prisma.colaboradorDm.deleteMany();
        await prisma.particular.deleteMany();
        await prisma.empresa.deleteMany();
        console.log('  todas as tabelas limpas');
        break;
      default:
        console.log(`  "${tabela}" não reconhecido — ignorado`);
    }
  }

  console.log('\nConcluído.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
