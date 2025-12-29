# Bravemath - Copilot Instructions

## 📋 Project Overview

**Bravemath** là nền tảng chia sẻ tài liệu học thuật miễn phí cho học sinh THPT và sinh viên Đại học tại Việt Nam, tập trung vào môn Toán học.

- **Tech Stack**: Vite 5, Vanilla JavaScript (ES6 Modules), Tailwind CSS 3
- **Deployment**: GitHub Pages với GitHub Actions CI/CD
- **CDN**: Cloudflare Worker proxy cho Google Drive files
- **Repository**: https://github.com/Bravee9/bravemath
- **Live URL**: https://bravee9.github.io/bravemath/

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

### **Build & Deploy**
```bash
npm run css:build      # Build production CSS
npm run build          # Build for production
git add . && git commit -m "..." && git push  # Auto-deploy via GitHub Actions
```

### **Metadata Update** (Run in WSL - npm not in PowerShell PATH)
```bash
npm run update:metadata  # Fetch fileSize & pages from Google Drive
```

---

## 🚫 Anti-Patterns & Gotchas

### **❌ NEVER DO THESE:**

1. **Hardcode Data**
```javascript
// ❌ WRONG - Tạo data khống
const documents = [
  { id: 1, title: "Fake Document" }
];
```

2. **Inline Styles**
```html
<!-- ❌ WRONG -->
<div style="background: #2f3136; padding: 1rem;">
```

3. **Duplicate Wrapper Divs**
```html
<!-- ❌ WRONG - Wrapper đã được thêm vào .document-card CSS -->
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
│ - PDF documents stored with public access                  │
│ - Thumbnails via Google Drive API                          │
│ - Metadata (fileSize, pages) via Drive API                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Reminders for AI Assistant

### **When User Asks to:**

- **"Thêm tài liệu mới"** → Update `data/documents.json` only, never hardcode in HTML
- **"Sửa màu"** → Edit `src/css/input.css`, rebuild CSS, never inline styles
- **"Fix spacing"** → Edit CSS classes (`.document-card { padding: 1rem; }`), not wrapper divs
- **"Deploy"** → `git push` triggers GitHub Actions automatically
- **"Tạo file mới"** → Check if it should be in `.gitignore` first (especially .env, wrangler.toml)

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