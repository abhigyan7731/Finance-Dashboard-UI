# Finance Dashboard UI

Small React + Vite demo implementing a simple finance dashboard UI.

Features
- Summary cards (Balance, Income, Expenses)
- Balance trend (SVG line chart)
- Spending breakdown (SVG pie)
- Transactions list with search/filter/sort
- Role simulation: `viewer` vs `admin` (Admin can add transactions)
- Insights: highest spending category and monthly totals
- LocalStorage persistence for role and transactions


Getting started (Next.js)

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

Notes
- Built with React + Next.js. No backend required; data is mocked and stored in `localStorage`.
- The app source lives under `src/`. The Next pages are in `pages/` and wrap the app via `pages/_app.jsx`.
- State management: `src/context/AppContext.jsx` uses React Context to hold transactions, filters and selected `role`. Changes persist to `localStorage` on the client.
- Insights: `src/components/Insights.jsx` shows totals, highest spending category, monthly totals and month-over-month change. Handles empty data gracefully.
- UI: responsive layout with simple CSS in `src/index.css`. The Transactions list supports filtering, sorting, pagination, virtualization, CSV export, and admin inline edit.

