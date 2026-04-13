#!/usr/bin/env node
/**
 * Post-build script: Creates a `habits-pwa/` subdirectory inside `out/`
 * so that the static export works on BOTH:
 * - GitHub Pages: files at branch root (served at /habits-pwa/)
 * - Vercel: files in out/habits-pwa/ subdirectory (served at /habits-pwa/)
 *
 * With basePath: '/habits-pwa', Next.js generates HTML referencing /habits-pwa/_next/...
 * This script ensures those paths resolve correctly on both platforms.
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');
const SUB_DIR = path.join(OUT_DIR, 'habits-pwa');

// Clean previous subdirectory if it exists
if (fs.existsSync(SUB_DIR)) {
  fs.rmSync(SUB_DIR, { recursive: true, force: true });
}

// Create the subdirectory
fs.mkdirSync(SUB_DIR, { recursive: true });

// Copy all contents from out/ into out/habits-pwa/
const entries = [
  'index.html',
  '404.html',
  '_not-found.html',
  'manifest.json',
  'service-worker.js',
  'robots.txt',
  'logo.svg',
  '_next',
  '_not-found',
];

for (const entry of entries) {
  const src = path.join(OUT_DIR, entry);
  const dest = path.join(SUB_DIR, entry);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log('  Copied: ' + entry);
  }
}

// Add .nojekyll for GitHub Pages
fs.writeFileSync(path.join(OUT_DIR, '.nojekyll'), '');
console.log('  Created: .nojekyll');

console.log('\nPost-build complete: out/habits-pwa/ ready for Vercel');
