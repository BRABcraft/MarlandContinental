/* ==========================================================================
   Marland Continental — site behavior
   ========================================================================== */

/* Site settings.
   sheetsEndpoint: the Google Apps Script web app URL (ends in /exec) that saves
   form submissions to the "Marland Continental Quotes" spreadsheet. See
   apps-script/Code.gs and the README for setup. */
const MC_CONFIG = {
  email: "bill@stadiaip.com",
  sheetsEndpoint: "https://script.google.com/macros/s/AKfycbyCJlh5_wXDFndF9P-CK_r_hQKG9ja1J2xDAEpMkbUtjjQnkflx70ih_atTVJ4WheHE/exec"
};

/* Site root (where index.html lives), worked out from this script's own URL so
   links and images resolve from any page folder (e.g. buy/index.html). */
const MC_ROOT = (function () {
  const src = document.currentScript && document.currentScript.src;
  return src ? src.replace(/js\/main\.js(\?.*)?$/, "") : "";
})();

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const products = window.MC_PRODUCTS || [];
  const future = window.MC_FUTURE || [];
  const categories = window.MC_CATEGORIES || [];
  const tiers = window.MC_TIERS || [];
  const stageAV = window.MC_STAGE_AV || null;
  const fmt = window.MC_formatPrice || ((n) => "$" + n);
  const bySlug = (slug) => products.find((p) => p.slug === slug) || future.find((p) => p.slug === slug);
  const catLabel = (id) => (categories.find((c) => c.id === id) || {}).label || "";
  const pad = (n) => String(n).padStart(2, "0");
  const coverPath = (slug, small) => `${MC_ROOT}assets/img/products/${slug}/cover${small ? "-sm" : ""}.jpg`;
  const productURL = (p) => `${MC_ROOT}buy/${p.url}/`;
  const viewPath = (slug, view) => `${MC_ROOT}assets/img/products/${slug}/${view.src}`;
  const isPlan = (view) => /plan|spec|elevation/i.test(view.label);
  const params = new URLSearchParams(location.search);

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  const btnArrow = ICON.arrow.replace("<svg", '<svg class="arrow"');

  const escapeHTML = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* "The [Your Brand] Grandstand" -> HTML with the sponsor name shown as a placeholder slot */
  const namingHTML = (s, dropThe) =>
    escapeHTML(dropThe ? s.replace(/^The /, "") : s).replace("[Your Brand]", '<span class="brand-slot">Your Brand</span>');

  /* Shows one product view in an <img>, switching between fill and whole-image modes */
  function setView(frame, img, slug, view, alt) {
    frame.classList.toggle("is-contain", view.fit === "contain");
    frame.classList.toggle("is-plan", isPlan(view));
    img.src = viewPath(slug, view);
    img.alt = alt;
  }
  function viewPills(item, active, attr) {
    if (item.images.length < 2) return "";
    return item.images.map((v, i) =>
      `<button type="button" class="view-pill" ${attr}="${i}" aria-pressed="${i === active}">${escapeHTML(v.label)}</button>`).join("");
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $("[data-nav-toggle]", header);
    const nav = $("[data-nav]", header);
    if (!toggle || !nav) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); } });
    window.addEventListener("resize", () => { if (window.innerWidth > 1100) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const render = (el, v) => { el.textContent = (el.dataset.prefix || "") + Math.round(v).toLocaleString() + (el.dataset.suffix || ""); };
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduceMotion) return render(el, target);
      const start = performance.now(), dur = 1400;
      const tick = (t) => {
        const k = Math.min(1, (t - start) / dur);
        render(el, target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Hero slideshow ---------- */
  function initSlideshow() {
    $$("[data-slideshow]").forEach((root) => {
      const slides = $$(".slide", root);
      const dotsWrap = $("[data-dots]", root);
      const caption = $("[data-caption-text]", root);
      if (slides.length < 2) return;
      let i = 0, timer = null;
      const dots = slides.map((s, n) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Show ${s.dataset.caption || "slide " + (n + 1)}`);
        b.addEventListener("click", () => { go(n); restart(); });
        dotsWrap && dotsWrap.appendChild(b);
        return b;
      });
      const go = (n) => {
        slides[i].classList.remove("is-active");
        dots[i].removeAttribute("aria-current");
        i = (n + slides.length) % slides.length;
        slides[i].classList.add("is-active");
        dots[i].setAttribute("aria-current", "true");
        if (caption) caption.textContent = slides[i].dataset.caption || "";
      };
      const restart = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) go(i + 1); }, 6000); };
      go(0);
      restart();
    });
  }

  /* ---------- Product rail ---------- */
  function initRail() {
    $$("[data-rail]").forEach((wrap) => {
      const rail = $(".rail", wrap);
      const prev = $("[data-rail-prev]", wrap.parentElement);
      const next = $("[data-rail-next]", wrap.parentElement);
      rail.innerHTML = products.map((p, n) => `
        <a class="rail-card" href="${productURL(p)}">
          <div class="rail-card-top"><span class="rail-card-num">${pad(n + 1)}</span><span class="circle-arrow">${ICON.arrow}</span></div>
          <div class="rail-card-img"><img src="${coverPath(p.slug, true)}" alt="${escapeHTML(p.name)}" loading="lazy" width="720" height="480"></div>
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.short)}</p>
        </a>`).join("");
      const step = () => { const card = $(".rail-card", rail); return card ? card.getBoundingClientRect().width + 20 : 320; };
      const update = () => {
        if (prev) prev.disabled = rail.scrollLeft < 8;
        if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
      };
      prev && prev.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
      next && next.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
      rail.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  }

  /* ---------- Gallery + lightbox ---------- */
  let lightbox = null;
  function buildLightbox() {
    if (lightbox) return lightbox;
    const el = document.createElement("div");
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "lb-title");
    el.innerHTML = `
      <div class="lightbox-panel">
        <div class="lightbox-media" data-lb-frame>
          <img alt="" data-lb-img>
          <button class="lightbox-nav prev" type="button" aria-label="Previous" data-lb-prev>${ICON.left}</button>
          <button class="lightbox-nav next" type="button" aria-label="Next" data-lb-next>${ICON.arrow}</button>
          <div class="view-pills lb-views" data-lb-views role="group" aria-label="Views"></div>
        </div>
        <div class="lightbox-body" data-lb-body></div>
        <button class="lightbox-close" type="button" aria-label="Close" data-lb-close>${ICON.close}</button>
      </div>`;
    document.body.appendChild(el);
    lightbox = {
      el, frame: $("[data-lb-frame]", el), img: $("[data-lb-img]", el), views: $("[data-lb-views]", el),
      body: $("[data-lb-body]", el), list: [], index: 0, mode: "buyer", opener: null
    };
    const close = () => {
      el.classList.remove("is-open");
      document.body.style.overflow = "";
      lightbox.opener && lightbox.opener.focus();
    };
    lightbox.close = close;
    $("[data-lb-close]", el).addEventListener("click", close);
    $("[data-lb-prev]", el).addEventListener("click", () => showLightbox(lightbox.index - 1));
    $("[data-lb-next]", el).addEventListener("click", () => showLightbox(lightbox.index + 1));
    lightbox.views.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lb-view]");
      if (b) showView(+b.dataset.lbView);
    });
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showLightbox(lightbox.index - 1);
      if (e.key === "ArrowRight") showLightbox(lightbox.index + 1);
      if (e.key === "Tab") {
        const f = $$("button, a[href]", el);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return lightbox;
  }

  function showView(i) {
    const lb = lightbox, p = lb.list[lb.index];
    setView(lb.frame, lb.img, p.slug, p.images[i], `${p.name}: ${p.images[i].label}`);
    $$("[data-lb-view]", lb.views).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.lbView === i)));
  }

  function showLightbox(index) {
    const lb = lightbox;
    lb.index = (index + lb.list.length) % lb.list.length;
    const p = lb.list[lb.index];
    lb.views.innerHTML = viewPills(p, 0, "data-lb-view");
    showView(0);

    let body;
    if (lb.mode === "future") {
      body = `
        <span class="g-card-cat">${escapeHTML(p.market)} · In development</span>
        <h2 id="lb-title">${escapeHTML(p.name)}</h2>
        <p>${escapeHTML(p.short)}</p>
        <dl class="spec-list"><div><dt>Market</dt><dd>${escapeHTML(p.market)}</dd></div><div><dt>Built from</dt><dd>${escapeHTML(p.container)}</dd></div></dl>
        <ul class="checks">${p.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>
        <div class="lightbox-actions"><a class="btn" href="${MC_ROOT}contact/?type=markets&p=${p.slug}">Register interest ${btnArrow}</a></div>
        <p class="small muted">A future market design. Pricing and availability to be announced.</p>`;
    } else if (lb.mode === "partner") {
      const specs = [["Naming opportunity", namingHTML(p.partner.naming)], ["Brand canvas", escapeHTML(p.partner.canvas)],
        ["Placement", escapeHTML(p.partner.placement)], ["Built from", escapeHTML(p.container)]];
      body = `
        <span class="g-card-cat">${pad(products.indexOf(p) + 1)} · ${escapeHTML(catLabel(p.category))}</span>
        <h2 id="lb-title">${escapeHTML(p.name)}</h2>
        <p>${escapeHTML(p.short)} Put your name on it, and on every game played around it.</p>
        <dl class="spec-list">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <div class="lightbox-actions">
          <a class="btn" href="${MC_ROOT}contact/?type=partner&p=${p.slug}">Sponsor this facility ${btnArrow}</a>
          <a class="btn btn-outline" href="${productURL(p)}">See it for schools</a>
        </div>`;
    } else {
      const specs = [["Built from", p.container], ...tiers.map((t) => [t.label, fmt(p.prices[t.id])])];
      body = `
        <span class="g-card-cat">${pad(products.indexOf(p) + 1)} · ${escapeHTML(catLabel(p.category))}</span>
        <h2 id="lb-title">${escapeHTML(p.name)}</h2>
        <p>${escapeHTML(p.description)}</p>
        <dl class="spec-list">${specs.map(([k, v]) => `<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}</dl>
        <ul class="checks">${p.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>
        <div class="tier-note"><strong>What changes between tiers</strong><p>${escapeHTML(p.tiers)}</p></div>
        <div class="lightbox-actions">
          <a class="btn" href="${productURL(p)}">View &amp; get a quote ${btnArrow}</a>
          <a class="btn btn-outline" href="${MC_ROOT}contact/?type=buyer&p=${p.slug}">Ask a question</a>
        </div>
        <p class="small muted">Delivered prices. Site foundation, utility connection, sales tax and permits are not included.</p>`;
    }
    lb.body.innerHTML = body;
    lb.body.scrollTop = 0;
    lb.el.querySelector(".lightbox-panel").scrollTop = 0;
  }

  function cardHTML(p, n, mode) {
    let cat, title, sub, meta;
    if (mode === "future") {
      cat = escapeHTML(p.market);
      title = escapeHTML(p.name);
      sub = escapeHTML(p.short);
      meta = `<span><strong>In development</strong> · ${escapeHTML(p.container)}</span>`;
    } else if (mode === "partner") {
      cat = escapeHTML(catLabel(p.category));
      title = namingHTML(p.partner.naming, true);
      sub = `${escapeHTML(p.name)} · ${escapeHTML(p.partner.placement)}`;
      meta = `<span>${escapeHTML(p.partner.canvas)}</span>`;
    } else {
      cat = escapeHTML(catLabel(p.category));
      title = escapeHTML(p.name);
      sub = escapeHTML(p.short);
      meta = `<span>From <strong>${fmt(p.prices.economy)}</strong> · ${escapeHTML(p.container.split(" +")[0])}</span>`;
    }
    return `
      <button class="g-card reveal" type="button" data-slug="${p.slug}" data-cat="${p.category || ""}" aria-label="View ${escapeHTML(p.name)}">
        <div class="g-card-img">
          <img src="${coverPath(p.slug, true)}" alt="" loading="lazy" width="720" height="480">
          <span class="g-card-num">${mode === "future" ? escapeHTML(p.market) : pad(n + 1)}</span>
        </div>
        <div class="g-card-body">
          <span class="g-card-cat">${cat}</span>
          <h3>${title}</h3>
          <p class="small muted">${sub}</p>
          <div class="g-card-meta">${meta}<span class="circle-arrow">${ICON.arrow}</span></div>
        </div>
      </button>`;
  }

  function initGallery() {
    $$("[data-gallery]").forEach((root) => {
      const mode = ["partner", "future"].includes(root.dataset.gallery) ? root.dataset.gallery : "buyer";
      const items = mode === "future" ? future : products;
      const filtersEl = $("[data-gallery-filters]", root);
      const grid = $("[data-gallery-grid]", root);
      grid.innerHTML = items.map((p, n) => cardHTML(p, n, mode)).join("");
      const cards = $$(".g-card", grid);

      if (filtersEl) {
        const all = [{ id: "all", label: "All facilities" }, ...categories];
        filtersEl.innerHTML = all.map((c, n) =>
          `<button class="pill" type="button" data-filter="${c.id}" aria-pressed="${n === 0}">${escapeHTML(c.label)}</button>`).join("");
        filtersEl.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-filter]");
          if (!btn) return;
          $$("[data-filter]", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
          const f = btn.dataset.filter;
          cards.forEach((c) => { c.hidden = f !== "all" && c.dataset.cat !== f; c.classList.add("is-in"); });
        });
      }

      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".g-card");
        if (!card) return;
        const lb = buildLightbox();
        lb.mode = mode;
        lb.list = cards.filter((c) => !c.hidden).map((c) => bySlug(c.dataset.slug));
        lb.opener = card;
        showLightbox(lb.list.findIndex((p) => p.slug === card.dataset.slug));
        lb.el.classList.add("is-open");
        document.body.style.overflow = "hidden";
        $("[data-lb-close]", lb.el).focus();
      });
    });
  }

  /* ---------- Shop catalog (buy/) ---------- */
  function shopCardHTML(p) {
    return `
      <a class="g-card shop-card reveal" href="${productURL(p)}" data-slug="${p.slug}" data-cat="${p.category}">
        <div class="g-card-img"><img src="${coverPath(p.slug, true)}" alt="" loading="lazy" width="720" height="480"></div>
        <div class="g-card-body">
          <span class="g-card-cat">${escapeHTML(catLabel(p.category))}</span>
          <h3>${escapeHTML(p.name)}</h3>
          <p class="small muted">${escapeHTML(p.short)}</p>
          <div class="g-card-meta"><span>From <strong>${fmt(p.prices.economy)}</strong> · ${escapeHTML(p.container.split(" +")[0])}</span><span class="circle-arrow">${ICON.arrow}</span></div>
        </div>
      </a>`;
  }

  function initShop() {
    const root = $("[data-shop]");
    if (!root) return;
    // Old configurator links (buy/?p=slug) go straight to the product page
    const legacy = products.find((p) => p.slug === params.get("p"));
    if (legacy) { location.replace(productURL(legacy) + (params.get("tier") ? `?tier=${params.get("tier")}` : "")); return; }

    const grid = $("[data-shop-grid]", root);
    const filtersEl = $("[data-shop-filters]", root);
    const sortEl = $("[data-shop-sort]", root);
    const countEl = $("[data-shop-count]", root);
    const state = { cat: categories.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all", sort: "featured" };

    const all = [{ id: "all", label: "All facilities" }, ...categories];
    filtersEl.innerHTML = all.map((c) =>
      `<button class="pill" type="button" data-filter="${c.id}" aria-pressed="${c.id === state.cat}">${escapeHTML(c.label)}</button>`).join("");

    const render = () => {
      let list = products.filter((p) => state.cat === "all" || p.category === state.cat);
      if (state.sort === "price-asc") list = [...list].sort((a, b) => a.prices.economy - b.prices.economy);
      if (state.sort === "price-desc") list = [...list].sort((a, b) => b.prices.economy - a.prices.economy);
      if (state.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      grid.innerHTML = list.map(shopCardHTML).join("");
      $$(".reveal", grid).forEach((el) => el.classList.add("is-in"));
      countEl.textContent = `${list.length} ${list.length === 1 ? "facility" : "facilities"}`;
      const url = new URL(location.href);
      if (state.cat === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", state.cat);
      history.replaceState(null, "", url);
    };
    filtersEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      state.cat = b.dataset.filter;
      $$("[data-filter]", filtersEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    });
    sortEl.addEventListener("change", () => { state.sort = sortEl.value; render(); });
    render();
  }

  /* ---------- Product page (buy/<product>/) ---------- */
  let currentOrder = null; // the configuration chosen on a product page, sent with its quote form
  function initProduct() {
    const root = $("[data-product]");
    if (!root) return;
    const p = products.find((x) => x.slug === root.dataset.product);
    if (!p) return;
    const frame = $("[data-buy-frame]", root);
    const mainImg = $("[data-buy-img]", root);
    const viewsEl = $("[data-buy-views]", root);
    const totalEl = $("[data-sum-total]", root);
    const totalK = $("[data-sum-total-k]", root);
    const barTotal = $("[data-bar-total]");
    const barK = $("[data-bar-k]");
    const hidden = $("[data-order-summary]");
    const avPrice = $("[data-av-price]", root);

    if (tiers.some((t) => t.id === params.get("tier"))) {
      const r = $(`input[name="tier"][value="${params.get("tier")}"]`, root);
      if (r) r.checked = true;
    }

    if (viewsEl) viewsEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-buy-view]");
      if (!b) return;
      const i = +b.dataset.buyView;
      setView(frame, mainImg, p.slug, p.images[i], `${p.name}: ${p.images[i].label}`);
      $$("[data-buy-view]", viewsEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });

    const update = () => {
      const tierId = ($('input[name="tier"]:checked', root) || {}).value || "standard";
      const tier = tiers.find((t) => t.id === tierId);
      const purchase = ($('input[name="purchase"]:checked', root) || {}).value || "buy";
      const addons = $$('input[name="addon"]:checked', root);
      const av = stageAV && p.slug === "container-stage" ? stageAV[tierId] : 0;
      const avOn = addons.some((i) => i.value === "av");
      if (avPrice) avPrice.textContent = "+" + fmt(av);
      const typeLabel = { buy: "Purchase", season: "Season rental", event: "Event rental" }[purchase];
      let k, v;
      if (purchase === "buy") {
        k = avOn ? "Estimated total, with AV" : "Delivered price";
        v = fmt(p.prices[tierId] + (avOn ? av : 0));
      } else {
        k = `${typeLabel}, quoted`;
        v = "Quote";
      }
      totalEl.textContent = v;
      totalK.textContent = k;
      if (barTotal) barTotal.textContent = v;
      if (barK) barK.textContent = `${tier.label} · ${purchase === "buy" ? "Delivered" : typeLabel}`;
      const opts = addons.length ? addons.map((i) => i.dataset.label).join(", ") : "None";
      currentOrder = { "Product": p.name, "Tier": tier.label, "Purchase": typeLabel, "Options": opts, "Price Shown": purchase === "buy" ? `${v} (${k})` : "Quoted" };
      if (hidden) hidden.value = `${p.name} | ${tier.label} tier | ${typeLabel} | Add-ons: ${opts} | ${k}: ${v}`;
      const url = new URL(location.href);
      url.searchParams.set("tier", tierId);
      history.replaceState(null, "", url);
    };
    root.addEventListener("change", (e) => { if (["tier", "purchase", "addon"].includes(e.target.name)) update(); });
    update();

    // Related: same category first, then neighbours in the catalog
    const related = $("[data-related]");
    if (related) {
      const same = products.filter((x) => x.category === p.category && x !== p);
      const idx = products.indexOf(p);
      const near = [...products.slice(idx + 1), ...products.slice(0, idx)].filter((x) => x.category !== p.category);
      related.innerHTML = [...same, ...near].slice(0, 4).map(shopCardHTML).join("");
    }

    // Mobile quote bar: shown while the panel's quote button and the order form are off screen
    const bar = $("[data-quote-bar]");
    const btn = $("[data-quote-btn]", root);
    const order = $("#order");
    if (bar && btn && "IntersectionObserver" in window) {
      const seen = { btn: false, order: false };
      const sync = () => bar.classList.toggle("is-visible", !seen.btn && !seen.order);
      new IntersectionObserver(([en]) => { seen.btn = en.isIntersecting; sync(); }).observe(btn);
      // the order form counts as "on screen" once it reaches the upper 60% of the viewport
      if (order) new IntersectionObserver(([en]) => { seen.order = en.isIntersecting; sync(); }, { rootMargin: "0px 0px -40% 0px" }).observe(order);
    }
  }

  /* ---------- ⓘ tooltips (hover, focus or tap) ---------- */
  function initTips() {
    // Tooltips are position: fixed, placed next to their button and kept on screen
    const place = (tip) => {
      const body = $(".tip-body", tip), btn = $(".tip-btn", tip);
      if (!body || !btn) return;
      const b = btn.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      const w = Math.min(280, vw - 24);
      body.style.maxWidth = w + "px";
      const bw = Math.min(w, body.offsetWidth || w), bh = body.offsetHeight || 80;
      const left = Math.max(12, Math.min(b.left + b.width / 2 - 16, vw - bw - 12));
      const below = b.bottom + 10 + bh < vh - 8;
      body.style.left = left + "px";
      body.style.top = (below ? b.bottom + 10 : b.top - 10 - bh) + "px";
      body.classList.toggle("is-above", !below);
      body.style.setProperty("--arrow-x", Math.max(10, Math.min(bw - 10, b.left + b.width / 2 - left)) + "px");
    };
    document.addEventListener("mouseover", (e) => { const t = e.target.closest(".tip"); if (t) place(t); });
    document.addEventListener("focusin", (e) => { const t = e.target.closest(".tip"); if (t) place(t); });
    window.addEventListener("scroll", () => {
      $$(".tip.is-open").forEach((t) => t.classList.remove("is-open"));
      if (document.activeElement && document.activeElement.classList.contains("tip-btn")) document.activeElement.blur();
    }, { passive: true });
    const close = (except) => $$(".tip.is-open").forEach((t) => { if (t !== except) t.classList.remove("is-open"); });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".tip-btn");
      if (btn) {
        e.preventDefault();
        const tip = btn.parentElement;
        close(tip);
        tip.classList.toggle("is-open");
        place(tip);
        return;
      }
      if (!e.target.closest(".tip-body")) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---------- Forms ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate(form) {
    let ok = true, firstBad = null;
    $$("[required]", form).forEach((input) => {
      const field = input.closest(".field");
      const err = field && $(".field-error", field);
      let msg = "";
      if (input.type === "checkbox" ? !input.checked : !input.value.trim()) msg = "This field is required.";
      else if (input.type === "email" && !EMAIL_RE.test(input.value.trim())) msg = "Enter a valid email address.";
      if (field) field.classList.toggle("has-error", !!msg);
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg && !firstBad) firstBad = input;
      if (msg) ok = false;
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  // Form fields as { "Column name": value }, using each field's data-label as the
  // column name. Radio and checkbox answers send their visible label text.
  function collect(form) {
    const data = {};
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name || el.type === "submit" || el.type === "hidden") return;
      const label = el.dataset.label || el.name;
      let value = el.value;
      if (el.type === "radio" || el.type === "checkbox") {
        if (!el.checked) { if (el.type === "checkbox" && !(label in data)) data[label] = "No"; return; }
        const text = el.closest("label") && el.closest("label").textContent.trim();
        value = el.type === "checkbox" && el.value === "yes" ? "Yes" : (text || el.value);
      }
      value = String(value).trim();
      if (!value) return;
      data[label] = label in data && data[label] !== "No" ? `${data[label]}, ${value}` : value;
    });
    return data;
  }

  const newId = (kind) => ({ order: "Q", contact: "C", consult: "F" }[kind] || "W") + "-" +
    Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();

  // Saves the submission to Google Sheets through the Apps Script web app.
  // Apps Script doesn't send CORS headers, so the POST is opaque (no-cors) with
  // a text/plain body; the script still receives the JSON.
  async function submit(form) {
    const kind = form.dataset.form;
    const fields = collect(form);
    if (kind === "order" && currentOrder) Object.assign(fields, currentOrder);
    if (kind === "contact") { const p = bySlug(params.get("p")); if (p) fields["Product"] = p.market ? `${p.name} (${p.market})` : p.name; }
    const payload = { form: kind, id: newId(kind), submittedAt: new Date().toISOString(), page: location.href, userAgent: navigator.userAgent, fields };

    const endpoint = (MC_CONFIG.sheetsEndpoint || "").trim();
    if (!endpoint) {
      try { localStorage.setItem("mc-unsent-" + payload.id, JSON.stringify(payload)); } catch (e) {}
      console.warn("Marland Continental: MC_CONFIG.sheetsEndpoint is not set in js/main.js, so this submission was not saved.", payload);
      throw new Error("no-endpoint");
    }
    await fetch(endpoint, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    return payload.id;
  }

  function showFormError(form, msg) {
    let box = $(".form-alert", form);
    if (!box) {
      box = document.createElement("p");
      box.className = "form-alert";
      box.setAttribute("role", "alert");
      const btn = $('[type="submit"]', form);
      (btn && btn.parentElement === form ? btn : (btn ? btn.parentElement : form)).insertAdjacentElement("afterend", box);
    }
    box.innerHTML = msg;
  }

  function initForms() {
    $$("[data-form]").forEach((form) => {
      form.setAttribute("novalidate", "");
      form.addEventListener("input", (e) => {
        const field = e.target.closest(".field.has-error");
        if (field) { field.classList.remove("has-error"); const err = $(".field-error", field); if (err) err.textContent = ""; }
      });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const btn = $('[type="submit"]', form);
        const label = btn ? btn.innerHTML : "";
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
        try {
          const id = await submit(form);
          const kind = form.dataset.form;
          const message = kind === "order"
            ? `Your quote request is in (reference ${id}). We’ll confirm the details and reply within one business day.`
            : kind === "consult"
              ? "Thanks! We’ll be in touch shortly to set up your consultation."
              : `Thanks! Your message is in (reference ${id}). We’ll reply within one business day.`;
          const success = form.dataset.success ? $(form.dataset.success) : null;
          const old = $(".form-alert", form); if (old) old.remove();
          if (kind === "consult") {
            const bar = form.closest(".consult");
            if (bar) {
              $$("[data-success-how]", bar).forEach((el) => { el.textContent = message; });
              bar.classList.add("is-done");
            }
          } else if (success) {
            $$("[data-success-how]", success).forEach((el) => { el.textContent = message; });
            form.hidden = true;
            success.classList.add("is-visible");
            success.setAttribute("tabindex", "-1");
            success.focus();
          }
        } catch (err) {
          const mail = `<a href="mailto:${MC_CONFIG.email}">${MC_CONFIG.email}</a>`;
          showFormError(form, err.message === "no-endpoint"
            ? `Online requests aren’t connected yet. Please email us at ${mail} and we’ll get right back to you.`
            : `Sorry, that didn’t go through. Check your connection and try again, or email us at ${mail}.`);
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
        }
      });
    });

    $$("[data-email]").forEach((a) => { a.href = "mailto:" + MC_CONFIG.email; a.textContent = MC_CONFIG.email; });
  }

  /* Contact page: preselect inquiry type / product from the URL */
  function initContactPrefill() {
    const form = $('[data-form="contact"]');
    if (!form) return;
    const type = params.get("type");
    if (type) { const radio = $(`input[name="type"][value="${CSS.escape(type)}"]`, form); if (radio) radio.checked = true; }
    const p = bySlug(params.get("p"));
    const msg = $("textarea[name='message']", form);
    if (p && msg && !msg.value) {
      msg.value = p.market
        ? `We're interested in the ${p.name} (${p.market}).`
        : type === "partner"
          ? `We're interested in naming rights on the ${p.name}.`
          : `I have a question about the ${p.name}.`;
    }
  }

  /* ---------- Consultation bar ---------- */
  function initConsult() {
    const bar = $("[data-consult]");
    if (!bar) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem("mc-consult-dismissed") === "1"; } catch (e) {}
    if (dismissed) return;
    const footer = $(".site-footer");
    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nearFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
      bar.classList.toggle("is-visible", scrolled > 0.22 && !nearFooter);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    $("[data-consult-close]", bar).addEventListener("click", () => {
      bar.classList.remove("is-visible");
      window.removeEventListener("scroll", onScroll);
      try { sessionStorage.setItem("mc-consult-dismissed", "1"); } catch (e) {}
    });
  }

  /* ---------- "From the field" photos ---------- */
  function initFieldPhotos() {
    const photos = window.MC_FIELD_PHOTOS || [];
    $$("[data-field-photos]").forEach((el) => {
      if (!photos.length) return;
      el.innerHTML = photos.map((ph) => `
        <figure class="field-photo reveal is-in">
          <img src="${MC_ROOT}${escapeHTML(ph.src)}" alt="${escapeHTML(ph.caption || ph.tag || "")}" loading="lazy">
          ${ph.tag ? `<span class="field-tag">${escapeHTML(ph.tag)}</span>` : ""}
          ${ph.caption ? `<figcaption>${escapeHTML(ph.caption)}</figcaption>` : ""}
        </figure>`).join("");
      el.hidden = false;
    });
  }

  function initYear() { $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); }); }

  initHeader();
  initRail();
  initGallery();
  initShop();
  initProduct();
  initTips();
  initForms();
  initContactPrefill();
  initConsult();
  initSlideshow();
  initCounters();
  initFieldPhotos();
  initYear();
  initReveal();
})();
