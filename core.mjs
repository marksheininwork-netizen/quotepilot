export const money = value => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
}).format(Number(value) || 0);

export function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftISODate(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localISODate(date);
}

export function parseItems(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const [description = '', quantity = '', price = ''] = line.split('|').map(part => part.trim());
    return {
      description,
      quantity: quantity === '' ? Number.NaN : Number(quantity),
      price: price === '' ? Number.NaN : Number(price),
    };
  });
}

export function validateItems(items) {
  if (items.length === 0) return 'Add at least one line item.';
  if (items.some(item => !item.description)) return 'Each line item needs a description.';
  if (items.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0)) return 'Quantities must be greater than zero.';
  if (items.some(item => !Number.isFinite(item.price) || item.price < 0)) return 'Unit prices must be zero or greater.';
  return '';
}

export function quoteTotal(items) {
  const cents = items.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0) * 100), 0);
  return cents / 100;
}

export function itemLines(items) {
  return items.map(item => `${item.description} | ${item.quantity} | ${item.price}`).join('\n');
}

export function quoteIsExpired(quote, today = localISODate()) {
  return quote.status !== 'accepted' && quote.valid < today;
}
