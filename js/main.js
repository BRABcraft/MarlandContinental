/* ==========================================================================
   Marland Continental — site behavior
   ========================================================================== */

/* Site settings. Optionally paste a form endpoint (Formspree, Basin, Netlify
   Forms, your own API...). With no endpoint, forms open the visitor's email
   app with the request pre-filled and addressed to `email`. */
const MC_CONFIG = {
  email: "bill@stadiaip.com",
  formEndpoint: ""
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
        <a class="rail-card" href="${MC_ROOT}buy/?p=${p.slug}">
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
          <a class="btn btn-outline" href="${MC_ROOT}buy/?p=${p.slug}">See it for schools</a>
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
          <a class="btn" href="${MC_ROOT}buy/?p=${p.slug}">Configure &amp; buy ${btnArrow}</a>
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

  /* ---------- Buy page configurator ---------- */
  function initBuy() {
    const root = $("[data-buy]");
    if (!root) return;
    const frame = $("[data-buy-frame]", root);
    const mainImg = $("[data-buy-img]", root);
    const viewsEl = $("[data-buy-views]", root);
    const thumbs = $("[data-buy-thumbs]", root);
    const select = $("[data-buy-select]", root);
    const tierWrap = $("[data-buy-tiers]", root);
    const avWrap = $("[data-buy-av]", root);
    const nameEl = $("[data-buy-name]", root);
    const catEl = $("[data-buy-cat]", root);
    const descEl = $("[data-buy-desc]", root);
    const featEl = $("[data-buy-features]", root);
    const tierNote = $("[data-buy-tiernote]", root);
    const sum = {
      product: $("[data-sum-product]", root), tier: $("[data-sum-tier]", root), option: $("[data-sum-option]", root),
      addons: $("[data-sum-addons]", root), total: $("[data-sum-total]", root), totalK: $("[data-sum-total-k]", root)
    };
    const hidden = $("[data-order-summary]");

    select.innerHTML = categories.map((c) =>
      `<optgroup label="${escapeHTML(c.label)}">${products.filter((p) => p.category === c.id).map((p) =>
        `<option value="${p.slug}">${escapeHTML(p.name)}</option>`).join("")}</optgroup>`).join("");
    thumbs.innerHTML = products.map((p) =>
      `<button class="buy-thumb" type="button" data-slug="${p.slug}" aria-label="${escapeHTML(p.name)}" title="${escapeHTML(p.name)}" aria-pressed="false"><img src="${coverPath(p.slug, true)}" alt="" loading="lazy"></button>`).join("");

    const state = {
      slug: products.some((p) => p.slug === params.get("p")) ? params.get("p") : products[0].slug,
      tier: tiers.some((t) => t.id === params.get("tier")) ? params.get("tier") : "standard",
      view: 0
    };

    const renderTiers = (p) => {
      tierWrap.innerHTML = tiers.map((t) => `
        <label class="option">
          <input type="radio" name="tier" value="${t.id}" ${t.id === state.tier ? "checked" : ""}>
          <span class="option-title">${t.label}</span>
          <span class="option-sub">${fmt(p.prices[t.id])}</span>
        </label>`).join("");
    };

    const renderAV = (p) => {
      if (!avWrap) return;
      avWrap.innerHTML = p.slug === "container-stage" && stageAV ? `
        <label class="check-row"><input type="checkbox" name="addon" value="av" data-label="Stage AV package"><span><strong>Stage AV package</strong><small>LED video walls, audio, lighting rig, towable generator and 100′ of crowd barrier, matched to your tier.</small></span><span class="note" data-av-price></span></label>` : "";
    };

    const showBuyView = (i) => {
      const p = bySlug(state.slug);
      state.view = i;
      setView(frame, mainImg, p.slug, p.images[i], `${p.name}: ${p.images[i].label}`);
      $$("[data-buy-view]", viewsEl).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.buyView === i)));
    };

    const update = () => {
      const p = bySlug(state.slug);
      const purchase = ($('input[name="purchase"]:checked', root) || {}).value || "buy";
      const addons = $$('input[name="addon"]:checked', root);
      const tier = tiers.find((t) => t.id === state.tier);
      const avPrice = stageAV && p.slug === "container-stage" ? stageAV[state.tier] : 0;
      const avOn = addons.some((i) => i.value === "av");
      const avNote = $("[data-av-price]", root);
      if (avNote) avNote.textContent = "+" + fmt(avPrice);
      sum.product.textContent = p.name;
      sum.tier.textContent = tier.label;
      sum.option.textContent = { buy: "Purchase", season: "Season rental", event: "Event rental" }[purchase];
      sum.addons.textContent = addons.length ? addons.map((i) => i.dataset.label).join(", ") : "None";
      if (purchase === "buy") {
        sum.totalK.textContent = avOn ? "Estimated, with AV" : "Delivered price";
        sum.total.textContent = fmt(p.prices[state.tier] + (avOn ? avPrice : 0));
      } else {
        sum.totalK.textContent = purchase === "season" ? "Season rental" : "Event rental";
        sum.total.textContent = "Quoted";
      }
      if (hidden) {
        hidden.value = `${p.name} | ${tier.label} tier | ${sum.option.textContent} | Add-ons: ${sum.addons.textContent} | ${sum.totalK.textContent} ${sum.total.textContent}`;
      }
    };

    const setProduct = (slug, scroll) => {
      const p = bySlug(slug);
      if (!p) return;
      state.slug = slug;
      select.value = slug;
      viewsEl.innerHTML = viewPills(p, 0, "data-buy-view");
      showBuyView(0);
      nameEl.textContent = p.name;
      catEl.textContent = `${catLabel(p.category)} · ${p.container}`;
      descEl.textContent = p.description;
      featEl.innerHTML = p.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("");
      if (tierNote) tierNote.textContent = p.tiers;
      $$(".buy-thumb", thumbs).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.slug === slug)));
      renderTiers(p);
      renderAV(p);
      update();
      const url = new URL(location.href);
      url.searchParams.set("p", slug);
      url.searchParams.set("tier", state.tier);
      history.replaceState(null, "", url);
      if (scroll && window.innerWidth <= 1020) root.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    };

    select.addEventListener("change", () => setProduct(select.value));
    thumbs.addEventListener("click", (e) => { const b = e.target.closest(".buy-thumb"); if (b) setProduct(b.dataset.slug, true); });
    viewsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-buy-view]"); if (b) showBuyView(+b.dataset.buyView); });
    root.addEventListener("change", (e) => {
      if (e.target.name === "tier") {
        state.tier = e.target.value;
        const url = new URL(location.href);
        url.searchParams.set("tier", state.tier);
        history.replaceState(null, "", url);
      }
      if (["tier", "purchase", "addon"].includes(e.target.name)) update();
    });
    setProduct(state.slug);
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

  function collect(form) {
    const data = [];
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name || el.type === "submit") return;
      if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
      const label = el.dataset.label || el.name;
      const existing = data.find((d) => d[0] === label);
      if (existing) existing[1] += ", " + el.value; else data.push([label, el.value]);
    });
    return data.filter(([, v]) => String(v).trim() !== "");
  }

  async function submit(form) {
    const kind = form.dataset.form;
    const fields = collect(form);
    const subject = {
      order: "Facility order request",
      consult: "Free facility consultation request",
      contact: "Website inquiry"
    }[kind] || "Website inquiry";

    if (MC_CONFIG.formEndpoint) {
      const res = await fetch(MC_CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: subject, form: kind, ...Object.fromEntries(fields) })
      });
      if (!res.ok) throw new Error("Request failed");
      return "sent";
    }
    const body = fields.map(([k, v]) => `${k}: ${v}`).join("\n");
    window.location.href = `mailto:${MC_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "mailto";
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
          const how = await submit(form);
          const message = how === "mailto"
            ? `Your email app should open with your request ready to send. If it didn't, email us directly at ${MC_CONFIG.email}.`
            : "Thanks! We’ll reply within one business day.";
          const success = form.dataset.success ? $(form.dataset.success) : null;
          if (form.dataset.form === "consult") {
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
          alert(`Sorry, that didn't go through. Please email us at ${MC_CONFIG.email}.`);
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

  function initYear() { $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); }); }

  initHeader();
  initRail();
  initGallery();
  initBuy();
  initForms();
  initContactPrefill();
  initConsult();
  initSlideshow();
  initCounters();
  initYear();
  initReveal();
})();
