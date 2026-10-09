#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEO-Апгрейд — сканер «мертвых» Tailwind-классов (2026-10-09)
Находит классы, использованные в HTML, но не сгенерированные в tailwind.min.css.
Запуск: python geo-upgrade-broken-css-scan.py [папка сайта]
Зависимости: только стандартная библиотека.
"""
import re, sys, os, glob, collections

SPECIAL = re.compile(r'[\[\]:/]')   # классы, селектор которых экранируется в CSS
def norm_css(css: str) -> str:
    return css.replace('\\', '')

def main(folder='.'):
    css_files = glob.glob(os.path.join(folder, '*.css'))
    if not css_files:
        print('Не найдено .css в', folder); sys.exit(1)
    union = '\n'.join(norm_css(open(p, encoding='utf-8', errors='replace').read()) for p in css_files)

    missing = collections.defaultdict(list)
    pages = glob.glob(os.path.join(folder, '*.html')) + glob.glob(os.path.join(folder, '**', '*.html'), recursive=True)
    seen = set()
    for page in sorted(set(pages)):
        html = open(page, encoding='utf-8', errors='replace').read()
        # вырезаем <script>, чтобы не ловить классы из шаблонных строк JS
        body = re.sub(r'<script.*?</script>', '', html, flags=re.S)
        inline = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S))
        page_css = union + '\n' + norm_css(inline)
        used = set()
        for m in re.findall(r'class="([^"]+)"', body):
            used.update(m.split())
        for c in sorted(used):
            key = (c,)
            if key in seen: continue
            seen.add(key)
            if SPECIAL.search(c) and ('.' + c) not in page_css:
                missing[c].append(os.path.basename(page))

    if not missing:
        print('Все классы покрыты. Мёртвых классов нет.')
    else:
        print('Мёртвые классы (используются, но нет CSS):')
        for c in sorted(missing):
            print(f'  {c:32s} x{len(missing[c])} pages: {", ".join(sorted(set(missing[c]))[:5])}')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
