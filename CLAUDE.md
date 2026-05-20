# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MaquinaGest** is a browser-based production management system for a machining/manufacturing shop. The frontend is a vanilla HTML + CSS + JavaScript SPA (no framework, no build step). The backend is Node.js + Express + PostgreSQL + Prisma.

The UI language is **Portuguese**. Variable names, comments, labels, and module concepts are all in Portuguese (e.g. `pedidos` = orders, `ordens` = work orders, `orcamentos` = quotes, `pecas` = parts, `clientes` = clients, `estado` = status).

## Running the App

### First-time setup

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://USER:PASS@localhost:5433/maquinagemdev"
npm install
npx prisma generate
npm run db:seed   # optional — seeds test data
```

### Normal startup (two terminals)

```bash
# Terminal 1 — backend API on port 3000
cd backend && npm run dev

# Terminal 2 — frontend static server
python3 -m http.server   # opens at http://localhost:8000
# OR: npx serve .
```

### Useful backend commands

```bash
cd backend
npm run db:studio    # Prisma Studio GUI at http://localhost:5555
npm run db:seed      # WARNING: wipes and reseeds all data
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:pull      # pull schema from DB (reverse engineer)
node prisma/limpar.js  # clears all data without reseeding
```

> The local PostgreSQL instance runs on **port 5433** (not the default 5432). DB name: `maquinagemdev`.

## Architecture

### Two-layer design

The frontend is a plain SPA that fetches all data from the backend REST API on load. The frontend has **no persistence of its own** — everything lives in PostgreSQL.

### Frontend global state (`js/data.js`)

All data fetched from the API is stored in the `DB` global object. Collections: `empresas`, `colaboradores`, `particulares`, `dados_pedido`, `pedidos`, `ordens`, `orcamentos`, `orcamento_itens`, `pecas`, `pecas_pedidos`, `materia_prima`, `colaboradores_dm`, `fornecedores`, `notas_pedido`, `servicos`, `servicos_pedidos`, `historico_precos`.

`DB` also holds UI state: `DB.expanded` (accordion state) and `DB.clienteFilter` (filter on the clientes page).

> **Note:** `historico_precos` is declared in `DB` but is **not** populated by `carregarDados()` — there is no startup fetch for that endpoint. It stays empty unless explicitly loaded.

### API layer (`js/api.js`)

`carregarDados()` fetches all endpoints in parallel via `Promise.allSettled` and populates `DB`. It shows a red banner if any endpoint fails. Field-name mapping between snake_case API responses and camelCase frontend properties is done via `map*` functions (e.g. `mapColaborador`, `mapPedido`, `mapOrdem`). The API base is `http://localhost:3000/api`. CRUD helpers: `apiFetch`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.

`orcamento_itens` is **not** fetched from its own endpoint — it is populated as a side-effect inside the `orcamentos` map function when `carregarDados()` loads `/orcamentos`.

### Routing and rendering (`js/app.js`)

`PAGE_RENDERERS` maps 15 page names to render functions. `showPage(pageName)` activates the corresponding `.page` div and calls its renderer. `renderAll()` re-renders only the current page — call it after any `DB` mutation.

Each page under `js/pages/` has a single `render<PageName>()` function that builds an HTML string and sets `innerHTML`. Event listeners are attached via `onclick` attributes or by querying the DOM after setting `innerHTML`.

The `*_detalhe` pages (`pedido_detalhe`, `ordem_detalhe`, `orcamento_detalhe`, `peca_detalhe`, `materia_prima_detalhe`) are sub-views navigated to from list pages via `showPage('pedido_detalhe')`. They are not sidebar items.

### Modal / form system (`js/modal.js`)

`openModal(type, extra)` builds a form via `buildModalForm`'s switch and injects it into `.modal-wrap`. The `.btn-save` button calls `saveForm()`, which writes to the API and calls `renderAll()`. All form types are registered in `modal.js`.

