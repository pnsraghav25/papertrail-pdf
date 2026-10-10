import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { matchesFolder, filterFiles, pdfUrl, formatBytes } from '../lib.js';
import { createCatalog } from '../scripts/index-pdfs.mjs';
import { themes, themeVars, themeCss, DEFAULT_THEME, GLOW_RADIUS, clampGlowRadius } from '../themes.js';

test('Folder boundaries and recursion', () => {
  assert.equal(matchesFolder('A/B', 'A'), true);
  assert.equal(matchesFolder('AB', 'A'), false);
  assert.equal(matchesFolder('A/B', 'A', false), false);
  assert.equal(matchesFolder('', '', false), true);
  assert.equal(matchesFolder('A', '', false), false);
});

test('Filename search and sorting', () => {
  const files = [
    { name: 'Z.pdf', folder: 'A', path: 'pdfs/A/Z.pdf', size: 1 },
    { name: 'Report 2.PDF', folder: 'A/B', path: 'pdfs/A/B/Report 2.PDF', size: 2 },
  ];
  assert.equal(filterFiles(files, { query: 'REPORT' })[0].name, 'Report 2.PDF');
  assert.equal(filterFiles(files, { folder: 'A', recursive: false }).length, 1);
  assert.equal(filterFiles(files, { sort: 'size' })[0].size, 2);
});

test('URL encodes reserved characters and Unicode', () => {
  assert.equal(pdfUrl('pdfs/A B/a#b%.pdf'), './pdfs/A%20B/a%23b%25.pdf');
  assert.ok(pdfUrl('pdfs/தமிழ்.pdf').includes('%'));
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
});

test('Recursive catalog handles duplicate names, uppercase extension and hidden files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'papertrail-'));
  try {
    await mkdir(path.join(root, 'pdfs', 'A', 'B'), { recursive: true });
    await mkdir(path.join(root, 'pdfs', 'Empty'));
    await writeFile(path.join(root, 'pdfs', 'A', 'same.pdf'), 'fixture');
    await writeFile(path.join(root, 'pdfs', 'A', 'B', 'same.PDF'), 'fixture');
    await writeFile(path.join(root, 'pdfs', '.hidden.pdf'), 'fixture');
    await writeFile(path.join(root, 'pdfs', 'note.txt'), 'not a pdf');
    const c = await createCatalog(root);
    assert.equal(c.files.length, 2);
    assert.equal(c.folders.find(f => f.path === 'A').count, 2);
    assert.equal(c.folders.find(f => f.path === 'Empty').count, 0);
    assert.equal(new Set(c.files.map(f => f.path)).size, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Reject unresolved LFS pointers', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'papertrail-'));
  try {
    await mkdir(path.join(root, 'pdfs'));
    await writeFile(path.join(root, 'pdfs', 'pointer.pdf'), 'version https://git-lfs.github.com/spec/v1\n');
    await assert.rejects(createCatalog(root), /LFS pointer/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Themes use the exact supplied tokens and generate CSS for every theme and mode', () => {
  assert.deepEqual(Object.keys(themes), ['orange', 'blue', 'green', 'rose', 'zinc']);
  assert.equal(DEFAULT_THEME, 'blue');
  assert.equal(themes.blue.light.primary, '221.2 83.2% 53.3%');
  assert.equal(themes.orange.dark.ring, '20.5 90.2% 48.2%');
  assert.equal(themes.green.dark.card, '24 9.8% 10%');
  assert.equal(themes.zinc.dark.primary, '0 0% 98%');
  const required = ['background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground', 'primary',
    'primaryForeground', 'secondary', 'secondaryForeground', 'muted', 'mutedForeground', 'accent', 'accentForeground',
    'destructive', 'destructiveForeground', 'border', 'input', 'ring'];
  for (const [name, t] of Object.entries(themes)) {
    for (const mode of ['light', 'dark']) {
      for (const k of required) assert.ok(t[mode][k], `${name}.${mode}.${k} missing`);
    }
  }
  const v = themeVars('rose', 'dark');
  assert.equal(v['--primary'], 'hsl(346.8 77.2% 49.8%)');
  assert.equal(v['--card-foreground'], 'hsl(0 0% 95%)');
  assert.equal(v['--radius'], '0.5rem');
  const css = themeCss();
  for (const name of Object.keys(themes)) {
    for (const mode of ['light', 'dark']) assert.ok(css.includes(`[data-theme="${name}"][data-mode="${mode}"]`));
  }
  assert.equal(themeVars('unknown', 'light')['--primary'], themeVars('blue', 'light')['--primary']);
});

test('Glow radius is clamped to the slider range and invalid values use the default', () => {
  assert.deepEqual(GLOW_RADIUS, { min: 50, max: 200, step: 10, default: 100 });
  assert.equal(clampGlowRadius(null), 100);
  assert.equal(clampGlowRadius(''), 100);
  assert.equal(clampGlowRadius('abc'), 100);
  assert.equal(clampGlowRadius('150'), 150);
  assert.equal(clampGlowRadius(10), 50);
  assert.equal(clampGlowRadius(999), 200);
  assert.equal(clampGlowRadius(134), 130);
});

test('Head script matches themes.js and the glow slider range', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const m = html.match(/var themes = \[([^\]]+)\]/);
  assert.deepEqual(m[1].split(',').map(s => s.trim().replace(/'/g, '')), Object.keys(themes));
  assert.ok(html.includes(`Math.min(${GLOW_RADIUS.max}, Math.max(${GLOW_RADIUS.min}, Math.round(radius / ${GLOW_RADIUS.step}) * ${GLOW_RADIUS.step}))`));
  assert.ok(html.includes(`isNaN(radius) ? ${GLOW_RADIUS.default}`));
  assert.ok(html.includes(`min="${GLOW_RADIUS.min}" max="${GLOW_RADIUS.max}" step="${GLOW_RADIUS.step}"`));
  assert.ok(html.includes('role="switch"'));
});

test('Stylesheet has glow-off overrides and scales glow with --glow-scale', async () => {
  const css = await readFile(new URL('../src/input.css', import.meta.url), 'utf8');
  for (const sel of ['.aurora', '.hero', '.glow-btn', '.icon-tile', '.document-card:hover', 'dialog']) {
    assert.ok(css.includes(`:root[data-glow="off"] ${sel}`), `missing glow-off rule for ${sel}`);
  }
  assert.ok((css.match(/var\(--glow-scale\)/g) || []).length >= 15);
});
