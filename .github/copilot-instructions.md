# Bravemath - Copilot Instructions

## 📋 Project Overview

**Bravemath** là nền tảng chia sẻ tài liệu học thuật miễn phí cho học sinh THPT và sinh viên Đại học tại Việt Nam, tập trung vào môn Toán học.

- **Tech Stack**: Vite 5, Vanilla JavaScript (ES6 Modules), Tailwind CSS 3
- **Deployment**: GitHub Pages với GitHub Actions CI/CD
- **CDN**: Cloudflare Worker proxy cho Google Drive files
- **Repository**: https://github.com/Bravee9/bravemath
- **Live URL**: https://bravee9.github.io/bravemath/

---

## 🚨 CRITICAL SECURITY & DATA INTEGRITY

### **1. CSP Configuration (Content Security Policy)**

**CRITICAL**: CSP trong `src/pages/index.html` phải allow Google Drive thumbnails:

```html
<!-- ✅ CORRECT - Wildcard for Google domains -->
<meta http-equiv="Content-Security-Policy" content="
    img-src 'self' https://*.google.com https://*.googleusercontent.com data: blob:;
">

<!-- ❌ WRONG - Blocks thumbnails -->
<meta http-equiv="Content-Security-Policy" content="
    img-src 'self' https://drive.google.com data:;
">
```

### **2. Duplicate Prevention (Data Integrity)**

**CRITICAL**: `scripts/add-document.js` PHẢI kiểm tra duplicate:

```javascript
// ✅ Kiểm tra Drive ID trùng (BLOCKING)
const duplicateDoc = existingData.documents.find(
  doc => doc.driveId === driveId.trim()
);
if (duplicateDoc) {
  console.log('❌ TÀI LIỆU ĐÃ TỒN TẠI');
  return; // Block duplicate Drive ID
}

// ✅ Kiểm tra Title trùng (WARNING)
const duplicateTitle = existingData.documents.find(
  doc => doc.title.toLowerCase().trim() === title.toLowerCase().trim()
);
if (duplicateTitle) {
  const confirm = await question('Tiếp tục? (y/n): ');
  if (confirm !== 'y') return;
}
```

### **3. Path Resolution (Vite Base URL)**

**CRITICAL**: Luôn dùng `import.meta.env.BASE_URL` cho paths:

```javascript
// ✅ CORRECT - Dynamic base path
const basePath = import.meta.env.BASE_URL || '/';
const fallbackImg = `${basePath}assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg`;

// ❌ WRONG - Hardcoded absolute path (fails on GitHub Pages)
const fallbackImg = '/assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg';
```

### **4. Vietnamese Filename Sanitization**

**CRITICAL**: Download filenames PHẢI sanitize Vietnamese chars:

```javascript
// In api.js - sanitizeFilename() function
const vietnameseMap = {
  'à': 'a', 'á': 'a', 'đ': 'd', 'ư': 'u', ... // 45 entries
};
// Add "-bravemath" suffix before extension
return `${name}-bravemath${ext}`;
```

---

## 🏗️ Architecture & Design Patterns

### **1. Module Pattern (ES6 Modules)**
Project tuân theo **Separation of Concerns** với các module độc lập:

```
src/js/
├── api.js      → Data fetching & external API communication
├── search.js   → Search & filtering logic (Pure functions)
├── router.js   → Client-side routing
├── main.js     → Homepage orchestration
└── subject.js  → Subject page orchestration
```

**Principles Applied:**
- ✅ **Single Responsibility Principle (SRP)**: Mỗi module chỉ đảm nhiệm 1 nhiệm vụ cụ thể
- ✅ **Dependency Inversion**: High-level modules (main.js, subject.js) depend on abstractions (api.js, search.js)
- ✅ **Pure Functions**: search.js chứa pure functions không side effects

### **2. Component-Based CSS (Tailwind + Custom Components)**

```css
/* input.css structure */
@layer base     → Global resets & defaults
@layer components → Reusable components (.btn-primary, .document-card, .badge-*)
@layer utilities  → Tailwind utilities
```

