import test from 'node:test';
import assert from 'node:assert/strict';
import { parseItems, quoteIsExpired, quoteTotal, itemLines, shiftISODate, validateItems } from './core.mjs';

test('line items parse and round-trip in the visible format', () => {
  const items = [{ description: 'Design', quantity: 2, price: 100 }, { description: 'Copy', quantity: 1, price: 50 }];
  assert.deepEqual(parseItems(itemLines(items)), items);
  assert.deepEqual(parseItems('Design | 2 | 100\n\nCopy | 1 | 50'), items);
});

test('quote total rounds each line to cents and accepts fractional quantities', () => {
  assert.equal(quoteTotal([{ quantity: 2, price: 100 }, { quantity: 1, price: 50 }]), 250);
  assert.equal(quoteTotal([{ quantity: 0.1, price: 0.1 }, { quantity: 1, price: 0.2 }]), 0.21);
});

test('line item validation explains incomplete or invalid amounts', () => {
  assert.equal(validateItems([]), 'Add at least one line item.');
  assert.equal(validateItems([{ description: '', quantity: 1, price: 10 }]), 'Each line item needs a description.');
  assert.equal(validateItems([{ description: 'Design', quantity: 0, price: 10 }]), 'Quantities must be greater than zero.');
  assert.equal(validateItems([{ description: 'Design', quantity: 1, price: -1 }]), 'Unit prices must be zero or greater.');
  assert.equal(validateItems(parseItems('Design | 1 | ')), 'Unit prices must be zero or greater.');
  assert.equal(validateItems([{ description: 'Design', quantity: 1, price: 0 }]), '');
});

test('validity is based on local calendar dates and accepted quotes remain accepted', () => {
  assert.equal(shiftISODate('2026-12-31', 1), '2027-01-01');
  assert.equal(quoteIsExpired({ valid: '2026-11-15', status: 'sent' }, '2026-11-16'), true);
  assert.equal(quoteIsExpired({ valid: '2026-11-15', status: 'accepted' }, '2026-11-16'), false);
});
