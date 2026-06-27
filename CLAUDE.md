# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MaquinaGest** is a browser-based production management system for a machining/manufacturing shop (DrawMech). Backend is Node.js + Express + PostgreSQL + Prisma. There are **two frontends in this repo** — see "Two frontends" below before editing any UI.

The UI language is **Portuguese**. Variable names, comments, labels, and module concepts are all in Portuguese (e.g. `pedidos` = client requests/orders, `ordens`/`ordens_trabalho` = work orders, `orcamentos` = quotes, `pecas` = parts, `clientes` = clients, `estado` = status).

## Two frontends — which one to edit

- **`frontend/`** — React 18 + Vite + react-router-dom + zustand. **This is the actively developed and deployed frontend.** Unless told otherwise, this is the one to edit.
- **`js/` + `css/` + root `index.html`** — the original vanilla-JS SPA (no build step, no framework). It still receives occasional parallel edits and is functionally similar, but it is **not deployed** (the root `railway.toml` builds and serves `frontend/dist`, not this). Treat it as legacy/reference unless explicitly asked to change it.

The two are independent implementations of the same features (own copies of API-fetch logic, state, components) — a fix in one does not apply to the other.

## Running the app

### First-time setup

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://USER:PASS@localhost:5433/maquinagemdev"
npm install
npx prisma generate
npm run db:seed   # optional — wipes and seeds test data
```

> Local PostgreSQL runs on **port 5433** (not the default 5432), db name `maquinagemdev`.

### Normal startup (two terminals)

```bash
# Terminal 1 — backend API on port 3000
cd backend && npm run dev

