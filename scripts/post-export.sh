#!/bin/bash
# Post-export: inject PWA meta tags into dist/index.html
sed -i '' 's|<title>Sudoku Minimalist</title>|<title>Sudoku Minimalist</title>\n    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n    <link rel="manifest" href="/manifest.json" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="apple-mobile-web-app-title" content="Sudoku" />\n    <meta name="theme-color" content="#0A0A0F" />|' dist/index.html
echo "PWA meta tags injected"
