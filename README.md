# Marland Continental website

Static marketing site for Marland Continental: shipping-container athletic facilities with naming-rights funding through Stadia IP. Plain HTML, CSS and JavaScript, with no build step.

## Pages

Each page is a folder with its own `index.html` (for example `buy/index.html`), so URLs look like `/buy/` and `/buy/?p=press-box`.

| Page | Purpose |
|---|---|
| `index.html` | Home. Sends visitors to the buyer or partner path |
| `buyers/` | Landing page for schools and venues, with the filterable gallery of all 17 products |
| `partners/` | Landing page for brands and sponsors (naming rights). Same gallery, showing naming format, brand canvas and placement |
| `buy/` | Configurator: facility, tier, buy or rent, options (including the stage AV package), delivered price, then an order request. Accepts `?p=<slug>&tier=<economy\|standard\|luxury>` |
| `markets/` | Future Markets: Military (mobile gym), Emergency Services (shelter), Education (STEM lab), Entertainment (pop-up store), Infrastructure (bus stop) |
| `contact/` | Contact form. Accepts `?type=<buyer\|partner\|rental\|markets\|investor\|press\|other>&p=<slug>` to prefill |
| `about/` | Team headshots, story, Stadia IP ecosystem, home base, roadmap |

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Content sources

- **Prices** in `js/products.js` come from `Marland_Continental_Product_Pricing.xlsx` (Price Worksheet and Stage AV Add-Ons tabs). They are delivered, per-unit prices and exclude site foundation, utility connection, sales tax and permits. If the workbook changes, update the `prices` values and `MC_STAGE_AV`.
- **Product images** come from the `Marland continental products` folder. Renders that also appear in the pitch deck are excluded. `tools/build_images.py` regenerates `assets/img/products/` (covers, crops and plan views). It deletes and rebuilds that folder.
- **Logos**: Marland Continental from the `Marland Continental assets` folder; Stadia IP (color and white) from the Stadia IP one-pager; the StruXure mark from the supplied image. The team headshots are the only images taken from the deck.

## Settings

In `js/main.js`, `MC_CONFIG.email` is set to `bill@stadiaip.com`. Optionally set `MC_CONFIG.formEndpoint` to a form service URL (Formspree, Basin, etc.). Without an endpoint, forms open the visitor's email app with the request filled in.

## Editing

- **Products and future markets** live in `js/products.js`. The galleries, product rail, lightbox, configurator and Future Markets page are generated from it.
- **Header, footer and consultation bar** are shared. Edit the templates in `tools/sync_partials.py`, then run `python tools/sync_partials.py` to update every page. Write links in the templates as `buy.html?p=x` and `assets/...`; the script rewrites them to `buy/?p=x` and adds `../` for pages in folders.
- **Brand tokens** (colors, fonts, radii) are at the top of `css/styles.css`. Fonts are DM Serif Text (headings) and Hind (body), matching the deck.
