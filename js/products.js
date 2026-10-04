/* ==========================================================================
   Product catalog. Drives the galleries, product rail, lightbox, buy page
   and the Future Markets page.

   Prices come from Marland_Continental_Product_Pricing.xlsx (Price Worksheet,
   priced September 2026, steel revised October 2026). They are delivered
   prices and exclude site foundation, utility connection to the pad, sales
   tax and local permits.

   Images live in assets/img/products/<slug>/ : cover.jpg, cover-sm.jpg and
   view-N.jpg. fit "cover" fills the frame; "contain" shows the whole image.
   ========================================================================== */

window.MC_CATEGORIES = [
  { id: "seating", label: "Seating" },
  { id: "training", label: "Training" },
  { id: "team", label: "Team Facilities" },
  { id: "gameday", label: "Game-Day Operations" },
  { id: "concessions", label: "Concessions & Retail" },
  { id: "hospitality", label: "Hospitality & Events" }
];

window.MC_TIERS = [
  { id: "economy", label: "Economy", blurb: "Durable, practical finishes at the lowest cost." },
  { id: "standard", label: "Standard", blurb: "Upgraded materials and equipment. Our most requested tier." },
  { id: "luxury", label: "Luxury", blurb: "Premium materials, equipment and finishes throughout." }
];

/* Container Stage production add-on (Stage AV Add-Ons tab): LED walls, audio,
   lighting, generator and crowd barrier, priced at the matching tier. */
window.MC_STAGE_AV = { economy: 52564, standard: 132877, luxury: 294118 };

