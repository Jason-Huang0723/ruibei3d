#!/usr/bin/env python3
"""把 src/ 裡的檔案接成單一 index.html（下載後用電腦 Chrome/Edge 直接開）。"""
import pathlib
root = pathlib.Path(__file__).parent
src = sorted((root / 'src').iterdir())
parts = [p.read_text(encoding='utf-8') for p in src if p.suffix in ('.html', '.js')]
html = ''.join(parts)
assert '`' not in html, '原始碼裡不要用反引號（`）'
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html.encode('utf-8')), 'bytes')
