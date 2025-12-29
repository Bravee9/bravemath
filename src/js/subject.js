/**
 * Subject Page Module
 * Tương tự main.js nhưng có xử lý URL params
 */

import { loadDocuments, downloadDocument, previewDocument } from './api.js';
import { filterDocuments, updateResultsCount } from './search.js';
import { setupRouter } from './router.js';

// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentFilters = {
    level: '',
    subject: '',
    category: ''
};

/**
 * Khởi tạo trang subject
 */
document.addEventListener('DOMContentLoaded', async () => {
    setupRouter();
    setupMobileMenu();
    setupFilters();
    
    // Lấy filters từ URL params
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    const subject = urlParams.get('subject');
    
    if (level) {
        currentFilters.level = level;
        const filterLevel = document.getElementById('filter-level');
        if (filterLevel) {
            filterLevel.value = level;
        }
    }
    
    if (subject) {
        currentFilters.subject = subject;
        const filterSubject = document.getElementById('filter-subject');
        if (filterSubject) {
            filterSubject.value = subject;
        }
    }
    
    // Cập nhật page title
    updatePageTitle();
    
    try {
        await loadAndRenderDocuments();
    } catch (error) {
        console.error('Error initializing subject page:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
});

/**
 * Cập nhật page title dựa trên filters
 */
function updatePageTitle() {
    const titleElement = document.getElementById('page-title');
    if (!titleElement) return;
    
    const levelMap = {
        'thpt': 'THPT Quốc Gia',
        'daihoc': 'Đại học'
    };
    
    if (currentFilters.level && levelMap[currentFilters.level]) {
        titleElement.textContent = `Tài liệu ${levelMap[currentFilters.level]}`;
    }
}

/**
 * Tải và render documents
 */
async function loadAndRenderDocuments() {
    showSkeletonLoading();
    
    try {
        const data = await loadDocuments();
        allDocuments = data.documents || [];
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
    filteredDocuments = filterDocuments(allDocuments, '', currentFilters);
    renderDocuments(filteredDocuments);
    
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        updateResultsCount(resultsCount, filteredDocuments.length, allDocuments.length);
    }
    
    hideSkeletonLoading();
}

/**
 * Render danh sách documents
 */
function renderDocuments(documents) {
    const grid = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    const skeleton = document.getElementById('loading-skeleton');
    
    if (!grid) return;
    
    if (skeleton) {
        skeleton.classList.add('hidden');
    }
    
    if (documents.length === 0) {
        grid.classList.add('hidden');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }
    
    grid.classList.remove('hidden');
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    grid.innerHTML = '';
    
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
 */
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    // Thumbnail with Vite base path
    const basePath = import.meta.env.BASE_URL || '/';
    const fallbackImg = `${basePath}assets/images/thumbnails/meme-soi-co-doc-hai-huoc.jpg`;
    const thumbnail = doc.thumbnail || fallbackImg;
    
    const categoryMap = {
        'ly-thuyet': 'Lý thuyết',
        'de-thi': 'Đề thi',
        'bai-tap': 'Bài tập',
        'giai-chi-tiet': 'Giải chi tiết'
    };
    
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
 * Setup filter dropdowns
 */
function setupFilters() {
    const filterLevel = document.getElementById('filter-level');
    const filterSubject = document.getElementById('filter-subject');
    const filterCategory = document.getElementById('filter-category');
    
    if (filterLevel) {
        filterLevel.addEventListener('change', (e) => {
            currentFilters.level = e.target.value;
            applyFilters();
        });
    }
    
    if (filterSubject) {
        filterSubject.addEventListener('change', (e) => {
            currentFilters.subject = e.target.value;
            applyFilters();
        });
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
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

