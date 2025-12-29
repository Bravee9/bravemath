/**
 * Main Application Module
 * Khởi tạo ứng dụng và quản lý state
 */

import { loadDocuments, downloadDocument, previewDocument } from './api.js';
import { filterDocuments, getSearchSuggestions, renderSearchSuggestions, updateResultsCount } from './search.js';
import { setupRouter } from './router.js';

// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentFilters = {
    level: '',
    subject: '',
    category: '',
    query: ''
};

/**
 * Khởi tạo ứng dụng khi DOM loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Setup router
    setupRouter();
    
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
                class="w-full aspect-[4/3] object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
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
                data-filename="${escapeHtml(doc.title.replace(/[^a-z0-9]/gi, '_'))}.pdf"
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
    
    return card;
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