window.MC_PRODUCTS = [
  {
    slug: "bleacher-unit",
    name: "Bleacher Unit",
    category: "seating",
    container: "40′ high-cube",
    short: "Four rows of covered seating built on a 40′ container.",
    description: "Tiered seating on a 40′ high-cube base with a steel canopy overhead and a side access stair. Set it beside the track or along the sideline.",
    features: ["Four seating rows under a steel canopy", "Side access stair and guardrails", "Bench, fold-down or chairback seating", "Galvanized riser frame at Standard and Luxury"],
    tiers: "Seating is the big difference: aluminum bench planks, fold-down chairs or chairbacks. The riser frame moves from painted steel to hot-dip galvanized.",
    prices: { economy: 31330, standard: 62510, luxury: 114484 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Stands", canvas: "Canopy fascia + 40′ base wrap", placement: "Sideline, in every game photo and stream" }
  },
  {
    slug: "stacked-bleacher-unit",
    name: "Stacked Bleacher Unit",
    category: "seating",
    container: "2 × 40′ high-cube",
    short: "Two decks of covered seating with an engineered stair tower.",
    description: "Double the seating in the same footprint. Two stacked 40′ seating decks, each with a canopy, joined by an engineered stair tower and walkway.",
    features: ["Two seating decks, four rows each", "Engineered stair tower and walkway", "About 19′ overall height", "Bench, fold-down or chairback seating"],
    tiers: "Everything in the single bleacher unit, doubled, plus the stair tower and stacked-frame structural design.",
    prices: { economy: 70056, standard: 136653, luxury: 241748 },
    images: [{ src: "view-1.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Grandstand", canvas: "Two canopy fascias + stair tower", placement: "Sideline, the tallest structure on site" }
  },
  {
    slug: "training-room-20",
    name: "Training Room 20′",
    category: "training",
    container: "20′ high-cube",
    short: "A glass-front athletic training room with three treatment tables.",
    description: "A 20′ training room with a 16′ glazed wall, three treatment tables and supply cabinetry. Drops in next to the field house or track.",
    features: ["16′ glazed wall", "Three treatment tables", "Storage cabinetry and supply stations", "Climate control and LED lighting"],
    tiers: "Tables range from fixed-height to electric hi-lo. Glazing ranges from fixed aluminum to a thermally broken low-E storefront.",
    prices: { economy: 30134, standard: 52969, luxury: 98343 },
    images: [{ src: "view-1.jpg", label: "Interior", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Training Room", canvas: "Rear wall + end walls", placement: "Field house and athlete entry" }
  },
  {
    slug: "training-room-40",
    name: "Training Room 40′",
    category: "training",
    container: "40′ high-cube",
    short: "Six treatment tables behind 36′ of glass.",
    description: "A full-roster training room: six treatment tables, rehab space and cabinetry behind a 36′ glazed wall.",
    features: ["36′ glazed wall", "Six treatment tables", "Storage cabinetry and supply stations", "Climate control and LED lighting"],
    tiers: "Tables range from fixed-height to electric hi-lo. Glazing ranges from fixed aluminum to a thermally broken low-E storefront.",
    prices: { economy: 50840, standard: 88762, luxury: 152272 },
    images: [{ src: "view-1.jpg", label: "Interior", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Performance Center", canvas: "Rear wall (~380 sq ft) + end walls", placement: "Field house and athlete entry" }
  },
  {
    slug: "weight-room",
    name: "Weight Room",
    category: "training",
    container: "20′ high-cube",
    short: "A strength room with a 16′ open side facing the field.",
    description: "Rack, bench, dumbbells and cardio inside a 20′ container with a 16′ open side. Lock it up at night, open it up for practice.",
    features: ["16′ open side", "Rack, bench and dumbbells", "Functional trainer and treadmill at Standard and up", "Rubber flooring and LED lighting"],
    tiers: "Equipment is over half the cost. Economy is a budget rack and dumbbells, Standard adds a functional trainer and commercial treadmill, and Luxury is premium-brand throughout.",
    prices: { economy: 28600, standard: 56754, luxury: 106347 },
    images: [{ src: "view-1.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Strength Lab", canvas: "Exterior wrap + interior feature wall", placement: "Practice fields and team areas" }
  },
  {
    slug: "visiting-team-facility",
    name: "Visiting Team Facility",
    category: "team",
    container: "40′ high-cube",
    short: "A full locker room with showers and restrooms for visitors.",
    description: "Give visiting teams a proper home base and free up your own locker rooms. Lockers and benches, three showers, two toilets and vanities in one 40′ unit.",
    features: ["Lockers and bench seating", "Three showers and two toilets", "Vanities and three water heaters", "Waterproof wet-area finishes"],
    tiers: "Plumbing drives the price. Waterproofing (FRP, hot-mop tile or porcelain) and locker grade do the rest.",
    prices: { economy: 64308, standard: 105648, luxury: 161299 },
    images: [{ src: "view-1.jpg", label: "Locker room", fit: "cover" }, { src: "view-2.jpg", label: "Vanity & showers", fit: "cover" }, { src: "view-3.jpg", label: "Floor plan", fit: "contain" }],
    partner: { naming: "The [Your Brand] Visitors’ Locker Room", canvas: "Two side walls, ~380 sq ft each", placement: "Field-side, in view of the visiting crowd" }
  },
  {
    slug: "referee-lounge",
    name: "Referee Lounge",
    category: "team",
    container: "20′ high-cube",
    short: "Private changing and lounge space for game officials.",
    description: "A dedicated room for referees and umpires with lockers, a bench and a kitchenette, so officials aren’t dressing in a storage closet.",
    features: ["Lockers and bench seating", "Kitchenette", "Climate control", "Half-bath rough-in and ADA ramp at Luxury"],
    tiers: "Locker grade and how far the kitchenette goes. Luxury adds a half-bath rough-in and an aluminum ADA ramp.",
    prices: { economy: 21521, standard: 37753, luxury: 72154 },
    images: [{ src: "view-1.jpg", label: "Interior", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Officials’ Lounge", canvas: "Two side walls, ~190 sq ft each", placement: "Behind the bench and team areas" }
  },
  {
    slug: "baseball-dugout",
    name: "Baseball Dugout",
    category: "team",
    container: "40′ high-cube",
    short: "A 40′ team dugout with bench seating and gear storage.",
    description: "An open-front 40′ dugout with continuous bench seating, built-in storage for helmets and bats, a roof overhang and a protective rail.",
    features: ["Seating for up to 15 players", "Built-in storage for helmets, bats and gear", "Roof overhang and protective railing", "LED lighting and ventilation"],
    tiers: "Insulation and comfort: a painted steel box with a treated bench, then insulation, a composite bench and fans, then climate control, sound and scoreboard integration.",
    prices: { economy: 23613, standard: 41661, luxury: 85690 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "contain" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Dugout", canvas: "Roof fascia + container end walls", placement: "On the field, in every at-bat" }
  },
  {
    slug: "equipment-room",
    name: "Equipment Room",
    category: "team",
    container: "20′ high-cube",
    short: "Secure, organized storage for helmets, balls and gear.",
    description: "Shelving, cubbies and ball racks inside a lockable 20′ container. The simplest unit in the line and the easiest way to win back space.",
    features: ["Shelving, cubbies and ball racks", "Lockable steel doors", "Ventilation", "Lockers, dehumidification and keypad entry at Luxury"],
    tiers: "Storage quality and climate control: wire shelving and padlocks at Economy, up to welded lockers, dehumidification and keypad entry at Luxury.",
    prices: { economy: 16669, standard: 27696, luxury: 50092 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Equipment Room", canvas: "Two side walls, ~190 sq ft each", placement: "Practice fields and team areas" }
  },
  {
    slug: "press-box",
    name: "Press Box",
    category: "gameday",
    container: "20′ high-cube",
    short: "A press box with an 18′ fold-up window over the field.",
    description: "Room for the announcer, stats and broadcast crew behind an 18′ fold-up awning window, with a full-length counter.",
    features: ["18′ fold-up awning window", "Full-length work counter", "Seating for the broadcast and stats crew", "Insulated shell with power and lighting"],
    tiers: "The window: steel and polycarbonate, aluminum and tempered glass, or thermally broken laminated low-E. Counters go from laminate to solid surface.",
    prices: { economy: 21997, standard: 37349, luxury: 65964 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Press Box", canvas: "Awning face + side walls", placement: "Above the stands, on every broadcast" }
  },
  {
    slug: "ticket-booth",
    name: "Ticket Booth",
    category: "gameday",
    container: "20′ high-cube",
    short: "A ticket window and full-height turnstile lane in one unit.",
    description: "A secure ticket office with a transaction window alongside a full-height turnstile lane. Your front door on game day.",
    features: ["Full-height turnstile lane", "Secure ticket office with transaction window", "QR/RFID scanner integration at Luxury", "Ties into existing fencing"],
    tiers: "The turnstile: mechanical at Economy, counter and drop-arm at Standard, electronic with QR/RFID scanning at Luxury. The transaction window follows the same curve.",
    prices: { economy: 27686, standard: 48237, luxury: 85224 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Gate", canvas: "Two side walls + window header", placement: "Main entry, the first thing every fan sees" }
  },
  {
    slug: "concession-stand",
    name: "Concession Stand",
    category: "concessions",
    container: "20′ high-cube",
    short: "A health-code-ready stand with a 16′ serving window.",
    description: "A 16′ serving window with awning, a prep and serving line, and a graphic wrap in your colors. Built around health-department requirements.",
    features: ["16′ serving window with awning", "NSF-compliant prep and serving line", "Custom graphic wrap", "Type-I hood, ice machine and grease interceptor at Luxury"],
    tiers: "Health-department compliance. Economy meets minimum NSF, Standard adds full coved finishes and a warming line, and Luxury adds a Type-I hood, ice machine and grease interceptor.",
    prices: { economy: 34898, standard: 65548, luxury: 123320 },
    images: [{ src: "view-1.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Snack Bar", canvas: "Full wrap + menu board + awning", placement: "Concourse, every fan walks past" }
  },
  {
    slug: "merchandise-stand",
    name: "Merchandise Stand",
    category: "concessions",
    container: "20′ high-cube",
    short: "An open-front team store with a 19′ awning side and header sign.",
    description: "Slatwall, apparel racks and a display table behind a 19′ fold-up side, with a header sign above. Merch on game day, secure storage the rest of the week.",
    features: ["19′ fold-up awning side", "Slatwall and apparel racks", "Header signage", "Lockable when closed"],
    tiers: "Fixtures and branding: stock slatwall and a folding table, a full slatwall system, or custom back-lit millwork, with a much bigger signage budget at the top.",
    prices: { economy: 27057, standard: 49416, luxury: 90022 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }, { src: "view-2.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Team Shop", canvas: "Header sign + full exterior wrap", placement: "Main concourse and gates" }
  },
  {
    slug: "clubhouse-deck",
    name: "Clubhouse + Observation Deck",
    category: "hospitality",
    container: "20′ high-cube + decks",
    short: "A bar and clubhouse below, an elevated observation deck above.",
    description: "A 20′ bar and gathering space with a wraparound lower deck and an occupied roof deck for coaches, scouts and filming.",
    features: ["Bar with seating", "Elevated roof deck with railing", "Lower deck with table seating", "Exterior stair"],
    tiers: "The roof deck: screw piers and treated lumber, footings and composite, or hot-dip galvanized steel with ipe and glass-infill rail. Bar equipment scales with it.",
    prices: { economy: 55130, standard: 94428, luxury: 160005 },
    images: [{ src: "view-1.jpg", label: "Plans & elevations", fit: "contain" }],
    partner: { naming: "The [Your Brand] Clubhouse", canvas: "Container walls + deck rail banners", placement: "Field-side, visible from the stands" }
  },
  {
    slug: "vip-club",
    name: "Luxury Suite / VIP Club",
    category: "hospitality",
    container: "40′ high-cube + deck",
    short: "A luxury suite with lounge, bar and a field-facing deck.",
    description: "Premium hospitality for boosters, sponsors and donors: lounge seating, a full bar, screens, a private restroom and a lit deck overlooking the field.",
    features: ["Climate control (HVAC)", "Full bar with refrigerator and ice maker", "Lounge seating, large windows and smart TV", "Private restroom and outdoor deck"],
    tiers: "Finish level and the glass: fixed aluminum window wall, commercial slider or multi-slide; laminate, quartz or stone bar; treated, composite or ipe deck. The deck is included at every tier.",
    prices: { economy: 84751, standard: 143545, luxury: 253110 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "contain" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Club", canvas: "Full exterior + deck fascia + interior", placement: "Premium sideline; host your own clients" }
  },
  {
    slug: "vip-club-stacked",
    name: "Stacked VIP Club",
    category: "hospitality",
    container: "2 × 40′ high-cube",
    short: "Two stories of VIP space plus a rooftop deck.",
    description: "Two lounge levels on stacked 40′ containers with an interior stair, a full bar, viewing windows on both levels and a third occupied level on the roof.",
    features: ["Two lounge levels", "Rooftop deck", "Interior and exterior stairs", "Full bar, restroom and large viewing windows"],
    tiers: "Everything in the single suite, doubled, plus the stack frame, an interior stair cut through the floor and the rooftop level.",
    prices: { economy: 173986, standard: 293902, luxury: 453323 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "contain" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Club Tower", canvas: "Two stories of exterior + rooftop", placement: "Premium sideline, highest-visibility hospitality" }
  },
  {
    slug: "container-stage",
    name: "Container Stage",
    category: "hospitality",
    container: "2 × 40′ + 24′ × 20′ deck",
    short: "A concert and event stage between two 40′ container towers.",
    description: "A 24′ × 20′ performance deck framed by two 40′ container towers, with a roof truss, rigging points, stairs and stage power. Production AV is available as an add-on.",
    features: ["24′ × 20′ performance deck", "Roof truss and rigging points", "Stairs and stage power", "Optional AV: LED walls, audio, lighting, generator"],
    tiers: "Roof truss and rigging: bolted box truss with a tarp, aluminum ground-support with a tensioned cover, or motorized hoists and flown wings. Power grows from single-phase to 400A three-phase.",
    prices: { economy: 74608, standard: 132127, luxury: 230340 },
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "contain" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }],
    partner: { naming: "The [Your Brand] Stage", canvas: "Container towers + LED walls + truss banner", placement: "Concerts, festivals and halftime shows" }
  }
];

/* Future market expansions: designs in development, not yet priced. */
window.MC_FUTURE = [
  {
    slug: "military-gym",
    market: "Military",
    name: "Mobile Gym",
    container: "40′ high-cube",
    short: "A deployable strength and conditioning facility. Train anywhere, any mission.",
    features: ["Strength equipment: racks, barbells, dumbbells, benches, sleds", "Cardio zone: treadmills, assault bikes, rowers", "Climate control with solar and battery power for off-grid use", "Ships as a standard 40′ container by truck, rail, ship or C-130"],
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "contain" }, { src: "view-2.jpg", label: "Spec sheet", fit: "contain" }]
  },
  {
    slug: "emergency-shelter",
    market: "Emergency Services",
    name: "Emergency Shelter",
    container: "40′ high-cube",
    short: "A steel shelter that can be staged before storms and deployed after disasters.",
    features: ["Hardened steel container shell", "Extended roof canopy for covered space outside", "Two entry doors", "Moves by truck or rail"],
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }]
  },
  {
    slug: "stem-lab",
    market: "Education",
    name: "STEM Lab",
    container: "40′ high-cube",
    short: "A climate-controlled science classroom delivered to any campus.",
    features: ["Lab benches and storage", "Large windows for natural light", "Mini-split climate control", "Ventilation exhaust"],
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }]
  },
  {
    slug: "popup-store",
    market: "Entertainment",
    name: "Pop-up Store",
    container: "20′ high-cube",
    short: "A ready-to-sell retail unit for festivals, fairs and events.",
    features: ["Fold-up service window and counter", "Lockable between events", "Easy to truck between venues", "Custom graphic wrap"],
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }]
  },
  {
    slug: "bus-stop",
    market: "Infrastructure",
    name: "Bus Stop",
    container: "20′ high-cube",
    short: "A covered transit shelter with seating, signage and weather protection.",
    features: ["Open side with bench seating", "Weather protection", "Route and schedule signage", "Advertising-ready exterior"],
    images: [{ src: "view-1.jpg", label: "Rendering", fit: "cover" }]
  }
];

window.MC_formatPrice = function (n) {
  return "$" + Math.round(n).toLocaleString("en-US");
};
window.MC_formatK = function (n) {
  return "$" + Math.round(n / 1000) + "K";
};
