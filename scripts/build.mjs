import { mkdir, rm, copyFile, writeFile, appendFile, stat, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalog } from './index-pdfs.mjs';
import { themeCss } from '../themes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const catalog = await createCatalog(root);
const total = catalog.files.reduce((n, f) => n + f.size, 0);
if (total > 950 * 1024 * 1024) {
  throw new Error('PDF collection exceeds the project safety limit of 950 MiB. Reduce its size before deploying.');
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ['index.html', 'app.js', 'lib.js', 'themes.js']) {
  await copyFile(path.join(root, file), path.join(dist, file));
}
for (const file of catalog.files) {
  const target = path.join(dist, ...file.path.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, ...file.path.split('/')), target);
}
await writeFile(path.join(dist, 'catalog.json'), JSON.stringify(catalog));
await writeFile(path.join(dist, '.nojekyll'), '');

const cli = path.join(root, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
try {
  await access(cli);
} catch {
  console.error('Tailwind CLI not found. Run "npm install" first (on Windows PowerShell: "npm.cmd install").');
  process.exit(1);
}
const result = spawnSync(process.execPath, [cli, '-i', path.join(root, 'src', 'input.css'), '-o', path.join(dist, 'styles.css'), '--minify'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);

// Theme variables generated from themes.js (single source of truth for colors).
await appendFile(path.join(dist, 'styles.css'), '\n/* Themes generated from themes.js */\n' + themeCss());
await stat(path.join(dist, 'styles.css'));
console.log(`Built dist: ${catalog.files.length} PDFs, ${catalog.folders.length} folders.`);
