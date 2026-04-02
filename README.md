
# Finance Dashboard UI

A small, responsive React + Next.js demo showing a modern finance dashboard UI with a premium look and feel.

Key features
- Responsive layout (mobile-first) with clear breakpoints for tablet and desktop
- Summary KPI cards (Total Balance, Income, Expenses, Net Change) with sparkline previews
- Balance trend (SVG line chart) and category breakdown (SVG pie)
- Transactions list with search, filters, sort, pagination, virtualization and CSV export
- Polished Transactions UI: glassy cards, pill badges, monospace amounts, selection highlights and add/delete animations
- Profile & Settings panel: avatar, fuller name/role, chips for membership/status, grouped preferences, dark mode and accent selection
- LocalStorage persistence for transactions, role, dateRange and preferences

Getting started

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

Notes
- Built with React + Next.js; the UI lives under `src/` and Next wrappers are in `pages/`.
- `src/context/AppContext.jsx` manages app state (transactions, filters, role, date range) and persists client-side to `localStorage`.
- Transactions support inline add/edit for admins, CSV import/export, and optional virtualization via `react-window` for large lists.
- Styling is handled by `src/index.css`; the app uses CSS Grid / Flexbox with mobile-first breakpoints at ~640px and 1024px.

If you'd like, I can:
- Run the dev server and verify responsive breakpoints interactively.
- Add a short screenshot and usage examples to this README.

