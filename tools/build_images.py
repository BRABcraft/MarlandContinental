# Builds site images from the "Marland continental products" folder.
# Edit the P table to change covers, crops or views, then run: python tools/build_images.py
# Every cover is a rendering. Prices live separately in js/products.js; keep its `images` lists in step with this table.
import os, shutil, json
from PIL import Image

SRC = "C:/Users/Bradl/Downloads/Marland continental products/"
NEW = SRC + "New marland continental additions/"
ASSETS = "C:/Users/Bradl/Downloads/Marland Continental assets/"
SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img") + "/"

# cover: ("photo", file, (fx, fy)) | ("drawing", file, box) | ("crop", file, box)
# views: (file, label, fit, optional box)
P = {
  "bleacher-unit": (("photo", "40 foot bleacher unit 3.png", (.5, .5)),
      [("40 foot bleacher unit 3.png", "Rendering", "cover"), ("40 feet bleacher unit 2.png", "Plans & elevations", "contain")]),
  "stacked-bleacher-unit": (("photo", "40 feet stacked bleacher unit 1.png", (.5, .5)),
      [("40 feet stacked bleacher unit 1.png", "Rendering", "cover"), ("40 feet stacked bleacher unit 2.png", "Plans & elevations", "contain")]),
  "press-box": (("photo", "20 foot press box 2.jpg", (.5, .5)),
      [("20 foot press box 2.jpg", "Rendering", "cover"), ("20 foot press box.jpg", "Spec sheet", "contain")]),
  "equipment-room": (("photo", "20 foot equipment room 2.png", (.52, .5)),
      [("20 foot equipment room 2.png", "Rendering", "cover"), ("20 foot equipment room.jpg", "Spec sheet", "contain")]),
  "training-room-20": (("photo", "20 feet training room 1.png", (.5, .62)),
      [("20 feet training room 1.png", "Interior", "cover"), ("20 feet training room 2.png", "Plans & elevations", "contain")]),
  "training-room-40": (("photo", "40 feet training room 1.png", (.5, .62)),
      [("40 feet training room 1.png", "Interior", "cover"), ("40 feet training room 2.png", "Plans & elevations", "contain")]),
  "weight-room": (("photo", "20 feet weight room 1.png", (.5, .5)),
      [("20 feet weight room 1.png", "Rendering", "cover"), ("20 feet weight room 2.png", "Plans & elevations", "contain")]),
  "concession-stand": (("photo", "20 feet conession stand 1.png", (.5, .5)),
      [("20 feet conession stand 1.png", "Rendering", "cover"), ("20 feet concession stand 2.png", "Plans & elevations", "contain")]),
  "merchandise-stand": (("photo", "20 feet merchandise stand 3.png", (.5, .5)),
      [("20 feet merchandise stand 3.png", "Rendering · High school", "cover"), ("20 feet merchandise stand 1.png", "Rendering · College", "cover"),
       ("20 feet merchandise stand 2.png", "Plans & elevations", "contain")]),
  "ticket-booth": (("photo", "20 feet ticket booth 3.png", (.5, .5)),
      [("20 feet ticket booth 3.png", "Rendering · High school", "cover"), ("20 feet ticket booth 1.png", "Rendering · College", "cover"),
       ("20 feet ticket booth 2.png", "Plans & elevations", "contain")]),
  "referee-lounge": (("photo", "20 feet referee longue 2.png", (.5, .55)),
      [("20 feet referee longue 2.png", "Interior", "cover"), ("20 feet referee longue 3.png", "Plans & elevations", "contain")]),
  "visiting-team-facility": (("photo", "40 feet visiting team facilities 1.png", (.5, .5)),
      [("40 feet visiting team facilities 1.png", "Rendering", "cover"), ("40 feet visiting team facilities 3.png", "Locker room", "cover"),
       ("40 feet visiting team facilities 4.png", "Vanity & showers", "cover"), ("40 feet visiting team facilities 5.png", "Vanity & showers · 2", "cover"),
       ("40 feet visiting team facilities 6.png", "Vanity & showers · 3", "cover"), ("40 feet visiting team facilities 2.png", "Floor plan", "contain")]),
  "clubhouse-deck": (("photo", "20 foot clubhouse 1.png", (.5, .5)),
      [("20 foot clubhouse 1.png", "Rendering", "cover"), ("20 foot clubhouse 2.png", "Plans & elevations", "contain")]),
  "vip-club": (("crop", "40 foot 1 floor luxury suite 2.jpg", (428, 0, 851, 282)),
      [("40 foot 1 floor luxury suite 2.jpg", "Rendering", "contain", (322, 0, 988, 282)), ("40 foot 1 floor luxury suite 2.jpg", "Spec sheet", "contain")]),
  "vip-club-stacked": (("crop", "40 foot 2 floor luxury suite.jpg", (375, 0, 825, 300)),
      [("40 foot 2 floor luxury suite.jpg", "Rendering", "contain", (350, 0, 955, 300)), ("40 foot 2 floor luxury suite.jpg", "Spec sheet", "contain")]),
  "container-stage": (("crop", "40 foot by 20 foot stage.jpg", (380, 0, 823, 295)),
      [("40 foot by 20 foot stage.jpg", "Rendering", "contain", (345, 0, 965, 295)), ("40 foot by 20 foot stage.jpg", "Spec sheet", "contain")]),
  "baseball-dugout": (("crop", "40 foot baseball dugout.jpg", (443, 0, 836, 262)),
      [("40 foot baseball dugout.jpg", "Rendering", "contain", (348, 0, 1003, 262)), ("40 foot baseball dugout.jpg", "Spec sheet", "contain")]),
  # Future markets
  "military-gym": (("crop", NEW + "40 foot mobile gym.jpg", (360, 0, 840, 320)),
      [(NEW + "40 foot mobile gym.jpg", "Rendering", "contain", (312, 0, 975, 320)), (NEW + "40 foot mobile gym.jpg", "Spec sheet", "contain")]),
  "emergency-shelter": (("photo", NEW + "40 foot emergency shelter.png", (.5, .5)),
      [(NEW + "40 foot emergency shelter.png", "Rendering", "cover")]),
  "stem-lab": (("photo", NEW + "40 foot stem lab.png", (.5, .5)),
      [(NEW + "40 foot stem lab.png", "Rendering", "cover")]),
  "popup-store": (("photo", NEW + "20 foot popup store.jfif", (.5, .5)),
      [(NEW + "20 foot popup store.jfif", "Rendering", "cover")]),
  "bus-stop": (("photo", NEW + "20 foot bus stop.jfif", (.5, .5)),
      [(NEW + "20 foot bus stop.jfif", "Rendering", "cover")]),
}

