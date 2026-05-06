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
  criado_em        TIMESTAMP DEFAULT NOW()
);
```

---

### `pedidos`

```sql
CREATE TABLE pedidos (
  id               SERIAL PRIMARY KEY,
  ref              VARCHAR(20)  UNIQUE NOT NULL,     -- PDYY-XXXX
  cliente_tipo     VARCHAR(20)  NOT NULL,             -- 'colaborador' | 'particular'
  colaborador_id   INTEGER REFERENCES colaboradores(id),
  particular_id    INTEGER REFERENCES particulares(id),
  dados_pedido_id  INTEGER NOT NULL REFERENCES dados_pedido(id),
  estado           VARCHAR(30)  NOT NULL DEFAULT 'Pendente',
  -- 'Pendente' | 'Em produção' | 'Concluído' | 'Cancelado'
  data_pedido      DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes      TEXT,
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

## Diagrama de relações (simplificado)

```
empresas ──< colaboradores >──┐
                               ├──> pedidos >──> ordens_trabalho
particulares >─────────────────┘
                                        ↑
pecas ──────────────────────────────────┘
```

---

## Índices recomendados

```sql
CREATE INDEX idx_colaboradores_empresa ON colaboradores(empresa_id);
CREATE INDEX idx_pedidos_colab         ON pedidos(colaborador_id);
CREATE INDEX idx_pedidos_particular    ON pedidos(particular_id);
CREATE INDEX idx_pedidos_estado        ON pedidos(estado);
CREATE INDEX idx_ordens_pedido         ON ordens_trabalho(pedido_id);
CREATE INDEX idx_ordens_estado         ON ordens_trabalho(estado);
```

---

## Views úteis

### Vista de pedidos com cliente resolvido

```sql
CREATE VIEW v_pedidos AS
SELECT
  p.id, p.ref, p.estado, p.data_pedido,
  pc.nome   AS peca_nome, pc.material, pc.custo_unit,
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
JOIN      pecas         pc ON pc.id = p.peca_id;
```

### Vista de custo por ordem

```sql
CREATE VIEW v_custos_ordens AS
SELECT
  ot.num, ot.estado, ot.mo_obra,
  pc.nome   AS peca, pc.material,
  pc.custo_unit,
  pc.custo_unit          AS custo_material,
  (pc.custo_unit + ot.mo_obra) AS custo_total,
  vp.cliente_nome, vp.empresa_nome, vp.cliente_tipo
FROM ordens_trabalho ot
JOIN v_pedidos vp ON vp.id = ot.pedido_id
JOIN pecas     pc ON pc.id = vp.peca_id; -- já está em vp, mas explicitamos
```
