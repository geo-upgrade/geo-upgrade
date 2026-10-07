#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Пакет исправлений PSI — патч всех HTML-страниц репозитория.
Запуск из КОРНЯ репозитория:  python3 patch/patch_all.py
Идемпотентный: повторный запуск ничего не меняет.
Оригиналы страниц копируются в backup/ перед первой правкой.
"""
import re, sys, shutil
from pathlib import Path

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
backup = root / 'backup'; backup.mkdir(exist_ok=True)

FONT_RE = re.compile(r'<link rel="preconnect" href="https://fonts\.googleapis\.com"><link rel="preconnect" href="https://fonts\.gstatic\.com"(?: crossorigin="")?><link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">')
FONT_NEW = ('<link rel="preload" as="font" type="font/woff2" href="fonts/exo2-400-cyrillic.woff2" crossorigin>'
            '<link rel="preload" as="font" type="font/woff2" href="fonts/exo2-600-cyrillic.woff2" crossorigin>'
            '<link rel="preload" as="font" type="font/woff2" href="fonts/orbitron-700-latin.woff2" crossorigin>'
            '<link rel="stylesheet" href="fonts.css">')
FC_OLD = '.fc-pulse{animation:fcPulse 2.4s ease-in-out infinite}'
FC_NEW = ('.fc-pulse{position:relative}.fc-pulse::after{content:"";position:absolute;inset:0;border-radius:inherit;'
          'box-shadow:0 0 30px rgba(0,240,255,.34);opacity:0;animation:fcPulse 2.4s ease-in-out infinite;pointer-events:none}')
KF_OLD = '@keyframes fcPulse{0%,100%{box-shadow:0 0 16px rgba(0,240,255,.18)}50%{box-shadow:0 0 30px rgba(0,240,255,.34)}}'
KF_NEW = '@keyframes fcPulse{0%,100%{opacity:0}50%{opacity:.75}}'
RM_OLD = '@media(prefers-reduced-motion:reduce){.fc-swap,.fc-pulse{animation:none}}'
RM_NEW = '@media(prefers-reduced-motion:reduce){.fc-swap,.fc-pulse,.fc-pulse::after{animation:none}}'
METH_RE = re.compile(r'Методология:\s*<a href="brand-visibility\.html"([^>]*)>GEO-Апгрейд</a>')
METH_NEW = r'<a href="brand-visibility.html"\1>Методология GEO-Апгрейд</a>'
MORE_RE = re.compile(r'<a href="([^"]+)"([^>]*)>Подробнее об услуге →</a>')
KNOWN = {'geo-scanner-lite.html':'GEO-сканер Лайт','geo-scanner-full.html':'GEO-сканер Полный',
         'geo-test-drive.html':'GEO-тест-драйв','geo-content-lab.html':'GEO-лаборатория контента',
         'geo-route.html':'GEO-маршрут бренда','geo-shturval.html':'GEO-штурвал'}

def page_name(p):
    try:
        t = re.search(r'<title>([^<]+)</title>', p.read_text(encoding='utf-8')).group(1)
        return re.split(r'\s[—–-]\s', t)[0].strip()
    except Exception:
        return None

def addwh(m):
    tag = m.group(0)
    if 'width=' in tag: return tag
    return tag.replace('<img ', '<img width="256" height="256" ', 1)
def addwh_blog(m):
    tag = m.group(0)
    if 'width=' in tag: return tag
    return tag.replace('<img ', '<img width="1100" height="684" ', 1)

changed_files, skipped = [], []
for f in sorted(root.glob('*.html')):
    s = f.read_text(encoding='utf-8'); orig = s; ch = []
    if 'fonts.googleapis.com' in s:
        if FONT_RE.search(s):
            s = FONT_RE.sub(FONT_NEW, s); ch.append('fonts->local')
        else:
            skipped.append(f.name + ' (блок шрифтов не совпал — править вручную)')
    if 'logo-round-min.png' in s:
        s = s.replace('src="logo-round-min.png"', 'src="logo-round-min.webp"'); ch.append('logo->webp')
    s = re.sub(r'<img[^>]*logo-round-min\.webp[^>]*>', addwh, s)
    s = re.sub(r'<img[^>]*blog-geo-lab-signals\.jpg[^>]*>', addwh_blog, s)
    if FC_OLD in s:
        s = s.replace(FC_OLD, FC_NEW).replace(KF_OLD, KF_NEW).replace(RM_OLD, RM_NEW); ch.append('fc-pulse->composite')
    if 'perf-fixes.css' not in s and '</head>' in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="perf-fixes.css">\n</head>', 1); ch.append('+perf-fixes.css')
    s, n1 = METH_RE.subn(METH_NEW, s)
    if n1: ch.append('link: Методология GEO-Апгрейд')
    def more_sub(m):
        href, attrs = m.group(1), m.group(2)
        name = KNOWN.get(href) or page_name(root / href) or href
        return f'<a href="{href}"{attrs}>Подробнее: {name} →</a>'
    s, n2 = MORE_RE.subn(more_sub, s)
    if n2: ch.append(f'links renamed x{n2}')
    if s != orig:
        if not (backup / f.name).exists(): shutil.copy2(f, backup / f.name)
        f.write_text(s, encoding='utf-8'); changed_files.append((f.name, ch))
    elif f.name not in [x.split(' ')[0] for x in skipped]:
        skipped.append(f.name + ' (без изменений)')

print('ИЗМЕНЕНО страниц:', len(changed_files))
for n, c in changed_files: print(' ', n, '->', '; '.join(c))
print('ПРОПУЩЕНО/РУЧНАЯ ПРОВЕРКА:', len(skipped))
for x in skipped: print(' ', x)
print('\nГотово. Оригиналы — в backup/. Проверь пару страниц в браузере перед push.')
