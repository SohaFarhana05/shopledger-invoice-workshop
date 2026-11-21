const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');

describe('test/invoice.test.js', () => {
  // Synthetic order with the subtotal and recorded bill from the ticket.
  const discountedOrder = {
    id: 1002,
    items: [{ name: 'Rice', hsn: '1006', price: 510, qty: 2 }],
    coupon: 'SAVE10',
    total: 963.90,
    tax: 45.90
  };

  it('order #1002 invoice agrees with the recorded GST and total', () => {
    const { tax, total } = invoice.computeInvoiceFigures(discountedOrder);
    assert.deepEqual({ tax, total }, { tax: discountedOrder.tax, total: discountedOrder.total });
  });

  it('SAVE10 discounts the subtotal before GST', () => {
    const figures = invoice.computeInvoiceFigures(discountedOrder);
    assert.equal(figures.subtotal, 1020);
    assert.equal(figures.rows[0].lineTax, 45.90);
    assert.equal(figures.discount, 102);
    assert.equal(figures.rows[0].gstPercent, 5);
  });

  it('SAVE10 respects its 150 rupee cap', () => {
    const figures = invoice.computeInvoiceFigures({
      items: [{ name: 'Tea', hsn: '0902', price: 2240, qty: 1 }],
      coupon: 'SAVE10'
    });
    assert.equal(figures.discount, 150);
  });

  it('5% and 12% HSN lines use their own GST rates', () => {
    const figures = invoice.computeInvoiceFigures({
      items: [
        { name: 'Rice', hsn: '1006', price: 100, qty: 1 },
        { name: 'Ghee', hsn: '0405', price: 200, qty: 1 }
      ]
    });
    assert.deepEqual(figures.rows.map(row => row.gstPercent), [5, 12]);
    assert.deepEqual(figures.rows.map(row => row.lineTax), [5, 24]);
    assert.equal(figures.tax, 29);
  });

  it('the printed invoice shows the billed total without a mismatch notice', () => {
    const html = invoice.render(discountedOrder);
    assert.match(html, /Invoice Total<\/td><td class="r">₹963\.90/);
    assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
  });

  it('an 18% sale without a coupon matches the saved bill', () => {
    const order = {
      items: [{ name: 'Tea', hsn: '0902', price: 100, qty: 2 }],
      total: 236
    };
    const figures = invoice.computeInvoiceFigures(order);
    assert.equal(figures.discount, 0);
    assert.equal(figures.cgst, 18);
    assert.equal(figures.sgst, 18);
    assert.equal(figures.total, order.total);
    assert.doesNotMatch(invoice.render(order), /Accountant Reconciliation Notice/);
  });
});
