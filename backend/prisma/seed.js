require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('A limpar dados existentes...');
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

    // ------------------------------------------------------------------
    // 1. Matéria-prima
    // ------------------------------------------------------------------
    console.log('A inserir matéria-prima...');
    const materiais = await Promise.all([
        // Aços
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.0503',
                peso_esp: 7.85,
                ref_din: 'C45',
                ref_bs: '080M46',
                ref_afnor: 'C45',
                ref_une: 'C45k',
                ref_aisi: '1045',
                ref_jis: 'S45C',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.7225',
                peso_esp: 7.85,
                ref_din: '42CrMo4',
                ref_bs: '708M40',
                ref_afnor: '42CD4',
                ref_une: '42CrMo4',
                ref_aisi: '4140',
                ref_jis: 'SCM440',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.7131',
                peso_esp: 7.85,
                ref_din: '16MnCr5',
                ref_bs: '527M20',
                ref_afnor: '16MC5',
                ref_une: '16MnCr5',
                ref_aisi: '5115',
                ref_jis: 'SMnC420',
                tipo_tt: 'Cementação e têmpera',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.3505',
                peso_esp: 7.81,
                ref_din: '100Cr6',
                ref_bs: '535A99',
                ref_afnor: '100C6',
                ref_une: 'F.131',
                ref_aisi: '52100',
                ref_jis: 'SUJ2',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.0037',
                peso_esp: 7.85,
                ref_din: 'St37-2',
                ref_bs: '040A10',
                ref_afnor: 'A37-2',
                ref_une: 'AE235-B',
                ref_aisi: 'A36',
                ref_jis: 'SS400',
                tipo_tt: '',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.1191',
                peso_esp: 7.85,
                ref_din: 'C45E',
                ref_bs: '080M46',
                ref_afnor: 'XC45',
                ref_une: 'C45E',
                ref_aisi: '1045',
                ref_jis: 'S45C',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.2379',
                peso_esp: 7.7,
                ref_din: 'X153CrMoV12',
                ref_bs: 'BD3',
                ref_afnor: 'Z160CDV12',
                ref_une: 'X153CrMoV12',
                ref_aisi: 'X153CrMoV12',
                ref_jis: 'SKD11',
                tipo_tt: 'Têmpera em óleo e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.2311',
                peso_esp: 7.85,
                ref_din: '40CrMnMo7',
                ref_bs: '-',
                ref_afnor: '40CMD8',
                ref_une: '40CrMnMo7',
                ref_aisi: 'P20',
                ref_jis: 'PX5',
                tipo_tt: 'Pré-temperado (fornecido pronto)',
            },
        }),
        // Alumínios
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.2315',
                peso_esp: 2.71,
                ref_din: 'EN AW-6082 / AlSi1MgMn',
                ref_bs: 'HE30',
                ref_afnor: 'A-SGM0.7',
                ref_une: 'L-3341',
                ref_aisi: '6082',
                ref_jis: 'A6082',
                tipo_tt: 'Solubilização e envelhecimento (T6)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.4365',
                peso_esp: 2.81,
                ref_din: 'EN AW-7075 / AlZn5.5MgCu',
                ref_bs: 'DTD5024',
                ref_afnor: 'A-Z5GU',
                ref_une: 'L-3372',
                ref_aisi: '7075',
                ref_jis: 'A7075',
                tipo_tt: 'Solubilização e envelhecimento (T651)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.1355',
                peso_esp: 2.78,
                ref_din: 'EN AW-2024 / AlCu4Mg1',
                ref_bs: 'L97',
                ref_afnor: 'A-U4G1',
                ref_une: 'L-3312',
                ref_aisi: '2024',
                ref_jis: 'A2024',
                tipo_tt: 'Solubilização e envelhecimento (T4/T351)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.3547',
                peso_esp: 2.66,
                ref_din: 'EN AW-5083 / AlMg4.5Mn0.7',
                ref_bs: 'N8',
                ref_afnor: 'A-G4.5MC',
                ref_une: 'L-3345',
                ref_aisi: '5083',
                ref_jis: 'A5083',
                tipo_tt:
                    'Sem tratamento térmico (endurecimento por deformação H111/H321)',
            },
        }),
        // Polímeros
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 1.14,
                ref_din: 'PA 6.6 (ISO 1874)',
                ref_bs: 'BS 6089',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: 'JIS K 6920',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 1.41,
                ref_din: 'POM-C (ISO 9988)',
                ref_bs: '-',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: '-',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 2.2,
                ref_din: 'PTFE (ISO 13000)',
                ref_bs: '-',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: '-',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
    ]);
    // Referências usadas nas peças de exemplo
    const mp42CrMo4 = materiais[1];
    const mp316L = materiais[0]; // placeholder (316L não está no catálogo base, peças usarão 42CrMo4)
    const mpAluminio = materiais[8];

    // ------------------------------------------------------------------
    // 2. Empresas
    // ------------------------------------------------------------------
    console.log('A inserir empresas...');
    const [efacec, renova, bosch] = await Promise.all([
        prisma.empresa.create({
            data: {
                nome: 'Faurecia, SEP, Bragança',
                nif: '500028040',
                morada: 'Rua Eng. Frederico Ulrich',
                codigo_postal: '4471-907',
                localidade: 'Moreira da Maia',
                email: 'geral@efacec.com',
                tel: '+351 229 406 000',
            },
        }),
        prisma.empresa.create({
            data: {
                nome: 'Renova – Fábrica de Papel do Almonda, S.A.',
                nif: '500111060',
                morada: 'Estrada Nacional 3, km 43',
                codigo_postal: '2354-001',
                localidade: 'Torres Novas',
                email: 'compras@renova.pt',
                tel: '+351 249 830 050',
            },
        }),
        prisma.empresa.create({
            data: {
                nome: 'Robert Bosch Portugal, S.A.',
                nif: '500054951',
                morada: 'Rua Werner Von Siemens, 1',
                codigo_postal: '2700-311',
                localidade: 'Amadora',
                email: 'compras.pt@bosch.com',
                tel: '+351 214 228 300',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 3. Particulares
    // ------------------------------------------------------------------
    console.log('A inserir particulares...');
    const [joao, maria] = await Promise.all([
        prisma.particular.create({
            data: {
                nome: 'João Pedro Ferreira',
                cc: '12345678',
                morada: 'Rua das Flores, 12',
                codigo_postal: '4000-193',
                localidade: 'Porto',
                email: 'joao.ferreira@gmail.com',
                tel: '+351 912 345 678',
            },
        }),
        prisma.particular.create({
            data: {
                nome: 'Maria da Conceição Sousa',
                cc: '87654321',
                morada: 'Av. da República, 45, 2.º Dto',
                codigo_postal: '1050-187',
                localidade: 'Lisboa',
                email: 'mcssousa@outlook.pt',
                tel: '+351 936 789 012',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 4. Colaboradores internos (equipa DM)
    // ------------------------------------------------------------------
    console.log('A inserir colaboradores internos...');
    const [carlos, ana] = await Promise.all([
        prisma.colaboradorDm.create({
            data: {
                nome: 'Carlos Manuel Rodrigues',
                funcao: 'Chefe de Oficina',
                contacto: '+351 961 234 567',
                estado: 'ativo',
            },
        }),
        prisma.colaboradorDm.create({
            data: {
                nome: 'Ana Cristina Lopes',
                funcao: 'Comercial',
                contacto: 'ana.lopes@maquinagem.pt',
                estado: 'ativo',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 5. Colaboradores das empresas (contactos clientes)
    // ------------------------------------------------------------------
    console.log('A inserir colaboradores das empresas...');
    const [ruiEfacec, susanaRenova, pedroBosch] = await Promise.all([
        prisma.colaborador.create({
            data: {
                empresa_id: efacec.id,
                nome: 'Rui Alexandre Monteiro',
                cargo: 'Responsável de Manutenção',
                email: 'r.monteiro@efacec.com',
                tel: '+351 917 001 002',
            },
        }),
        prisma.colaborador.create({
            data: {
                empresa_id: renova.id,
                nome: 'Susana Filipa Carvalho',
                cargo: 'Engenheira de Processo',
                email: 's.carvalho@renova.pt',
                tel: '+351 927 003 004',
            },
        }),
        prisma.colaborador.create({
            data: {
                empresa_id: bosch.id,
                nome: 'Pedro Nuno Almeida',
                cargo: 'Técnico de Compras',
                email: 'p.almeida@bosch.com',
                tel: '+351 937 005 006',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 6. Peças
    // ------------------------------------------------------------------
    console.log('A inserir peças...');
    const [veio, flange, tampa] = await Promise.all([
        prisma.peca.create({
            data: {
                ref: 'PC-2024-001',
                plano: 'DES-EFA-001-A',
                denominacao: 'Veio Principal de Transmissão',
                orgao: 'Grupo Motor',
                parte: 'Transmissão',
                materia_prima_id: mp42CrMo4.id,
                forma: 'redondo_macico',
                comprimento: 450.0,
                diametro_ext: 85.0,
                nota_descritiva:
                    'Maquinar conforme desenho. Tolerâncias H7/k6 nos apoios de rolamento.',
            },
        }),
        prisma.peca.create({
            data: {
                ref: 'PC-2024-002',
                plano: 'DES-REN-015-B',
                denominacao: 'Flange de Ligação DN100',
                orgao: 'Sistema Hidráulico',
                parte: 'Circuito Primário',
                materia_prima_id: mp316L.id,
                forma: 'redondo_oco',
                diametro_ext: 160.0,
                diametro_int: 108.0,
                altura: 30.0,
                nota_descritiva:
                    'Furação conforme norma EN 1092-1 PN16. Acabamento Ra 1.6.',
            },
        }),
        prisma.peca.create({
            data: {
                ref: 'PC-2024-003',
                plano: 'DES-BSH-007-A',
                denominacao: 'Tampa de Caixa de Relés',
                orgao: 'Caixa de Distribuição',
                parte: 'Proteção IP54',
                materia_prima_id: mpAluminio.id,
                forma: 'quadrado',
                comprimento: 200.0,
                largura: 150.0,
                altura: 8.0,
                nota_descritiva:
                    'Fresagem de alojamento para vedante. Anodização natural após maquinagem.',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 7. Serviços
    // ------------------------------------------------------------------
    console.log('A inserir serviços...');
    const [svcTorneamento, svcFresagem, svcRetificacao] = await Promise.all([
        prisma.servico.create({
            data: {
                ref: 'SVC-TORN',
                tipo_servico: 'Torneamento CNC',
                descricao: 'Torneamento em centro CNC Mazak',
                unidade: 'h',
            },
        }),
        prisma.servico.create({
            data: {
                ref: 'SVC-FRES',
                tipo_servico: 'Fresagem CNC',
                descricao: 'Fresagem em centro de maquinagem DMG',
                unidade: 'h',
            },
        }),
        prisma.servico.create({
            data: {
                ref: 'SVC-RETIF',
                tipo_servico: 'Retificação Cilíndrica',
                descricao: 'Retificação cilíndrica externa/interna',
                unidade: 'h',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 8. Dados de pedido
    // ------------------------------------------------------------------
    console.log('A inserir dados de pedido...');
    const [dpEfacec, dpRenova, dpBosch, dpJoao] = await Promise.all([
        prisma.dadosPedido.create({
            data: {
                ref: 'DP-2026-001',
                equipamento: 'Transformador AT 60MVA',
                orgao: 'Grupo Motor',
                parte: 'Transmissão',
                breve_descricao: 'Substituição de veio partido por fadiga',
                ordem_compra: 'OC-EFA-2026-0312',
                data_rececao_oc: new Date('2026-01-15'),
            },
        }),
        prisma.dadosPedido.create({
            data: {
                ref: 'DP-2026-002',
                equipamento: 'Bomba Centrífuga KSB DN100',
                orgao: 'Sistema Hidráulico',
                parte: 'Circuito Primário',
                breve_descricao:
                    'Fabrico de flange de substituição em inox 316L',
                ordem_compra: 'OC-REN-2026-0089',
                data_rececao_oc: new Date('2026-02-03'),
            },
        }),
        prisma.dadosPedido.create({
            data: {
                ref: 'DP-2026-003',
                equipamento: 'Quadro Elétrico QE-12',
                orgao: 'Caixa de Distribuição',
                parte: 'Proteção IP54',
                breve_descricao:
                    'Fabrico de tampa de alumínio com alojamento para vedante',
                ordem_compra: 'OC-BSH-2026-0541',
                data_rececao_oc: new Date('2026-03-10'),
            },
        }),
        prisma.dadosPedido.create({
            data: {
                ref: 'DP-2026-004',
                equipamento: 'Torno de Bancada Manual',
                orgao: 'Mandril',
                parte: 'Porca de ajuste',
                breve_descricao: 'Fabrico de porca roscada M42 em aço',
                ordem_compra: null,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 9. Pedidos
    // ------------------------------------------------------------------
    console.log('A inserir pedidos...');
    const [pedEfacec, pedRenova, pedBosch, pedJoao] = await Promise.all([
        prisma.pedido.create({
            data: {
                ref: 'PT26-0001',
                cliente_tipo: 'colaborador',
                colaborador_id: ruiEfacec.id,
                dados_pedido_id: dpEfacec.id,
                estado_pedido: 'Produção',
                data_pedido: new Date('2026-01-16'),
                observacoes:
                    'Urgente — transformador em avaria. Prazo máximo 10 dias úteis.',
                custo_liquido: 1850.0,
            },
        }),
        prisma.pedido.create({
            data: {
                ref: 'PT26-0002',
                cliente_tipo: 'colaborador',
                colaborador_id: susanaRenova.id,
                dados_pedido_id: dpRenova.id,
                estado_pedido: 'Orçamentar',
                data_pedido: new Date('2026-02-04'),
            },
        }),
        prisma.pedido.create({
            data: {
                ref: 'PT26-0003',
                cliente_tipo: 'colaborador',
                colaborador_id: pedroBosch.id,
                dados_pedido_id: dpBosch.id,
                estado_pedido: 'Faturar',
                data_pedido: new Date('2026-03-11'),
                custo_liquido: 320.0,
            },
        }),
        prisma.pedido.create({
            data: {
                ref: 'PT26-0004',
                cliente_tipo: 'particular',
                particular_id: joao.id,
                dados_pedido_id: dpJoao.id,
                estado_pedido: 'Pendente',
                data_pedido: new Date('2026-04-02'),
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 10. Peças ↔ Pedidos
    // ------------------------------------------------------------------
    console.log('A associar peças a pedidos...');
    await Promise.all([
        prisma.pecaPedido.create({
            data: { peca_id: veio.id, pedido_id: pedEfacec.id },
        }),
        prisma.pecaPedido.create({
            data: { peca_id: flange.id, pedido_id: pedRenova.id },
        }),
        prisma.pecaPedido.create({
            data: { peca_id: tampa.id, pedido_id: pedBosch.id },
        }),
    ]);

    // ------------------------------------------------------------------
    // 11. Ordens de trabalho
    // ------------------------------------------------------------------
    console.log('A inserir ordens de trabalho...');
    const [otEfacec, otBosch] = await Promise.all([
        prisma.ordemTrabalho.create({
            data: {
                num: 'OT26-0001',
                pedido_id: pedEfacec.id,
                estado: 'Em curso',
                prazo: new Date('2026-01-30'),
                mo_obra: 420.0,
                notas: 'Verificar dureza após têmpera. Alvo 52-56 HRC.',
            },
        }),
        prisma.ordemTrabalho.create({
            data: {
                num: 'OT26-0002',
                pedido_id: pedBosch.id,
                estado: 'Concluída',
                prazo: new Date('2026-04-05'),
                mo_obra: 96.0,
                notas: 'Anodização natural enviada para subcontratado.',
                concluido_em: new Date('2026-04-04'),
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 12. Orçamentos
    // ------------------------------------------------------------------
    console.log('A inserir orçamentos...');
    const [orcRenova, orcBosch] = await Promise.all([
        prisma.orcamento.create({
            data: {
                pedido_id: pedRenova.id,
                ref: 'ORC-2026-001',
                data_emissao: new Date('2026-02-06'),
                data_validade: new Date('2026-03-06'),
                estado: 'Pendente',
                ativo: false,
                total_liquido: 875.0,
                observacoes: 'Preço inclui matéria-prima 316L. Válido 30 dias.',
            },
        }),
        prisma.orcamento.create({
            data: {
                pedido_id: pedBosch.id,
                ref: 'ORC-2026-002',
                data_emissao: new Date('2026-03-12'),
                data_validade: new Date('2026-04-12'),
                estado: 'Aprovado',
                ativo: true,
                total_liquido: 320.0,
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 13. Itens de orçamento
    // ------------------------------------------------------------------
    console.log('A inserir itens de orçamento...');
    await Promise.all([
        // Orçamento Renova: peça + serviço de torneamento
        prisma.orcamentoItem.create({
            data: {
                orcamento_id: orcRenova.id,
                item_tipo: 'peca',
                peca_id: flange.id,
                quantidade: 1,
                valor_unitario: 575.0,
                unidade: 'un',
            },
        }),
        prisma.orcamentoItem.create({
            data: {
                orcamento_id: orcRenova.id,
                item_tipo: 'servico',
                servico_id: svcTorneamento.id,
                quantidade: 5,
                valor_unitario: 60.0,
                unidade: 'h',
            },
        }),
        // Orçamento Bosch: peça + serviço de fresagem
        prisma.orcamentoItem.create({
            data: {
                orcamento_id: orcBosch.id,
                item_tipo: 'peca',
                peca_id: tampa.id,
                quantidade: 1,
                valor_unitario: 200.0,
                unidade: 'un',
            },
        }),
        prisma.orcamentoItem.create({
            data: {
                orcamento_id: orcBosch.id,
                item_tipo: 'servico',
                servico_id: svcFresagem.id,
                quantidade: 2,
                valor_unitario: 60.0,
                unidade: 'h',
            },
        }),
    ]);

    // ------------------------------------------------------------------
    // 14. Notas de pedido
    // ------------------------------------------------------------------
    console.log('A inserir notas de pedido...');
    await Promise.all([
        prisma.notaPedido.create({
            data: {
                pedido_id: pedEfacec.id,
                colaborador_dm_id: carlos.id,
                data: new Date('2026-01-17'),
                nota: 'Cliente confirmou dimensões por telefone. Avançar com produção.',
            },
        }),
        prisma.notaPedido.create({
            data: {
                pedido_id: pedEfacec.id,
                colaborador_dm_id: ana.id,
                data: new Date('2026-01-20'),
                nota: 'Orçamento já aprovado verbalmente. Fatura a emitir após entrega.',
            },
        }),
        prisma.notaPedido.create({
            data: {
                pedido_id: pedRenova.id,
                colaborador_dm_id: ana.id,
                data: new Date('2026-02-07'),
                nota: 'Enviado orçamento ORC-2026-001 por email. Aguardar aprovação.',
            },
        }),
    ]);

    console.log('\nSeed concluído com sucesso!');
    console.log(`  ${15} matérias-prima`);
    console.log(`  ${3} empresas  |  ${2} particulares`);
    console.log(
        `  ${3} colaboradores externos  |  ${2} colaboradores internos`,
    );
    console.log(`  ${3} peças  |  ${3} serviços`);
    console.log(`  ${4} pedidos  |  ${2} ordens de trabalho`);
    console.log(`  ${2} orçamentos  |  ${4} itens de orçamento`);
    console.log(`  ${3} notas de pedido`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
