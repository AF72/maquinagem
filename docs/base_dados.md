# Esquema da Base de Dados Relacional

Este documento descreve o esquema SQL equivalente ao estado em memória
do protótipo. Pode ser usado para implementar a camada de persistência
com PostgreSQL, MySQL ou SQLite.

---

## Tabelas

### `empresas`

```sql
CREATE TABLE empresas (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  nif       VARCHAR(20)  UNIQUE,
  morada    VARCHAR(255),
  codigo_postal VARCHAR(20),
  localidade VARCHAR(100),
  email     VARCHAR(150),
  tel       VARCHAR(30),
  criado_em TIMESTAMP DEFAULT NOW()
);
```

---

### `colaboradores`

```sql
CREATE TABLE colaboradores (
  id         SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome       VARCHAR(150) NOT NULL,
  cargo      VARCHAR(100),
  email      VARCHAR(150),
  tel        VARCHAR(30),
  ativo      BOOLEAN DEFAULT TRUE,
  criado_em  TIMESTAMP DEFAULT NOW()
);
```

---

### `particulares`

```sql
CREATE TABLE particulares (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  cc        VARCHAR(20)  UNIQUE,   -- Cartão de Cidadão
  morada    VARCHAR(255),
  codigo_postal VARCHAR(20),
  localidade VARCHAR(100),
  email     VARCHAR(150),
  tel       VARCHAR(30),
  criado_em TIMESTAMP DEFAULT NOW()
);
```

---

### `dados_pedido`

```sql
CREATE TABLE dados_pedido (
  id               SERIAL PRIMARY KEY,
  ref              VARCHAR(30)  UNIQUE NOT NULL,
  equipamento      VARCHAR(100),
  orgao            VARCHAR(100),
  parte            VARCHAR(100),
  breve_descricao  VARCHAR(255),
  imagem           VARCHAR(255),
  ordem_compra     VARCHAR(50),
  data_rececao_oc  DATE,
  criado_em        TIMESTAMP DEFAULT NOW()
);
```

---

### `pedidos`

```sql
CREATE TABLE pedidos (
  id               SERIAL PRIMARY KEY,
  ref              VARCHAR(20)  UNIQUE NOT NULL,     -- PTYY-XXXX
  cliente_tipo     VARCHAR(20)  NOT NULL,             -- 'colaborador' | 'particular'
  colaborador_id   INTEGER REFERENCES colaboradores(id),
  particular_id    INTEGER REFERENCES particulares(id),
  dados_pedido_id  INTEGER NOT NULL REFERENCES dados_pedido(id),
  estado_pedido    VARCHAR(30)  NOT NULL DEFAULT 'Orçamentar',
  -- 'Orçamentar' | 'Pendente' | 'Produção' | 'Faturar' | 'Concluido' | 'Cancelado'
  data_pedido      DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes      TEXT,
  custo_liquido    NUMERIC(10,2),
  criado_em        TIMESTAMP DEFAULT NOW(),

  -- Garante que apenas um dos dois campos de cliente está preenchido
  CONSTRAINT chk_cliente CHECK (
    (cliente_tipo = 'colaborador' AND colaborador_id IS NOT NULL AND particular_id IS NULL)
    OR
    (cliente_tipo = 'particular' AND particular_id IS NOT NULL AND colaborador_id IS NULL)
  )
);
```

---

### `ordens_trabalho`

```sql
CREATE TABLE ordens_trabalho (
  id          SERIAL PRIMARY KEY,
  num         VARCHAR(20)  UNIQUE NOT NULL,    -- OTYY-XXXX
  pedido_id   INTEGER NOT NULL REFERENCES pedidos(id),
  operador    VARCHAR(150),
  estado      VARCHAR(30)  NOT NULL DEFAULT 'Em curso',
  -- 'Em curso' | 'Concluída' | 'Cancelada'
  prazo       DATE,
  mo_obra     NUMERIC(10,2) DEFAULT 0,         -- Custo de mão de obra (€)
  notas       TEXT,
  criado_em   TIMESTAMP DEFAULT NOW(),
  concluido_em TIMESTAMP
);
```

---

### `pecas`

```sql
CREATE TABLE pecas (
  id               SERIAL PRIMARY KEY,
  ref              VARCHAR(50) UNIQUE NOT NULL,  -- Ex: DM26-0001-000-00
  plano            VARCHAR(100),
  denominacao      VARCHAR(150) NOT NULL,
  orgao            VARCHAR(100),
  parte            VARCHAR(100),
  materia_prima_id INTEGER REFERENCES materia_prima(id),
  forma            VARCHAR(20) CHECK (forma IN ('quadrado', 'redondo_macico', 'redondo_oco')),
  comprimento      NUMERIC(10,2),               -- mm
  largura          NUMERIC(10,2),               -- mm (quadrado)
  altura           NUMERIC(10,2),               -- mm (quadrado)
  diametro_ext     NUMERIC(10,2),               -- mm (redondo)
  diametro_int     NUMERIC(10,2),               -- mm (redondo oco)
  nota_descritiva  TEXT,
  imagem           TEXT,                         -- base64 ou caminho
  criado_em        TIMESTAMP DEFAULT NOW()
);
```

---

### `pecas_pedidos`

```sql
CREATE TABLE pecas_pedidos (
  id         SERIAL PRIMARY KEY,
  peca_id    INTEGER NOT NULL REFERENCES pecas(id)   ON DELETE CASCADE,
  pedido_id  INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  UNIQUE (peca_id, pedido_id)
);
```

---

### `materia_prima`

