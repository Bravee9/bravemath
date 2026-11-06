/**
 * Main Application Module
 * Entry point — initializes the app and manages global state.
 */

import { loadDocuments, downloadDocument, previewDocument } from './api.js';
import { filterDocuments, sortDocuments, updateResultsCount } from './search.js';
import { setupRouter } from './router.js';
import { initExamCountdown } from './countdown.js';

/* ========================================
   GLOBAL STATE
   ======================================== */

let allDocuments = [];
let filteredDocuments = [];
let currentFilters = { level: '', subject: '', category: '', query: '' };

// Hover preview state
let hoverPreviewEl = null;
let hoverShowTimer = null;
let hoverHideTimer = null;

/* ========================================
   APP INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {
    setupRouter();
    setupDarkMode();
    setupMobileMenu();
    setupSearch();
    setupFilters();
    setupClearFilters();
    setupQuickFooterFilters();
    initHoverPreview();
    setupFeaturedDocument();
    setupScrollHeader();
    setupScrollbarAutohide();
    setupHeroTypewriter();
    initExamCountdown();

    try {
        await loadAndRenderDocuments();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
});

function setupScrollHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

function setupScrollbarAutohide() {
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
        document.documentElement.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            document.documentElement.classList.remove('is-scrolling');
        }, 1000);
    }, { passive: true });
}

function setupHeroTypewriter() {
    const target = document.getElementById('hero-typewriter');
    if (!target) return;

    const phrases = [
        'Chuyên đề Toán THPT Quốc Gia & Đại Học',
        'Giải tích 1, 2 • Đại số tuyến tính • Xác suất thống kê',
        'Toán rời rạc • Tối ưu hóa • Hình học giải tích Oxyz',
        'Tải xuống trực tiếp PDF — 100% Miễn phí & Không Quảng Cáo'
    ];

    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let isDeleting = true;

    function tick() {
        const currentPhrase = phrases[phraseIndex];

        if (!isDeleting) {
            charIndex++;
            target.textContent = currentPhrase.slice(0, charIndex);
            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(tick, 2400);
                return;
            }
            setTimeout(tick, 45);
        } else {
            charIndex--;
            target.textContent = currentPhrase.slice(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, 260);
                return;
            }
            setTimeout(tick, 22);
        }
    }

    setTimeout(tick, 2400);
}

/* ========================================
   DOCUMENT LOADING & RENDERING
   ======================================== */

async function loadAndRenderDocuments() {
    showSkeletonLoading();

    try {
        const data = await loadDocuments();
        allDocuments = data.documents || [];
        updateHeroStats(allDocuments);
        applyFilters();
        renderBookmarkedDocuments();
    } catch (error) {
        console.error('Error loading documents:', error);
        hideSkeletonLoading();
        showError('Không thể tải danh sách tài liệu.');
    }
}

function updateHeroStats(docs) {
    if (!Array.isArray(docs) || docs.length === 0) return;

    const totalDocsEl = document.getElementById('stat-total-docs');
    const totalPagesEl = document.getElementById('stat-total-pages');

    if (totalDocsEl) {
        totalDocsEl.textContent = `${docs.length}+`;
    }
    if (totalPagesEl) {
        const sumPages = docs.reduce((acc, d) => acc + (Number(d.pages) || 0), 0);
        if (sumPages > 0) {
            totalPagesEl.textContent = `${sumPages.toLocaleString('vi-VN')}+`;
        }
    }
}

/** Apply current filters and re-render the document grid. */
function applyFilters() {
    const query = currentFilters.query || '';
    filteredDocuments = filterDocuments(allDocuments, query, currentFilters);
    filteredDocuments = sortDocuments(filteredDocuments, 'date-desc');

    renderDocuments(filteredDocuments);

    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        updateResultsCount(resultsCount, filteredDocuments.length, allDocuments.length);
    }

    hideSkeletonLoading();
}

