# Bravemath - Copilot Instructions

> Last updated: 2026-01-01 | Version: 1.3.0

## 📋 Project Overview

**Bravemath** is a free academic document sharing platform for Vietnamese students (THPT & University), focused on Mathematics.

| Attribute | Value |
|-----------|-------|
| **Tech Stack** | Vite 5, Vanilla JS (ES6 Modules), Tailwind CSS 3 |
| **Deployment** | GitHub Pages + Cloudflare Workers |
| **Repository** | https://github.com/Bravee9/bravemath |
| **Live URL** | https://bravee9.github.io/bravemath/ |
| **Worker URL** | https://bravemath-proxy.bravechien2209.workers.dev |

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### 1. Security - XSS Prevention
```javascript
// ✅ ALWAYS escape user content before rendering
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ✅ Usage in main.js
const safeTitle = escapeHtml(doc.title);
card.innerHTML = `<h3>${safeTitle}</h3>`;
```

### 2. Security - Drive ID Validation
```javascript
// ✅ ALWAYS validate driveId before API calls
function isValidDriveId(driveId) {
    if (!driveId || typeof driveId !== 'string') return false;
    return /^[a-zA-Z0-9_-]{28,44}$/.test(driveId);
}

// ✅ Usage
if (!isValidDriveId(driveId)) {
    alert('ID tài liệu không hợp lệ.');
    return;
}
```

### 3. Security - URL Encoding
```javascript
// ✅ ALWAYS encode user input in URLs
const url = `${WORKER_URL}/download/${encodeURIComponent(driveId)}`;

// ✅ ALWAYS use noopener,noreferrer for external links
window.open(url, '_blank', 'noopener,noreferrer');
```

### 4. Path Resolution - NEVER Hardcode
```javascript
// ✅ CORRECT - Use import.meta.env.BASE_URL
const basePath = import.meta.env.BASE_URL || '/';
const fallbackImg = `${basePath}assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg`;

// ❌ WRONG - Hardcoded path
const fallbackImg = '/bravemath/assets/images/...';
```

### 5. CSP Headers - Keep Updated
All HTML pages MUST include this CSP:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https://*.google.com https://*.googleusercontent.com data: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://bravemath-proxy.bravechien2209.workers.dev https://www.google-analytics.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self' https://formspree.io;
">
```

### 6. Image onerror - Prevent Infinite Loop
```html
<!-- ✅ CORRECT - Set onerror=null first -->
<img src="..." onerror="this.onerror=null; this.src='fallback.jpg'">

<!-- ❌ WRONG - Can cause infinite loop -->
<img src="..." onerror="this.src='fallback.jpg'">
```

---

## 🏗️ Architecture

### File Structure
```
bravemath/
├── .github/
│   ├── workflows/deploy.yml    # CI/CD pipeline
│   └── copilot-instructions.md # This file
├── src/
│   ├── css/
│   │   ├── input.css           # Tailwind source
│   │   └── styles.css          # Compiled CSS
│   ├── js/
│   │   ├── api.js              # API calls & downloads
│   │   ├── main.js             # App orchestration
│   │   ├── search.js           # Search/filter logic
│   │   ├── router.js           # Client routing
│   │   └── subject.js          # Subject page logic
│   └── pages/
│       ├── index.html          # Homepage
│       ├── about.html          # About page
│       ├── contact.html        # Contact form
│       └── how-to-use.html     # Usage guide
├── cloudflare-worker/
│   ├── src/index.js            # Worker code
│   ├── wrangler.jsonc          # Worker config
│   └── package.json
├── data/
│   └── documents.json          # Document metadata
├── scripts/
│   ├── add-document.js         # CLI: Add new doc
│   └── update-metadata.js      # CLI: Update metadata
├── assets/                     # Static assets
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Module Responsibilities (SOLID)
| Module | Responsibility |
|--------|---------------|
| `api.js` | External API calls, downloads, validation |
| `search.js` | Pure search/filter functions (no DOM) |
| `main.js` | DOM manipulation, event handlers |
| `router.js` | Client-side navigation |
| `subject.js` | Subject-specific page logic |

### Data Flow
```
documents.json → loadDocuments() → filterDocuments() → renderDocuments()
                     ↓
              Cloudflare Worker → Google Drive
```

---

## 🔒 Security Checklist

### Frontend (src/js/)
- [ ] All user content escaped with `escapeHtml()`
- [ ] DriveId validated with `isValidDriveId()` before API calls
- [ ] URLs encoded with `encodeURIComponent()`
- [ ] External links use `noopener,noreferrer`
- [ ] No `eval()`, `innerHTML` with raw user data, or `document.write()`

