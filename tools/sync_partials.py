# Syncs the shared notice bar + header, footer and "From the field" section into
# every page. Each block is found by its own element (<header class="site-header">,
# <footer class="site-footer">, <section id="proof">), so pages need no markers.
# Edit the templates below, then run:
#   python tools/sync_partials.py
import re, sys, pathlib

SITE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent

NAV = [("buyers.html", "Schools &amp; Venues"), ("partners.html", "Sponsors"), ("buy.html", "Designs"), ("markets.html", "Future Markets"), ("about.html", "About"), ("contact.html", "Contact")]

NOTICE = '''<div class="notice-bar"><p><strong>Pre-seed startup.</strong> <span class="notice-long">Every image on this site is a concept rendering. We haven’t built a facility yet; our first builds are planned for winter 2026–27.</span><span class="notice-short">All images are renderings. First builds planned for winter 2026–27.</span> <a href="about.html#status">Where we are</a></p></div>'''

def header(page, dark):
    links = "\n".join(
        f'        <a href="{href}"{" aria-current=\"page\"" if href == page else ""}>{label}</a>' for href, label in NAV)
    return NOTICE + f'''
  <header class="site-header{' is-dark' if dark else ''}" data-header>
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="Marland Continental home">
        <img src="assets/img/brand/logo-horizontal.png" alt="Marland Continental" width="996" height="250">
      </a>
      <nav class="nav" id="site-nav" data-nav aria-label="Main">
{links}
        <a class="btn btn-sm" href="contact.html">Get in touch</a>
      </nav>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav" data-nav-toggle><span></span><span></span></button>
    </div>
  </header>'''

FOOTER = '''<footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <img class="logo" src="assets/img/brand/logo-horizontal.png" alt="Marland Continental" width="996" height="250">
          <p>Athletic facilities built from shipping containers. A pre-seed startup based in Portsmouth, Virginia.</p>
          <a class="stadia-lockup" href="about.html#ecosystem" aria-label="A Stadia IP company"><span>A company of</span><img src="assets/img/brand/stadia-mark-white.png" alt="" width="187" height="229"><img src="assets/img/brand/stadia-wordmark-white.png" alt="Stadia IP" width="719" height="102"></a>
        </div>
        <div class="footer-col">
          <h3>Site</h3>
          <ul>
            <li><a href="buyers.html">Schools &amp; Venues</a></li>
            <li><a href="partners.html">Sponsors</a></li>
            <li><a href="buy.html">Designs &amp; pricing</a></li>
            <li><a href="markets.html">Future Markets</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="privacy.html">Privacy</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Partners</h3>
          <ul>
            <li><a href="about.html#ecosystem">Stadia IP</a></li>
            <li><a href="https://www.struxure.com/" rel="noopener">StruXure</a></li>
            <li><a href="https://www.robotlab.com/" rel="noopener">RobotLab</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Contact</h3>
          <address>500 Confederate Ave<br>Portsmouth, VA</address>
          <p class="footer-email"><a data-email href="mailto:bill@stadiaip.com">bill@stadiaip.com</a></p>
        </div>
      </div>
    </div>
    <div class="footer-bottom-wrap">
      <div class="container">
        <div class="footer-bottom">
          <span>© <span data-year>2026</span> Marland Continental. Product images are concept renderings.</span>
          <span>marlandcontinental.com · <a href="privacy.html">Privacy</a></span>
        </div>
      </div>
    </div>
  </footer>'''

