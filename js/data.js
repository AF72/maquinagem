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
    { id: 1, nome: 'MetalTec Lda',     nif: '123456789', morada: 'Rua das Indústrias, 45, Braga', email: 'geral@metaltec.pt', tel: '253100200' },
    { id: 2, nome: 'Construções BS',   nif: '234567890', morada: 'Av. Central, 12, Porto',        email: 'geral@bs.pt',       tel: '222300100' },
  ],

  /** Colaboradores das empresas */
  colaboradores: [
    { id: 1, empresaId: 1, nome: 'Ana Ferreira',  cargo: 'Diretora técnica',  email: 'ana@metaltec.pt',  tel: '912345678' },
    { id: 2, empresaId: 1, nome: 'Ricardo Lima',  cargo: 'Engenheiro',         email: 'rlima@metaltec.pt', tel: '913000111' },
    { id: 3, empresaId: 2, nome: 'Bruno Sousa',   cargo: 'Gestor',             email: 'bruno@bs.pt',      tel: '933211000' },
  ],

  /** Clientes particulares (sem empresa) */
  particulares: [
    { id: 1, nome: 'Carla Matos', cc: '12345678', morada: 'Rua Nova, 8, Guimarães',      email: 'carla@gmail.com', tel: '965000111' },
    { id: 2, nome: 'Diogo Reis',  cc: '87654321', morada: 'Av. das Flores, 22, Braga',   email: 'dreis@gmail.com', tel: '961222333' },
  ],

  /**
   * Catálogo de Dados do Pedido
   */
  dados_pedido: [
    { id: 1, ref: 'DP-001', equipamento: 'Torno CNC', orgao: 'Cabeçote', parte: 'Flange Frontal', breveDescricao: 'Substituição de flange por desgaste mecânico', imagem: '' },
    { id: 2, ref: 'DP-002', equipamento: 'Fresa Universal', orgao: 'Mesa', parte: 'Apoio lateral', breveDescricao: 'Apoio para fixação de peças de grande porte', imagem: '' },
    { id: 3, ref: 'DP-003', equipamento: 'Prensa 500T', orgao: 'Matriz', parte: 'Casquilho guia', breveDescricao: 'Casquilho em bronze para guia do êmbolo', imagem: '' },
    { id: 4, ref: 'DP-004', equipamento: 'Injetora PL', orgao: 'Molde', parte: 'Placa extratora', breveDescricao: 'Placa com furação especial para novos pinos', imagem: '' },
  ],

  /**
   * Pedidos
   * clienteTipo: 'colaborador' | 'particular'
   * estado: 'Pendente' | 'Em produção' | 'Concluído' | 'Cancelado'
   */
  pedidos: [
    { id: 1, ref: 'PD26-0001', clienteTipo: 'colaborador', clienteId: 1, dadosPedidoId: 1, qtd: 10, estado: 'Em produção', data: '2025-04-10' },
    { id: 2, ref: 'PD26-0002', clienteTipo: 'colaborador', clienteId: 3, dadosPedidoId: 2, qtd: 25, estado: 'Pendente',    data: '2025-04-15' },
    { id: 3, ref: 'PD26-0003', clienteTipo: 'particular',  clienteId: 1, dadosPedidoId: 3, qtd:  2, estado: 'Concluído',  data: '2025-04-05' },
    { id: 4, ref: 'PD26-0004', clienteTipo: 'colaborador', clienteId: 2, dadosPedidoId: 4, qtd: 50, estado: 'Em produção', data: '2025-04-18' },
    { id: 5, ref: 'PD26-0005', clienteTipo: 'particular',  clienteId: 2, dadosPedidoId: 1, qtd:  1, estado: 'Pendente',   data: '2025-04-20' },
  ],

  /**
   * Ordens de trabalho
   * estado: 'Em curso' | 'Concluída' | 'Cancelada'
   */
  ordens: [
    { id: 1, num: 'OT-0001', pedidoId: 1, operador: 'Miguel Costa', estado: 'Em curso',  prazo: '2025-04-30', moObra: 120 },
    { id: 2, num: 'OT-0002', pedidoId: 3, operador: 'Sofia Lima',   estado: 'Concluída', prazo: '2025-04-08', moObra:  60 },
    { id: 3, num: 'OT-0003', pedidoId: 4, operador: 'Miguel Costa', estado: 'Em curso',  prazo: '2025-05-05', moObra: 200 },
  ],

  /** UI state */
  expanded: {},   // chave: 'e<empresaId>' → boolean
  clienteFilter: 'todos',
};
