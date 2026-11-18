import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));

test('manifest defines an installable, correctly scoped app', () => {
  assert.ok(manifest.name);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
  for (const icon of manifest.icons) {
    const path = join(root, icon.src);
    assert.ok(statSync(path).size > 1000, `${icon.src} should be a real icon asset`);
    const png = readFileSync(path);
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  }
});

test('the page links its manifest and registers the offline shell', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const worker = readFileSync(join(root, 'sw.js'), 'utf8');
  assert.match(html, /rel="manifest"/);
  assert.match(html, /serviceWorker\.register\('\.\/sw\.js'\)/);
  assert.match(worker, /cache\.addAll\(SHELL\)/);
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.ok(readFileSync(join(root, 'privacy.html'), 'utf8').length > 100);
  assert.ok(readFileSync(join(root, 'support.html'), 'utf8').length > 100);
});
