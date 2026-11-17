import test from'node:test';import assert from'node:assert/strict';import{parseItems,quoteTotal,itemLines,money}from'./core.mjs';
test('parses line items and ignores blank lines',()=>{assert.deepEqual(parseItems('Design | 2 | 100\n\nCopy | 1 | 50'),[{description:'Design',quantity:2,price:100},{description:'Copy',quantity:1,price:50}])});
test('calculates extended quote totals',()=>{assert.equal(quoteTotal([{quantity:2,price:100},{quantity:1,price:50}]),250);assert.match(money(250),/250\.00/)});
test('line item text round trips',()=>{const rows=[{description:'Design',quantity:3,price:25}];assert.deepEqual(parseItems(itemLines(rows)),rows)});
