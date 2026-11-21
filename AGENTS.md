# Working on ShopLedger

ShopLedger is a Node.js application using CommonJS, Express 4, and body-parser. Express serves the plain HTML, CSS, and browser JavaScript in `public/`.

## Module map

- `server.js` mounts the API routers and serves printable invoices.
- `routes/` handles products, orders, customers, and reports.
- `lib/pricing.js`, `lib/coupons.js`, and `lib/tax.js` calculate the checkout bill. `lib/invoice.js` renders the printable bill. `lib/reports.js` compares invoice figures with saved orders.
- `lib/inventory.js`, `lib/orders.js`, `lib/ledger.js`, and `lib/dates.js` manage stock, orders, customer credit, and dates.
- `config.js` holds shop settings and business rules. `lib/store.js` reads and writes `data/db.json`.

## Commands

- `npm install` installs the declared packages.
- `npm start` launches the server. The default port is 3000.
- `node --test` runs the Node.js test suite. The package's `npm test` script is a placeholder.

## Change rules

- Write passing characterization tests before changing behavior. Include `CURRENT BEHAVIOUR` in the names of tests that capture known discrepancies.
- Limit production changes to the modules involved in the selected ticket.
- Build fixtures in memory. Tests must never read or write `data/db.json`.
- Add no dependencies.