/** Render a list of documents into the grid. */
function renderDocuments(documents) {
    const grid = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    const skeleton = document.getElementById('loading-skeleton');

    if (!grid) return;

    if (skeleton) skeleton.style.display = 'none';

    if (documents.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = '';
        return;
    }

    grid.style.display = '';
    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = '';
    documents.forEach(doc => {
        grid.appendChild(createDocumentCard(doc));
    });
}

/* ========================================
   DOCUMENT CARD CREATION
   ======================================== */

/** Escape HTML to prevent XSS. */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/** Maps for display labels. */
const CATEGORY_LABELS = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết'
};

const LEVEL_LABELS = {
    'thcs': 'THCS',
    'thpt': 'THPT',
    'daihoc': 'Đại học'
};

const CATEGORY_BADGE_CLASS = {
    'ly-thuyet': 'badge-theory',
    'de-thi': 'badge-exam',
    'bai-tap': 'badge-exercise',
    'giai-chi-tiet': 'badge-solution'
};

const LEVEL_BADGE_CLASS = {
    'thpt': 'badge-thpt',
    'daihoc': 'badge-daihoc'
};

/** Create a single document card element. */
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';

    const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%230a1628'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='20' fill='%2338bdf8' text-anchor='middle' dy='.3em'%3EBRAVEMATH%20PDF%3C/text%3E%3C/svg%3E";
    const thumbnail = doc.thumbnail || fallbackImg;

    const safeTitle = escapeHtml(doc.title);
    const safeDesc = escapeHtml(doc.description || '');
    const levelLabel = LEVEL_LABELS[doc.level] || doc.level;
    const categoryLabel = CATEGORY_LABELS[doc.category] || doc.category;
    const levelBadge = LEVEL_BADGE_CLASS[doc.level] || 'badge-thpt';
    const categoryBadge = CATEGORY_BADGE_CLASS[doc.category] || 'badge-theory';

    const isBookmarked = getBookmarks().includes(doc.driveId);
    const bookmarkActive = isBookmarked ? 'active' : '';

    card.innerHTML = `
        <img
            src="${escapeHtml(thumbnail)}"
            alt="${safeTitle}"
            class="card-thumbnail"
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackImg}'"
        >
        <button class="bookmark-btn ${bookmarkActive}" data-id="${escapeHtml(doc.driveId)}" aria-label="Lưu tài liệu" title="Lưu tài liệu">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="square" stroke-linejoin="miter" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        </button>
        <div class="card-body">
            <div class="card-badges">
                <span class="badge ${levelBadge}">${escapeHtml(levelLabel)}</span>
                <span class="badge ${categoryBadge}">${escapeHtml(categoryLabel)}</span>
            </div>
            <h3 class="card-title">${safeTitle}</h3>
            <p class="card-desc">${safeDesc}</p>
            <div class="card-meta">
                <span>${doc.pages || 0} trang</span>
                <span>${escapeHtml(doc.fileSize || '')}</span>
            </div>
            <button
                class="btn-primary download-btn"
                data-drive-id="${escapeHtml(doc.driveId)}"
                data-filename="${escapeHtml(doc.title)}.pdf"
            >
                <span>Tải xuống</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="square" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
            </button>
        </div>
    `;

    // Thumbnail click -> preview
    const thumbnailImg = card.querySelector('img');
    if (thumbnailImg && doc.driveId) {
        thumbnailImg.addEventListener('click', (e) => {
            e.preventDefault();
            previewDocument(doc.driveId);
        });
    }

    // Download button — direct Google Drive link
    const downloadBtn = card.querySelector('.download-btn');
    if (downloadBtn && doc.driveId) {
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadDocument(doc.driveId, `${doc.title}.pdf`);
        });
    } else if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.5';
        downloadBtn.style.cursor = 'not-allowed';
        downloadBtn.textContent = 'Chưa có sẵn';
    }

    // Bookmark button
    const bookmarkBtn = card.querySelector('.bookmark-btn');
    if (bookmarkBtn && doc.driveId) {
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(doc.driveId);
        });
    }

    // Hover preview (desktop only)
    card.addEventListener('mouseenter', () => {
        if (window.innerWidth < 1024) return;
        clearTimeout(hoverHideTimer);
        hoverShowTimer = setTimeout(() => showHoverPreview(doc, card), 220);
    });
    card.addEventListener('mouseleave', () => {
        clearTimeout(hoverShowTimer);
        hoverHideTimer = setTimeout(hideHoverPreview, 130);
    });

    return card;
}