```sql
CREATE TABLE materia_prima (
  id        SERIAL PRIMARY KEY,
  ref_wnr   VARCHAR(20),           -- Werkstoffnummer (designação alemã, ex: 1.0503)
  peso_esp  NUMERIC(6,3),          -- Peso específico (g/cm³)
  ref_din   VARCHAR(50),           -- Designação DIN
  ref_bs    VARCHAR(50),           -- Designação BS (British Standard)
  ref_afnor VARCHAR(50),           -- Designação AFNOR (francesa)
  ref_une   VARCHAR(50),           -- Designação UNE (espanhola)
  ref_aisi  VARCHAR(50),           -- Designação AISI (americana)
  ref_jis   VARCHAR(50),           -- Designação JIS (japonesa)
  tipo_tt   VARCHAR(150)           -- Tipo de tratamento térmico aplicável
);
```

---

### `servicos`

```sql
CREATE TABLE servicos (
  id               SERIAL PRIMARY KEY,
  ref              VARCHAR(50) UNIQUE NOT NULL, -- Código do serviço
  tipo_servico     VARCHAR(100) NOT NULL,
  descricao        TEXT,
  unidade          VARCHAR(20) DEFAULT 'un',
  criado_em        TIMESTAMP DEFAULT NOW()
);
```

---

### `orcamentos`

```sql
CREATE TABLE orcamentos (
  id               SERIAL PRIMARY KEY,
  pedido_id        INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  ref              VARCHAR(30) UNIQUE NOT NULL, -- Ex: ORC2026-001
  data_emissao     DATE DEFAULT CURRENT_DATE,
  data_validade    DATE,
  estado           VARCHAR(20) DEFAULT 'Pendente', -- 'Pendente' | 'Aprovado' | 'Rejeitado'
  ativo            BOOLEAN DEFAULT FALSE,
  total_liquido    NUMERIC(12,2) DEFAULT 0,
  observacoes      TEXT,
  criado_em        TIMESTAMP DEFAULT NOW()
);

-- Garante apenas 1 orçamento ativo por pedido
CREATE UNIQUE INDEX idx_unico_orcamento_ativo ON orcamentos (pedido_id) WHERE (ativo = TRUE);
```

---

### `orcamento_itens`

```sql
CREATE TABLE orcamento_itens (
  id               SERIAL PRIMARY KEY,
  orcamento_id     INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  item_tipo        VARCHAR(20) NOT NULL,        -- 'peca' | 'servico'
  peca_id          INTEGER REFERENCES pecas(id),
  servico_id       INTEGER REFERENCES servicos(id),
  quantidade       NUMERIC(10,2) NOT NULL DEFAULT 1,
  valor_unitario   NUMERIC(12,2) NOT NULL DEFAULT 0,
  unidade          VARCHAR(20),
  subtotal         NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  CONSTRAINT chk_item_tipo CHECK (
    (item_tipo = 'peca' AND peca_id IS NOT NULL AND servico_id IS NULL) OR
    (item_tipo = 'servico' AND servico_id IS NOT NULL AND peca_id IS NULL)
  )
);
```

---

## Diagrama de relações (simplificado)

```
empresas ──< colaboradores >──┐
                               ├──> pedidos >──> ordens_trabalho
particulares >─────────────────┘         │
                                         └──< orcamentos ──< orcamento_itens
                                                                  │
                                         ┌────────────────────────┤
                                         ▼                        ▼
                                       pecas                   servicos

materia_prima  (tabela de referência independente — pode ser referenciada por pecas.material)
```

---

## Índices recomendados

```sql
CREATE INDEX idx_colaboradores_empresa ON colaboradores(empresa_id);
CREATE INDEX idx_pedidos_colab         ON pedidos(colaborador_id);
CREATE INDEX idx_pedidos_particular    ON pedidos(particular_id);
CREATE INDEX idx_pedidos_estado        ON pedidos(estado_pedido);
CREATE INDEX idx_ordens_pedido         ON ordens_trabalho(pedido_id);
CREATE INDEX idx_orcamentos_pedido     ON orcamentos(pedido_id);
CREATE INDEX idx_orc_itens_orc         ON orcamento_itens(orcamento_id);
CREATE INDEX idx_pecas_pedidos_peca    ON pecas_pedidos(peca_id);
CREATE INDEX idx_pecas_pedidos_pedido  ON pecas_pedidos(pedido_id);
CREATE INDEX idx_pecas_material        ON pecas(materia_prima_id);
```

---

## Views úteis

### Vista de pedidos com cliente resolvido

```sql
CREATE VIEW v_pedidos AS
SELECT
  p.id, p.ref, p.estado_pedido, p.data_pedido,
  dp.equipamento, dp.orgao, dp.parte,
  CASE p.cliente_tipo
    WHEN 'colaborador' THEN c.nome
    WHEN 'particular'  THEN pt.nome
  END AS cliente_nome,
  CASE p.cliente_tipo
    WHEN 'colaborador' THEN e.nome
    WHEN 'particular'  THEN 'Particular'
  END AS empresa_nome,
  p.cliente_tipo
FROM pedidos p
LEFT JOIN colaboradores c  ON c.id  = p.colaborador_id
LEFT JOIN empresas      e  ON e.id  = c.empresa_id
LEFT JOIN particulares  pt ON pt.id = p.particular_id
JOIN      dados_pedido  dp ON dp.id = p.dados_pedido_id;
```

### Vista de custo por ordem

```sql
CREATE VIEW v_custos_ordens AS
SELECT
  ot.num, ot.estado, ot.mo_obra,
  dp.equipamento AS peca, p.custo_liquido,
  vp.cliente_nome, vp.empresa_nome, vp.cliente_tipo
FROM ordens_trabalho ot
JOIN v_pedidos vp ON vp.id = ot.pedido_id
JOIN pedidos   p  ON p.id  = ot.pedido_id
JOIN dados_pedido dp ON dp.id = p.dados_pedido_id;
```
