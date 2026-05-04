# Guia de Evolução para Produção

Este documento descreve como transformar o protótipo atual
numa aplicação web completa, com base de dados persistente,
autenticação e múltiplos utilizadores.

---

## Stack recomendada

| Camada         | Tecnologia recomendada          | Alternativa          |
|----------------|---------------------------------|----------------------|
| Frontend       | React + Vite                    | Vue.js               |
| Estilo         | Tailwind CSS                    | CSS Modules          |
| Gráficos       | Recharts (React) / Chart.js     | —                    |
| Backend / API  | Node.js + Express               | Python + FastAPI     |
| Base de dados  | PostgreSQL                      | MySQL / SQLite       |
| ORM            | Prisma                          | Sequelize / TypeORM  |
| Autenticação   | JWT + bcrypt                    | Auth0 / Clerk        |
| Alojamento     | Railway / Render / VPS          | Vercel + Supabase    |

---

## Perfis de utilizador

| Perfil    | Permissões                                                        |
|-----------|-------------------------------------------------------------------|
| Gestor    | Acesso total: clientes, pedidos, ordens, peças, custos, relatórios |
| Operador  | Ver e atualizar ordens de trabalho (concluir, adicionar notas)    |
| Vendas    | Criar clientes e pedidos; ver estado das ordens                   |

---

## Fases de desenvolvimento sugeridas

### Fase 1 — Backend e base de dados (3–4 semanas)
- Criar projeto Node.js + Express
- Configurar PostgreSQL com o esquema em `base_dados.md`
- Implementar endpoints REST:
  - `GET/POST /empresas`
  - `GET/POST /empresas/:id/colaboradores`
  - `GET/POST /particulares`
  - `GET/POST /pecas`
  - `GET/POST /pedidos`
  - `PATCH /pedidos/:id/estado`
  - `GET/POST /ordens`
  - `PATCH /ordens/:id/concluir`
  - `GET /custos/resumo`
- Autenticação JWT com perfis

### Fase 2 — Frontend React (3–4 semanas)
- Migrar o HTML/CSS/JS atual para componentes React
- Integrar com a API via `fetch` / `axios`
- Gerir estado com `useState` / `useContext` (ou Zustand)
- Adicionar loading states e tratamento de erros

### Fase 3 — Funcionalidades avançadas (2–3 semanas)
- Relatórios exportáveis em PDF / Excel
- Notificações de prazo (ordens próximas do vencimento)
- Histórico de alterações por ordem
- Pesquisa global
- Dashboard com filtros por período

### Fase 4 — Deploy e produção (1 semana)
- Configurar CI/CD (GitHub Actions)
- Deploy do backend (Railway ou Render)
- Deploy do frontend (Vercel ou Netlify)
- Configurar domínio e HTTPS
- Backups automáticos da base de dados

---

## Estrutura sugerida do projeto React

```
maquinagem-app/
├── frontend/
│   ├── src/
│   │   ├── components/     ← Componentes reutilizáveis (Badge, Avatar, Modal…)
│   │   ├── pages/          ← Dashboard, Clientes, Pedidos, Ordens, Peças, Custos
│   │   ├── hooks/          ← useClientes, usePedidos, useOrdens…
│   │   ├── services/       ← api.js (chamadas à API)
│   │   ├── store/          ← Estado global (Zustand ou Context)
│   │   └── App.jsx
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/         ← empresas.js, pedidos.js, ordens.js…
    │   ├── controllers/    ← Lógica de negócio
    │   ├── middleware/     ← auth.js, errorHandler.js
    │   ├── prisma/         ← schema.prisma + migrations
    │   └── app.js
    └── package.json
```

---

## Estimativa de esforço

| Fase                        | Esforço estimado |
|-----------------------------|-----------------|
| Backend + BD                | 3–4 semanas     |
| Frontend React              | 3–4 semanas     |
| Funcionalidades avançadas   | 2–3 semanas     |
| Deploy + testes             | 1 semana        |
| **Total**                   | **9–12 semanas**|

*Assumindo um desenvolvedor com experiência em Node.js e React.*

---

## Considerações de segurança

- Nunca expor credenciais da BD no frontend
- Validar todos os inputs no backend (usar `zod` ou `joi`)
- Usar HTTPS em produção
- Implementar rate limiting nas rotas de autenticação
- Fazer backups diários da base de dados
- Logs de auditoria para operações críticas (criar/eliminar registos)