To add a new form: add a builder function → register in `buildModalForm`'s switch → call `openModal('myType', …)` from the relevant page renderer.

### Helpers (`js/helpers.js`)

Pure lookup and HTML-builder functions over `DB`:
- **Lookups:** `getEmpresa`, `getColab`, `getParticular`, `getDadosPedido`, `getPedido`, `resolveCliente`
- **HTML:** `estadoBadge`, `avatarHtml`, `tipoBadge`, `inlineFlex`
- **Date:** `today()`, `addDays(n)`
- **IDs:** `nextId()` — returns `Date.now()` (timestamp-based)

Use these instead of accessing `DB` directly.

### Client types

The `clientes` page merges two data models:
- `colaboradores` — employees of client companies (`Empresa`). A `Colaborador` always belongs to an `Empresa`.
- `particulares` — individual clients with no company affiliation.

`colaboradores_dm` (DM = shop's own team) are internal workshop staff who author `notas_pedido`. They are **not** clients — do not confuse with `colaboradores`.

### Backend (`backend/`)

Express REST API. Routes in `backend/src/routes/`, controllers in `backend/src/controllers/`. Prisma schema at `backend/prisma/schema.prisma`. The full SQL schema is documented in `docs/base_dados.md`.

#### Controller pattern

Every controller follows the same pattern:

```js
const schema = z.object({ ... });

async function criar(req, res, next) {
  try {
    const dados = schema.parse(req.body);
    const result = await prisma.model.create({ data: dados });
    res.status(201).json(result);
  } catch (err) { next(err); }
}
```

- Validate with Zod (`schema.parse` for create, `schema.partial().parse` for update)
- Always forward errors via `next(err)` — never `res.status(500)` directly
- Clearable optional fields must be sent as `null`, not `undefined`, and the Zod schema must include `.nullable()`

#### Error handler (`backend/src/middleware/errorHandler.js`)

Automatically maps:
- `ZodError` → 400 `{ erro: 'Dados inválidos', detalhes: [...] }`
- Prisma `P2002` (unique constraint) → 409
- Prisma `P2025` (record not found) → 404

#### Auth middleware

`backend/src/middleware/auth.js` exists but is **not applied** to any routes. Authentication is not enforced.

### CSS structure

Four files loaded in order: `base.css` (reset, CSS variables), `layout.css` (sidebar 240 px, `.page` toggling via `.active`), `components.css` (buttons, cards, tables, badges), `modal.css`.

Badge class mapping (defined in `components.css`, generated by `estadoBadge()`):
- `'Orçamentar'` → `badge-gray`
- `'Pendente'` → `badge-amber`
- `'Produção'` / `'Em curso'` → `badge-blue`
- `'Faturar'` → `badge-red`
- `'Concluido'` / `'Concluída'` → `badge-green`
- `'Cancelado'` → `badge-black`
- `'Falta OC'` → `badge-orange`

### Script load order

`data.js` → `helpers.js` → `modal.js` → all page scripts → `api.js` → `app.js`. New page scripts must be added before `api.js` in `index.html`.

### Key status values

- **pedidos** `estado_pedido`: `'Orçamentar'` → `'Pendente'` → `'Produção'` → `'Faturar'` → `'Concluido'` / `'Cancelado'`
- **ordens** `estado`: `'Em curso'` / `'Concluída'` / `'Cancelada'`

Marking an ordem as `'Concluída'` also sets its linked pedido to `'Concluido'`.

### ID generation

Backend IDs use PostgreSQL `autoincrement()`. `nextId()` (timestamp-based) in `helpers.js` exists as a legacy utility. References are auto-generated from the current year: `PT26-XXXX` for pedidos, `OT26-XXXX` for ordens.

## Docs

- `docs/base_dados.md` — full PostgreSQL schema (tables, FKs, indexes)
- `docs/evolucao.md` — migration roadmap to React + Node/Express + PostgreSQL + Prisma
- `docs/modulos.md` — business logic description per module
