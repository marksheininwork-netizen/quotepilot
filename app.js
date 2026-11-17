import { itemLines, localISODate, money, parseItems, quoteIsExpired, quoteTotal, shiftISODate, validateItems } from './core.mjs';

const storageKey = 'quotepilot.quotes.v1';
const statuses = ['draft', 'sent', 'accepted', 'declined'];
const sampleQuotes = () => [{
  id: crypto.randomUUID(), quoteNumber: 'QP-024', client: 'Willow & Pine', title: 'Brand refresh & launch kit',
  valid: shiftISODate(localISODate(), 15), email: '', scope: 'Identity refresh and launch-ready digital assets.',
  items: [{ description: 'Identity design', quantity: 1, price: 1800 }, { description: 'Launch assets', quantity: 1, price: 950 }], status: 'sent',
}];

function readQuotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return Array.isArray(saved) ? saved : sampleQuotes();
  } catch {
    return sampleQuotes();
  }
}

let quotes = readQuotes();
let filter = 'all';
const $ = selector => document.querySelector(selector);
const form = $('#quote-form');

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2200);
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(quotes));
  render();
}

function editQuote(quote) {
  for (const field of ['id', 'client', 'title', 'valid', 'email', 'scope']) {
    form.elements.namedItem(field).value = quote[field] || '';
  }
  form.elements.namedItem('items').value = itemLines(quote.items);
  form.querySelector('[type="submit"]').textContent = 'Save changes';
  form.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  form.elements.namedItem('client').focus();
}

