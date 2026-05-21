# Diagrama de Relações — MaquinaGest

```mermaid
erDiagram

    empresas {
        int id PK
        varchar nome
        varchar nif UK
        varchar morada
        varchar codigo_postal
        varchar localidade
        varchar email
        varchar tel
        timestamp criado_em
    }

    colaboradores {
        int id PK
        int empresa_id FK
        varchar nome
        varchar cargo
        varchar email
        varchar tel
        boolean ativo
        timestamp criado_em
    }

    particulares {
        int id PK
        varchar nome
        varchar cc UK
        varchar morada
        varchar codigo_postal
        varchar localidade
        varchar email
        varchar tel
        timestamp criado_em
    }

    dados_pedido {
        int id PK
        varchar ref
        varchar equipamento
        varchar orgao
        varchar parte
        varchar breve_descricao
        text imagem
        varchar tipo_contacto
        varchar ordem_compra
        date data_rececao_oc
        timestamp criado_em
    }

    pedidos {
        int id PK
        varchar ref UK
        varchar cliente_tipo
        int colaborador_id FK
        int particular_id FK
        int dados_pedido_id FK
        varchar estado_pedido
        date data_pedido
        text observacoes
        decimal custo_liquido
        timestamp criado_em
    }

    ordens_trabalho {
        int id PK
        varchar num UK
        int pedido_id FK
        varchar estado
        int prazo
        decimal mo_obra
        text notas
        date data_limite_entrega
        varchar n_gt
        varchar n_ft
        text observacoes
        timestamp criado_em
        timestamp concluido_em
    }

    materia_prima {
        int id PK
        varchar ref_wnr
        decimal peso_esp
        varchar ref_din
        varchar ref_bs
        varchar ref_afnor
        varchar ref_une
        varchar ref_aisi
        varchar ref_jis
        varchar tipo_tt
    }

    pecas {
        int id PK
        varchar ref UK
        varchar plano
        varchar denominacao
        varchar orgao
        varchar parte
        int materia_prima_id FK
        varchar forma
        decimal comprimento
        decimal largura
        decimal altura
        decimal diametro_ext
        decimal diametro_int
        text nota_descritiva
        text imagem
        timestamp criado_em
    }

    pecas_pedidos {
        int id PK
        int peca_id FK
        int pedido_id FK
    }

    servicos {
        int id PK
        varchar ref UK
        varchar tipo_servico
        text descricao
        varchar unidade
        timestamp criado_em
    }

    servicos_pedidos {
        int id PK
        int servico_id FK
        int pedido_id FK
        int fornecedor_id FK
        decimal quantidade
        decimal preco_unitario
        timestamp criado_em
    }

    orcamentos {
        int id PK
        int pedido_id FK
        varchar ref UK
        date data_emissao
        date data_validade
        varchar estado
        boolean ativo
        decimal total_liquido
        text observacoes
        text notas
        timestamp criado_em
    }

    orcamento_itens {
        int id PK
        int orcamento_id FK
        varchar item_tipo
        int peca_id FK
        int servico_id FK
        decimal quantidade
        decimal valor_unitario
        varchar unidade
    }

    colaboradores_dm {
        int id PK
        varchar nome
        varchar funcao
        varchar contacto
        varchar estado
        timestamp criado_em
    }

    notas_pedido {
        int id PK
        int pedido_id FK
        int colaborador_dm_id FK
        date data
        text nota
        timestamp criado_em
    }

    fornecedores {
        int id PK
        varchar nome
        varchar nif UK
        varchar morada
        varchar codigo_postal
        varchar localidade
        varchar pessoa_contacto
        varchar email
        varchar telf
        timestamp criado_em
    }

    historico_precos {
        int id PK
        int peca_id FK
        int pedido_id FK
        int fornecedor_id FK
        decimal preco_compra
        decimal preco_venda
        timestamp data
    }

    pedidos_fornecedores {
        int id PK
        int pedido_id FK
        int fornecedor_id FK
    }

    %% Clientes → Pedidos
    empresas          ||--o{ colaboradores       : "tem"
    colaboradores     |o--o{ pedidos             : "faz pedido"
    particulares      |o--o{ pedidos             : "faz pedido"

    %% Dados técnicos → Pedidos
    dados_pedido      ||--o{ pedidos             : "descreve"

    %% Pedido → filhos directos
    pedidos           ||--o{ ordens_trabalho     : "gera"
    pedidos           ||--o{ orcamentos          : "tem"
    pedidos           ||--o{ notas_pedido        : "tem"
    pedidos           ||--o{ pecas_pedidos       : "inclui peças"
    pedidos           ||--o{ servicos_pedidos    : "inclui serviços"
    pedidos           ||--o{ pedidos_fornecedores: "envolve"
    pedidos           ||--o{ historico_precos    : "regista preços"

    %% Orçamento → Itens
    orcamentos        ||--o{ orcamento_itens     : "contém"

    %% Peças
    materia_prima     ||--o{ pecas              : "material de"
    pecas             ||--o{ pecas_pedidos      : "associada a"
    pecas             ||--o{ orcamento_itens    : "cotada em"
    pecas             ||--o{ historico_precos   : "tem histórico"

    %% Serviços
    servicos          ||--o{ orcamento_itens    : "cotado em"
    servicos          ||--o{ servicos_pedidos   : "associado a"

    %% Fornecedores
    fornecedores      ||--o{ servicos_pedidos   : "fornece"
    fornecedores      ||--o{ pedidos_fornecedores: "associado a"
    fornecedores      ||--o{ historico_precos   : "fornece"

    %% Equipa interna (DM) → Notas
    colaboradores_dm  ||--o{ notas_pedido       : "escreve"
```

## Legenda das relações

| Símbolo | Significado |
|---------|-------------|
| `\|\|` | Exactamente um (obrigatório) |
| `\|o` | Zero ou um (opcional) |
| `o{` | Zero ou muitos |
| `\|{` | Um ou muitos |

## Tabelas de ligação (N:M)

| Tabela | Liga |
|--------|------|
| `pecas_pedidos` | `pecas` ↔ `pedidos` |
| `servicos_pedidos` | `servicos` ↔ `pedidos` (+ fornecedor opcional) |
| `pedidos_fornecedores` | `pedidos` ↔ `fornecedores` |
| `orcamento_itens` | `orcamentos` ↔ `pecas` ou `servicos` |
| `historico_precos` | `pecas` ↔ `pedidos` (+ fornecedor opcional) |

## Nota sobre clientes

`pedidos.cliente_tipo` determina qual FK está preenchida:
- `'colaborador'` → `colaborador_id` preenchido, `particular_id` NULL
- `'particular'` → `particular_id` preenchido, `colaborador_id` NULL

`colaboradores_dm` são a **equipa interna** da oficina — não são clientes.
