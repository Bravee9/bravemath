/** Bravemath main catalog application. */
import { loadDocuments, downloadDocument, previewDocument } from './api.js';
import { filterDocuments, sortDocuments, updateResultsCount } from './search.js';
import { setupRouter } from './router.js';
import { initExamCountdown } from './countdown.js';

let allDocuments = [];
let filteredDocuments = [];
let currentFilters = { level: '', subject: '', category: '', query: '', sort: 'date-desc' };

const CATEGORY_LABELS = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết'
};
const LEVEL_LABELS = { thcs: 'THCS', thpt: 'THPT', daihoc: 'Đại học' };
const CATEGORY_BADGE_CLASS = {
    'ly-thuyet': 'badge-theory',
    'de-thi': 'badge-exam',
    'bai-tap': 'badge-exercise',
    'giai-chi-tiet': 'badge-solution'
};

const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='320'%3E%3Crect width='100%25' height='100%25' fill='%23e8f2fa'/%3E%3Cpath d='M70 72h100v145H70z' fill='none' stroke='%231769aa' stroke-width='4'/%3E%3Cpath d='M90 105h60M90 130h60M90 155h40' stroke='%231769aa' stroke-width='4'/%3E%3Ctext x='120' y='260' font-family='Arial' font-size='14' fill='%23172b3a' text-anchor='middle'%3EBRAVEMATH%3C/text%3E%3C/svg%3E";

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function getBookmarks() {
    try { return JSON.parse(localStorage.getItem('bravemath-bookmarks') || '[]'); }
    catch { return []; }
}

function applyFilters() {
    filteredDocuments = filterDocuments(allDocuments, currentFilters.query, currentFilters);
    filteredDocuments = sortDocuments(filteredDocuments, currentFilters.sort);
    renderDocuments(filteredDocuments);

    const resultsCount = document.getElementById('results-count');
    if (resultsCount) updateResultsCount(resultsCount, filteredDocuments.length, allDocuments.length);
    document.getElementById('loading-skeleton')?.setAttribute('style', 'display:none');
}

function renderDocuments(documents) {
    const list = document.getElementById('documents-grid');
    const emptyState = document.getElementById('empty-state');
    if (!list) return;

    const hasDocuments = documents.length > 0;
    list.style.display = hasDocuments ? '' : 'none';
    if (emptyState) emptyState.style.display = hasDocuments ? 'none' : '';
    if (!hasDocuments) return;

    list.replaceChildren(...documents.map(createDocumentCard));
}

function createDocumentCard(doc) {
    const card = document.createElement('article');
    card.className = 'document-card';
    const thumbnail = doc.thumbnail || fallbackImg;
    const safeTitle = escapeHtml(doc.title);
    const safeDescription = escapeHtml(doc.description || 'Chưa có mô tả cho tài liệu này.');
    const hasFile = Boolean(doc.driveId && doc.driveId !== 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE');
    const isBookmarked = getBookmarks().includes(doc.driveId);

    card.innerHTML = `
        <button class="card-thumbnail-button" type="button" aria-label="Xem trước ${safeTitle}" ${hasFile ? '' : 'disabled'}>
            <img src="${escapeHtml(thumbnail)}" alt="Bìa tài liệu ${safeTitle}" class="card-thumbnail" loading="lazy">
        </button>
        <div class="card-body">
            <div class="card-badges">
                <span class="badge">${escapeHtml(LEVEL_LABELS[doc.level] || doc.level || 'Khác')}</span>
                <span class="badge ${CATEGORY_BADGE_CLASS[doc.category] || ''}">${escapeHtml(CATEGORY_LABELS[doc.category] || doc.category || 'Tài liệu')}</span>
            </div>
            <h3 class="card-title">${safeTitle}</h3>
            <p class="card-desc">${safeDescription}</p>
            <div class="card-meta">
                <span>${Number(doc.pages) || 0} trang</span>
                ${doc.fileSize ? `<span>${escapeHtml(doc.fileSize)}</span>` : ''}
                ${doc.author ? `<span>${escapeHtml(doc.author)}</span>` : ''}
                ${doc.uploadDate ? `<span>Cập nhật ${escapeHtml(doc.uploadDate)}</span>` : ''}
            </div>
        </div>
        <button class="bookmark-btn${isBookmarked ? ' active' : ''}" type="button" data-id="${escapeHtml(doc.driveId)}" aria-label="${isBookmarked ? 'Bỏ lưu' : 'Lưu'} tài liệu ${safeTitle}" aria-pressed="${isBookmarked}">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linejoin="round" d="M6 4h12v17l-6-3-6 3V4Z"/></svg>
        </button>
        <div class="card-actions">
            <button type="button" class="btn-primary preview-btn" ${hasFile ? '' : 'disabled'}>Xem trước</button>
            <button type="button" class="btn-secondary download-btn" ${hasFile ? '' : 'disabled'}>Tải PDF</button>
        </div>`;

    const image = card.querySelector('.card-thumbnail');
    image.addEventListener('error', () => { image.src = fallbackImg; }, { once: true });

    const openPreview = () => { if (hasFile) previewDocument(doc.driveId); };
    card.querySelector('.card-thumbnail-button')?.addEventListener('click', openPreview);
    card.querySelector('.preview-btn')?.addEventListener('click', openPreview);
    card.querySelector('.download-btn')?.addEventListener('click', async () => {
        if (!hasFile) return;
        try { await downloadDocument(doc.driveId, `${doc.title}.pdf`); }
        catch (error) { console.error('Download error:', error); }
    });
    card.querySelector('.bookmark-btn')?.addEventListener('click', () => toggleBookmark(doc.driveId));
    return card;
}

function toggleBookmark(driveId) {
    if (!driveId) return;
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(driveId);
    if (index >= 0) bookmarks.splice(index, 1);
    else bookmarks.push(driveId);
    localStorage.setItem('bravemath-bookmarks', JSON.stringify(bookmarks));

    document.querySelectorAll(`.bookmark-btn[data-id="${CSS.escape(driveId)}"]`).forEach(button => {
        const active = index < 0;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? 'Bỏ lưu tài liệu' : 'Lưu tài liệu');
    });
    renderBookmarkedDocuments();
}

