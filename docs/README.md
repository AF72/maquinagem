# MaquinaGest — Sistema de Gestão de Produção

Sistema web para gestão de produção de peças e equipamentos numa empresa de maquinação.
Desenvolvido em HTML + CSS + JavaScript puro, sem frameworks ou dependências de servidor.

---

## Como abrir

1. Extraia o ficheiro ZIP
2. Abra o ficheiro `index.html` diretamente no browser (Chrome, Firefox, Edge)
3. Não é necessário instalar nada nem ter ligação à internet (excepto Chart.js via CDN)

> **Nota:** Para produção real, recomenda-se um servidor web (Apache, Nginx, Node.js)
> e uma base de dados relacional (ver secção "Evolução para produção").

---

## Estrutura de ficheiros

```
maquinagem/
│
├── index.html              ← Ponto de entrada da aplicação
│
├── css/
│   ├── base.css            ← Reset, variáveis CSS, tipografia
│   ├── layout.css          ← Sidebar, topbar, grid de páginas
│   ├── components.css      ← Botões, cards, tabelas, badges, avatares
│   └── modal.css           ← Overlay e formulários do modal
│
├── js/
│   ├── data.js             ← Estado global / base de dados em memória
│   ├── helpers.js          ← Funções utilitárias partilhadas
│   ├── modal.js            ← Lógica do modal (abertura, fecho, formulários, save)
│   ├── app.js              ← Router de páginas e inicialização
│   │
│   └── pages/
│       ├── dashboard.js    ← Dashboard com métricas e gráficos
│       ├── clientes.js     ← Gestão de empresas, colaboradores e particulares
│       ├── pedidos.js      ← Lista de pedidos e criação de ordens de trabalho
│       ├── ordens.js       ← Ordens de trabalho e conclusão
│       ├── dados_pedido.js ← Catálogo de Dados do Pedido (equipamento, órgão, parte, etc.)
│       └── custos.js       ← Análise de custos por ordem e por material
│
└── docs/
    ├── README.md           ← Este ficheiro
    ├── modulos.md          ← Descrição detalhada de cada módulo
    ├── base_dados.md       ← Esquema da base de dados relacional
    └── evolucao.md         ← Guia para evolução para produção
```

---

## Dependências externas

| Biblioteca | Versão | Uso                          | CDN |
|------------|--------|------------------------------|-----|
| Chart.js   | 4.4.1  | Gráficos (dashboard, custos) | ✅  |

Todas as outras funcionalidades usam apenas APIs nativas do browser.

---

## Funcionalidades implementadas

### Clientes
- Registo de empresas com NIF, morada, email e telefone
- Colaboradores associados a cada empresa (expansíveis na lista)
- Registo de clientes particulares (Cartão de Cidadão, sem colaboradores)
- Filtro rápido: Todos / Empresas / Particulares

### Pedidos
- Criação de pedidos por colaborador de empresa ou particular
- Estados: Pendente → Em produção → Concluído
- Conversão de pedido em Ordem de Trabalho

### Ordens de Trabalho
- Geração automática de referência (OT-XXXX)
- Atribuição de operador e prazo
- Conclusão de ordem (atualiza estado do pedido)

### Dados do Pedido
- Alterado o conceito de 'Peças' para 'Dados do Pedido' para abranger detalhes mais granulares como equipamento, órgão e parte.
- Novo campo para imagem, facilitando a identificação visual.
- Custo unitário de produção por peça

### Custos
- Cálculo automático: custo de material × quantidade + mão de obra
- Tabela detalhada por ordem de trabalho
- Gráfico de custo acumulado por tipo de material

### Dashboard
- Métricas em tempo real (empresas, particulares, ordens ativas, faturação estimada)
- Gráfico de ordens por estado
- Gráfico de pedidos por tipo de cliente (empresa vs particular)
- Tabela das últimas ordens de trabalho