# Terminal 2 — React frontend on port 5173
cd frontend && npm run dev
```

There is no lint or test setup in this repo (no test files, no lint scripts in any `package.json`).

### Useful backend commands

```bash
cd backend
npm run db:studio    # Prisma Studio GUI at http://localhost:5555
npm run db:seed      # WARNING: wipes and reseeds all data
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:pull      # pull schema from DB (reverse engineer)
node prisma/limpar.js tudo            # wipe all data without reseeding
node prisma/limpar.js pedidos ordens  # wipe selected modules only (see LIMPAR_DADOS_BD.txt)
```

### Frontend build

```bash
cd frontend
npm run build    # production build to frontend/dist
npm run preview
```

## Architecture

### Backend (`backend/`)

Express REST API. Routes in `backend/src/routes/`, controllers in `backend/src/controllers/`, one pair per resource. Prisma schema at `backend/prisma/schema.prisma`; full SQL schema also documented in `docs/base_dados.md`.

#### Controller pattern

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

`backend/src/middleware/errorHandler.js` automatically maps `ZodError` → 400, Prisma `P2002` (unique constraint) → 409, Prisma `P2025` (not found) → 404.

#### Auth

JWT auth **is enforced**: `backend/src/app.js` applies `auth` middleware globally (`app.use(auth)`) to everything mounted after it; only `/api/auth/*` is public. Login (`POST /api/auth/login`) checks `colaboradores_dm.email` + `password_hash` (bcrypt) and issues a JWT (`{id, role, nome}`, default 8h, configurable via `JWT_EXPIRES_IN`). `colaboradores_dm` doubles as the staff/user table — don't confuse it with `colaboradores` (client-company employees).

`authController.js` also has one-off, non-idempotent-by-design admin endpoints (`/setup`, `/migrate`, `/reset-admin`) that run raw SQL via `$executeRawUnsafe` to patch production schema/seed the first admin. These are a deliberate substitute for `prisma migrate` in this project (see "Deployment").

#### Cross-entity state sync

Some `estado` transitions on one entity are meant to cascade to a related entity. The established (and only currently *active*) pattern lives in `ordensController.atualizar` (the generic `PUT /ordens/:id` handler, which is what the frontend actually calls for every ordem edit): when the saved `estado` is `'Faturar'`, it also sets the linked `pedido.estado_pedido` to `'Faturar'`.

There is also a `PATCH /ordens/:id/concluir` endpoint that sets a pedido to `'Concluido'` when its ordem completes — but **no frontend code calls it**; ordem completion goes through the same generic `PUT` above with no pedido side-effect. If you need to add another cascading transition, add it to `atualizar`, not to `concluir`.

### React frontend (`frontend/`)

- `src/App.jsx` — routes, wrapped in `AuthProvider`; unauthenticated users are redirected to `/login`.
- `src/context/AuthContext.jsx` — JWT + user kept in `localStorage`; decodes the JWT payload client-side to check expiry; registers a 401 callback with the API layer (`setOn401`) to force logout on session expiry.
- `src/lib/api.js` — `apiFetch/apiPost/apiPut/apiPatch/apiDelete`, all attaching the `Authorization: Bearer` header. `API_BASE` switches between `localhost:3000` and the Railway production URL based on `location.hostname`. Also holds the snake_case→camelCase `map*` functions (`mapPedido`, `mapOrdem`, etc.) used when loading data.
- `src/store/index.js` (zustand) — single global store; one array per backend collection (`pedidos`, `ordens`, `pecas`, …). `carregarDados()` fetches every endpoint in parallel via `Promise.allSettled` and populates the store; it sets `backendErro` if any endpoint fails, and sets `dadosCarregados: true` once the first load completes (see gotcha below). `Layout.jsx` triggers `carregarDados()` once on mount.
- `src/pages/*.jsx` — one file per module, typically bundling **both** the list view and the detail view (e.g. `Pedidos.jsx` exports a root component that reads `useParams().id` and renders either `PedidosList` or `PedidoDetalhe`), routed via the same path with and without `/:id` (see `App.jsx`).
- `src/lib/helpers.js` — lookups (`getEmpresa`, `getColab`, `resolveCliente`, …) that read `useStore.getState()` directly, so they work outside React components too; also formatting helpers (`formatEuro`, `today`, `addDays`).
- Dashboard charts use Chart.js directly (not a React wrapper): a `<canvas>` ref + `useEffect` that constructs/destroys a `Chart` instance on data change.

#### Gotcha: don't read store data in a `useState` initializer for a detail view

`useState(p?.campo ?? default)`-style initializers only run once, on mount. If the component mounts before `carregarDados()` has resolved (e.g. a hard refresh/direct link straight to a detail route), `p` is still `undefined`, the field locks onto the fallback value forever, and saving later silently overwrites real data with that fallback. The store's `dadosCarregados` flag exists for this: gate mounting of the detail component on `dadosCarregados` (see `Pedidos.jsx`'s root component for the pattern) instead of relying on hooks to "catch up" once data arrives — React won't re-run a `useState` initializer on its own, and conditionally skipping hooks based on data-readiness inside the detail component itself causes a "Rendered more hooks than during the previous render" crash. `Pedidos.jsx` and `Orcamentos.jsx` are both fixed (their root component gates on `dadosCarregados` before mounting the detail view). `Ordens.jsx` doesn't need it — its detail view derives the editable form from a plain `const` recomputed every render, not from `useState` initializers, so it isn't affected.

### Data model

Prisma schema (`backend/prisma/schema.prisma`) centers on: `Pedido` (client request) → `Orcamento` (quote, with `OrcamentoItem` lines pointing at either a `Peca` or a `Servico`) and `OrdemTrabalho` (work order). `Peca` links to `MateriaPrima` (raw material) and ordered `PecaProcesso` steps (linking to `Processo`, which has an hourly cost). Clients are either `Empresa`+`Colaborador` (company + employee) or `Particular` (individual) — don't confuse `Colaborador` (client-side) with `ColaboradorDm` (internal shop staff, used for auth and `NotaPedido` authorship). Price history is tracked in three parallel tables: `HistoricoPreco` (parts, per supplier/pedido), `HistoricoPrecoMp` (raw material), `HistoricoPrecoProcesso` (process hourly rate).

### Status workflows

- **pedidos** `estado_pedido`: `Orçamentar → Pendente → Produção → Faturar → Concluido / Cancelado`
- **ordens** `estado`: `Em curso / Pendente / Falta OC / Faturar / Concluída / Cancelada`

Badge color classes (`badge-gray/amber/blue/red/green/black/orange`, defined in `components.css`) are mapped from these state strings in `helpers.js` (`ESTADO_BADGE_CLASS`) on the legacy frontend and per-page in the React one — keep new states' colors consistent across both if you add one.

References auto-generate from the current year: `PT26-XXXX` for pedidos, `OT26-XXXX` for ordens.

### Deployment

Two separate Railway services from this one repo:
- Root `railway.toml` builds `frontend/` (`npm --prefix frontend run build`) and serves `frontend/dist` as a static site.
- `backend/railway.toml` builds the backend and runs `prisma generate && prisma db push --accept-data-loss` — schema changes ship via `db push`, not `prisma migrate deploy`. Combined with the raw-SQL endpoints in `authController.js`, this means schema evolution in production is push-based/imperative rather than migration-file-based.

## Docs

- `docs/base_dados.md` — full PostgreSQL schema (tables, FKs, indexes)
- `docs/modulos.md` — business logic description per module
- `docs/evolucao.md` — the original migration plan (vanilla JS → React/Node/Postgres/Prisma); largely historical now since that migration has happened, but still useful for the reasoning behind some structural choices
