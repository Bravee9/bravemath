/**
 * Main Application Module
 * Khởi tạo ứng dụng và quản lý state
 */

import { loadDocuments, downloadDocument, previewDocument } from './api.js';
import { filterDocuments, sortDocuments, getSearchSuggestions, renderSearchSuggestions, updateResultsCount } from './search.js';
import { setupRouter } from './router.js';
import { initNeatBackground } from './neat-background.js';

// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentFilters = {
    level: '',
    subject: '',
    category: '',
    query: ''
};

// Hover preview state
let hoverPreviewEl = null;
let hoverShowTimer = null;
let hoverHideTimer = null;

/**
 * Khởi tạo ứng dụng khi DOM loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Setup router
    setupRouter();
    
    // Init NEAT gradient background
    initNeatBackground();

    // Init hover preview popup (desktop)
    initHoverPreview();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup search
    setupSearch();
    
    // Setup filters
    setupFilters();
    
    // Setup clear filters button
    setupClearFilters();
    
    // Load và hiển thị documents
    try {
        await loadAndRenderDocuments();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
});

/**
 * Tải và render documents
 */
async function loadAndRenderDocuments() {
    // Hiển thị skeleton loading
    showSkeletonLoading();
    
    try {
        const data = await loadDocuments();
        allDocuments = data.documents || [];
        
        // Render documents ban đầu
        applyFilters();
    } catch (error) {
        console.error('Error loading documents:', error);
        hideSkeletonLoading();
        showError('Không thể tải danh sách tài liệu.');
    }
}

/**
 * Áp dụng filters và render documents
 */
function applyFilters() {
    // Get query from current filters or search inputs
    const query = currentFilters.query || '';
    
    // Lọc documents
    filteredDocuments = filterDocuments(allDocuments, query, currentFilters);
    
    // Sắp xếp: mới nhất lên đầu
    filteredDocuments = sortDocuments(filteredDocuments, 'date-desc');
    
    // Render
    renderDocuments(filteredDocuments);
    
    // Cập nhật số kết quả
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        updateResultsCount(resultsCount, filteredDocuments.length, allDocuments.length);
    }
    
    // Ẩn skeleton
    hideSkeletonLoading();
}

/**
 * Render danh sách documents
 * @param {Array} documents - Danh sách documents để render
 */
function renderDocuments(documents) {
    const grid = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    const skeleton = document.getElementById('loading-skeleton');
    
    if (!grid) return;
    
    // Ẩn skeleton
    if (skeleton) {
        skeleton.classList.add('hidden');
    }
    
    // Hiển thị empty state nếu không có kết quả
    if (documents.length === 0) {
        grid.classList.add('hidden');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }
    
    // Hiển thị grid
    grid.classList.remove('hidden');
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Render mỗi document
    documents.forEach(doc => {
        const card = createDocumentCard(doc);
        grid.appendChild(card);
    });
}

