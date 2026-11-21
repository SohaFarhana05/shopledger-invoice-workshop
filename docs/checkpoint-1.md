# CP1 · Understanding ShopLedger

ShopLedger is a point-of-sale app for cash and Khata credit sales. Staff use it to manage stock and customer balances. The accountant can print invoices and compare them with the amounts recorded at checkout.

## Module map

| Location | Responsibility |
| --- | --- |
| `public/`, `server.js` | Browser interface and Express entry point |
| `routes/` | Products, orders, customers, and reports |
| `lib/pricing.js`, `lib/coupons.js`, `lib/tax.js` | Checkout totals, discount rules, and item-specific GST |
| `lib/inventory.js`, `lib/orders.js`, `lib/dates.js` | Sellable stock, order records, and date handling |
| `lib/ledger.js` | Customer credit limits, charges, reversals, and settlements |
| `lib/invoice.js`, `lib/reports.js` | Printable invoices and reconciliation with saved orders |
| `config.js`, `lib/store.js`, `data/db.json` | Business settings and JSON persistence |

## I am sure

1. The browser submits the cart to `POST /api/orders`. The server looks up catalog prices, checks sellable stock, and validates the coupon.
2. Checkout distributes the discount across items and calculates GST on each discounted line. A Khata sale also checks the customer's credit limit and records the charge.
3. The server deducts stock, records the order and audit entry, writes the JSON database, and returns the order.
4. Printing an invoice runs another calculation. For order #1002, checkout saved ₹963.90 including ₹45.90 GST. The invoice calculates ₹1,083.24 including ₹183.60 GST. Its calculation falls back to 18% when a line has no explicit rate, applies percentage discounts after tax, and skips the discount cap.

Other risks visible in the code include a stock check that rejects the last sellable unit, date comparisons on day-first strings, and settlement arithmetic that can concatenate strings. The package test command is a placeholder.

## I suspect

Changing coupon settings could alter a historical invoice when someone reprints it. An interrupted write could also damage the single JSON database. Neither scenario was tested during this read-only checkpoint.
