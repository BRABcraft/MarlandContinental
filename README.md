# Marland Continental website

Static marketing site for Marland Continental: shipping-container athletic facilities with naming-rights funding through Stadia IP. Plain HTML, CSS and JavaScript, with no build step.

## Pages

Each page is a folder with its own `index.html` (for example `buy/index.html`), so URLs look like `/buy/` and `/buy/20-foot-press-box/`.

| Page | Purpose |
|---|---|
| `index.html` | Home. Sends visitors to the buyer or partner path |
| `buyers/` | Landing page for schools and venues, with the filterable gallery of all 17 products |
| `partners/` | Landing page for brands and sponsors (naming rights). Same gallery, showing naming format, brand canvas and placement |
| `buy/` | Shop catalog: category filters (`?cat=seating`), sort, and product cards. Old `?p=<slug>` links redirect to the product page |
| `buy/<product>/` | Product pages (e.g. `buy/40-foot-bleachers/`): images and description on the left; sticky panel on the right with tier, purchase type, options (ⓘ tooltips), delivered price and the quote button; order form below. Accepts `?tier=` |
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
- **Product images** come from the `Marland continental products` folder, and every cover is a rendering. `tools/build_images.py` regenerates `assets/img/products/` (covers, crops and plan views). It deletes and rebuilds that folder.
- **Logos**: Marland Continental from the `Marland Continental assets` folder; Stadia IP (color and white) from the Stadia IP one-pager; the StruXure mark from the supplied image. The team headshots are taken from the pitch deck.

## Form submissions (Google Sheets)

The quote form on every product page, the contact form and the consultation bar all save to a Google Sheet called **Marland Continental Quotes**, through a Google Apps Script web app (the same setup as the Cargotecture survey).

1. Create a Google Sheet named **Marland Continental Quotes**.
2. Give the script **its own Apps Script project**: go to [script.google.com](https://script.google.com) → **New project** (or open the sheet → **Extensions → Apps Script**). Paste in `apps-script/Code.gs` as the only code and save. Don't add it to the survey's project: a project can only have one `doPost`/`doGet`, so the two scripts would override each other.
3. Pick `mcSetup` in the function dropdown and click **Run**, approving the permissions. It finds the sheet by name, creates the **Quote Requests**, **Contact Messages** and **Consultation Requests** tabs, and logs the sheet's URL. (Optional: run `mcTestInsert` to add a test row to each tab, then delete them.)
4. **Deploy → New deployment → ⚙ Select type → Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**, then **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. Paste it into `js/main.js`:
   ```js
   sheetsEndpoint: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
6. Publish the site. Opening the `/exec` URL in a browser should say "Marland Continental forms endpoint is running. Writing to "Marland Continental Quotes": <link>", which confirms which sheet it uses.

The script always writes to the sheet named **Marland Continental Quotes**, whichever project it's in. To pin a specific file, paste its ID into `MC_SPREADSHEET_ID` at the top of `Code.gs`.

**What lands in the sheet**
- **Quote Requests**: request ID (e.g. `Q-LS5XQ3AV`, also shown to the customer), time, a **Status** column (starts as "New", for tracking), product, tier, purchase type, options, the price shown, contact details, delivery state, timeline, notes and the product page link.
- **Contact Messages**: inquiry type, name, email, organization, phone, message, the product (when they came from a product or future-market link) and whether they want updates.
- **Consultation Requests**: name, email and school or organization.

Rows are written by column name, so you can reorder or add columns in the sheet freely. A new form field shows up as a new column automatically. To get an email for every new row, set `MC_NOTIFY_EMAIL` near the top of `Code.gs` (e.g. `"bill@stadiaip.com"`).

> **If you edit `Code.gs` later**, publish a new version: **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**. The URL stays the same.

Until `sheetsEndpoint` is set, the forms show "Online requests aren't connected yet" with the email address (`MC_CONFIG.email`, currently `bill@stadiaip.com`). Nothing opens an email app.

## Editing

- **Products and future markets** live in `js/products.js`. The galleries, product rail, lightbox, shop and Future Markets page are generated from it.
- **Product pages** are static files built from `js/products.js`. After adding, renaming or editing a product, run `node tools/build_product_pages.mjs` (it also re-syncs the header and footer). The order form shared by every product page is `tools/templates/order-section.html`.
- **Header, footer and consultation bar** are shared. Edit the templates in `tools/sync_partials.py`, then run `python tools/sync_partials.py` to update every page. Write links in the templates as `buy.html?cat=x` and `assets/...`; the script rewrites them to `buy/?cat=x` and adds `../` for pages in folders.
- **"From the field" section** (testimonials, buyer interest, survey stats) appears on the home, Schools & Venues and Naming Rights pages. Its text is the `PROOF` template in `tools/sync_partials.py`; edit it there and run `python tools/sync_partials.py`. To add photos (sales meetings, builds at 500 Confederate Ave, installs), put them in `assets/img/field/` and list them in `MC_FIELD_PHOTOS` at the bottom of `js/products.js`. The photo strip appears once the list has entries.
- **Brand tokens** (colors, fonts, radii) are at the top of `css/styles.css`. Fonts are DM Serif Text (headings) and Hind (body), matching the deck.