QUOTE_SVG = '<svg class="proof-mark" viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h5v12H0zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h5v12H19z" fill="currentColor"/></svg>'
PROOF = '''<section class="section bg-white proof" id="proof" aria-labelledby="proof-title">
    <div class="container">
      <div class="section-head split">
        <h2 class="h2" id="proof-title">What athletic directors told us</h2>
        <a class="btn btn-outline" href="contact.html?type=buyer">Talk to us</a>
        <p class="lede">This fall we showed our renderings and estimated prices to athletic directors, coaches and administrators at nine Virginia high schools, colleges and parks departments, and asked what they would buy. Two said they’re interested in purchasing.</p>
      </div>

      <div class="proof-interest">
        <article class="interest-card">
          <div class="interest-top"><span class="interest-badge">Survey response</span><span class="small muted">College · NCAA Division III</span></div>
          <h3 class="interest-name">Sweet Briar College</h3>
          <blockquote class="interest-quote">“We are on a very tight budget and I like the look of these structures. I feel they could be a budget-friendly way for us to finally get the facilities upgrades we need.”<cite>Athletic Director, Sweet Briar College</cite></blockquote>
          <dl class="interest-facts">
            <div><dt>Interested in</dt><dd>Press box, bleacher unit, baseball dugout</dd></div>
            <div><dt>Timeline given</dt><dd>Within 90 days</dd></div>
            <div><dt>Funding</dt><dd>Wants to hear about sponsorship funding</dd></div>
          </dl>
        </article>
        <article class="interest-card">
          <div class="interest-top"><span class="interest-badge">Survey response</span><span class="small muted">High school · Lynchburg, VA</span></div>
          <h3 class="interest-name">E.C. Glass High School</h3>
          <p class="interest-lede">Their athletic director picked five facilities and said they plan to purchase within six months. We’re preparing a proposal.</p>
          <dl class="interest-facts">
            <div><dt>Interested in</dt><dd>Press box, equipment room, ticket booth, visiting team facility, merchandise stand</dd></div>
            <div><dt>Timeline given</dt><dd>Within 6 months</dd></div>
            <div><dt>Next step</dt><dd>Proposal in progress</dd></div>
          </dl>
        </article>
      </div>

      <div class="proof-quotes">
        <figure class="quote-card">{Q}<blockquote>Cool idea and nice use of containers. Would be interested in seeing [them] in person for a better feel.</blockquote><figcaption>Parks &amp; recreation administrator, Virginia county</figcaption></figure>
        <figure class="quote-card">{Q}<blockquote>This could be an option at our remote school locations that do not have concession buildings.</blockquote><figcaption>On the concession stand · Virginia county</figcaption></figure>
        <figure class="quote-card">{Q}<blockquote>I would go a little higher in price to ensure we had a nice dugout, painted with good seating.</blockquote><figcaption>On the baseball dugout · College athletic director</figcaption></figure>
        <figure class="quote-card">{Q}<blockquote>For the bleacher-style bench seating, I think this price [is] fair.</blockquote><figcaption>On the bleacher unit · College athletic director</figcaption></figure>
      </div>

      <ul class="survey-facts">
        <li><strong>9</strong> programs responded</li>
        <li><strong>16 of 28</strong> price ratings were “about right”</li>
        <li><strong>6 of 9</strong> respondents picked the press box</li>
      </ul>

      <div class="proof-photos" data-field-photos hidden></div>

      <div class="proof-base">
        <span class="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 17h10"/></svg></span>
        <p><strong>Our warehouse.</strong> We lease the former Skippy peanut butter plant at 500 Confederate Avenue in Portsmouth, which has its own rail siding and crane. Nothing has been built there yet. Our first units are planned for winter 2026–27.</p>
      </div>
      <p class="gallery-note">Quotes are from our fall 2026 survey of Virginia athletic programs, lightly edited for spelling. Bracketed words added for clarity.</p>
    </div>
  </section>'''.replace("{Q}", QUOTE_SVG)

BLOCKS = {
    "header": re.compile(r'(?:<div class="notice-bar">.*?</div>\s*)?<header class="site-header.*?</header>', re.S),
    "footer": re.compile(r'<footer class="site-footer">.*?</footer>', re.S),
    "proof": re.compile(r'<section [^>]*id="proof".*?</section>', re.S),
}

def put(html, name, content):
    return BLOCKS[name].sub(lambda m: content, html, count=1)

PAGES = ("buyers", "partners", "buy", "markets", "contact", "about", "privacy")
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
        html = put(html, "proof", relink(PROOF, prefix))
        f.write_text(html, encoding="utf8")
        print("synced", f.relative_to(SITE))
