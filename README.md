# Sakila Angular

The **frontend half of a two-part full-stack project** — see its backend twin, the [Sakila Sales API](https://github.com/rajeshgajra19889/sales-api), for the Express/TypeScript/Drizzle/PostgreSQL REST layer this UI consumes. Together they form a complete stack: **Angular UI → Express API → PostgreSQL**.

A feature-complete admin panel over the PostgreSQL Sakila database. Built with the modern Angular stack: **standalone components, signals, lazy routes, colocated feature modules.**

## Stack

- **Angular 22** — standalone components, signal state, block-template syntax (`@if / @for / @empty`)
- **TypeScript** — strict mode
- **Angular HttpClient** — typed REST calls to the API (created via the `@Service()` decorator + `inject()`)
- **Lazy loading** — each feature ships its own chunk, fetched only when navigated to

## Features

- **Films grid — full CRUD**
  - Hand-built grid with **custom pagination** (moving window of page buttons, page-size selector 10/20/50)
  - **Search-as-you-type** across titles (server-side filtering)
  - **Sortable columns** — click a header to sort, click again to invert (▲/▼)
  - **Modal add/edit** with per-field validation: all three fields required, rental rate must be numeric, Save is blocked until valid
  - Delete with confirmation; deletes on an emptied page step you back automatically
- **Admin layout** — `navbar` + `sidebar` shell with an `<router-outlet>`, keys accessible via signals
- **Lazy route map** — `Dashboard` and `Films` are isolated lazy chunks
- **Typed end to end** — `Film`, `Page<T>`, and `FilmInput` mirror the API contract so a backend change breaks the build, not the browser

## Getting started

1. The API must be running on `http://localhost:3000` — see the [sales-api README](https://github.com/rajeshgajra19889/sales-api).

2. Install and serve:

   ```sh
   npm install
   ng serve
   ```

3. Open http://localhost:4200 and navigate to **Films**.

## Project structure

```
src/app/
├── app.ts                  # shell — just <router-outlet>
├── app.routes.ts           # lazy route map (AdminLayout parent)
├── app.config.ts           # HttpClient providers
├── layout/
│   ├── navbar/             # top bar
│   ├── sidebar/            # navigation links
│   └── admin-layout/       # shell: navbar + sidebar + outlet
└── features/
    ├── dashboard/          # lazy-loaded landing page
    └── films/              # the complete CRUD module
        ├── film.ts         # contract types (mirrors the API)
        ├── film.service.ts # typed HttpClient calls
        └── films-page.*    # grid, pagination, modal, styles
```

## Roadmap — actively developed

This repo is an ongoing teaching project; commits land as features complete.

- [ ] Film **detail view** (rentals/inventory for a title)
- [ ] Toast/notification system for action feedback (replacing `window.confirm`)
- [ ] Client-side tests
- [ ] More feature modules as the API grows (actors, categories, …)

## Why it's built this way

- **Half of a full-stack pair** — this UI talks only to the [Sakila Sales API](https://github.com/rajeshgajra19889/sales-api). The two repos share one typed data contract (`Film`, `Page<T>`, `FilmInput`), so either half changing the contract surfaces as a TypeScript error — contract-first development across repositories.
- **Colocated feature modules** — each feature owns its model, service, and page. No `core/` folder until something is genuinely shared.
- **Signals over services-of-state** — every UI fact (page, sort, search, form fields) is one signal with one reload path; derived values (`totalPages`, per-field errors) are `computed`.
- **The divide every developer should keep** — templates *declare*, components *decide*. Global helpers like `Number()` stay in TS, never in template expressions.