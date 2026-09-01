# Sakila Angular

![Angular](https://img.shields.io/badge/Angular%2022-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript%207-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS%207-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Angular Signals](https://img.shields.io/badge/Angular%20Signals-0F766E?style=for-the-badge)
![CI](https://github.com/rajeshgajra19889/sakila-angular/actions/workflows/ci.yml/badge.svg)

The **frontend half of a two-part full-stack project** — a feature-complete admin panel over the PostgreSQL Sakila database, consuming the [Sakila Sales API](https://github.com/rajeshgajra19889/sales-api). Built with the modern Angular stack: **standalone components, signals, lazy routes, colocated feature modules.**

## 🚀 Live demo

- **Deployed app:** <https://sakila-angular.onrender.com/>
- **Demo login:** `Mike` / `Admin@123`
- **Backend API:** <https://sales-api-rnz1.onrender.com/>

## Stack

- **Angular 22** — standalone components, signal state, block-template syntax (`@if / @for / @empty`)
- **TypeScript** — strict mode
- **Angular HttpClient** — typed REST calls created with `inject()` + `@Service()`
- **Lazy loading** — each feature ships its own chunk, fetched only when navigated to
- **Deployed:** Render static site; API base URL sourced from Angular **environment files** (`environment.prod.ts`), so dev (`ng serve` → localhost) and prod point at different backends with one-line swaps

## Features

- **Authentication** — JWT login, `token`/`staff` signals, route-guarded shell, auto-logout on expired session
- **Films** — CRUD grid: pagination (10/20/50), search-as-you-type, sortable columns, validated modal form, film **actors** management
- **Staff** — CRUD: create with password, **edit with optional password**, delete with confirm, address/city/country joins in detail
- **Customers** — paginated/searchable list + detail with payment history
- **Actors** — CRUD with grid, search, sort
- **Rentals** — searchable list + detail (film, customer)
- **Inventory** — stock list, add copies, move copies between stores, renters report, summary
- **Stores** — CRUD with stats, address search with inline create
- **Reservations** — holds + waitlist tabs with promote flow
- **Dashboard** — stats cards, rentals-per-month, top categories, recent rentals (lazy chunk)
- **Global address search** — type-ahead used by every form

Built with consistent pieces across every module: `list → page → sort → search → create/edit/delete → detail`.

## Getting started

```sh
npm install
ng serve            # dev API on http://localhost:3000 (see sales-api README)
```

Open http://localhost:4200 and log in with `Mike` / `Admin@123`.

To point a build at a different backend, change one line in `src/environments/environment.prod.ts`.

## Project structure

```
src/
├── main.ts / app.config.ts      # bootstrap + HttpClient providers
├── app.routes.ts                # lazy route map (AdminLayout parent, auth guard)
├── environments/                # environment.ts (dev) / environment.prod.ts (prod)
└── app/
    ├── core/auth/               # JWT login, session signals, guard
    ├── layout/                  # navbar + sidebar shell
└── features/                      # one folder per feature: types, service, page
        ├── login/                     # sign-in form
        ├── dashboard/ films/ actors/ rentals/ inventory/
        ├── customers/ stores/ reservations/ staff/
        └── addresses/                 # shared type-ahead address search
```

## Why it's built this way

- **Half of a full-stack pair** — talks only to the [Sakila Sales API](https://github.com/rajeshgajra19889/sales-api); the two repos share one typed data contract, so a backend change breaks the build, not the browser.
- **Colocated feature modules** — each feature owns its model, service, and page. No shared folder until something is genuinely shared.
- **Signals over services-of-state** — every UI fact (page, sort, search, form fields) is one signal with one reload path; derived values (`totalPages`, field errors) are `computed`.
- **Templates declare, components decide** — helpers live in TS, never in template expressions.
- **Deployable** — production build swaps in the live API via `fileReplacements`; CI runs it on every push.