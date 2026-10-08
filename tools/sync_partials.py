# Syncs the shared header / footer / consultation bar into every page between
# <!-- @name --> ... <!-- /@name --> markers. Edit the templates below, then run:
#   python tools/sync_partials.py
import re, sys, pathlib

SITE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'

NAV = [("buyers.html", "Schools &amp; Venues"), ("partners.html", "Naming Rights"), ("buy.html", "Shop"), ("markets.html", "Future Markets"), ("about.html", "About"), ("contact.html", "Contact")]

def header(page, dark):
    links = "\n".join(
        f'        <a href="{href}"{" aria-current=\"page\"" if href == page else ""}>{label}</a>' for href, label in NAV)
    return f'''<header class="site-header{' is-dark' if dark else ''}" data-header>
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="Marland Continental home">
        <img src="assets/img/brand/logo-horizontal.png" alt="Marland Continental" width="996" height="250">
      </a>
      <nav class="nav" id="site-nav" data-nav aria-label="Main">
{links}
        <a class="btn btn-sm" href="buy.html">Get a quote</a>
      </nav>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav" data-nav-toggle><span></span><span></span></button>
    </div>
  </header>'''

FOOTER = '''<footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <img class="logo" src="assets/img/brand/logo-horizontal.png" alt="Marland Continental" width="996" height="250">
          <p>Turning shipping containers into revenue-generating athletic facilities.</p>
          <a class="stadia-lockup" href="about.html#ecosystem" aria-label="A Stadia IP company"><span>A company of</span><img src="assets/img/brand/stadia-mark-white.png" alt="" width="187" height="229"><img src="assets/img/brand/stadia-wordmark-white.png" alt="Stadia IP" width="719" height="102"></a>
        </div>
        <div class="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><a href="buyers.html">Schools &amp; Venues</a></li>
            <li><a href="partners.html">Naming Rights</a></li>
            <li><a href="buy.html">Shop Facilities</a></li>
            <li><a href="markets.html">Future Markets</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Facilities</h3>
          <ul>
            <li><a href="buy.html?cat=seating">Bleachers</a></li>
            <li><a href="buy.html?cat=training">Training &amp; Weight Rooms</a></li>
            <li><a href="buy.html?cat=team">Team Facilities</a></li>
            <li><a href="buy.html?cat=gameday">Press Boxes &amp; Ticket Booths</a></li>
            <li><a href="buy.html?cat=concessions">Concessions &amp; Retail</a></li>
            <li><a href="buy.html?cat=hospitality">VIP Suites, Clubhouses &amp; Stages</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Home base</h3>
          <address>500 Confederate Ave<br>Portsmouth, VA</address>
          <p style="margin-top: 12px;"><a data-email href="mailto:bill@stadiaip.com">bill@stadiaip.com</a></p>
        </div>
      </div>
    </div>
    <div class="footer-word" aria-hidden="true">Marland</div>
    <div class="footer-bottom-wrap">
      <div class="container">
        <div class="footer-bottom">
          <span>© <span data-year>2026</span> Marland Continental. All rights reserved.</span>
          <span>Portsmouth, Virginia · marlandhq.com</span>
        </div>
      </div>
    </div>
  </footer>'''

CONSULT = f'''<aside class="consult" data-consult aria-label="Free facility consultation">
    <div class="container consult-inner">
      <h2>Get a free <em>facility consultation</em></h2>
      <p class="consult-mobile">Get a free <em>facility consultation</em></p>
      <form data-form="consult">
        <label class="sr-only" for="consult-name">Name</label>
        <input id="consult-name" name="name" data-label="Name" placeholder="Name" autocomplete="name" required>
        <label class="sr-only" for="consult-email">Email</label>
        <input id="consult-email" type="email" name="email" data-label="Email" placeholder="Email" autocomplete="email" required>
        <label class="sr-only" for="consult-org">School or organization</label>
        <input id="consult-org" class="hide-md" name="org" data-label="School or organization" placeholder="School or organization" autocomplete="organization">
        <button class="btn btn-light" type="submit">Submit</button>
      </form>
      <a class="btn btn-light btn-sm consult-mobile" href="contact.html">Start</a>
      <p class="consult-done" data-success-how>Thanks! We’ll be in touch shortly.</p>
      <button class="consult-close" type="button" aria-label="Dismiss" data-consult-close>{CLOSE}</button>
    </div>
  </aside>'''

