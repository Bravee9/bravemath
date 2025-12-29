/**
 * Search Module - Logic tìm kiếm và lọc tài liệu
 */

/**
 * Lọc documents theo query và filters (với fuzzy search)
 * @param {Array} documents - Danh sách documents
 * @param {string} query - Từ khóa tìm kiếm
 * @param {Object} filters - Bộ lọc {level, subject, category}
 * @returns {Array} Documents đã lọc
 */
export function filterDocuments(documents, query = '', filters = {}) {
    let filtered = [...documents];
    
    // Lọc theo query (tìm kiếm trong title, description, tags, author)
    if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(doc => {
            const titleMatch = doc.title.toLowerCase().includes(searchTerm);
            const descMatch = doc.description?.toLowerCase().includes(searchTerm);
            const tagsMatch = doc.tags?.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );
            const subjectMatch = doc.subject?.toLowerCase().includes(searchTerm);
            const authorMatch = doc.author?.toLowerCase().includes(searchTerm);
            const categoryMatch = doc.category?.toLowerCase().includes(searchTerm);
            
            return titleMatch || descMatch || tagsMatch || subjectMatch || authorMatch || categoryMatch;
        });
    }
    
    // Lọc theo level
    if (filters.level) {
        filtered = filtered.filter(doc => doc.level === filters.level);
    }
    
    // Lọc theo subject (dựa trên tags)
    if (filters.subject) {
        filtered = filtered.filter(doc => 
            doc.tags && doc.tags.includes(filters.subject)
        );
    }
    
    // Lọc theo category
    if (filters.category) {
        filtered = filtered.filter(doc => doc.category === filters.category);
    }
    
    return filtered;
}

/**
 * Sort documents theo tiêu chí
 * @param {Array} documents - Danh sách documents
 * @param {string} sortBy - Tiêu chí sắp xếp: 'date-desc', 'date-asc', 'title-asc', 'title-desc', 'pages-asc', 'pages-desc'
 * @returns {Array} Documents đã sắp xếp
 */
export function sortDocuments(documents, sortBy = 'date-desc') {
    const sorted = [...documents];
    
    switch (sortBy) {
        case 'date-desc': // Mới nhất
            return sorted.sort((a, b) => {
                const dateA = parseVietnameseDate(a.uploadDate);
                const dateB = parseVietnameseDate(b.uploadDate);
                return dateB - dateA;
            });
        
        case 'date-asc': // Cũ nhất
            return sorted.sort((a, b) => {
                const dateA = parseVietnameseDate(a.uploadDate);
                const dateB = parseVietnameseDate(b.uploadDate);
                return dateA - dateB;
            });
        
        case 'title-asc': // Tên A-Z
            return sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        
        case 'title-desc': // Tên Z-A
            return sorted.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        
        case 'pages-asc': // Ít trang nhất
            return sorted.sort((a, b) => (a.pages || 0) - (b.pages || 0));
        
        case 'pages-desc': // Nhiều trang nhất
            return sorted.sort((a, b) => (b.pages || 0) - (a.pages || 0));
        
        default:
            return sorted;
    }
}

/**
 * Parse Vietnamese date format (dd/mm/yyyy)
 * @param {string} dateStr 
 * @returns {Date}
 */
function parseVietnameseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Tạo search suggestions từ documents (cải tiến với ranking)
 * @param {Array} documents - Danh sách documents
 * @param {string} query - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng suggestions tối đa
 * @returns {Array} Danh sách suggestions với rank
 */
export function getSearchSuggestions(documents, query, limit = 5) {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Map(); // Use Map để track score
    
    documents.forEach(doc => {
        let score = 0;
        
        // Title match - cao nhất
        if (doc.title.toLowerCase().includes(searchTerm)) {
            score = doc.title.toLowerCase().startsWith(searchTerm) ? 100 : 50;
            suggestions.set(doc.title, score);
        }
        
        // Tags match - trung bình
        if (doc.tags) {
            doc.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    score = tag.toLowerCase() === searchTerm ? 80 : 40;
                    suggestions.set(tag, score);
                }
            });
        }
        
        // Subject match - thấp
        if (doc.subject?.toLowerCase().includes(searchTerm)) {
            suggestions.set(doc.subject, 30);
        }
        
        // Author match
        if (doc.author?.toLowerCase().includes(searchTerm)) {
            suggestions.set(doc.author, 20);
        }
    });
    
    // Sort by score descending
    return Array.from(suggestions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([text]) => text);
}

/**
 * Hiển thị search suggestions với icons
 * @param {HTMLElement} container - Container để hiển thị suggestions
 * @param {Array} suggestions - Danh sách suggestions
 * @param {Function} onSelect - Callback khi chọn suggestion
 */
export function renderSearchSuggestions(container, suggestions, onSelect) {
    if (!suggestions || suggestions.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.innerHTML = '';
    container.classList.remove('hidden');
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'px-4 py-2 cursor-pointer text-slate-300 hover:text-white transition-colors flex items-center gap-2';
        item.style.backgroundColor = 'transparent';
        
        // Add search icon
        const icon = document.createElement('svg');
        icon.className = 'w-4 h-4 text-slate-400';
        icon.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
        
        const text = document.createElement('span');
        text.textContent = suggestion;
        
        item.appendChild(icon);
        item.appendChild(text);
        
        item.addEventListener('mouseover', () => {
            item.style.backgroundColor = '#40444b';
        });
        item.addEventListener('mouseout', () => {
            item.style.backgroundColor = 'transparent';
        });
        item.addEventListener('click', () => {
            onSelect(suggestion);
            container.classList.add('hidden');
        });
        
        container.appendChild(item);
    });
}

/**
 * Highlight search terms trong text
 * @param {string} text - Text gốc
 * @param {string} query - Từ khóa cần highlight
 * @returns {string} HTML với highlighted text
 */
export function highlightSearchTerm(text, query) {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="bg-blue-500/30 text-blue-300 rounded px-1">$1</mark>');
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cập nhật số kết quả tìm được
 * @param {HTMLElement} element - Element hiển thị số kết quả
 * @param {number} count - Số lượng kết quả
 * @param {number} total - Tổng số documents
 */
export function updateResultsCount(element, count, total) {
    if (!element) return;
    
    const textElement = element.querySelector('#results-text');
    if (textElement) {
        if (count === total) {
            textElement.textContent = `Hiển thị tất cả ${total} tài liệu`;
        } else {
            textElement.textContent = `Tìm thấy ${count} / ${total} tài liệu`;
        }
    }
}

/**
 * Lấy tất cả unique tags từ documents
 * @param {Array} documents 
 * @returns {Array} Danh sách tags unique
 */
export function getAllTags(documents) {
    const tagsSet = new Set();
    documents.forEach(doc => {
        if (doc.tags) {
            doc.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    return Array.from(tagsSet).sort();
}

/**
 * Lấy tất cả unique subjects từ documents
 * @param {Array} documents 
 * @returns {Array} Danh sách subjects unique
 */
export function getAllSubjects(documents) {
    const subjectsSet = new Set();
    documents.forEach(doc => {
        if (doc.subject) {
            subjectsSet.add(doc.subject);
        }
    });
    return Array.from(subjectsSet).sort();
}