/* ========================================
   BOOKMARKS
   ======================================== */

function getBookmarks() {
    try {
        return JSON.parse(localStorage.getItem('bravemath-bookmarks') || '[]');
    } catch {
        return [];
    }
}

function toggleBookmark(driveId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(driveId);
    if (index > -1) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.push(driveId);
    }
    localStorage.setItem('bravemath-bookmarks', JSON.stringify(bookmarks));

    const btns = document.querySelectorAll(`.bookmark-btn[data-id="${driveId}"]`);
    btns.forEach(btn => {
        if (index > -1) {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active');
        }
    });

    renderBookmarkedDocuments();
}

function renderBookmarkedDocuments() {
    const listEl = document.getElementById('bookmarked-list');
    if (!listEl) return;

    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        listEl.innerHTML = '<div class="empty-bookmark">Chưa có tài liệu nào được ghim. Nhấn biểu tượng ngôi sao trên thẻ tài liệu để lưu nhanh.</div>';
        return;
    }

    const bookmarkedDocs = allDocuments.filter(doc => bookmarks.includes(doc.driveId));

    if (bookmarkedDocs.length === 0) {
        listEl.innerHTML = '<div class="empty-bookmark">Chưa có tài liệu nào được ghim. Nhấn biểu tượng ngôi sao trên thẻ tài liệu để lưu nhanh.</div>';
        return;
    }

    listEl.innerHTML = '';
    const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%230a1628'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='20' fill='%2338bdf8' text-anchor='middle' dy='.3em'%3EBRAVEMATH%20PDF%3C/text%3E%3C/svg%3E";

    bookmarkedDocs.forEach(doc => {
        const thumbnail = doc.thumbnail || fallbackImg;
        const item = document.createElement('div');
        item.className = 'bookmarked-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(doc.title)}" onerror="this.onerror=null; this.src='${fallbackImg}'">
            <div class="bookmarked-item-info">
                <div class="bookmarked-item-title">${escapeHtml(doc.title)}</div>
                <div class="bookmarked-item-meta">${doc.pages || 0} trang • ${escapeHtml(doc.fileSize || '')}</div>
            </div>
        `;

        item.addEventListener('click', () => {
            previewDocument(doc.driveId);
        });
        listEl.appendChild(item);
    });
}

/* ========================================
   HOVER PREVIEW POPUP
   ======================================== */

function initHoverPreview() {
    if (document.getElementById('doc-hover-preview')) return;

    const el = document.createElement('div');
    el.id = 'doc-hover-preview';
    el.className = 'doc-hover-preview';
    el.setAttribute('role', 'tooltip');
    el.innerHTML = `
        <div class="preview-iframe-wrap">
            <iframe class="preview-iframe" title="Xem trước tài liệu"
                allowfullscreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
            </iframe>
            <div class="preview-iframe-placeholder">
                <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24">
                    <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Đang tải...</span>
            </div>
        </div>
        <div class="preview-body">
            <div class="preview-badges" style="margin-bottom:8px;"></div>
            <h3 class="preview-title"></h3>
            <p class="preview-desc"></p>
            <div class="preview-meta">
                <span class="preview-pages"></span>
                <span class="preview-size"></span>
            </div>
            <div class="preview-actions">
                <button class="btn-secondary preview-view-btn" style="font-size:11px; padding:8px 12px;">Xem trước</button>
                <button class="btn-primary preview-download-btn" style="font-size:11px; padding:8px 12px;">Tải xuống</button>
            </div>
        </div>
    `;

    el.addEventListener('mouseenter', () => clearTimeout(hoverHideTimer));
    el.addEventListener('mouseleave', () => {
        hoverHideTimer = setTimeout(hideHoverPreview, 130);
    });

    document.body.appendChild(el);
    hoverPreviewEl = el;
}

function showHoverPreview(doc, cardEl) {
    if (!hoverPreviewEl) return;

    const levelLabel = LEVEL_LABELS[doc.level] || doc.level || '';
    const categoryLabel = CATEGORY_LABELS[doc.category] || doc.category || '';
    const levelBadge = LEVEL_BADGE_CLASS[doc.level] || 'badge-thpt';
    const categoryBadge = CATEGORY_BADGE_CLASS[doc.category] || 'badge-theory';

    hoverPreviewEl.querySelector('.preview-badges').innerHTML = `
        <span class="badge ${levelBadge}" style="margin-right:4px;">${escapeHtml(levelLabel)}</span>
        <span class="badge ${categoryBadge}">${escapeHtml(categoryLabel)}</span>
    `;

    hoverPreviewEl.querySelector('.preview-title').textContent = doc.title || '';
    hoverPreviewEl.querySelector('.preview-desc').textContent = doc.description || 'Không có mô tả.';
    hoverPreviewEl.querySelector('.preview-pages').textContent = `${doc.pages || 0} trang`;
    hoverPreviewEl.querySelector('.preview-size').textContent = doc.fileSize || '';

    const iframe = hoverPreviewEl.querySelector('.preview-iframe');
    const placeholder = hoverPreviewEl.querySelector('.preview-iframe-placeholder');
    const spinnerText = placeholder.querySelector('span');
    const hasDoc = doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE';

    placeholder.style.display = 'flex';
    if (hasDoc) {
        if (spinnerText) spinnerText.textContent = 'Đang tải...';
        iframe.src = `https://drive.google.com/file/d/${encodeURIComponent(doc.driveId)}/preview`;
        iframe.onload = () => { placeholder.style.display = 'none'; };
    } else {
        iframe.src = '';
        if (spinnerText) spinnerText.textContent = 'Chưa có bản xem trước.';
    }

    const viewBtn = hoverPreviewEl.querySelector('.preview-view-btn');
    const dlBtn = hoverPreviewEl.querySelector('.preview-download-btn');

    viewBtn.onclick = () => { if (hasDoc) previewDocument(doc.driveId); };
    dlBtn.onclick = async () => {
        if (hasDoc) {
            try { await downloadDocument(doc.driveId, `${doc.title}.pdf`); } catch (e) { console.error(e); }
        }
    };

    [viewBtn, dlBtn].forEach(btn => {
        btn.disabled = !hasDoc;
        btn.style.opacity = hasDoc ? '1' : '0.5';
        btn.style.cursor = hasDoc ? 'pointer' : 'not-allowed';
    });

    positionHoverPreview(cardEl);
    hoverPreviewEl.classList.add('visible');
}