QUOTE_SVG = '<svg class="proof-mark" viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h5v12H0zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h5v12H19z" fill="currentColor"/></svg>'
PROOF = '''<section class="section bg-white proof" id="proof" aria-labelledby="proof-title">
    <div class="container">
      <div class="section-head split reveal">
        <div style="display:grid; gap:20px;">
          <span class="eyebrow">From the field</span>
          <h2 class="h2" id="proof-title">Athletic directors are <em>already asking.</em></h2>
        </div>
        <a class="btn btn-outline" href="contact.html?type=buyer">Talk to us</a>
        <p class="lede">This fall we surveyed athletic directors, coaches and administrators at Virginia high schools, colleges and parks departments. Here’s what they told us, and who’s ready to buy.</p>
      </div>

      <div class="proof-interest">
        <article class="interest-card reveal">
          <div class="interest-top"><span class="interest-badge">Interested in buying</span><span class="small muted">College · NCAA Division III</span></div>
          <h3 class="interest-name">Sweet Briar College</h3>
          <blockquote class="interest-quote">“We are on a very tight budget and I like the look of these structures. I feel they could be a budget-friendly way for us to finally get the facilities upgrades we need.”<cite>Athletic Director, Sweet Briar College</cite></blockquote>
          <dl class="interest-facts">
            <div><dt>Facilities</dt><dd>Press box, bleacher unit, baseball dugout</dd></div>
            <div><dt>Timeline</dt><dd>Within 90 days</dd></div>
            <div><dt>Funding</dt><dd>Interested in Stadia IP sponsorship funding</dd></div>
          </dl>
        </article>
        <article class="interest-card reveal reveal-delay-1">
          <div class="interest-top"><span class="interest-badge">Interested in buying</span><span class="small muted">High school · Lynchburg, VA</span></div>
          <h3 class="interest-name">E.C. Glass High School</h3>
          <p class="interest-lede">Their athletic director picked five facilities and plans to purchase within six months.</p>
          <dl class="interest-facts">
            <div><dt>Facilities</dt><dd>Press box, equipment room, ticket booth, visiting team facility, merchandise stand</dd></div>
            <div><dt>Timeline</dt><dd>Within 6 months</dd></div>
            <div><dt>Next step</dt><dd>Proposal in progress</dd></div>
          </dl>
        </article>
      </div>

      <div class="proof-quotes">
        <figure class="quote-card reveal">{Q}<blockquote>Cool idea and nice use of containers. Would be interested in seeing [them] in person for a better feel.</blockquote><figcaption>Parks &amp; recreation administrator, Virginia county</figcaption></figure>
        <figure class="quote-card reveal reveal-delay-1">{Q}<blockquote>This could be an option at our remote school locations that do not have concession buildings.</blockquote><figcaption>On the concession stand · Virginia county</figcaption></figure>
        <figure class="quote-card reveal reveal-delay-2">{Q}<blockquote>I would go a little higher in price to ensure we had a nice dugout, painted with good seating.</blockquote><figcaption>On the baseball dugout · College athletic director</figcaption></figure>
        <figure class="quote-card reveal">{Q}<blockquote>For the bleacher-style bench seating, I think this price [is] fair.</blockquote><figcaption>On the bleacher unit · College athletic director</figcaption></figure>
      </div>

      <div class="stats proof-stats">
        <div class="stat reveal"><div class="stat-num">9</div><p class="stat-label">Virginia athletic programs surveyed</p></div>
        <div class="stat reveal reveal-delay-1"><div class="stat-num">2</div><p class="stat-label">Schools ready to buy</p></div>
        <div class="stat reveal reveal-delay-2"><div class="stat-num">16 / 28</div><p class="stat-label">Price ratings were “about right”</p></div>
        <div class="stat reveal reveal-delay-3"><div class="stat-num">6 / 9</div><p class="stat-label">Respondents picked the press box</p></div>
      </div>

      <div class="proof-photos" data-field-photos hidden></div>

      <div class="proof-base reveal">
        <span class="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 17h10"/></svg></span>
        <p><strong>Built in Portsmouth, Virginia.</strong> Our facilities are built at 500 Confederate Avenue, the old Skippy peanut butter plant, with its own rail siding and crane.</p>
      </div>
      <p class="gallery-note">Quotes are from our fall 2026 survey of Virginia athletic programs, lightly edited for spelling. Bracketed words added for clarity.</p>
    </div>
  </section>'''.replace("{Q}", QUOTE_SVG)

def put(html, name, content):
    pat = re.compile(rf"<!-- @{name} -->.*?<!-- /@{name} -->", re.S)
    if not pat.search(html):
        return html
    return pat.sub(lambda m: f"<!-- @{name} -->\n  {content}\n  <!-- /@{name} -->", html)

PAGES = ("buyers", "partners", "buy", "markets", "contact", "about")
PAGE_RE = re.compile(r'(href)="(index|' + "|".join(PAGES) + r')\.html([?#][^"]*)?"')
ASSET_RE = re.compile(r'((?:src|href|content)=")((?:assets|css|js)/)')

def relink(html, prefix):
    """Turn flat links (buy.html?p=x, assets/...) into folder links (buy/?p=x)
    relative to a page that sits `prefix` deep ("" for the root, "../" for buy/)."""
    def page(m):
        name, rest = m.group(2), m.group(3) or ""
        target = prefix + ("" if name == "index" else name + "/")
        return f'{m.group(1)}="{target or "./"}{rest}"'
    html = PAGE_RE.sub(page, html)
    return ASSET_RE.sub(lambda m: m.group(1) + prefix + m.group(2), html) if prefix else html

def pages():
    yield SITE / "index.html", "index.html", ""
    for name in PAGES:
        f = SITE / name / "index.html"
        if f.exists():
            yield f, name + ".html", "../"
    for f in sorted((SITE / "buy").glob("*/index.html")):
        yield f, "buy.html", "../../"

if __name__ == "__main__":
    for f, key, prefix in pages():
        html = f.read_text(encoding="utf8")
        dark = 'data-header-dark' in html
        html = put(html, "header", relink(header(key, dark), prefix))
        html = put(html, "footer", relink(FOOTER, prefix))
        html = put(html, "consult", relink(CONSULT, prefix))
        html = put(html, "proof", relink(PROOF, prefix))
        f.write_text(html, encoding="utf8")
        print("injected", f.relative_to(SITE))