/**
 * Escape HTML để tránh XSS
 * @param {string} str - String cần escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Tạo document card element
 * @param {Object} doc - Document object
 * @returns {HTMLElement} Card element
 */
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    // Thumbnail with Vite base path
    const basePath = import.meta.env.BASE_URL || '/';
    const fallbackImg = `${basePath}assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg`;
    const thumbnail = doc.thumbnail || fallbackImg;
    
    // Category label
    const categoryMap = {
        'ly-thuyet': 'Lý thuyết',
        'de-thi': 'Đề thi',
        'bai-tap': 'Bài tập',
        'giai-chi-tiet': 'Giải chi tiết'
    };
    
    // Level label
    const levelMap = {
        'thcs': 'THCS',
        'thpt': 'THPT',
        'daihoc': 'Đại học'
    };
    
    // ✅ Escape all user-controlled content to prevent XSS
    const safeTitle = escapeHtml(doc.title);
    const safeDescription = escapeHtml(doc.description || '');
    const safeLevel = escapeHtml(levelMap[doc.level] || doc.level);
    const safeCategory = escapeHtml(categoryMap[doc.category] || doc.category);
    const safeFileSize = escapeHtml(doc.fileSize || '');
    
    card.innerHTML = `
        <div class="mb-3">
            <img 
                src="${escapeHtml(thumbnail)}" 
                alt="${safeTitle}"
                class="w-full aspect-[3/4] object-contain rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity bg-slate-900"
                loading="lazy"
                onerror="this.onerror=null; this.src='${fallbackImg}'"
            >
            <div class="flex flex-wrap gap-1.5">
                <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    ${safeLevel}
                </span>
                <span class="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                    ${safeCategory}
                </span>
            </div>
        </div>
        <div class="flex-1 flex flex-col">
            <h3 class="font-math text-base font-semibold text-white mb-2 line-clamp-2">
                ${safeTitle}
            </h3>
            <p class="text-slate-400 text-xs mb-3 line-clamp-2 flex-1">
                ${safeDescription}
            </p>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>${doc.pages || 0} trang</span>
                <span>${safeFileSize}</span>
            </div>
            <button 
                class="btn-primary w-full download-btn text-sm py-2" 
                data-drive-id="${escapeHtml(doc.driveId)}"
                data-filename="${escapeHtml(doc.title)}.pdf"
            >
                Tải xuống
            </button>
        </div>
    `;
    
    // Thêm event listener cho thumbnail (preview)
    const thumbnailImg = card.querySelector('img');
    if (thumbnailImg && doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE') {
        thumbnailImg.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Preview clicked:', doc.driveId);
            previewDocument(doc.driveId);
        });
    }
    
    // Thêm event listener cho nút download
    const downloadBtn = card.querySelector('.download-btn');
    if (downloadBtn && doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE') {
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const driveId = downloadBtn.getAttribute('data-drive-id');
            const filename = downloadBtn.getAttribute('data-filename');
            
            try {
                await downloadDocument(driveId, filename);
            } catch (error) {
                console.error('Download error:', error);
            }
        });
    } else if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
        downloadBtn.textContent = 'Chưa có sẵn';
    }

    // Hover preview (desktop only - CSS hides popup on mobile)
    card.addEventListener('mouseenter', () => {
        clearTimeout(hoverHideTimer);
        hoverShowTimer = setTimeout(() => showHoverPreview(doc, card), 220);
    });
    card.addEventListener('mouseleave', () => {
        clearTimeout(hoverShowTimer);
        hoverHideTimer = setTimeout(hideHoverPreview, 130);
    });
    
    return card;
}

/**
 * Khởi tạo singleton hover preview element
 */
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
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Đang tải...</span>
            </div>
        </div>
        <div class="preview-body">
            <div class="preview-badges mb-2"></div>
            <h3 class="preview-title"></h3>
            <p class="preview-desc"></p>
            <div class="preview-meta">
                <span class="preview-pages"></span>
                <span class="preview-size"></span>
            </div>
            <div class="preview-actions">
                <button class="btn-secondary preview-view-btn text-xs py-2 px-3">👁 Xem trước</button>
                <button class="btn-primary preview-download-btn text-xs py-2 px-3">⬇ Tải xuống</button>
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

/**
 * Định vị popup cạnh card, tránh tràn màn hình
 */
function positionHoverPreview(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const popupW = 360;
    const margin = 12;
    let left, top;

    if (rect.right + popupW + margin <= window.innerWidth) {
        left = rect.right + margin;
    } else if (rect.left - popupW - margin >= 0) {
        left = rect.left - popupW - margin;
    } else {
        left = Math.max(margin, Math.round((window.innerWidth - popupW) / 2));
    }

    const estimatedH = 530;
    top = Math.min(rect.top, window.innerHeight - estimatedH - margin);
    top = Math.max(margin + 64, top);

    hoverPreviewEl.style.left = left + 'px';
    hoverPreviewEl.style.top = top + 'px';
}

/**
 * Điền dữ liệu và hiển thị hover preview
 */
