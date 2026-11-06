<div align="center">
  <h1>BRAVEMATH</h1>
  <p><strong>Open Academic Mathematics Repository for High School and University Students</strong></p>

  <p>
    <a href="https://github.com/Bravee9/bravemath/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="Build Status" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.0-646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://bravee9.github.io/bravemath/"><img src="https://img.shields.io/badge/Deployment-GitHub_Pages-0ea5e9.svg?style=flat-square" alt="Deployment" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" /></a>
  </p>

  <p>
    <a href="#overview">Overview</a> |
    <a href="#design-system">Design System</a> |
    <a href="#system-architecture">Architecture</a> |
    <a href="#git-workflow-and-branches">Git Workflow</a> |
    <a href="#getting-started">Getting Started</a> |
    <a href="#ci-cd-pipeline">CI/CD Pipeline</a>
  </p>
</div>

---

## Overview

**Bravemath** is a static web platform engineered to distribute curated mathematics learning materials, examination papers, lecture notes, and problem sets for Vietnamese High School (THPT) and University students. All documents are hosted on Google Drive for direct, zero-advertisement, high-speed access and inline PDF previewing.

Key capabilities include:
- **Real-Time Multi-Faceted Search and Filtering**: Instant client-side filtering across education levels (`thpt`, `daihoc`), academic subjects (Calculus, Linear Algebra, Probability and Statistics, Discrete Mathematics, Geometry, Optimization), and document categories.
- **Interactive Hover Preview**: Desktop hover popover with embedded Google Drive PDF preview and instant download triggers.
- **Local Bookmarking**: Persistent client-side document pinning stored via `localStorage`.
- **Metadata Administration Console**: Built-in `admin.html` utility with Google Drive URL drag-and-drop ID extraction and automated JSON schema generation.

---

## Design System

Bravemath implements the **Ocean Swiss Minimalist** design system unified with the **Bravechat** visual identity:

1. **Swiss Structural Grid**: Sharp geometric edges (`border-radius: 0`), exposed `1px` structural hairlines, and high-density typographic hierarchy.
2. **Ocean Dark-First Palette**: Deep abyssal navy backgrounds (`#060d18`, `#0a1628`, `#0f2847`) paired with cyan/sky accents (`#0ea5e9`, `#38bdf8`, `#06b6d4`) and a full Light Mode counterpart (`#f8fafc`).
3. **Typography**:
   - **Display and UI**: `Be Vietnam Pro` and `Inter` for clean Vietnamese diacritic rendering.
   - **Monospace Metadata and Numerals**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` to guarantee zero layout shift on counters and numeric metrics.

---

## System Architecture

```text
bravemath/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # Continuous Integration for main and development
│   │   └── deploy.yml            # GitHub Pages production deployment
│   └── PULL_REQUEST_TEMPLATE.md  # Standardized Pull Request checklist
├── assets/
│   └── images/                   # Static brand icons and OpenGraph assets
├── data/
│   └── documents.json            # Master catalog of academic PDF documents
├── scripts/
│   ├── add-document.js           # CLI helper for appending document metadata
│   ├── server.js                 # Local Express utility server for admin operations
│   └── update-metadata.js        # Automated Google Drive metadata synchronization
├── src/
│   ├── css/
│   │   ├── input.css             # Ocean Swiss Minimalist design tokens and rules
│   │   └── styles.css            # Compiled and minified Tailwind CSS output
│   └── js/
│       ├── api.js                # Google Drive direct download and preview integration
│       ├── main.js               # Core application state, DOM rendering, and theme logic
│       ├── router.js             # Client-side navigation handler
│       └── search.js             # Filtering, sorting, and query matching engine
├── index.html                    # Main application entry point
├── about.html                    # Platform overview and academic mission
├── how-to-use.html               # User documentation and search guide
├── contact.html                  # Feedback and document submission form
├── admin.html                    # Metadata generator and catalog inspector
├── tailwind.config.js            # Tailwind CSS configuration with Ocean palette
├── vite.config.js                # Vite multi-page bundler configuration
└── package.json                  # Build scripts and package dependencies
```

---

## Git Workflow and Branches

The repository enforces a structured Git Flow branching model to isolate active development and feature validation from production releases:

- **`main`**: Production-ready branch. Every push or merge into `main` triggers the automated GitHub Pages deployment pipeline.
- **`development`**: Primary integration branch. Consolidates UI upgrades (such as the Bravechat Ocean Swiss Minimalist integration), architectural improvements, and feature branches before release promotion.
- **`feature/*`**: Dedicated topic branches branched off `development` for self-contained features. All `feature/*` branches undergo CI validation and Pull Request review into `development` prior to merging into `main`.

---

## Getting Started

### Prerequisites

- **Node.js**: `>= 18.0.0` (LTS `20.x` recommended)
- **npm**: `>= 9.0.0`

### Installation and Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Bravee9/bravemath.git
cd bravemath

# 2. Install dependencies
npm install

# 3. Compile Tailwind CSS
npm run css:build

# 4. Start the local Vite development server (http://localhost:3000/bravemath/)
npm run dev
```

### Production Build

```bash
# Compile minified CSS and bundle multi-page static assets into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## CI/CD Pipeline

1. **Continuous Integration (`.github/workflows/ci.yml`)**:
   - Executes automatically on every `push` and `pull_request` targeting `main` or `development`.
   - Validates the JSON schema and required properties of all entries in `data/documents.json`.
   - Runs `npm run build` (`tailwindcss --minify` + `vite build`) and verifies the existence of all multi-page HTML bundles and data artifacts in `dist/`.
2. **Continuous Deployment (`.github/workflows/deploy.yml`)**:
   - Triggers on merges to `main` (or manual `workflow_dispatch`).
   - Builds the production bundle and deploys the `dist/` artifact directly to GitHub Pages (`https://bravee9.github.io/bravemath/`).

---

## Author and License

- **Author**: Bui Quang Chien (`@Bravee9`) — University of Science, Vietnam National University, Hanoi (HUS - VNU).
- **License**: Distributed under the [MIT License](./LICENSE).