function renderBookmarkedDocuments() {
    const list = document.getElementById('bookmarked-list');
    if (!list) return;
    const bookmarks = getBookmarks();
    const documents = allDocuments.filter(doc => bookmarks.includes(doc.driveId));

    if (!documents.length) {
        list.innerHTML = '<div class="empty-bookmark">Chưa có tài liệu nào được lưu. Chọn biểu tượng dấu trang ở mỗi tài liệu để xem lại nhanh.</div>';
        return;
    }

    list.replaceChildren(...documents.map(doc => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bookmarked-item';
        button.innerHTML = `<img src="${escapeHtml(doc.thumbnail || fallbackImg)}" alt=""><span><span class="bookmarked-item-title">${escapeHtml(doc.title)}</span><span class="bookmarked-item-meta">${Number(doc.pages) || 0} trang · ${escapeHtml(doc.fileSize || '')}</span></span>`;
        button.addEventListener('click', () => previewDocument(doc.driveId));
        return button;
    }));
}

function setupMobileMenu() {
    const button = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    button?.addEventListener('click', () => {
        const open = menu?.classList.toggle('open') ?? false;
        button.setAttribute('aria-expanded', String(open));
    });
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        menu.classList.remove('open');
        button?.setAttribute('aria-expanded', 'false');
    }));
}

function setupTheme() {
    const toggle = () => {
        const dark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('bravemath-theme', dark ? 'dark' : 'light');
    };
    document.getElementById('theme-toggle')?.addEventListener('click', toggle);
    document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggle);
}

function setupControls() {
    const search = document.getElementById('header-search');
    let searchTimer;
    search?.addEventListener('input', event => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentFilters.query = event.target.value.trim();
            applyFilters();
        }, 180);
    });
    search?.addEventListener('keydown', event => {
        if (event.key === 'Enter') document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    [
        ['filter-level', 'level'],
        ['filter-subject', 'subject'],
        ['filter-category', 'category'],
        ['sort-documents', 'sort']
    ].forEach(([id, key]) => document.getElementById(id)?.addEventListener('change', event => {
        currentFilters[key] = event.target.value;
        applyFilters();
    }));

    document.querySelectorAll('[data-clear-filters]').forEach(button => button.addEventListener('click', clearFilters));
    document.querySelectorAll('[data-quick-level], [data-quick-subject]').forEach(link => link.addEventListener('click', () => {
        const level = link.dataset.quickLevel;
        const subject = link.dataset.quickSubject;
        if (level) {
            currentFilters.level = level;
            const select = document.getElementById('filter-level');
            if (select) select.value = level;
        }
        if (subject) {
            currentFilters.subject = subject;
            const select = document.getElementById('filter-subject');
            if (select) select.value = subject;
        }
        applyFilters();
    }));
}

function clearFilters() {
    currentFilters = { level: '', subject: '', category: '', query: '', sort: 'date-desc' };
    ['filter-level', 'filter-subject', 'filter-category'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    const sort = document.getElementById('sort-documents');
    if (sort) sort.value = 'date-desc';
    const search = document.getElementById('header-search');
    if (search) search.value = '';
    applyFilters();
}

async function loadAndRenderDocuments() {
    try {
        const data = await loadDocuments();
        allDocuments = data.documents || [];
        applyFilters();
        renderBookmarkedDocuments();
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('loading-skeleton')?.setAttribute('style', 'display:none');
        const empty = document.getElementById('empty-state');
        if (empty) {
            empty.style.display = '';
            const message = empty.querySelector('p');
            if (message) message.textContent = 'Không thể tải danh sách tài liệu. Vui lòng thử lại sau.';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupRouter();
    setupTheme();
    setupMobileMenu();
    setupControls();
    initExamCountdown();
    loadAndRenderDocuments();
});