### Cloudflare Worker
- [ ] Rate limiting enabled (10 req/min/IP)
- [ ] DriveId format validation
- [ ] CORS headers configured
- [ ] No sensitive data in responses

### HTML Pages
- [ ] CSP headers present and complete
- [ ] No inline event handlers with user data
- [ ] Form actions whitelisted in CSP

---

## 🎨 CSS Guidelines

### Tailwind First
```css
/* ✅ Use Tailwind utilities first */
<div class="bg-slate-800 rounded-lg p-4">

/* ✅ Custom components in @layer components */
@layer components {
    .btn-primary { @apply bg-blue-600 hover:bg-blue-700 ...; }
    .document-card { @apply bg-slate-800 rounded-xl ...; }
}

/* ❌ AVOID inline styles */
<div style="background: #1a1a1a;">
```

### Color Palette (Discord-inspired)
```css
--bg-dark: #202225;
--bg-card: #2f3136;
--accent-blue: #5865F2;
--accent-pink: #EB459E;
--accent-green: #3BA55D;
--accent-yellow: #FAA81A;
--accent-red: #ED4245;
```

---

## 📝 JavaScript Guidelines

### Error Handling
```javascript
// ✅ CORRECT - User-friendly errors in Vietnamese
try {
    await downloadDocument(driveId, filename);
} catch (error) {
    console.error('Download error:', error);
    alert('Không thể tải tài liệu. Vui lòng thử lại sau.');
}

// ❌ WRONG - Silent fail or English message
try { ... } catch (e) { }
```

### Debounce Pattern
```javascript
// ✅ Use 300ms debounce for search inputs
let searchTimeout;
input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
});
```

### DOM Safety
```javascript
// ✅ Always check element existence
const grid = document.getElementById('documents-grid');
if (!grid) return;

// ✅ Check driveId validity before enabling download
if (doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE') {
    downloadBtn.addEventListener('click', ...);
} else {
    downloadBtn.disabled = true;
}
```

---

## 🔄 Development Workflow

### Local Development
```bash
npm run css:watch    # Watch Tailwind (terminal 1)
npm run dev          # Vite dev server (terminal 2)
```

### Adding Documents
```bash
npm run add:document # Interactive CLI
# Auto: duplicate check, metadata fetch, thumbnail generation
```

### Build & Deploy
```bash
npm run build        # Build for production
git push             # Auto-deploy via GitHub Actions
```

---

## 🚀 Deployment

### GitHub Actions Pipeline
```yaml
# .github/workflows/deploy.yml
jobs:
  build:        # Build Vite project
  deploy-pages: # Deploy to GitHub Pages
  deploy-worker: # Deploy Cloudflare Worker
```

### Required Secrets
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Worker deployment token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### Wrangler Config
```jsonc
// cloudflare-worker/wrangler.jsonc
{
  "name": "bravemath-proxy",
  "main": "src/index.js",
  "compatibility_date": "2025-12-01",
  "workers_dev": true
}
```

---

## ❌ Common Mistakes

| Mistake | Correct Way |
|---------|-------------|
| Hardcoded paths | Use `import.meta.env.BASE_URL` |
| Raw innerHTML with user data | Use `escapeHtml()` |
| Missing driveId validation | Use `isValidDriveId()` |
| Manual documents.json edits | Use `npm run add:document` |
| Committing wrangler.toml | It's in .gitignore |
| Multiple favicon formats | Single JPG: `meme-soi-co-doc-hai-huoc.jpg` |
| Inconsistent nav classes | Use `mobile-nav-link` for mobile menu |

---

## 📋 Code Review Checklist

Before merging any PR:
- [ ] No `console.log` in production code
- [ ] All user content escaped (XSS)
- [ ] DriveId validated before API calls
- [ ] URLs properly encoded
- [ ] CSP headers present in new HTML pages
- [ ] Error messages in Vietnamese
- [ ] Responsive design tested (mobile/desktop)
- [ ] No hardcoded paths or URLs

---

## 📚 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-01-01 | Security hardening, wrangler.jsonc migration, nav fixes |
| 1.2.2 | 2026-01-01 | Unified favicon across pages |
| 1.2.1 | 2026-01-01 | QR donate, SEO headers |
| 1.2.0 | 2025-12-29 | Security & data integrity updates |

---

**Maintainer**: Bùi Quang Chiến (@Bravee9)