**Principles:**
- ✅ BEM-inspired naming: `.document-card`, `.btn-primary`, `.badge-thpt`
- ✅ Discord Design System colors (#202225, #2f3136, #5865F2, etc.)
- ✅ No hardcoded styles in HTML/JS - all styles in CSS classes

### **3. Data-Driven Rendering**

**CRITICAL RULE: KHÔNG BAO GIỜ TẠO DATA KHỐNG (No hardcoded data)**

```javascript
// ❌ WRONG - Hardcoded data
const documents = [{ id: 1, title: "..." }];

// ✅ CORRECT - Load from documents.json
const data = await loadDocuments();
allDocuments = data.documents || [];
```

**Single Source of Truth**: `data/documents.json`
- Tất cả tài liệu PHẢI được load từ JSON
- Metadata (fileSize, pages) được tự động cập nhật qua `scripts/update-metadata.js`
- Thumbnails tự động từ Google Drive API

---

## 📂 File Structure & Responsibilities

### **Core Files**

#### `vite.config.js` - Build Configuration
```javascript
{
  base: '/bravemath/',           // GitHub Pages base path
  root: 'src/pages',             // Entry point
  publicDir: 'assets',           // Static assets
  outDir: 'dist',                // Build output
  plugins: [copyDataPlugin]      // Copy documents.json to dist/
}
```

#### `data/documents.json` - Single Source of Truth
```json
{
  "documents": [
    {
      "id": "doc-001",
      "title": "...",
      "driveId": "...",           // Google Drive File ID
      "thumbnail": "https://drive.google.com/thumbnail?id=...&sz=w400",
      "fileSize": "255.4 KB",     // Auto-generated
      "pages": 5,                 // Auto-estimated
      // ... other fields
    }
  ]
}
```

#### `src/js/api.js` - API Layer (Interface Segregation)
```javascript
// Public API
export async function loadDocuments()      // Fetch documents.json
export async function downloadDocument()   // Download via Cloudflare Worker
export function previewDocument()          // Open preview in new tab
export async function checkWorkerHealth()  // Health check
```

**Responsibilities:**
- Fetch data từ `data/documents.json`
- Proxy downloads qua Cloudflare Worker để ẩn Google Drive links
- Error handling với user-friendly messages

#### `src/js/search.js` - Pure Functions (Open/Closed Principle)
```javascript
// Pure functions - no side effects
export function filterDocuments(documents, query, filters)
export function getSearchSuggestions(documents, query, limit)
export function renderSearchSuggestions(container, suggestions, onSelect)
export function updateResultsCount(element, filtered, total)
```

**Principles:**
- ✅ Pure functions - same input = same output
- ✅ Immutable operations - không modify input arrays
- ✅ Testable - dễ dàng unit test

#### `src/js/main.js` & `src/js/subject.js` - Page Controllers
**Pattern**: Event-driven architecture với state management

```javascript
// Global State
let allDocuments = [];
let filteredDocuments = [];
let currentFilters = { level: '', subject: '', category: '' };

// Lifecycle
DOMContentLoaded → loadAndRenderDocuments() → applyFilters() → renderDocuments()

// Event Handlers
setupMobileMenu()   // Mobile menu toggle
setupSearch()       // Search input with debounce (300ms)
setupFilters()      // Filter dropdowns
```

**Code Duplication**: main.js và subject.js có duplicated code (Known issue - cần refactor thành shared utilities)

#### `src/css/input.css` - Design System
**Discord Color Palette:**
```css
#202225  → Background (darkest)
#2f3136  → Cards (darker)
#40444b  → Borders/Inputs (gray)
#5865F2  → Primary (blurple)
#EB459E  → Pink (Đại học badge)
#3BA55D  → Green (success)
#FAA81A  → Yellow (warning)
#ED4245  → Red (error)
```

**Component Classes:**
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Buttons
- `.card`, `.document-card`, `.featured-card` - Cards
- `.badge-thpt`, `.badge-daihoc`, `.badge-*` - Badges
- `.input-field`, `.search-input`, `.select-field` - Forms

---

## 🎯 Coding Standards & Best Practices

### **JavaScript Guidelines**

#### 1. **Module Imports** - Always explicit
```javascript
// ✅ CORRECT
import { loadDocuments, downloadDocument } from './api.js';

// ❌ WRONG
import * as api from './api.js';
```

#### 2. **Error Handling** - Always user-friendly
```javascript
try {
  await downloadDocument(driveId, filename);
} catch (error) {
  console.error('Download error:', error);  // Log for dev
  alert('Không thể tải tài liệu. Vui lòng thử lại sau.'); // User message
}
```

#### 3. **Event Listeners** - Debounce user input
```javascript
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();  // Debounce 300ms
  }, 300);
});
```

#### 4. **DOM Manipulation** - Check existence before accessing
```javascript
const grid = document.getElementById('documents-grid');
if (!grid) return;  // Early return if element doesn't exist
```

#### 5. **Data Validation** - Validate before rendering
```javascript
// Check for placeholder values
if (doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE') {
  // Enable download
} else {
  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Chưa có sẵn';
}
```

### **CSS Guidelines**

#### 1. **No Inline Styles** - All styles in CSS classes
```html
<!-- ❌ WRONG -->
<div style="padding: 1rem; background: #2f3136;">

<!-- ✅ CORRECT -->
<div class="document-card">
```

#### 2. **Tailwind Utilities First** - Custom CSS only when needed
```css
/* ✅ Use Tailwind @apply */
.document-card {
  @apply rounded-lg overflow-hidden transition-all duration-300;
  background-color: #2f3136;  /* Custom color */
  padding: 1rem;               /* Custom spacing */
}
```

#### 3. **No Glow Effects** - User preference (clean design)
```css
/* ❌ REMOVED - No box-shadow or glow */
box-shadow: 0 0 20px rgba(88, 101, 242, 0.3);

/* ✅ Use border-color changes */
.card:hover {
  border-color: #5865F2;
}
```

### **HTML Guidelines**

#### 1. **Semantic HTML**
```html
<nav>    → Navigation
<main>   → Main content
<section> → Content sections
<article> → Document cards
```

#### 2. **Accessibility**
```html
<img src="..." alt="Descriptive text" loading="lazy">
<button aria-label="Menu">...</button>
```

#### 3. **No Hardcoded Content** - Use JS to render from JSON
```html
<!-- ❌ WRONG -->
<div class="document-card">
  <h3>Hardcoded Title</h3>
</div>

<!-- ✅ CORRECT -->
<div id="documents-grid"></div>
<script src="../js/main.js" type="module"></script>
```

---

## 🔄 Development Workflow

### **Local Development**
```bash
npm run css:watch      # Watch Tailwind CSS changes
npm run dev            # Start Vite dev server (port 3000)
```

### **Add New Document (Automated)**
```bash
npm run add:document   # Interactive CLI với duplicate detection
# Script tự động:
# - Check duplicate driveId (blocking)
# - Check duplicate title (warning)
# - Fetch file size từ Google Drive
# - Convert tags to kebab-case
# - Generate thumbnail URL
```

### **Build & Deploy**
```bash
npm run css:build      # Build production CSS
npm run build          # Build for production
git add . && git commit -m "..." && git push  # Auto-deploy via GitHub Actions
```

**IMPORTANT**: 
- CSS build không cần thiết nếu chỉ sửa JS/JSON (GitHub Actions tự build)
- Chờ ~2-3 phút cho GitHub Actions deploy
- Hard refresh (Ctr{ id: 1, title: "Fake Document" }];
```

2. **Inline Styles hoặc Hardcoded Paths**
```html
<!-- ❌ WRONG -->
<div style="background: #2f3136;">
<img src="/assets/images/thumb.jpg">

<!-- ✅ CORRECT -->
<div class="document-card">
<img src="${basePath}assets/images/thumb.jpg">
```

3. **Add Document Without Duplicate Check**
```javascript
// ❌ WRONG - Thêm trực tiếp vào documents.json
data.documents.push(newDoc);

// ✅ CORRECT - Dùng npm run add:document (có duplicate detection)
```

4. **Commit Sensitive Files**
```bash
# ❌ NEVER commit these (.gitignore blocks them)
.env
cloudflare-worker/wrangler.toml
.github/copilot-instructions.md  # This file!
```

5. **Forget onerror Handler for Images**
```html
<!-- ❌ WRONG - Infinite loop nếu fallback cũng fail -->
onerror="this.src='fallback.jpg'"

<!-- ✅ CORRECT - Prevent loop với onerror=null -->
onerror="this.onerror=null; this.src='${fallbackImg}'"
```

6. **XSS Vulnerabilities**
```javascript
// ❌ WRONG - Directly inject user content
card.innerHTML = `<h3>${doc.title}</h3>`;

// ✅ CORRECT - Escape HTML (main.js has escapeHtml function)
const safeTitle = escapeHtml(doc.title);
card.innerHTML = `<h3>${safeTitle}</h3>`; WRONG - Wrapper đã được thêm vào .document-card CSS -->
<div class="document-card">
  <div class="p-4">
    Content...
  </div>
</div>
```

4. **Push Sensitive Files**
```bash
# ❌ NEVER commit these (check .gitignore)
.github/copilot-instructions.md
.env
cloudflare-worker/wrangler.toml
```

5. **Modify Documents in HTML**
```html
<!-- ❌ WRONG - Document cards phải render từ JS -->
<div class="document-card">
  <h3>Static Title</h3>
</div>
```

---

## 🔧 Refactoring Opportunities (Technical Debt)

### **Known Issues to Fix:**

1. **Code Duplication**: `main.js` và `subject.js` có nhiều duplicate code
   - **Solution**: Extract shared functions vào `utils.js`
   - Functions to extract: `createDocumentCard()`, `setupMobileMenu()`, `showSkeletonLoading()`

2. **Search Suggestions**: Container references hardcoded
   - **Solution**: Generalize `renderSearchSuggestions()` to accept any container

3. **Cloudflare Worker**: Google Drive IDs still exposed in `documents.json`
   - **Solution**: Move driveId to backend, return opaque IDs

4. **CSS Build**: Manual build required before Vite
   - **Solution**: Integrate Tailwind as Vite plugin (PostCSS)

---

## 📦 Dependencies & Versions

```json
{
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16"
}
```

**No Runtime Dependencies** - Pure Vanilla JS (no jQuery, no React, no Vue)

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Repository                                           │
│ ├─ .github/workflows/deploy.yml (CI/CD)                    │
│ ├─ src/ (source code)                                      │
│ ├─ data/documents.json (metadata)                          │
│ └─ dist/ (build output - deployed to GitHub Pages)         │
└─────────────────────────────────────────────────────────────┘
                            ↓ (push to main)
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions Workflow                                     │
│ 1. Checkout code                                            │
│ 2. Setup Node.js 20                                         │
│ 3. npm install                                              │
│ 4. npm run css:build (Tailwind)                            │
│ 5. npm run build (Vite)                                     │
│ 6. Upload dist/ to GitHub Pages                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ GitHub Pages (Static Hosting)                              │
│ URL: https://bravee9.github.io/bravemath/                  │
│ Base path: /bravemath/ (configured in vite.config.js)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (Proxy)                                  │
│ URL: bravemath-proxy.bravechien2209.workers.dev            │
│ Routes:                                                     │
│ - /download/:driveId → Proxy Google Drive download         │
│ - /preview/:driveId  → Proxy Google Drive viewer           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Google Drive (File Storage)                                │
│ - PDF documents stored withse `npm run add:document` CLI (có duplicate detection), NEVER edit documents.json manually
- **"Sửa màu"** → Edit `src/css/input.css`, rebuild CSS, never inline styles
- **"Fix spacing"** → Edit CSS classes, not wrapper divs (padding đã có trong .document-card)
- **"Deploy"** → `git push` triggers GitHub Actions automatically (~2-3 min)
- **"Thumbnails không hiện"** → Check CSP header in index.html, verify wildcard `https://*.google.com`
- **"Download bị lỗi chữ"** → Check sanitizeFilename() in api.js có đủ Vietnamese char mapping

### **Before Making Changes:**

1. ✅ Check CSP không block resources (thumbnails, workers)
2. ✅ Verify no data is hardcoded (always load from documents.json)
3. ✅ Use `import.meta.env.BASE_URL` cho paths (không hardcode /assets/)
4. ✅ Escape user content với escapeHtml() để prevent XSS
5. ✅ Test fallback images có onerror=null để tránh infinite loop
6. ✅ Check duplicate detection trong add-document.js (driveId + title)

### **Common Debugging:**

- **Thumbnails không load**: Check Console (F12) → CSP violation?
- **Documents không update**: Cache issue → Check `?v=${timestamp}` in api.js
- **Download filename lỗi**: Check sanitizeFilename() mapping Vietnamese chars
- **Duplicate documents**: Verify add-document.js check driveId trước khi thêm

---

## 📝 Version History

- **v1.2.0** (2025-12-29): Security & Data Integrity Updates
  - ✅ CSP wildcard for Google Drive thumbnails
  - ✅ Duplicate detection (driveId + title) in add-document.js
  - ✅ Dynamic base path with Vite BASE_URL
  - ✅ Vietnamese filename sanitization with branding suffix
  - ✅ Cache busting strategy for documents.json
  - ✅ XSS prevention with escapeHtml()
  - ✅ Infinite loop prevention in image onerror handlers→ Check if it should be in `.gitignore` first (especially .env, wrangler.toml)

### **Before Making Changes:**

1. ✅ Check if change is in CSS or JS (don't mix concerns)
2. ✅ Verify no data is hardcoded (always load from JSON)
3. ✅ Run `npm run css:build` after CSS changes
4. ✅ Test locally before pushing
5. ✅ Check .gitignore before committing sensitive files

---

## 📝 Version History

- **v1.0.0** (2025-12-29): Initial documentation
  - Clean architecture với SOLID principles
  - Discord color palette
  - GitHub Pages deployment
  - Cloudflare Worker proxy
  - Automated metadata updates

---

**Maintained by**: Bùi Quang Chiến (@Bravee9)  
**Last Updated**: 2025-12-29