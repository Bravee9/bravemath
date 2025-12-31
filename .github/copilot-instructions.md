# Bravemath - Copilot Instructions

## 📋 Project Overview

**Bravemath** is a free academic document sharing platform for high school and university students in Vietnam, focused on Mathematics.

- **Tech Stack**: Vite 5, Vanilla JavaScript (ES6 Modules), Tailwind CSS 3
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **CDN**: Cloudflare Worker proxy for Google Drive files
- **Repository**: https://github.com/Bravee9/bravemath
- **Live URL**: https://bravee9.github.io/bravemath/

## 🚨 CRITICAL SECURITY & DATA INTEGRITY

### CSP Configuration
**CRITICAL**: CSP in `src/pages/index.html` must allow Google Drive thumbnails:
```html
<meta http-equiv="Content-Security-Policy" content="img-src 'self' https://*.google.com https://*.googleusercontent.com data: blob:;">
```

### Duplicate Prevention
**CRITICAL**: `scripts/add-document.js` MUST check duplicates:
- Drive ID check (blocking)
- Title check (warning with confirmation)

### Path Resolution
**CRITICAL**: Always use `import.meta.env.BASE_URL` for paths:
```javascript
const basePath = import.meta.env.BASE_URL || '/';
const fallbackImg = `${basePath}assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg`;
```

### Vietnamese Filename Sanitization
**CRITICAL**: Download filenames MUST sanitize Vietnamese chars with 45-char mapping in `api.js`, add "-bravemath" suffix.

## 🏗️ Architecture & Design Patterns

### Module Pattern (ES6 Modules)
Separation of Concerns with independent modules:
- `src/js/api.js` → Data fetching & external API communication
- `src/js/search.js` → Search & filtering logic (Pure functions)
- `src/js/router.js` → Client-side routing
- `src/js/main.js` → Homepage orchestration
- `src/js/subject.js` → Subject page orchestration

**Principles**: Single Responsibility, Dependency Inversion, Pure Functions.

### Component-Based CSS (Tailwind + Custom Components)
```css
@layer base     → Global resets & defaults
@layer components → Reusable components (.btn-primary, .document-card, .badge-*)
@layer utilities  → Tailwind utilities
```

**Colors**: Discord palette (#202225, #2f3136, #5865F2, #EB459E, #3BA55D, #FAA81A, #ED4245)

### Data-Driven Rendering
**NO HARDCODED DATA**: All content from `data/documents.json`
- Metadata auto-updated via `scripts/update-metadata.js`
- Thumbnails from Google Drive API
- Single Source of Truth

## 🎯 Coding Standards & Best Practices

### JavaScript Guidelines
- **Explicit imports**: `import { loadDocuments } from './api.js';`
- **User-friendly errors**: Console log + alert in Vietnamese
- **Debounced input**: 300ms for search
- **DOM checks**: `if (!grid) return;`
- **Data validation**: Check driveId before enabling downloads

### CSS Guidelines
- **No inline styles**: All in CSS classes
- **Tailwind first**: Custom CSS only when needed
- **No glow effects**: Clean design

### HTML Guidelines
- **Semantic HTML**: nav, main, section, article
- **Accessibility**: alt text, lazy loading
- **No hardcoded content**: Render from JS

## 🔄 Development Workflow

### Local Development
```bash
npm run css:watch    # Watch Tailwind changes
npm run dev          # Vite dev server (port 3000)
```

### Add New Document
```bash
npm run add:document # Interactive CLI with duplicate detection
# Auto: check duplicates, fetch metadata, generate thumbnail, kebab-case tags
```

### Build & Deploy
```bash
npm run css:build    # Build production CSS
npm run build        # Vite build
git push             # Auto-deploy via GitHub Actions (~2-3 min)
```

## 📦 Dependencies & Versions
- `vite: ^5.0.0`
- `tailwindcss: ^3.4.0`
- No runtime dependencies (Vanilla JS)

## 🌐 Deployment Architecture
GitHub Repository → GitHub Actions → GitHub Pages + Cloudflare Worker → Google Drive

## ❌ Common Mistakes to Avoid
- Hardcoded paths (use `import.meta.env.BASE_URL`)
- Inline styles or hardcoded data
- Missing duplicate checks in add-document.js
- Committing sensitive files (.env, wrangler.toml)
- Infinite loops in image onerror (use `onerror=null`)
- XSS vulnerabilities (use `escapeHtml()`)
- Modifying documents.json manually (use npm scripts)

## 📝 Version History
- **v1.2.0** (2025-12-29): Security & Data Integrity Updates

**Maintained by**: Bùi Quang Chiến (@Bravee9)