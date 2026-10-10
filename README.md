# Papertrail PDF Library

A complete static PDF library using plain HTML, JavaScript and compiled Tailwind CSS v4. Six selectable primary colors (purple, green, amber, blue, red, slate), slate dark mode, warm folder icons and rose PDF icons.

## Included features
- Case-insensitive filename search (not PDF content search).
- Expandable nested folders with recursive document counts and breadcrumbs.
- Include/exclude subfolders, folder shortcut chips, grid/list layouts.
- Theme picker beside the dark-mode switch: Orange, Blue, Green, Rose, Zinc. Each has its own light and dark palette, and the whole site (backgrounds, sidebar, cards, borders, buttons, icons, focus rings) follows it.
- Glow effects: background glow, glowing buttons and icons, card hover glow, search focus glow. Glow is softer in light mode.
- Theme and dark/light choice are saved in the browser; first visit follows the system dark/light setting, Blue by default.
- Primary-color picker beside the dark-mode switch; color preference is saved independently.
- Filename, size and recently updated sorting; 48 documents per page.
- Embedded browser PDF viewer, open in new tab, download.
- Mobile folder drawer, keyboard focus styles, Escape to close, `/` to search.
- Build-time recursive catalog and automatic GitHub Pages deployment.
- No external runtime CDN, database, GitHub token or paid service needed.

## 1. Add your PDFs
Extract this ZIP. Copy your existing folder tree into `pdfs/`, keeping filenames and subfolders:

```text
pdfs/
  Learning/
    Java/
      Notes.pdf
  Projects/
    Design.pdf
  Another document.pdf
```

No PDFs are bundled. The interactive Page preview uses sample filenames only. The actual project starts empty and indexes your real files. Hidden files/directories and symlinks are excluded. Only `.pdf` files (case insensitive) are published. Empty folders appear in navigation, but Git does not track empty directories; add a `.gitkeep` if you want to retain one.

## 2. Preview locally
Install Node.js 22 or later with npm. Open a terminal in the extracted project:

```sh
npm ci
npm test
npm run dev
```

Visit http://localhost:8080. Stop with Ctrl+C. After adding/removing PDFs or changing source files, stop and rerun `npm run dev`; this is a build-and-serve command, not a file watcher. Do not double-click index.html: the catalog is fetched over HTTP.

The ZIP includes a prebuilt `dist/` for an empty library. Rebuild after adding your PDFs. If you only want a build:

```sh
npm run build
```

## 3. Publish on GitHub Pages
1. Create a repository with default branch `main`. A public repository is the simplest option for GitHub Free.
2. Upload the project CONTENTS at the repository root, including `.github/workflows/deploy.yml`, `package-lock.json`, and your `pdfs/` tree. Do not upload `node_modules/` or `dist/`.
3. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Push to `main`, or run **Actions → Build and deploy PDF library → Run workflow** if the initial run occurred before Pages was enabled.
5. The deployment job displays the site URL. Project sites normally use `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`.

If you prefer Git locally, from the project root (replace placeholders):

```sh
git init
git add .
git commit -m "Add Papertrail PDF library"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Future updates: add PDFs under `pdfs/`, commit, and push. The workflow regenerates the catalog, compiles Tailwind, and deploys. It does not commit generated files back to your source branch. No manual link editing is needed. Files must be in the repository; a public website cannot automatically access your local disk.

## Customize colors
All colors live in `themes.js`, using the same HSL token format as shadcn/ui (`background`, `primary`, `ring`, ...). The build turns them into CSS variables, so components never hard-code a color.

- Edit a theme: change its token values and rebuild.
- Add a theme: copy an entry in `themes.js`, give it a new key and label, then add the same key to the `themes` list in the small script inside `<head>` in `index.html` (a test checks the two lists match).
- Change the default theme: set `DEFAULT_THEME` in `themes.js` and the fallback in that `<head>` script.
- Change glow strength: edit the `glow` values in `themes.js`.

## Project files
- `index.html`: accessible HTML layout.
- `src/input.css`: Tailwind import plus themed component styles and glow effects.
- `themes.js`: color themes (exact shadcn-style tokens) and the CSS variable generator.
- `app.js`: folder navigation, search, viewer, theme picker and dark mode.
- `lib.js`: pure search/filter/URL helpers.
- `scripts/index-pdfs.mjs`: recursive PDF catalog generator.
- `scripts/build.mjs`: builds `dist/` with compiled `styles.css` (including theme variables) and your PDFs.
- `scripts/serve.mjs`: local preview server.
- `.github/workflows/deploy.yml`: automatic build and Pages deployment.
- `tests/library.test.mjs`: automated logic and catalog tests.
- `package.json`, `package-lock.json`: reproducible dependency install.

## Important limits and privacy
Publish only documents you own or have permission to share. Treat this as a PUBLIC library: there is no login or access control, and a hidden link is not protection. Do not upload confidential, personal or workplace-sensitive documents. A private source repository does not automatically make the published website private.

GitHub blocks regular Git files larger than 100 MiB; browser uploads are limited to 25 MiB. GitHub Pages published sites are limited to 1 GB. This project conservatively rejects PDFs at or above 100 MiB and collections above 950 MiB to leave room for website assets. Keep well below those limits. It deliberately uses regular Git files, not Git LFS; unresolved LFS pointer files cause a build error. Git LFS does not avoid the Pages site-size limit and needs extra checkout handling.

PDF rendering uses your browser's built-in support, not PDF.js. Some mobile browsers download PDFs instead of embedding them; Open in tab and Download remain available. No thumbnails or PDF-content indexing are included. Filenames with spaces, Unicode, # and % are URL-encoded. Filenames are inserted as text, not HTML.

“Recently updated” uses filesystem modification times. Git checkout does not preserve original local file modification dates, so deployed timestamps may reflect checkout time. It is not a reliable document-history feature.

## Troubleshooting
- Blank styles: run `npm ci` and `npm run build`; serve `dist/`, not the source root.
- Catalog not loading: use HTTP, and check that `catalog.json` exists in `dist/`.
- No documents: confirm PDFs are in `pdfs/`, committed, and the latest workflow succeeded.
- Workflow permissions: select GitHub Actions as the Pages source and allow Actions in repository settings.
- Missing workflow: ensure hidden `.github/` was uploaded.
- Different branch: change `branches: [main]` in the workflow.
- Too-large PDF: reduce its size or use another appropriate storage service; do not bypass host limits.

## Official references
- Tailwind CLI: https://tailwindcss.com/docs/installation/tailwind-cli
- GitHub Pages Actions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub file limits: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