def path(f): return f if os.path.isabs(f) or f.startswith("C:") else SRC + f

def crop32(im, fx, fy):
    w, h = im.size
    if w / h > 1.5:
        nw = round(h * 1.5); x = min(max(0, round(fx * w - nw / 2)), w - nw); return im.crop((x, 0, x + nw, h))
    nh = round(w / 1.5); y = min(max(0, round(fy * h - nh / 2)), h - nh); return im.crop((0, y, w, y + nh))

def on_white(im):
    w, h = im.size; pad = 0.08
    cw = max(w / (1 - 2 * pad), h * 1.5 / (1 - 2 * pad)); ch = cw / 1.5
    canvas = Image.new("RGB", (round(cw), round(ch)), "white")
    canvas.paste(im, ((round(cw) - w) // 2, (round(ch) - h) // 2)); return canvas

def save(im, out, maxw):
    im = im.convert("RGB")
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    return im.size

# fresh product folder
prod_dir = SITE + "products/"
if os.path.isdir(prod_dir): shutil.rmtree(prod_dir)
os.makedirs(prod_dir)
manifest = {}
for slug, ((kind, f, arg), views) in P.items():
    d = prod_dir + slug + "/"; os.makedirs(d)
    src = Image.open(path(f)).convert("RGB")
    if kind == "photo": cov = crop32(src, *arg)
    elif kind == "drawing": cov = on_white(src.crop(arg))
    else: cov = src.crop(arg)
    save(cov, d + "cover.jpg", 1200); save(cov, d + "cover-sm.jpg", 720)
    items = []
    for i, v in enumerate(views, 1):
        vf, label, fit = v[:3]
        im = Image.open(path(vf)).convert("RGB")
        if len(v) > 3: im = im.crop(v[3])
        size = save(im, d + f"view-{i}.jpg", 1800)
        items.append({"src": f"view-{i}.jpg", "label": label, "fit": fit, "w": size[0], "h": size[1]})
    manifest[slug] = items
    print(slug, cov.size, [(x["label"], x["w"], x["h"]) for x in items])

# brand assets from the brand folder; remove deck-derived images
b = SITE + "brand/"
for old in ["stadia-ip.png", "robot.png", "mark.png"]:  # old deck-derived files; keep struxure-mark.png and stadia-*.png
    if os.path.exists(b + old): os.remove(b + old)
if os.path.exists(SITE + "stadium-974.jpg"): os.remove(SITE + "stadium-974.jpg")
shutil.copy(ASSETS + "Logo-removebg-preview.png", b + "logo-horizontal.png")
shutil.copy(ASSETS + "Logo_name-removebg-preview.png", b + "logo-stacked.png")
icon = Image.open(ASSETS + "Icon-removebg-preview.png").convert("RGBA"); icon = icon.crop(icon.getbbox())
s = max(icon.size); sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); sq.paste(icon, ((s - icon.width) // 2, (s - icon.height) // 2))
fav = Image.new("RGBA", (64, 64), (255, 255, 255, 0)); m = sq.resize((56, 56), Image.LANCZOS); fav.paste(m, (4, 4), m); fav.save(b + "favicon.png")
print("done")
print("brand:", os.listdir(b))