function hideHoverPreview() {
    if (!hoverPreviewEl) return;
    hoverPreviewEl.classList.remove('visible');
    setTimeout(() => {
        if (hoverPreviewEl && !hoverPreviewEl.classList.contains('visible')) {
            const iframe = hoverPreviewEl.querySelector('.preview-iframe');
            if (iframe) iframe.src = '';
        }
    }, 200);
}

function positionHoverPreview(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const popupW = 340;
    const margin = 12;
    let left;
    let top;

    if (rect.right + popupW + margin <= window.innerWidth) {
        left = rect.right + margin;
    } else if (rect.left - popupW - margin >= 0) {
        left = rect.left - popupW - margin;
    } else {
        left = Math.max(margin, Math.round((window.innerWidth - popupW) / 2));
    }

    const estimatedH = 500;
    top = Math.min(rect.top, window.innerHeight - estimatedH - margin);
    top = Math.max(margin + 64, top);

    hoverPreviewEl.style.left = `${left}px`;
    hoverPreviewEl.style.top = `${top}px`;
}

/* ========================================
   UI SETUP FUNCTIONS
   ======================================== */

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const searchBtn = document.getElementById('mobile-search-btn');
    const searchPanel = document.getElementById('mobile-search');

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
            });
        });
    }

    if (searchBtn && searchPanel) {
        searchBtn.addEventListener('click', () => {
            const visible = searchPanel.style.display !== 'none';
            searchPanel.style.display = visible ? 'none' : 'block';
            if (!visible) {
                const input = searchPanel.querySelector('input');
                if (input) input.focus();
            }
        });
    }
}

