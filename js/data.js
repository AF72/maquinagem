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

    /** UI state */
    expanded: {}, // chave: 'e<empresaId>' → boolean
    clienteFilter: 'todos',
};
