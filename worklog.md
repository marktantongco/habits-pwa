# Habits PWA - PWA Fixes Worklog

## Date: 2025-01-XX

### Summary of Changes

Applied 10 PWA-related fixes to the Habits Class devotional app.

---

### FIX 1: Service Worker Registration Path (CRITICAL)
- **File**: `/home/z/my-project/src/app/page.tsx` (line ~1088)
- **Change**: Updated service worker registration from `/service-worker.js` to `/habits-pwa/service-worker.js` with `scope: '/habits-pwa/'`
- **Reason**: Static export with basePath requires correct SW path

### FIX 2: PWA Install Prompt (CRITICAL - NEW FEATURE)
- **File**: `/home/z/my-project/src/app/page.tsx`
- **Changes**:
  - Added `BeforeInstallPromptEvent` interface (line 43-46)
  - Added `Download` and `WifiOff` to lucide-react imports
  - Added state: `installPrompt`, `showInstallBanner`, `isOnline` (lines 1069-1074)
  - Added `beforeinstallprompt` useEffect handler (lines 1167-1177)
  - Added `handleInstallPWA` and `dismissInstallBanner` handlers (lines 1179-1189)
  - Added install banner JSX with Download icon before `showNameModal` block (lines 1507-1524)
- **Note**: Used `Download` icon instead of `Install` (not available in lucide-react)

### FIX 3: Fix CSS Wildcard Transitions (PERFORMANCE - CRITICAL)
- **File**: `/home/z/my-project/src/app/globals.css` (lines 296-308)
- **Change**: Replaced `*, *::before, *::after` wildcard transition with targeted element list (`h1, h2, h3, h4, p, span, div, button, a, li, label, section, header, footer, main, nav, article, aside`)
- **Added**: Exclusion rule for scroll containers (`.no-scrollbar, .overflow-y-auto, .overflow-x-auto, [class*="overflow-"]`)
- **Reason**: Wildcard transitions cause scroll jank

### FIX 4: Add viewport-fit=cover for standalone PWA
- **File**: `/home/z/my-project/src/app/layout.tsx` (line 27)
- **Change**: Added `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` in `<head>`
- **Reason**: Required for full-screen PWA on iOS

### FIX 5: Add apple-touch-icon in layout + generate PNG icons
- **File**: `/home/z/my-project/src/app/layout.tsx` (line 28)
- **Change**: Added `<link rel="apple-touch-icon" href="/habits-pwa/icon-192.png" />` in `<head>`
- **Files Created**:
  - `/home/z/my-project/public/icon-192.png` - App icon (1024x1024)
  - `/home/z/my-project/public/icon-512.png` - App icon (1024x1024)
- **Generated via**: z-ai-generate CLI tool

### FIX 6: Update manifest.json with real icon paths
- **File**: `/home/z/my-project/public/manifest.json`
- **Change**: Replaced SVG data URI icons with real PNG file references (`/habits-pwa/icon-192.png` and `/habits-pwa/icon-512.png`)
- **Reason**: SVG data URIs cause issues with some PWA installers; PNG is more compatible

### FIX 7: Add Offline Status Indicator
- **File**: `/home/z/my-project/src/app/page.tsx`
- **Changes**:
  - Added `isOnline` state (line 1074)
  - Added online/offline event listeners useEffect (lines 1191-1202)
  - Added offline indicator JSX with `WifiOff` icon, z-[90] priority (lines 1501-1506)

### FIX 8: Service Worker Update Notification
- **File**: `/home/z/my-project/src/app/page.tsx` (lines 1088-1102)
- **Change**: Enhanced service worker registration with `updatefound` event listener that shows "Update available! Refresh to update." via `setSaveStatus`
- **Reason**: Users need to know when new content is available

### FIX 9: Bump Service Worker Cache Version
- **File**: `/home/z/my-project/public/service-worker.js` (lines 2-3)
- **Change**: Updated cache names from `v2` to `v3`
  - `CACHE_NAME: 'habits-class-v3'`
  - `RUNTIME_CACHE: 'habits-class-runtime-v3'`
- **Reason**: Force cache refresh after these changes

### FIX 10: Add safe-area padding for standalone PWA on iOS
- **File**: `/home/z/my-project/src/app/globals.css` (lines 521-529)
- **Change**: Added `@supports` rule for `env(safe-area-inset-top)` with `.pwa-safe-top` and `.pwa-safe-bottom` utility classes
- **Reason**: iOS notch and home indicator require safe area padding in standalone mode

---

### Lint Status
- No source file errors (only pre-existing warnings in `deploy/dist` build artifacts and `habits1_extracted/` reference file)
- Dev server compiled successfully
---
Task ID: 1
Agent: Main Agent + full-stack-developer subagent
Task: Comprehensive PWA audit, optimization, and deployment

Work Log:
- Audited all key files: next.config.ts, manifest.json, service-worker.js, layout.tsx, page.tsx (1823 lines), globals.css (515 lines)
- Identified 10 issues: CRITICAL (SW path wrong, no install prompt, CSS wildcard transitions), HIGH (viewport-fit, apple-touch-icon, offline indicator, SW update notification), LOW (safe-area padding)
- Fixed service worker registration path from /service-worker.js to /habits-pwa/service-worker.js with scope
- Added BeforeInstallPromptEvent interface and PWA install banner with Download icon
- Fixed CSS wildcard transitions (replaced *, *::before, *::after with targeted element list + scroll exclusion)
- Added viewport-fit=cover meta tag for standalone PWA safe areas
- Generated real PNG app icons (192px, 512px) via z-ai-generate
- Updated manifest.json to use real icon file paths instead of SVG data URIs
- Added apple-touch-icon link in layout.tsx
- Added offline status indicator with WifiOff icon
- Enhanced SW registration with updatefound handler for update notifications
- Bumped service worker cache version from v2 to v3
- Added pwa-safe-top/pwa-safe-bottom utility classes
- Fixed duplicate Download import in lucide-react
- Fixed postbuild.mjs ESM imports (require -> import)
- Fixed Vercel deployment: set framework null, copy real routes-manifest.json from .next/
- Build: zero errors, zero lint warnings in src/
- Deployed to GitHub, GitHub Pages, Vercel

Stage Summary:
- All 10 fixes applied successfully
- GitHub Pages: https://marktantongco.github.io/habits-pwa/
- Vercel: https://habits-pwa-lyart.vercel.app (new alias: https://my-project-pearl-kappa-72.vercel.app)
- PWA is now installable on mobile with proper service worker scope, install prompt banner, and offline support