function render() {
  const count = Object.fromEntries(statuses.map(status => [status, 0]));
  quotes.forEach(quote => { count[quote.status] = (count[quote.status] || 0) + 1; });
  $('#stats').innerHTML = `
    <div class="stat"><label>Quotes created</label><strong>${quotes.length}</strong></div>
    <div class="stat"><label>Awaiting decision</label><strong>${count.sent || 0}</strong></div>
    <div class="stat"><label>Accepted</label><strong>${count.accepted || 0}</strong></div>`;

  const query = $('#quote-search').value.trim().toLowerCase();
  const today = localISODate();
  const visible = quotes.filter(quote => {
    const matchesFilter = filter === 'all' || quote.status === filter;
    const matchesQuery = `${quote.client} ${quote.title}`.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });
  const body = $('#quotes');
  body.replaceChildren();
  for (const quote of visible) {
    const row = document.createElement('tr');
    row.innerHTML = `<td><div class="client-name"></div><div class="invoice-number"></div></td><td><time></time><small class="due-note"></small></td><td><b class="quote-total"></b></td><td><span class="pill"></span></td><td><div class="row-actions"></div></td>`;
    row.querySelector('.client-name').textContent = quote.client;
    row.querySelector('.invoice-number').textContent = `${quote.quoteNumber || 'Quote'} · ${quote.title}`;
    row.querySelector('time').dateTime = quote.valid;
    row.querySelector('time').textContent = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${quote.valid}T12:00:00`));
    row.querySelector('.due-note').textContent = quoteIsExpired(quote, today) ? 'Expired' : 'Valid';
    row.querySelector('.quote-total').textContent = money(quoteTotal(quote.items));
    const badge = row.querySelector('.pill');
    badge.className = `pill ${statuses.includes(quote.status) ? quote.status : 'draft'}`;
    badge.textContent = statuses.includes(quote.status) ? quote.status[0].toUpperCase() + quote.status.slice(1) : 'Draft';

    const actions = row.querySelector('.row-actions');
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.textContent = 'Preview / print';
    preview.onclick = () => printQuote(quote);
    actions.append(preview);
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.onclick = () => editQuote(quote);
    actions.append(edit);
    const status = document.createElement('select');
    status.setAttribute('aria-label', `Status for ${quote.title}`);
    for (const value of statuses) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value[0].toUpperCase() + value.slice(1);
      option.selected = value === quote.status;
      status.append(option);
    }
    status.onchange = () => { quote.status = status.value; persist(); };
    actions.append(status);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete quote for ${quote.client}`);
    remove.onclick = () => {
      if (!confirm(`Delete the quote “${quote.title}” for ${quote.client}?`)) return;
      quotes = quotes.filter(item => item.id !== quote.id);
      persist();
      toast('Quote deleted');
    };
    actions.append(remove);
    body.append(row);
  }

  const noMatches = visible.length === 0;
  $('#empty').classList.toggle('hidden', !noMatches);
  $('#empty').textContent = quotes.length === 0
    ? 'Your quote desk is ready. Create a quote to begin.'
    : 'No quotes match this search. Try another name or status.';
  $('.table-wrap').classList.toggle('hidden', noMatches);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function printQuote(quote) {
  const popup = window.open('', '_blank', 'width=850,height=900');
  if (!popup) { toast('Allow pop-ups to preview this quote'); return; }
  const rows = quote.items.map(item => `<tr><td>${escapeHTML(item.description)}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.quantity * item.price)}</td></tr>`).join('');
  const title = escapeHTML(quote.title);
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title} — QuotePilot</title><style>
    body{font:16px Arial,sans-serif;color:#252440;max-width:720px;margin:50px auto;padding:0 30px}header{display:flex;justify-content:space-between;border-bottom:2px solid #554d8d;padding-bottom:20px}h1{font-size:34px}.meta{color:#666;line-height:1.8}.scope{background:#f7f6fa;padding:18px;border-radius:8px;white-space:pre-wrap}table{width:100%;border-collapse:collapse;margin-top:35px}td,th{text-align:left;border-bottom:1px solid #ddd;padding:12px 8px}th{font-size:12px;color:#666}.total{text-align:right;font-size:24px;font-weight:bold;margin:25px 0}.print{position:fixed;right:24px;top:20px;padding:12px 20px;background:#554d8d;color:white;border:0;border-radius:6px;cursor:pointer}@media print{.print{display:none}body{margin:0}}
    </style></head><body><button class="print" onclick="window.print()">Print / Save PDF</button><header><b>QuotePilot · ${title}</b><span>${escapeHTML(quote.quoteNumber || 'Quote')}<br>VALID UNTIL ${escapeHTML(quote.valid)}</span></header><h1>${title}</h1><p class="meta">Prepared for <b>${escapeHTML(quote.client)}</b>${quote.email ? `<br>${escapeHTML(quote.email)}` : ''}</p><p class="scope">${escapeHTML(quote.scope || 'Project scope as discussed.')}</p><table><thead><tr><th>DESCRIPTION</th><th>QTY</th><th>UNIT PRICE</th><th>AMOUNT</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total: ${money(quoteTotal(quote.items))}</div><p class="meta">Thank you for considering this project. Please reply to discuss any changes.</p></body></html>`);
  popup.document.close();
}

$('#new-quote').onclick = () => {
  form.reset();
  form.elements.namedItem('id').value = '';
  form.querySelector('[type="submit"]').textContent = 'Save quote';
  form.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  form.elements.namedItem('client').focus();
};
$('#cancel').onclick = () => { form.reset(); form.classList.add('hidden'); };
$('#quote-search').addEventListener('input', render);
$('#quote-filter').addEventListener('change', event => { filter = event.target.value; render(); });

form.onsubmit = event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const items = parseItems(values.items);
  const error = validateItems(items);
  if (error) { toast(error); form.elements.namedItem('items').focus(); return; }
  const existing = quotes.find(quote => quote.id === values.id);
  const quote = {
    ...existing,
    ...values,
    id: existing?.id || crypto.randomUUID(),
    quoteNumber: existing?.quoteNumber || `QP-${String(Date.now()).slice(-6)}`,
    client: values.client.trim(),
    title: values.title.trim(),
    items,
    status: existing?.status || 'draft',
  };
  if (existing) quotes = quotes.map(item => item.id === existing.id ? quote : item);
  else quotes.unshift(quote);
  form.reset();
  form.classList.add('hidden');
  persist();
  toast(existing ? 'Quote updated on this device' : 'Quote saved on this device');
};

$('#export').onclick = () => {
  const rows = [['Quote', 'Client', 'Project', 'Total', 'Status', 'Valid until'], ...quotes.map(quote => [quote.quoteNumber || 'Quote', quote.client, quote.title, quoteTotal(quote.items), quote.status, quote.valid])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.csv';
  link.click();
  URL.revokeObjectURL(url);
};

render();