function showHoverPreview(doc, cardEl) {
    if (!hoverPreviewEl) return;

    const categoryMap = {
        'ly-thuyet': 'Lý thuyết',
        'de-thi': 'Đề thi',
        'bai-tap': 'Bài tập',
        'giai-chi-tiet': 'Giải chi tiết'
    };
    const levelColorMap = {
        'thcs': 'bg-green-500/20 text-green-400',
        'thpt': 'bg-blue-500/20 text-blue-400',
        'daihoc': 'bg-pink-500/20 text-pink-400'
    };
    const levelMap = { 'thcs': 'THCS', 'thpt': 'THPT', 'daihoc': 'Đại học' };

    hoverPreviewEl.querySelector('.preview-badges').innerHTML = `
        <span class="px-2 py-0.5 ${levelColorMap[doc.level] || 'bg-slate-700/50 text-slate-300'} text-xs rounded mr-1.5">
            ${escapeHtml(levelMap[doc.level] || doc.level || '')}
        </span>
        <span class="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
            ${escapeHtml(categoryMap[doc.category] || doc.category || '')}
        </span>
    `;

    hoverPreviewEl.querySelector('.preview-title').textContent = doc.title || '';
    hoverPreviewEl.querySelector('.preview-desc').textContent = doc.description || 'Không có mô tả.';
    hoverPreviewEl.querySelector('.preview-pages').textContent = `📄 ${doc.pages || 0} trang`;
    hoverPreviewEl.querySelector('.preview-size').textContent = `💾 ${escapeHtml(doc.fileSize || '')}`;

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
        const spinner = placeholder.querySelector('svg');
        if (spinner) spinner.style.display = 'none';
    }

    const viewBtn = hoverPreviewEl.querySelector('.preview-view-btn');
    const dlBtn = hoverPreviewEl.querySelector('.preview-download-btn');

    viewBtn.onclick = () => { if (hasDoc) previewDocument(doc.driveId); };
    dlBtn.onclick = async () => {
        try { await downloadDocument(doc.driveId, `${doc.title}.pdf`); } catch (e) { console.error(e); }
    };

    [viewBtn, dlBtn].forEach(btn => {
        if (hasDoc) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    positionHoverPreview(cardEl);
    hoverPreviewEl.classList.add('visible');
}

/**
 * Ẩn hover preview
 */
function hideHoverPreview() {
    if (!hoverPreviewEl) return;
    hoverPreviewEl.classList.remove('visible');
    // Dừng tải PDF sau khi animation fade-out kết thúc
    setTimeout(() => {
        if (hoverPreviewEl && !hoverPreviewEl.classList.contains('visible')) {
            const iframe = hoverPreviewEl.querySelector('.preview-iframe');
            if (iframe) iframe.src = '';
            const spinner = hoverPreviewEl.querySelector('.preview-iframe-placeholder svg');
            if (spinner) spinner.style.display = '';
        }
    }, 200);
}

/**
 * Setup mobile menu
 */
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const headerSearch = document.getElementById('header-search');
    const headerSearchMobile = document.getElementById('header-search-mobile');
    const headerSearchCount = document.getElementById('header-search-count');
    const headerSearchCountMobile = document.getElementById('header-search-count-mobile');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSearchContainer = document.getElementById('mobile-search');
    
    // Mobile search toggle
    if (mobileSearchBtn && mobileSearchContainer) {
        mobileSearchBtn.addEventListener('click', () => {
            mobileSearchContainer.classList.toggle('hidden');
            if (!mobileSearchContainer.classList.contains('hidden')) {
                headerSearchMobile?.focus();
            }
        });
    }
    
    // Desktop header search
    if (headerSearch) {
        let searchTimeout;
        headerSearch.addEventListener('input', (e) => {
            try {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    try {
                        currentFilters.query = e.target.value;
                        applyFilters();
                        
                        // Show results count
                        if (headerSearchCount) {
                            if (filteredDocuments.length > 0 || e.target.value.trim()) {
                                headerSearchCount.textContent = `Tìm thấy ${filteredDocuments.length}/${allDocuments.length} tài liệu`;
                                headerSearchCount.classList.remove('hidden');
                            } else {
                                headerSearchCount.classList.add('hidden');
                            }
                        }
                    } catch (error) {
                        console.error('Error in desktop search timeout:', error);
                    }
                }, 300);
            } catch (error) {
                console.error('Error in desktop header search:', error);
            }
        });
    }
    
    // Mobile header search
    if (headerSearchMobile) {
        let searchTimeout;
        headerSearchMobile.addEventListener('input', (e) => {
            try {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    try {
                        currentFilters.query = e.target.value;
                        applyFilters();
                        
                        // Show results count
                        if (headerSearchCountMobile) {
                            if (filteredDocuments.length > 0 || e.target.value.trim()) {
                                headerSearchCountMobile.textContent = `Tìm thấy ${filteredDocuments.length}/${allDocuments.length} tài liệu`;
                                headerSearchCountMobile.classList.remove('hidden');
                            } else {
                                headerSearchCountMobile.classList.add('hidden');
                            }
                        }
                    } catch (error) {
                        console.error('Error in mobile search timeout:', error);
                    }
                }, 300);
            } catch (error) {
                console.error('Error in mobile header search:', error);
            }
        });
    }
    
    const searchInput = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const suggestionsContainerMobile = document.getElementById('search-suggestions-mobile');
    
    // Desktop search
    if (searchInput && suggestionsContainer) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;
            
            if (query.trim()) {
                const suggestions = getSearchSuggestions(allDocuments, query);
                renderSearchSuggestions(suggestionsContainer, suggestions, (suggestion) => {
                    searchInput.value = suggestion;
                    applyFilters();
                });
            } else {
                suggestionsContainer.classList.add('hidden');
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
        
        // Ẩn suggestions khi click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }
    
    // Mobile search
    if (searchInputMobile && suggestionsContainerMobile) {
        let searchTimeout;
        
        searchInputMobile.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;
            
            if (query.trim()) {
                const suggestions = getSearchSuggestions(allDocuments, query);
                renderSearchSuggestions(suggestionsContainerMobile, suggestions, (suggestion) => {
                    searchInputMobile.value = suggestion;
                    applyFilters();
                });
            } else {
                suggestionsContainerMobile.classList.add('hidden');
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
        
        // Ẩn suggestions khi click outside
        document.addEventListener('click', (e) => {
            if (!searchInputMobile.contains(e.target) && !suggestionsContainerMobile.contains(e.target)) {
                suggestionsContainerMobile.classList.add('hidden');
            }
        });
    }
}

/**
 * Setup clear filters button
 */
function setupClearFilters() {
    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            try {
                // Reset filters
                currentFilters = { level: '', subject: '', category: '', query: '' };
                
                // Reset dropdowns
                const filterLevel = document.getElementById('filter-level');
                const filterSubject = document.getElementById('filter-subject');
                const filterCategory = document.getElementById('filter-category');
                const headerSearch = document.getElementById('header-search');
                const headerSearchMobile = document.getElementById('header-search-mobile');
                
                if (filterLevel) filterLevel.value = '';
                if (filterSubject) filterSubject.value = '';
                if (filterCategory) filterCategory.value = '';
                if (headerSearch) headerSearch.value = '';
                if (headerSearchMobile) headerSearchMobile.value = '';
                
                // Re-render
                applyFilters();
            } catch (error) {
                console.error('Error clearing filters:', error);
            }
        });
    }
}

