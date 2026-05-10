/**
 * data.js
 * -------------------------------------------------
 * Estado global da aplicação (substitui base de dados
 * em memória para este protótipo).
 *
 * Em produção, cada objeto aqui corresponde a uma
 * tabela na base de dados relacional (ver docs/).
 * -------------------------------------------------
 */

const DB = {
    /** Empresas clientes */
    empresas: [
        {
            id: 1,
            nome: 'Faurecia, SEP, Bragança',
            nif: '505261090',
            morada: 'Estr. do Aeroporto Santa Maria',
            codigo_postal: '5301-902',
            localidade: 'Bragança',
            email: '',
            tel: '',
        },
        {
            id: 2,
            nome: 'KOENIG MODULO PORTUGAL',
            nif: '514171588',
            morada: 'Zona Ind. de Mós, Lt. nº2',
            codigo_postal: '5300-692',
            localidade: 'Bragança',
            email: '',
            tel: '',
        },
    ],

    /** Colaboradores das empresas */
    colaboradores: [
        {
            id: 1,
            empresaId: 1,
            nome: 'Celso Ferreira',
            cargo: 'Engenharia de Produto',
            email: 'celso.ferreira@forvia.com',
            tel: '962309437',
            ativo: true,
        },
        {
            id: 2,
            empresaId: 1,
            nome: 'André Abél',
            cargo: 'Engenheiro',
            email: 'celso.ferreira@forvia.com',
            tel: '963233405',
            ativo: false,
        },
        {
            id: 3,
            empresaId: 2,
            nome: 'Michele Giorgi',
            cargo: 'Manutenção',
            email: 'michelegiorgi@modulonet.com',
            tel: '916664080',
            ativo: true,
        },
    ],

    /** Clientes particulares (sem empresa) */
    particulares: [
        {
            id: 1,
            nome: 'Carla Matos',
            cc: '12345678',
            morada: 'Rua Nova, 8',
            codigo_postal: '4800-001',
            localidade: 'Guimarães',
            email: 'carla@gmail.com',
            tel: '965000111',
        },
        {
            id: 2,
            nome: 'Diogo Reis',
            cc: '87654321',
            morada: 'Av. das Flores, 22',
            codigo_postal: '4700-001',
            localidade: 'Braga',
            email: 'dreis@gmail.com',
            tel: '961222333',
        },
    ],

    /**
     * Catálogo de Dados do Pedido
     */
    dados_pedido: [
        {
            id: 1,
            ref: 'EFM-001',
            equipamento: 'Calibradora',
            orgao: 'Base',
            parte: 'Matriz',
            breveDescricao: 'Retificar matriz',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
        {
            id: 2,
            ref: 'DOB-001',
            equipamento: 'Dobradora',
            orgao: 'Matriz',
            parte: 'Cone de apoio',
            breveDescricao: 'Retificar cone de apoio',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
        {
            id: 3,
            ref: 'DP-003',
            equipamento: 'Prensa 500T',
            orgao: 'Matriz',
            parte: 'Casquilho guia',
            breveDescricao: 'Casquilho em bronze para guia do êmbolo',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
        {
            id: 4,
            ref: 'DP-004',
            equipamento: 'Injetora PL',
            orgao: 'Molde',
            parte: 'Placa extratora',
            breveDescricao: 'Placa com furação especial para novos pinos',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
        {
            id: 5,
            ref: 'EFM-002',
            equipamento: 'Calibradora',
            orgao: 'Base',
            parte: 'Matriz',
            breveDescricao: 'Retificar matriz (Segunda intervenção)',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
        {
            id: 6,
            ref: 'DOB-002',
            equipamento: 'Dobradora',
            orgao: 'Matriz',
            parte: 'Cone de apoio',
            breveDescricao: 'Retificar cone de apoio (Urgente)',
            imagem: '',
            tipo_contacto: '',
            ordem_compra: '',
            data_rececao_oc: '',
        },
    ],

    /**
     * Pedidos
     * clienteTipo: 'colaborador' | 'particular'
     * estado: 'Pendente' | 'Em produção' | 'Concluído' | 'Cancelado'
     */
    pedidos: [
        {
            id: 1,
            ref: 'PT26-0001',
            clienteTipo: 'colaborador',
            clienteId: 1,
            dadosPedidoId: 1,
            ordemTrabalhoId: 1,
            estado_pedido: 'Cancelado',
            data: '2025-04-10',
            custo_liquido: '',
        },
        {
            id: 2,
            ref: 'PT26-0002',
            clienteTipo: 'colaborador',
            clienteId: 3,
            dadosPedidoId: 2,
            estado_pedido: 'Pendente',
            data: '2025-04-15',
            custo_liquido: '',
        },
        {
            id: 3,
            ref: 'PT26-0003',
            clienteTipo: 'particular',
            clienteId: 1,
            dadosPedidoId: 3,
            ordemTrabalhoId: 2,
            estado_pedido: 'Concluido',
            data: '2025-04-05',
            custo_liquido: '',
        },
        {
            id: 4,
            ref: 'PT26-0004',
            clienteTipo: 'colaborador',
            clienteId: 2,
            dadosPedidoId: 4,
            ordemTrabalhoId: 3,
            estado_pedido: 'Produção',
            data: '2025-04-18',
            custo_liquido: '',
        },
        {
            id: 5,
            ref: 'PT26-0005',
            clienteTipo: 'particular',
            clienteId: 2,
            dadosPedidoId: 5,
            estado_pedido: 'Orçamentar',
            data: '2025-04-20',
            custo_liquido: '',
        },
        {
            id: 6,
            ref: 'PT26-0006',
            clienteTipo: 'colaborador',
            clienteId: 1,
            dadosPedidoId: 6,
            estado_pedido: 'Faturar',
            data: '2025-04-22',
            custo_liquido: '',
        },
    ],

    /**
     * Ordens de trabalho
     * estado: 'Em curso' | 'Concluída' | 'Cancelada'
     */
    ordens: [
        {
            id: 2,
            num: 'OT26-0002',
            pedidoId: 3,
            operador: 'Sofia Lima',
            estado: 'Concluída',
            prazo: '2025-04-08',
            moObra: 60,
        },
        {
            id: 3,
            num: 'OT26-0003',
            pedidoId: 4,
            operador: 'Miguel Costa',
            estado: 'Em curso',
            prazo: '2025-05-05',
            moObra: 200,
        },
    ],

    /**
     * Orçamentos
     * Um orçamento por pedido (relação um-para-um)
     * estado: 'Pendente' | 'Aprovado' | 'Rejeitado'
     */
    orcamentos: [],

    /**
     * Peças
     * pedidoId guarda o pedido de origem (usado na geração da referência).
     * As associações efectivas pedido↔peça estão em pecas_pedidos.
     */
    pecas: [],

    /**
     * Tabela de junção peça ↔ pedido
     * Permite que uma peça seja associada a múltiplos pedidos.
     * { id, pecaId, pedidoId }
     */
    pecas_pedidos: [],

    /**
     * Itens de orçamento — histórico de preços por peça por orçamento.
     * { id, orcamentoId, pecaId, precoUnitario, quantidade, subtotal }
     */
    orcamento_itens: [],

    /**
     * Catálogo de Matéria-Prima
     * Referências cruzadas pelas normas internacionais mais comuns.
     */
    materia_prima: [
        { id: 1, ref_wnr: '1.0503', peso_esp: 7.85, ref_din: 'C45',          ref_bs: '080M46',  ref_afnor: 'C45',       ref_une: 'C45k',       ref_aisi: '1045',  ref_jis: 'S45C',   tipo_tt: 'Têmpera e revenido' },
        { id: 2, ref_wnr: '1.7225', peso_esp: 7.85, ref_din: '42CrMo4',    ref_bs: '708M40',  ref_afnor: '42CD4',     ref_une: '42CrMo4',    ref_aisi: '4140',  ref_jis: 'SCM440', tipo_tt: 'Têmpera e revenido' },
        { id: 3, ref_wnr: '1.7131', peso_esp: 7.85, ref_din: '16MnCr5',    ref_bs: '527M20',  ref_afnor: '16MC5',     ref_une: '16MnCr5',    ref_aisi: '5115',  ref_jis: 'SMnC420', tipo_tt: 'Cementação e têmpera' },
        { id: 4, ref_wnr: '1.3505', peso_esp: 7.81, ref_din: '100Cr6',     ref_bs: '535A99',  ref_afnor: '100C6',     ref_une: 'F.131',      ref_aisi: '52100', ref_jis: 'SUJ2',   tipo_tt: 'Têmpera e revenido' },
        { id: 5, ref_wnr: '1.0037', peso_esp: 7.85, ref_din: 'St37-2',     ref_bs: '040A10',  ref_afnor: 'A37-2',     ref_une: 'AE235-B',    ref_aisi: 'A36',   ref_jis: 'SS400',  tipo_tt: '' },
        { id: 6, ref_wnr: '1.1191', peso_esp: 7.85, ref_din: 'C45E',       ref_bs: '080M46',  ref_afnor: 'XC45',      ref_une: 'C45E',       ref_aisi: '1045',  ref_jis: 'S45C',   tipo_tt: 'Têmpera e revenido' },
        { id: 7, ref_wnr: '1.2379', peso_esp: 7.70, ref_din: 'X153CrMoV12', ref_bs: 'BD3',   ref_afnor: 'Z160CDV12', ref_une: 'X153CrMoV12', ref_aisi: 'D2',   ref_jis: 'SKD11',  tipo_tt: 'Têmpera em óleo e revenido' },
        { id: 8,  ref_wnr: '1.2311', peso_esp: 7.85, ref_din: '40CrMnMo7',          ref_bs: '-',       ref_afnor: '40CMD8',    ref_une: '40CrMnMo7',  ref_aisi: 'P20',   ref_jis: 'PX5',    tipo_tt: 'Pré-temperado (fornecido pronto)' },

        // Alumínios
        { id: 9,  ref_wnr: '3.2315', peso_esp: 2.71, ref_din: 'EN AW-6082 / AlSi1MgMn', ref_bs: 'HE30',    ref_afnor: 'A-SGM0.7',  ref_une: 'L-3341',     ref_aisi: '6082',  ref_jis: 'A6082',  tipo_tt: 'Solubilização e envelhecimento (T6)' },
        { id: 10, ref_wnr: '3.4365', peso_esp: 2.81, ref_din: 'EN AW-7075 / AlZn5.5MgCu', ref_bs: 'DTD5024', ref_afnor: 'A-Z5GU',  ref_une: 'L-3372',     ref_aisi: '7075',  ref_jis: 'A7075',  tipo_tt: 'Solubilização e envelhecimento (T651)' },
        { id: 11, ref_wnr: '3.1355', peso_esp: 2.78, ref_din: 'EN AW-2024 / AlCu4Mg1',      ref_bs: 'L97',     ref_afnor: 'A-U4G1',   ref_une: 'L-3312',  ref_aisi: '2024',  ref_jis: 'A2024',  tipo_tt: 'Solubilização e envelhecimento (T4/T351)' },
        { id: 15, ref_wnr: '3.3547', peso_esp: 2.66, ref_din: 'EN AW-5083 / AlMg4.5Mn0.7', ref_bs: 'N8',      ref_afnor: 'A-G4.5MC',  ref_une: 'L-3345',  ref_aisi: '5083',  ref_jis: 'A5083',  tipo_tt: 'Sem tratamento térmico (endurecimento por deformação H111/H321)' },

        // Polímeros
        { id: 12, ref_wnr: '-', peso_esp: 1.14, ref_din: 'PA 6.6 (ISO 1874)',  ref_bs: 'BS 6089', ref_afnor: '-', ref_une: '-', ref_aisi: '-', ref_jis: 'JIS K 6920', tipo_tt: 'Sem tratamento térmico (termoplástico)' },
        { id: 13, ref_wnr: '-', peso_esp: 1.41, ref_din: 'POM-C (ISO 9988)',   ref_bs: '-',       ref_afnor: '-', ref_une: '-', ref_aisi: '-', ref_jis: '-',          tipo_tt: 'Sem tratamento térmico (termoplástico)' },
        { id: 14, ref_wnr: '-', peso_esp: 2.20, ref_din: 'PTFE (ISO 13000)',   ref_bs: '-',       ref_afnor: '-', ref_une: '-', ref_aisi: '-', ref_jis: '-',          tipo_tt: 'Sem tratamento térmico (termoplástico)' },
    ],

    /** UI state */
    expanded: {}, // chave: 'e<empresaId>' → boolean
    clienteFilter: 'todos',
};
