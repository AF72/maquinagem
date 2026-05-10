# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MaquinaGest** is a browser-based production management system for a machining/manufacturing shop. It is a vanilla HTML + CSS + JavaScript SPA (no framework, no build step). All code runs directly in the browser — open `index.html` to run it.

The UI language is **Portuguese**. Variable names, comments, labels, and module concepts are all in Portuguese (e.g. `pedidos` = orders, `ordens` = work orders, `orcamentos` = quotes, `pecas` = parts, `clientes` = clients, `estado` = status).

## Running the App

```bash
open index.html        # macOS — open directly in browser
# OR serve via any static file server:
npx serve .
python3 -m http.server
```

There is no build, no npm install, no transpilation. Chart.js 4.4.1 is loaded via CDN.

## Architecture

### Global State

All application data lives in the `DB` global object defined in [js/data.js](js/data.js). It is in-memory only — data resets on page reload. Collections: `empresas`, `colaboradores`, `particulares`, `dados_pedido`, `pedidos`, `ordens`, `orcamentos`, `pecas`, `pecas_pedidos`, `materia_prima`.

`DB` also holds UI state: `DB.expanded` (expandable lists) and `DB.clienteFilter`.

### Routing and Rendering

[js/app.js](js/app.js) owns navigation. It maps the 12 page names to render functions via `PAGE_RENDERERS`. When a sidebar nav item is clicked, `showPage(pageName)` toggles the active `.page` div in the DOM and calls the corresponding renderer.

`renderAll()` is the global refresh — call it after any `DB` mutation to update the current page view.

Each page under [js/pages/](js/pages/) exports a single `render<PageName>()` function that builds an HTML string and sets `innerHTML` on its container. Event listeners are attached inline via `onclick` attributes or by querying the DOM immediately after setting `innerHTML`.

### Modal / Form System

[js/modal.js](js/modal.js) manages a single global modal overlay. `openModal(type, extra)` receives a form type string and optional context (e.g. a client ID), builds the form HTML via a dispatcher, and injects it into `.modal-wrap`. The `.btn-save` button calls `saveForm()`, which reads form inputs, writes to `DB`, and calls `renderAll()`.

All 12 form types are defined in modal.js. To add a new form: add a builder function, register it in `buildModalForm`'s switch, and add a `openModal('myType', …)` call in the relevant page renderer.

### Helpers

[js/helpers.js](js/helpers.js) provides lookups (`getEmpresa`, `getPedido`, `resolveCliente`, …), HTML builders (`estadoBadge`, `avatarHtml`, `tipoBadge`), and date utilities (`today()`, `addDays(n)`). These are pure functions over `DB` — use them instead of accessing `DB` directly in page renderers.

### CSS Structure

Four CSS files loaded in order:
- `base.css` — reset, CSS variables (`--color-*`, `--radius-*`), typography
- `layout.css` — sidebar (fixed 240 px), topbar, `.page` container toggling via `.active`
- `components.css` — buttons, cards, tables, badges (8 colour variants), avatars, tabs, forms
- `modal.css` — modal overlay and dialog

Badge colours map to `estado_pedido` values: `Orçamentar` → teal, `Pendente` → amber, `Produção` → blue, `Faturar` → coral, `Concluido` → green, `Cancelado` → gray/red. These are defined in `components.css` and used by `estadoBadge()`.

### Key Estado (Status) Values

- **pedidos** `estado_pedido`: `'Orçamentar'` → `'Pendente'` → `'Produção'` → `'Faturar'` → `'Concluido'` / `'Cancelado'`
- **ordens** `estado`: `'Em curso'` / `'Concluída'` / `'Cancelada'`

Marking an ordem as `'Concluída'` also sets its linked pedido to `'Concluido'`.

### ID Generation

Use `nextId()` (timestamp-based) for new entity IDs. Order references are auto-generated from the current year: `PT26-XXXX` for pedidos, `OT26-XXXX` for ordens.

## Production Schema

The prototype uses in-memory data. A full PostgreSQL schema is documented in [docs/base_dados.md](docs/base_dados.md) — 10 tables with FK relationships, constraints, and recommended indexes. The migration roadmap (React + Node/Express + PostgreSQL + Prisma) is in [docs/evolucao.md](docs/evolucao.md).
