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

  it('CURRENT BEHAVIOUR: SAVE10 discounts the tax-inclusive bill', () => {
    const figures = invoice.computeInvoiceFigures(discountedOrder);
    assert.equal(figures.subtotal, 1020);
    assert.equal(figures.tax, 183.60);
    assert.equal(figures.discount, 120.36);
    assert.equal(figures.total, 1083.24);
  });

  it('CURRENT BEHAVIOUR: SAVE10 exceeds its 150 rupee cap', () => {
    const figures = invoice.computeInvoiceFigures({
      items: [{ name: 'Tea', hsn: '0902', price: 2240, qty: 1 }],
      coupon: 'SAVE10'
    });
    assert.equal(figures.discount, 264.32);
  });

  it('CURRENT BEHAVIOUR: 5% and 12% HSN lines both print at 18%', () => {
    const figures = invoice.computeInvoiceFigures({
      items: [
        { name: 'Rice', hsn: '1006', price: 100, qty: 1 },
        { name: 'Ghee', hsn: '0405', price: 200, qty: 1 }
      ]
    });
    assert.deepEqual(figures.rows.map(row => row.gstPercent), [18, 18]);
    assert.deepEqual(figures.rows.map(row => row.lineTax), [18, 36]);
    assert.equal(figures.tax, 54);
  });

  it('CURRENT BEHAVIOUR: the printed notice shows a 119.34 rupee difference', () => {
    const html = invoice.render(discountedOrder);
    assert.match(html, /Invoice computed total \(₹1083\.24\)/);
    assert.match(html, /recorded total \(₹963\.90\) by \+₹119\.34/);
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
