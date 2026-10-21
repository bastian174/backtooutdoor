#!/usr/bin/env python3
"""SEO-Check für backtooutdoor.com – prüft Sitemap, Meta-Tags, Canonicals, hreflang und interne Links.

Aufruf: python3 scripts/seo-check.py   (Exit-Code 1 bei Fehlern)
"""
import glob
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = "https://backtooutdoor.com/"
# Seiten, die nicht in den Index gehören, müssen noindex tragen; Ordner, die gar nicht ausgeliefert werden sollen
SKIP_DIRS = ("journal/", "vorschau/", "entwuerfe/", "assets/", "social/", "node_modules/")
IGNORE_LINK_PREFIXES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "//", "/api/", "/_vercel/")

errors = []


def err(page, msg):
    errors.append(f"{page}: {msg}")


def url_to_path(url):
    p = url[len(DOMAIN):] if url.startswith(DOMAIN) else url
    return "index.html" if p == "" else p


def exists(path):
    full = os.path.join(ROOT, path)
    return os.path.isfile(full) or os.path.isfile(os.path.join(full, "index.html"))


def strip_comments(html):
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


def attr(tag, name):
    m = re.search(rf'\b{name}\s*=\s*"([^"]*)"', tag)
    return m.group(1) if m else None


def find_tags(html, tag):
    return re.findall(rf"<{tag}\b[^>]*>", html, flags=re.I)


def meta(html, key, value):
    for t in find_tags(html, "meta"):
        if attr(t, key) == value:
            return attr(t, "content")
    return None


# --- Sitemap ---------------------------------------------------------------
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "x": "http://www.w3.org/1999/xhtml"}
try:
    tree = ET.parse(os.path.join(ROOT, "sitemap.xml"))
except ET.ParseError as e:
    print(f"sitemap.xml: kein gültiges XML ({e})")
    sys.exit(1)
sitemap_paths = set()
for url in tree.getroot().findall("s:url", ns):
    loc = url.find("s:loc", ns).text.strip()
    path = url_to_path(loc)
    sitemap_paths.add(path)
    if not exists(path):
        err("sitemap.xml", f"<loc> zeigt auf fehlende Datei: {loc}")
    for alt in url.findall("x:link", ns):
        if not exists(url_to_path(alt.get("href"))):
            err("sitemap.xml", f"hreflang={alt.get('hreflang')} zeigt auf fehlende Datei: {alt.get('href')}")

# --- HTML-Seiten -----------------------------------------------------------
pages = sorted(glob.glob("*.html", root_dir=ROOT) + glob.glob("mindset/**/*.html", root_dir=ROOT, recursive=True))
titles, descs = defaultdict(list), defaultdict(list)

for page in pages:
    with open(os.path.join(ROOT, page), encoding="utf-8", errors="replace") as f:
        html = strip_comments(f.read())
    robots = (meta(html, "name", "robots") or "").lower()
    noindex = "noindex" in robots

    # interne Links (gilt auch für noindex-Seiten)
    base = os.path.dirname(page)
    for link in re.findall(r'\b(?:href|src)\s*=\s*"([^"]*)"', html):
        link = link.split("#")[0].split("?")[0]
        if not link or link.startswith(IGNORE_LINK_PREFIXES) or "${" in link or "{{" in link:
            continue
        target = link.lstrip("/") if link.startswith("/") else os.path.normpath(os.path.join(base, link))
        if target in ("", "."):
            continue
        if not (exists(target) or exists(target + ".html")):
            err(page, f"defekter interner Link: {link}")

    if noindex:
        if page in sitemap_paths:
            err(page, "steht in der Sitemap, hat aber noindex")
        continue

    title = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.S | re.I)
    if not title or not title.group(1).strip():
        err(page, "fehlender <title>")
    else:
        titles[title.group(1).strip()].append(page)

    desc = meta(html, "name", "description")
    if not desc:
        err(page, "fehlende meta description")
    else:
        descs[desc.strip()].append(page)

    html_tag = find_tags(html, "html")
    if not html_tag or not attr(html_tag[0], "lang"):
        err(page, "fehlendes lang-Attribut am <html>")

    h1 = len(re.findall(r"<h1\b", html, flags=re.I))
    if h1 != 1:
        err(page, f"{h1} <h1>-Elemente (erwartet: 1)")

    links = find_tags(html, "link")
    canon = [attr(t, "href") for t in links if attr(t, "rel") == "canonical"]
    if not canon:
        err(page, "fehlender canonical")
    else:
        expected = "" if page == "index.html" else page
        if canon[0] not in (DOMAIN + expected, DOMAIN + expected.removesuffix(".html")):
            err(page, f"canonical zeigt nicht auf die Seite selbst: {canon[0]}")

    for t in links:
        if attr(t, "rel") == "alternate" and attr(t, "hreflang"):
            href = attr(t, "href") or ""
            if href.startswith(DOMAIN) and not exists(url_to_path(href)):
                err(page, f"hreflang={attr(t, 'hreflang')} zeigt auf fehlende Datei: {href}")

    if page not in sitemap_paths:
        err(page, "indexierbare Seite fehlt in sitemap.xml (oder noindex setzen)")

for label, coll in (("Titel", titles), ("meta description", descs)):
    for text, ps in coll.items():
        if len(ps) > 1:
            err(", ".join(ps), f"doppelte {label}: {text[:70]}")

# --- Ergebnis --------------------------------------------------------------
if errors:
    print(f"✗ {len(errors)} SEO-Fehler:")
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print(f"✓ SEO-Check grün ({len(pages)} Seiten, {len(sitemap_paths)} Sitemap-URLs)")
