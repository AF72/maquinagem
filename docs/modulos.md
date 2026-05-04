# Descrição dos Módulos

## 1. Módulo de Clientes (`pages/clientes.js`)

Gere todos os clientes da empresa, divididos em dois tipos:

### Empresa
- Tem NIF, morada, email e telefone corporativo
- Pode ter zero ou mais **colaboradores** associados
- Qualquer colaborador pode submeter pedidos em nome da empresa
- Na lista, cada empresa é expansível (▸) para ver os colaboradores

### Particular
- Pessoa singular com Cartão de Cidadão
- Faz pedidos diretamente, sem intermediários
- Identificado por nome, CC, email, telefone e morada

**Filtros disponíveis:** Todos | Empresas | Particulares

---

## 2. Módulo de Pedidos (`pages/pedidos.js`)

Registo de intenções de encomenda, antes de avançarem para produção.

**Campos:**
- Referência automática (PD-XXXX)
- Solicitado por: colaborador de empresa ou particular
- Peça selecionada do catálogo
- Quantidade
- Data do pedido
- Estado: `Pendente` → `Em produção` → `Concluído`

**Fluxo:** Um pedido com estado `Pendente` pode ser convertido em Ordem de Trabalho com o botão "Criar OT". O estado passa automaticamente para `Em produção`.

---

## 3. Módulo de Ordens de Trabalho (`pages/ordens.js`)

Representa o trabalho efetivo na oficina/fábrica.

**Campos:**
- Número da ordem (OT-XXXX)
- Pedido de origem
- Operador responsável
- Prazo de entrega
- Custo de mão de obra (€)
- Estado: `Em curso` → `Concluída`

**Fluxo:** Ao concluir uma ordem, o pedido associado é automaticamente marcado como `Concluído`.

---

## 4. Módulo de Peças (`pages/pecas.js`)

Catálogo de peças que a empresa produz.

**Campos:**
- Referência interna (P-XXX)
- Designação / nome da peça
- Material: Aço | Alumínio | Cobre | Polímero | Inox
- Espessura
- Peso (kg)
- Acabamento superficial
- Custo unitário de produção (€)

---

## 5. Módulo de Custos (`pages/custos.js`)

Análise financeira das ordens de trabalho.

**Cálculo por ordem:**
```
Custo de material = custo_unitário_peça × quantidade
Total             = custo_material + mão_de_obra
```

**Métricas apresentadas:**
- Custo total estimado (todas as ordens)
- Custo médio por ordem
- Número de ordens concluídas

**Gráfico:** Custo acumulado por tipo de material (barras).

---

## 6. Módulo Dashboard (`pages/dashboard.js`)

Visão geral do estado atual da empresa.

**Métricas:**
- Número de empresas clientes
- Número de colaboradores registados
- Número de clientes particulares
- Ordens ativas (em curso)
- Faturação estimada das ordens em curso

**Gráficos:**
- Donut: ordens por estado (Em curso / Concluída / Cancelada)
- Donut: pedidos por tipo de cliente (Empresa vs Particular)

**Tabela:** Últimas ordens de trabalho com cliente, tipo, peça, estado e prazo.

---

## 7. Módulo Modal (`modal.js`)

Componente de diálogo genérico usado em todos os formulários de criação.

**Formulários disponíveis:**
- `novoCliente` — toggle entre Empresa e Particular
- `colaborador` — adicionar colaborador a uma empresa existente
- `pedido` — novo pedido (lista todos os colaboradores e particulares)
- `peca` — nova peça no catálogo

---

## 8. Dados e Estado (`data.js`)

Armazena todo o estado da aplicação em memória (substituir por API + BD em produção).

**Entidades:**
- `DB.empresas` — empresas clientes
- `DB.colaboradores` — colaboradores das empresas
- `DB.particulares` — clientes particulares
- `DB.pecas` — catálogo de peças
- `DB.pedidos` — pedidos de clientes
- `DB.ordens` — ordens de trabalho

---

## 9. Utilitários (`helpers.js`)

Funções partilhadas por todos os módulos:

| Função              | Descrição                                      |
|---------------------|------------------------------------------------|
| `getEmpresa(id)`    | Lookup de empresa por id                       |
| `getColab(id)`      | Lookup de colaborador por id                   |
| `getParticular(id)` | Lookup de particular por id                    |
| `getPeca(id)`       | Lookup de peça por id                          |
| `getPedido(id)`     | Lookup de pedido por id                        |
| `resolveCliente()`  | Resolve nome/avatar de qualquer tipo de cliente|
| `estadoBadge()`     | Gera HTML do badge de estado                   |
| `tipoBadge()`       | Gera HTML do badge Empresa/Particular          |
| `avatarHtml()`      | Gera HTML do avatar circular                   |
| `initials()`        | Extrai iniciais de um nome                     |
| `today()`           | Data de hoje em formato ISO                    |
| `addDays(n)`        | Data de hoje + N dias                          |