/**
 * Setup filter dropdowns
 */
function setupFilters() {
    const filterLevel = document.getElementById('filter-level');
    const filterSubject = document.getElementById('filter-subject');
    const filterCategory = document.getElementById('filter-category');
    
    if (filterLevel) {
        filterLevel.addEventListener('change', (e) => {
            try {
                currentFilters.level = e.target.value;
                applyFilters();
            } catch (error) {
                console.error('Error filtering by level:', error);
            }
        });
    }
    
    if (filterSubject) {
        filterSubject.addEventListener('change', (e) => {
            try {
                currentFilters.subject = e.target.value;
                applyFilters();
            } catch (error) {
                console.error('Error filtering by subject:', error);
            }
        });
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            try {
                currentFilters.category = e.target.value;
                applyFilters();
            } catch (error) {
                console.error('Error filtering by category:', error);
            }
        });
    }
}

/**
 * Hiển thị skeleton loading
 */
function showSkeletonLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    const grid = document.getElementById('documents-grid');
    
    if (skeleton) {
        skeleton.classList.remove('hidden');
        // Tạo skeleton cards
        skeleton.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'card animate-pulse';
            skeletonCard.innerHTML = `
                <div class="h-48 bg-background-dark rounded-lg mb-4"></div>
                <div class="h-4 bg-background-dark rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-background-dark rounded w-1/2 mb-4"></div>
                <div class="h-10 bg-background-dark rounded"></div>
            `;
            skeleton.appendChild(skeletonCard);
        }
    }
    
    if (grid) {
        grid.classList.add('hidden');
    }
}

/**
 * Ẩn skeleton loading
 */
function hideSkeletonLoading() {
    const skeleton = document.getElementById('loading-skeleton');
    if (skeleton) {
        skeleton.classList.add('hidden');
    }
}

/**
 * Hiển thị lỗi
 */
function showError(message) {
    const grid = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (grid) {
        grid.classList.add('hidden');
    }
    
    if (emptyState) {
        emptyState.classList.remove('hidden');
        const emptyText = emptyState.querySelector('p');
        if (emptyText) {
            emptyText.textContent = message;
        }
    }
}

