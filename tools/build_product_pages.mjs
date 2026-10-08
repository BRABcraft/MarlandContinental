// Generates one static product page per product at buy/<url>/index.html from
// js/products.js, then runs sync_partials.py to fill in the shared header/footer.
//   node tools/build_product_pages.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(SITE, "js/products.js"), "utf8"), ctx);
const { MC_PRODUCTS: products, MC_CATEGORIES: categories, MC_TIERS: tiers, MC_STAGE_AV: stageAV } = ctx.window;

const R = "../../";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const catLabel = (id) => categories.find((c) => c.id === id).label;
const isPlan = (v) => /plan|spec|elevation/i.test(v.label);
const img = (p, file) => `${R}assets/img/products/${p.slug}/${file}`;
const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

let tipN = 0;
const tip = (topic, text) => {
  const id = `tip-${++tipN}`;
  return `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${esc(topic)}" aria-describedby="${id}">i</button><span class="tip-body" role="tooltip" id="${id}">${esc(text)}</span></span>`;
};

const ORDER = fs.readFileSync(path.join(SITE, "tools/templates/order-section.html"), "utf8");

function page(p) {
  tipN = 0;
  const v0 = p.images[0];
  const frameClass = ["buy-main", v0.fit === "contain" ? "is-contain" : "", isPlan(v0) ? "is-plan" : ""].filter(Boolean).join(" ");
  const views = p.images.length > 1 ? `
          <div class="pdp-views" data-buy-views role="group" aria-label="Views">
            ${p.images.map((v, i) => `<button type="button" class="pdp-view${isPlan(v) ? " is-plan" : ""}" data-buy-view="${i}" aria-pressed="${i === 0}" aria-label="${esc(v.label)}"><img src="${img(p, v.src)}" alt="" loading="lazy"><span>${esc(v.label)}</span></button>`).join("\n            ")}
          </div>` : "";
  const tierOpts = tiers.map((t) => `
              <label class="seg-opt"><input type="radio" name="tier" value="${t.id}"${t.id === "standard" ? " checked" : ""}><span class="seg-t">${t.label}</span><span class="seg-s">${money(p.prices[t.id])}</span></label>`).join("");
  const av = p.slug === "container-stage" && stageAV ? `
            <div class="opt-row"><label><input type="checkbox" name="addon" value="av" data-label="Stage AV package"><span>Stage AV package</span></label>${tip("the stage AV package", "LED video walls, audio, lighting rig, towable generator and 100′ of crowd barrier, matched to your tier.")}<span class="opt-note" data-av-price>+${money(stageAV.standard)}</span></div>` : "";
  const specs = [["Built from", p.container], ["Category", catLabel(p.category)], ...tiers.map((t) => [t.label, money(p.prices[t.id])])];

  return `<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.name)} | Shop | Marland Continental</title>
  <meta name="description" content="${esc(p.short)} From ${money(p.prices.economy)}, delivered. Economy, Standard and Luxury tiers.">
  <meta property="og:title" content="${esc(p.name)} | Marland Continental">
  <meta property="og:image" content="${R}assets/img/products/${p.slug}/cover.jpg">
  <link rel="icon" type="image/png" href="${R}assets/img/brand/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Hind:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${R}css/styles.css">
</head>
<body class="has-quote-bar">
  <a class="skip-link" href="#main">Skip to content</a>
  <!-- @header --><!-- /@header -->

  <main id="main">
    <section class="pdp-wrap">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="../">Shop</a><span aria-hidden="true">/</span><a href="../?cat=${p.category}">${esc(catLabel(p.category))}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span>
        </nav>

        <div class="pdp" data-product="${p.slug}">
          <div class="pdp-media">
            <div class="${frameClass}" data-buy-frame><img src="${img(p, v0.src)}" alt="${esc(p.name)}: ${esc(v0.label)}" data-buy-img></div>${views}
          </div>

          <aside class="pdp-config" aria-label="Configure ${esc(p.name)}">
            <span class="g-card-cat">${esc(catLabel(p.category))} · ${esc(p.container)}</span>
            <h1 class="pdp-title">${esc(p.name)}</h1>
            <div class="pdp-price">
              <span class="pdp-price-v" data-sum-total>${money(p.prices.standard)}</span>
              <span class="pdp-price-k"><span data-sum-total-k>Delivered price</span>${tip("pricing", "Per-unit price, delivered, including a freight and setting allowance. Excludes site foundation, utility connection, sales tax and permits.")}</span>
            </div>

            <fieldset class="pdp-group">
              <legend>Tier ${tip("tiers", p.tiers)}</legend>
              <div class="seg seg-3">${tierOpts}
              </div>
            </fieldset>

            <fieldset class="pdp-group">
              <legend>Purchase ${tip("purchase options", "Buy outright, or rent for a full season or a single event such as a tournament. Rentals are quoted.")}</legend>
              <div class="seg seg-3">
                <label class="seg-opt"><input type="radio" name="purchase" value="buy" checked><span class="seg-t">Buy</span></label>
                <label class="seg-opt"><input type="radio" name="purchase" value="season"><span class="seg-t">Season rental</span></label>
                <label class="seg-opt"><input type="radio" name="purchase" value="event"><span class="seg-t">Event rental</span></label>
              </div>
            </fieldset>

            <fieldset class="pdp-group">
              <legend>Options</legend>
              <div class="opt-row"><label><input type="checkbox" name="addon" value="funding" data-label="Stadia IP funding" checked><span>Stadia IP sponsorship funding</span></label>${tip("Stadia IP funding", "We’ll show you how naming rights and robot sponsorships can offset the cost. Free consult.")}<span class="opt-note">Free</span></div>
              <div class="opt-row"><label><input type="checkbox" name="addon" value="wrap" data-label="Custom graphic wrap"><span>Custom graphic wrap</span></label>${tip("the graphic wrap", "Your colors, logo and mascot on the exterior.")}<span class="opt-note">Quoted</span></div>
              <div class="opt-row"><label><input type="checkbox" name="addon" value="foundation" data-label="Site foundation"><span>Site foundation</span></label>${tip("site foundation", "A concrete pad or pier system for your site. Pads typically run $4,000–$12,000; piers $1,500–$5,000.")}<span class="opt-note">Quoted</span></div>${av}
            </fieldset>

            <a class="btn btn-block" href="#order" data-quote-btn>Request a quote ${ARROW}</a>
            <p class="pdp-fine">No payment online. We confirm specs and send a formal quote.</p>
          </aside>

          <div class="pdp-details">
            <h2 class="pdp-h">About this facility</h2>
            <p class="pdp-desc">${esc(p.description)}</p>
            <ul class="checks pdp-features">
              ${p.features.map((f) => `<li>${esc(f)}</li>`).join("\n              ")}
            </ul>
            <div class="tier-note"><strong>What changes between tiers</strong><p>${esc(p.tiers)}</p></div>
            <dl class="spec-list pdp-specs">
              ${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("\n              ")}
            </dl>
            <a class="pdp-funding" href="${R}partners/">
              <img src="${R}assets/img/brand/stadia-mark.png" alt="" width="326" height="399">
              <span><strong>Let sponsors help pay for it.</strong> Through Stadia IP, this facility comes with naming rights and robot sponsorships that offset its cost.</span>
            </a>
          </div>
        </div>
      </div>
    </section>

${ORDER.replaceAll("{{R}}", R)}

    <section class="section" style="padding-top: clamp(56px, 7vw, 96px);">
      <div class="container">
        <div class="section-head split" style="margin-bottom: 32px;">
          <h2 class="h3">More <em>${esc(catLabel(p.category).toLowerCase())}</em> and related facilities</h2>
          <a class="link-arrow" href="../">Shop all facilities ${ARROW.replace(' class="arrow"', "")}</a>
        </div>
        <div class="gallery-grid shop-grid" data-related></div>
      </div>
    </section>
  </main>

  <div class="quote-bar" data-quote-bar>
    <div class="quote-bar-price"><span data-bar-k>Standard · Delivered</span><b data-bar-total>${money(p.prices.standard)}</b></div>
    <a class="btn btn-light btn-sm" href="#order">Request a quote</a>
  </div>

  <!-- @footer --><!-- /@footer -->

  <script src="${R}js/products.js"></script>
  <script src="${R}js/main.js"></script>
</body>
</html>
`;
}

// remove pages for products that no longer exist
const keep = new Set(products.map((p) => p.url));
for (const d of fs.readdirSync(path.join(SITE, "buy"), { withFileTypes: true })) {
  if (d.isDirectory() && !keep.has(d.name) && fs.existsSync(path.join(SITE, "buy", d.name, "index.html"))) {
    fs.rmSync(path.join(SITE, "buy", d.name), { recursive: true });
    console.log("removed buy/" + d.name);
  }
}
for (const p of products) {
  const dir = path.join(SITE, "buy", p.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(p));
  console.log("wrote buy/" + p.url + "/");
}
execFileSync("python", [path.join(SITE, "tools/sync_partials.py")], { stdio: "inherit" });
