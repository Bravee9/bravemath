/**
 * Search Module - Logic tìm kiếm và lọc tài liệu
 */

/**
 * Lọc documents theo query và filters
 * @param {Array} documents - Danh sách documents
 * @param {string} query - Từ khóa tìm kiếm
 * @param {Object} filters - Bộ lọc {level, subject, category}
 * @returns {Array} Documents đã lọc
 */
export function filterDocuments(documents, query = '', filters = {}) {
    let filtered = [...documents];
    
    // Lọc theo query (tìm kiếm trong title, description, tags)
    if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(doc => {
            const titleMatch = doc.title.toLowerCase().includes(searchTerm);
            const descMatch = doc.description?.toLowerCase().includes(searchTerm);
            const tagsMatch = doc.tags?.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );
            const subjectMatch = doc.subject?.toLowerCase().includes(searchTerm);
            
            return titleMatch || descMatch || tagsMatch || subjectMatch;
        });
    }
    
    // Lọc theo level
    if (filters.level) {
        filtered = filtered.filter(doc => doc.level === filters.level);
    }
    
    // Lọc theo subject
    if (filters.subject) {
        filtered = filtered.filter(doc => doc.subject === filters.subject);
    }
    
    // Lọc theo category
    if (filters.category) {
        filtered = filtered.filter(doc => doc.category === filters.category);
    }
    
    return filtered;
}

/**
 * Tạo search suggestions từ documents
 * @param {Array} documents - Danh sách documents
 * @param {string} query - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng suggestions tối đa
 * @returns {Array} Danh sách suggestions
 */
export function getSearchSuggestions(documents, query, limit = 5) {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set();
    
    documents.forEach(doc => {
        // Thêm title nếu match
        if (doc.title.toLowerCase().includes(searchTerm)) {
            suggestions.add(doc.title);
        }
        
        // Thêm tags nếu match
        if (doc.tags) {
            doc.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    suggestions.add(tag);
                }
            });
        }
        
        // Giới hạn số lượng
        if (suggestions.size >= limit) return;
    });
    
    return Array.from(suggestions).slice(0, limit);
}

/**
 * Hiển thị search suggestions
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
        item.className = 'px-4 py-2 hover:bg-background-dark cursor-pointer text-paragraph-dark hover:text-ocean-400 transition-colors';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            onSelect(suggestion);
            container.classList.add('hidden');
        });
        container.appendChild(item);
    });
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

