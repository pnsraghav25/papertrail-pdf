import { filterFiles, formatBytes, pdfUrl } from './lib.js';
import { themes, DEFAULT_THEME, GLOW_RADIUS, clampGlowRadius } from './themes.js';

const $ = id => document.getElementById(id);
const root = document.documentElement;

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no external dependency)                          */
/* ------------------------------------------------------------------ */
const paths = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 3H20v19H6.5A2.5 2.5 0 0 1 4 19.5v-14A2.5 2.5 0 0 1 6.5 3Z',
  folder: 'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h5',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  grid: 'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  sun: 'M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  moon: 'M21 12.8A9 9 0 0 1 11.2 3 9 9 0 1 0 21 12.8Z',
  close: 'M6 6l12 12 M6 18L18 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  chevron: 'M9 5l7 7-7 7',
  arrow: 'M7 17 17 7 M7 7h10v10',
  up: 'M12 19V5 M5 12l7-7 7 7',
  palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22Z M7.5 10.5h.01 M10.5 7.5h.01 M15.5 8.5h.01',
  check: 'M20 6 9 17l-5-5',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 3v4 M17 5h4',
};

function icon(name, size = 20) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const attrs = { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
  for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', paths[name] || paths.file);
  svg.append(p);
  return svg;
}

function el(tag, cls = '', text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const read = k => { try { return localStorage.getItem(k); } catch { return null; } };

for (const e of document.querySelectorAll('[data-icon]')) {
  e.append(icon(e.dataset.icon, Number(e.dataset.size) || 20));
}

/* ------------------------------------------------------------------ */
/* Theme (color) + mode (light/dark)                                   */
/* ------------------------------------------------------------------ */
const currentMode = () => (root.dataset.mode === 'dark' ? 'dark' : 'light');
const currentTheme = () => (themes[root.dataset.theme] ? root.dataset.theme : DEFAULT_THEME);

function renderThemeOptions() {
  const box = $('theme-options');
  box.replaceChildren();
  for (const [key, theme] of Object.entries(themes)) {
    const primary = `hsl(${theme[currentMode()].primary})`;
    const b = el('button', 'theme-option hover-soft');
    b.type = 'button';
    b.dataset.theme = key;
    b.setAttribute('aria-pressed', String(key === currentTheme()));
    const swatch = el('span', 'swatch border');
    swatch.style.background = primary;
    if (glowOn()) swatch.style.boxShadow = `0 0 ${Math.round(10 * glowRadius / 100)}px ${primary}`;
    const check = icon('check', 14);
    check.classList.add('check');
    b.append(swatch, el('span', '', theme.label), check);
    b.onclick = () => { setTheme(key); closePicker(true); };
    box.append(b);
  }
}

function updateThemeUi() {
  const label = themes[currentTheme()].label;
  const mode = currentMode();
  $('theme-label').textContent = label;
  $('theme-trigger').setAttribute('aria-label', `Customize appearance (color: ${label})`);
  $('theme-status').textContent = `${mode === 'dark' ? 'Dark' : 'Light'} palette · Auto-saved`;
  $('footer-theme').textContent = `${label} / ${mode === 'dark' ? 'Dark' : 'Light'} · Saved automatically`;
  $('mode-toggle').replaceChildren(icon(mode === 'dark' ? 'sun' : 'moon', 18));
  $('mode-toggle').setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  $('mode-toggle').setAttribute('aria-pressed', String(mode === 'dark'));
  renderThemeOptions(); // swatches show the primary color for the active mode
}

function setTheme(key) {
  root.dataset.theme = themes[key] ? key : DEFAULT_THEME;
  save('papertrail-color', root.dataset.theme);
  updateThemeUi();
}

function setMode(mode) {
  root.dataset.mode = mode === 'dark' ? 'dark' : 'light';
  save('papertrail-mode', root.dataset.mode);
  updateThemeUi();
}

/* ------------------------------------------------------------------ */
/* Glow: on/off + radius                                               */
/* ------------------------------------------------------------------ */
let glowRadius = clampGlowRadius(read('papertrail-glow-radius'));
const glowOn = () => root.dataset.glow !== 'off';

function applyGlow() {
  const on = glowOn();
  root.style.setProperty('--glow-scale', String(glowRadius / 100));
  $('glow-toggle').setAttribute('aria-checked', String(on));
  $('glow-radius').value = String(glowRadius);
  $('glow-radius').disabled = !on;
  $('glow-radius').setAttribute('aria-valuetext', `${glowRadius}%`);
  $('glow-radius-value').textContent = on ? `${glowRadius}%` : 'Off';
  $('glow-radius-row').classList.toggle('is-disabled', !on);
  renderThemeOptions(); // swatch glow follows the setting
}

function setGlow(on) {
  root.dataset.glow = on ? 'on' : 'off';
  save('papertrail-glow', root.dataset.glow);
  applyGlow();
}

function setGlowRadius(value) {
  glowRadius = clampGlowRadius(value);
  save('papertrail-glow-radius', String(glowRadius));
  applyGlow();
}

$('glow-radius').min = String(GLOW_RADIUS.min);
$('glow-radius').max = String(GLOW_RADIUS.max);
$('glow-radius').step = String(GLOW_RADIUS.step);
$('glow-toggle').onclick = () => setGlow(!glowOn());
$('glow-radius').addEventListener('input', e => setGlowRadius(e.target.value));

/* ------------------------------------------------------------------ */
/* Customize menu open/close                                           */
/* ------------------------------------------------------------------ */
function openPicker() {
  $('theme-picker').hidden = false;
  $('theme-trigger').setAttribute('aria-expanded', 'true');
  $('theme-options').querySelector('[aria-pressed="true"]')?.focus();
}

function closePicker(returnFocus = false) {
  if ($('theme-picker').hidden) return;
  $('theme-picker').hidden = true;
  $('theme-trigger').setAttribute('aria-expanded', 'false');
  if (returnFocus) $('theme-trigger').focus();
}

$('theme-trigger').onclick = () => ($('theme-picker').hidden ? openPicker() : closePicker());
$('theme-reset').onclick = () => {
  setTheme(DEFAULT_THEME);
  root.dataset.glow = 'on';
  save('papertrail-glow', 'on');
  setGlowRadius(GLOW_RADIUS.default);
};
$('mode-toggle').onclick = () => setMode(currentMode() === 'dark' ? 'light' : 'dark');
document.addEventListener('pointerdown', e => { if (!$('theme-menu').contains(e.target)) closePicker(); });
updateThemeUi();
applyGlow();

/* ------------------------------------------------------------------ */
/* Library state                                                       */
/* ------------------------------------------------------------------ */
const state = {
  files: [], folders: [], folder: '', query: '', recursive: true, sort: 'name',
  page: 1, pageSize: 48, layout: read('papertrail-layout') === 'list' ? 'list' : 'grid',
  expanded: new Set(),
};

const parentOf = p => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');

function mobile(open) {
  $('sidebar').classList.toggle('open', open);
  $('mobile-backdrop').hidden = !open;
  $('open-sidebar').setAttribute('aria-expanded', String(open));
}
$('open-sidebar').onclick = () => mobile(true);
$('close-sidebar').onclick = () => mobile(false);
$('mobile-backdrop').onclick = () => mobile(false);

function selectFolder(folder) {
  state.folder = folder;
  state.page = 1;
  const parts = folder.split('/').filter(Boolean);
  while (parts.length) { state.expanded.add(parts.join('/')); parts.pop(); }
  renderTree();
  render();
  mobile(false);
}
$('all-documents').onclick = () => selectFolder('');

function setQuery(value) {
  state.query = value;
  $('search').value = value;
  state.page = 1;
  render();
}

function clearAllFilters() {
  state.query = '';
  $('search').value = '';
  state.recursive = true;
  $('recursive').checked = true;
  selectFolder('');
}

/* ------------------------------------------------------------------ */
/* Folder tree                                                         */
/* ------------------------------------------------------------------ */
function renderTree() {
  const nav = $('folder-tree');
  nav.replaceChildren();
  const children = new Map();
  for (const f of state.folders) {
    const parent = parentOf(f.path);
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(f);
  }

  (function branch(parent, depth) {
    for (const f of children.get(parent) || []) {
      const hasChildren = children.has(f.path);
      const open = state.expanded.has(f.path);
      const row = el('div', 'folder-row' + (state.folder === f.path ? ' selected' : ''));
      row.style.paddingLeft = `${depth * 14}px`;

      const toggle = el('button', 'folder-toggle');
      if (hasChildren) {
        const chevron = icon('chevron', 14);
        if (open) chevron.style.transform = 'rotate(90deg)';
        toggle.append(chevron);
        toggle.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${f.name}`);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.onclick = () => { open ? state.expanded.delete(f.path) : state.expanded.add(f.path); renderTree(); };
      } else {
        toggle.disabled = true;
        toggle.tabIndex = -1;
        toggle.setAttribute('aria-hidden', 'true');
      }

      const select = el('button', 'folder-select');
      select.title = f.path;
      select.append(icon('folder', 17), el('span', 'truncate', f.name), el('span', 'ml-auto text-xs muted', String(f.count)));
      if (state.folder === f.path) select.setAttribute('aria-current', 'page');
      select.onclick = () => selectFolder(f.path);

      row.append(toggle, select);
      nav.append(row);
      if (hasChildren && open) branch(f.path, depth + 1);
    }
  })('', 0);

  const all = $('all-documents');
  all.classList.toggle('nav-active', state.folder === '');
  all.classList.toggle('muted', state.folder !== '');
  if (state.folder === '') all.setAttribute('aria-current', 'page'); else all.removeAttribute('aria-current');

  const allOpen = state.folders.length > 0 && state.expanded.size >= state.folders.length;
  $('expand-folders').textContent = allOpen ? 'Collapse all' : 'Expand all';
  $('expand-folders').hidden = !state.folders.some(f => f.path.includes('/'));
}

$('expand-folders').onclick = () => {
  const allOpen = state.expanded.size >= state.folders.length;
  state.expanded = allOpen ? new Set() : new Set(state.folders.map(f => f.path));
  renderTree();
};

/* ------------------------------------------------------------------ */
/* Folder filter bar (above the documents)                             */
/*   Row 1: active filters with ✕ buttons and "Clear all"              */
/*   Row 2: "All folders" + every top-level folder (always visible)    */
/*   Row 3: inside the selected folder: "Up" + its subfolders          */
/* ------------------------------------------------------------------ */
function folderChip({ label, count, active = false, onClick, iconName = 'folder', title }) {
  const b = el('button', 'surface hover-soft rounded-xl px-3 py-2 flex items-center gap-2 text-xs');
  b.type = 'button';
  if (title) b.title = title;
  const ico = icon(iconName, 15);
  ico.classList.add('primary-text');
  b.append(ico, el('span', '', label));
  if (count !== undefined) b.append(el('span', 'muted', String(count)));
  if (active) {
    b.setAttribute('aria-pressed', 'true');
    b.style.borderColor = 'var(--primary)';
    b.style.background = 'color-mix(in srgb, var(--primary) 14%, transparent)';
  } else if (onClick) {
    b.setAttribute('aria-pressed', 'false');
  }
  b.onclick = onClick;
  return b;
}

function filterPill(label, onRemove, removeLabel) {
  const pill = el('span', 'soft rounded-full pl-3 pr-1 py-1 text-xs inline-flex items-center gap-1');
  pill.append(el('span', 'break-all', label));
  const x = el('button', 'hover-soft rounded-full p-1 inline-flex');
  x.type = 'button';
  x.setAttribute('aria-label', removeLabel);
  x.title = removeLabel;
  x.append(icon('close', 12));
  x.onclick = onRemove;
  pill.append(x);
  return pill;
}

function renderFolderFilters() {
  const box = $('subfolders');
  box.className = 'flex flex-col gap-3 mb-5';
  box.replaceChildren();
  if (!state.folders.length && !state.query) return;

  // Row 1: active filters
  if (state.folder || state.query.trim() || !state.recursive) {
    const row = el('div', 'flex flex-wrap items-center gap-2');
    row.append(el('span', 'text-xs muted', 'Filters:'));
    if (state.folder) {
      row.append(filterPill(`Folder: ${state.folder.split('/').join(' / ')}`, () => selectFolder(''), 'Clear folder filter'));
    }
    if (state.query.trim()) {
      row.append(filterPill(`Search: "${state.query.trim()}"`, () => setQuery(''), 'Clear search'));
    }
    if (!state.recursive) {
      row.append(filterPill('Subfolders excluded', () => {
        state.recursive = true; $('recursive').checked = true; state.page = 1; render();
      }, 'Include subfolders again'));
    }
    const clear = el('button', 'text-xs primary-text font-medium hover:underline px-1', 'Clear all');
    clear.type = 'button';
    clear.onclick = clearAllFilters;
    row.append(clear);
    box.append(row);
  }

  if (!state.folders.length) return;

  // Row 2: top-level folders, always shown so you can jump between main folders
  const topRow = el('div', 'flex flex-wrap items-center gap-2');
  topRow.setAttribute('role', 'group');
  topRow.setAttribute('aria-label', 'Main folders');
  const topLevelOfSelection = state.folder.split('/')[0];
  topRow.append(folderChip({
    label: 'All folders', count: state.files.length, iconName: 'grid',
    active: state.folder === '', onClick: () => selectFolder(''),
  }));
  for (const f of state.folders.filter(f => !f.path.includes('/'))) {
    topRow.append(folderChip({
      label: f.name, count: f.count, title: f.path,
      active: !!state.folder && topLevelOfSelection === f.path,
      onClick: () => selectFolder(f.path),
    }));
  }
  box.append(topRow);

  // Row 3: inside the selected folder
  if (state.folder) {
    const children = state.folders.filter(f => parentOf(f.path) === state.folder);
    const isNested = state.folder.includes('/');
    if (children.length || isNested) {
      const subRow = el('div', 'flex flex-wrap items-center gap-2 pl-3 border-l-2');
      subRow.style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)';
      subRow.setAttribute('role', 'group');
      subRow.setAttribute('aria-label', `Subfolders of ${state.folder}`);
      if (isNested) {
        const parent = parentOf(state.folder);
        subRow.append(folderChip({
          label: `Up to ${parent.split('/').pop()}`, iconName: 'up', title: parent,
          onClick: () => selectFolder(parent),
        }));
      }
      if (children.length) {
        subRow.append(el('span', 'text-xs muted', `In ${state.folder.split('/').pop()}:`));
        for (const f of children) {
          subRow.append(folderChip({ label: f.name, count: f.count, title: f.path, onClick: () => selectFolder(f.path) }));
        }
      } else {
        subRow.append(el('span', 'text-xs muted', 'No subfolders here'));
      }
      box.append(subRow);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */
function highlight(name) {
  const frag = document.createDocumentFragment();
  const q = state.query.trim();
  if (!q) { frag.append(name); return frag; }
  const lower = name.toLocaleLowerCase(), needle = q.toLocaleLowerCase();
  let pos = 0, at;
  while ((at = lower.indexOf(needle, pos)) !== -1) {
    frag.append(name.slice(pos, at), el('mark', '', name.slice(at, at + q.length)));
    pos = at + q.length;
  }
  frag.append(name.slice(pos));
  return frag;
}

function openPdf(f) {
  const url = pdfUrl(f.path);
  $('viewer-title').textContent = f.name;
  $('viewer-path').textContent = f.folder || 'Library root';
  $('viewer-open').href = url;
  $('viewer-download').href = url;
  $('viewer-download').download = f.name;
  $('pdf-frame').src = url;
  $('viewer').showModal();
}
$('viewer-close').onclick = () => $('viewer').close();
$('viewer').addEventListener('close', () => $('pdf-frame').removeAttribute('src'));
$('viewer').addEventListener('click', e => {
  if (e.target !== $('viewer')) return;
  const r = $('viewer').getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('viewer').close();
});

function card(f) {
  const article = el('article', 'surface document-card');

  const top = el('div', 'card-top flex justify-between items-start');
  const tile = el('span', 'icon-tile inline-flex p-3 rounded-xl');
  tile.append(icon('file', 24));
  const arrow = icon('arrow', 17);
  arrow.classList.add('arrow');
  top.append(tile, arrow);

  const info = el('div', 'file-info');
  const title = el('button', 'file-title text-left font-semibold text-sm mt-4 link-hover');
  title.append(highlight(f.name));
  title.setAttribute('aria-label', `Preview ${f.name}`);
  title.onclick = () => openPdf(f);
  const where = el('p', 'text-xs muted mt-1.5 flex items-center gap-1 break-all');
  where.append(icon('folder', 13), f.folder || 'Library root');
  info.append(title, where);

  const foot = el('div', 'file-footer flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t text-xs');
  const meta = el('div', 'flex items-center gap-2');
  meta.append(el('span', 'soft rounded-md px-2 py-0.5 font-medium', 'PDF'), el('span', 'muted', formatBytes(f.size)));
  const links = el('div', 'flex items-center gap-3');
  const open = el('a', 'muted link-hover', 'Open ↗');
  open.href = pdfUrl(f.path);
  open.target = '_blank';
  open.rel = 'noopener';
  open.setAttribute('aria-label', `Open ${f.name} in a new tab`);
  const download = el('a', 'muted link-hover', 'Download');
  download.href = open.href;
  download.download = f.name;
  download.setAttribute('aria-label', `Download ${f.name}`);
  links.append(open, download);
  foot.append(meta, links);

  article.append(top, info, foot);

  // Clicking anywhere on the card opens the PDF viewer.
  // Open/Download links and the title button keep their own behavior,
  // and selecting text on the card doesn't open it.
  article.addEventListener('click', e => {
    if (e.target.closest('a, button')) return;
    if (String(getSelection()).trim()) return;
    openPdf(f);
  });
  return article;
}

function render() {
  // Breadcrumbs
  const crumbs = $('breadcrumbs');
  crumbs.replaceChildren();
  const home = el('button', 'link-hover', 'Library');
  home.onclick = () => selectFolder('');
  crumbs.append(home);
  let acc = '';
  for (const part of state.folder.split('/').filter(Boolean)) {
    acc += (acc ? '/' : '') + part;
    const path = acc;
    const b = el('button', 'link-hover break-all', part);
    b.onclick = () => selectFolder(path);
    crumbs.append(el('span', '', '/'), b);
  }
  if (state.folder) crumbs.lastElementChild.classList.add('primary-text');
  else crumbs.append(el('span', '', '/'), el('span', 'primary-text', 'All documents'));

  $('section-title').textContent = state.folder ? state.folder.split('/').pop() : 'All documents';

  // Folder filter bar
  renderFolderFilters();

  // Cards
  const rows = filterFiles(state.files, state);
  const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  $('result-count').textContent = `${rows.length.toLocaleString()} document${rows.length === 1 ? '' : 's'}`;

  const container = $('documents');
  container.className = state.layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid gap-3 list-layout';
  container.replaceChildren(...rows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize).map(card));

  // Empty state + paging
  $('empty-state').hidden = rows.length > 0;
  $('empty-title').textContent = state.files.length ? 'No matching documents' : 'Your library is ready for PDFs';
  $('empty-message').textContent = state.files.length
    ? 'Try a different filename, folder, or include subfolders.'
    : 'Add your PDFs inside the pdfs folder, keeping your subfolders, then rebuild or push to deploy.';
  $('reset-filters').hidden = !state.files.length;
  $('page-label').textContent = rows.length ? `Page ${state.page} of ${pages}` : '';
  $('previous').disabled = state.page <= 1;
  $('next').disabled = state.page >= pages;

  $('layout-toggle').replaceChildren(icon(state.layout === 'grid' ? 'list' : 'grid'));
  $('layout-toggle').setAttribute('aria-label', state.layout === 'grid' ? 'Switch to list view' : 'Switch to grid view');
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */
$('search').addEventListener('input', e => { state.query = e.target.value; state.page = 1; render(); });
$('sort').onchange = e => { state.sort = e.target.value; state.page = 1; render(); };
$('recursive').onchange = e => { state.recursive = e.target.checked; state.page = 1; render(); };
$('layout-toggle').onclick = () => {
  state.layout = state.layout === 'grid' ? 'list' : 'grid';
  save('papertrail-layout', state.layout);
  render();
};
$('previous').onclick = () => { state.page--; render(); scrollTo({ top: 0 }); };
$('next').onclick = () => { state.page++; render(); scrollTo({ top: 0 }); };
$('reset-filters').onclick = clearAllFilters;

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('theme-picker').hidden) closePicker(true);
    mobile(false);
  }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (e.key === '/' && !typing && !$('viewer').open) {
    e.preventDefault();
    $('search').focus();
  }
});

/* ------------------------------------------------------------------ */
/* Load catalog                                                        */
/* ------------------------------------------------------------------ */
try {
  const res = await fetch('./catalog.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.files) || !Array.isArray(data.folders)) throw new Error('Invalid catalog');
  state.files = data.files;
  state.folders = data.folders;
  $('all-count').textContent = state.files.length;
  $('stat-documents').textContent = state.files.length.toLocaleString();
  $('stat-folders').textContent = state.folders.length.toLocaleString();
  $('stat-size').textContent = formatBytes(state.files.reduce((n, f) => n + f.size, 0));
  $('updated-at').textContent = `· Indexed ${new Date(data.generatedAt).toLocaleDateString()}`;
  renderTree();
  render();
} catch (err) {
  $('result-count').textContent = 'Not loaded';
  $('empty-state').hidden = false;
  $('reset-filters').hidden = true;
  $('empty-title').textContent = 'Unable to load the PDF catalog';
  $('empty-message').textContent = 'Run npm run build and serve the dist folder over HTTP. Check that catalog.json was deployed.';
  console.error(err);
}