function setupSearch() {
    setupSearchInput('header-search');
    setupSearchInput('header-search-mobile');
}

function setupSearchInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentFilters.query = e.target.value;
            applyFilters();
        }, 250);
    });
}

function setupFilters() {
    const ids = ['filter-level', 'filter-subject', 'filter-category'];
    const keys = ['level', 'subject', 'category'];

    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                currentFilters[keys[i]] = e.target.value;
                applyFilters();
            });
        }
    });
}

function setupQuickFooterFilters() {
    document.querySelectorAll('[data-quick-level]').forEach(link => {
        link.addEventListener('click', () => {
            const level = link.getAttribute('data-quick-level');
            const levelSelect = document.getElementById('filter-level');
            if (levelSelect && level) {
                levelSelect.value = level;
                currentFilters.level = level;
                applyFilters();
            }
        });
    });

    document.querySelectorAll('[data-quick-subject]').forEach(link => {
        link.addEventListener('click', () => {
            const subject = link.getAttribute('data-quick-subject');
            const subjectSelect = document.getElementById('filter-subject');
            if (subjectSelect && subject) {
                subjectSelect.value = subject;
                currentFilters.subject = subject;
                applyFilters();
            }
        });
    });
}

function setupClearFilters() {
    const btn = document.getElementById('clear-filters-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        currentFilters = { level: '', subject: '', category: '', query: '' };

        ['filter-level', 'filter-subject', 'filter-category', 'header-search', 'header-search-mobile']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });

        applyFilters();
    });
}

function setupFeaturedDocument() {
    const featuredDoc = document.querySelector('.featured-document');
    if (!featuredDoc) return;

    const driveId = featuredDoc.getAttribute('data-drive-id');
    if (!driveId) return;

    featuredDoc.addEventListener('click', () => {
        previewDocument(driveId);
    });

    const viewBtn = featuredDoc.querySelector('.btn-primary');
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            previewDocument(driveId);
        });
    }
}

/* ========================================
   DARK MODE (Ocean Dark Default)
   ======================================== */

function setupDarkMode() {
    const saved = localStorage.getItem('bravemath-theme');
    if (saved === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('bravemath-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('bravemath-theme', 'dark');
        }
    }

    const toggleBtn = document.getElementById('theme-toggle');
    const toggleBtnMobile = document.getElementById('theme-toggle-mobile');

    if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
    if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleTheme);
}

/* ========================================
   LOADING & ERROR STATES
   ======================================== */

function showSkeletonLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    const grid = document.getElementById('documents-grid');
    if (skeleton) skeleton.style.display = '';
    if (grid) grid.style.display = 'none';
}

function hideSkeletonLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) skeleton.style.display = 'none';
}

function showError(message) {
    const grid = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    if (grid) grid.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = '';
        const msg = emptyState.querySelector('p');
        if (msg) msg.textContent = message;
    }
}
