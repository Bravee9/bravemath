/**
 * Search Module — Filter, sort, and search documents.
 */

/**
 * Filter documents by keyword and filter criteria.
 * @param {Array} documents - All documents
 * @param {string} query - Search keyword
 * @param {Object} filters - { level, subject, category }
 * @returns {Array} Filtered documents
 */
export function filterDocuments(documents, query = '', filters = {}) {
    let results = [...documents];

    // Keyword search (title, description, tags, author)
    if (query.trim()) {
        const term = query.toLowerCase().trim();
        results = results.filter(doc => {
            return (
                doc.title?.toLowerCase().includes(term) ||
                doc.description?.toLowerCase().includes(term) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                doc.author?.toLowerCase().includes(term) ||
                doc.subject?.toLowerCase().includes(term) ||
                doc.category?.toLowerCase().includes(term)
            );
        });
    }

    // Level filter
    if (filters.level) {
        results = results.filter(doc => doc.level === filters.level);
    }

    // Subject filter (matches in tags)
    if (filters.subject) {
        results = results.filter(doc =>
            doc.tags && doc.tags.includes(filters.subject)
        );
    }

    // Category filter
    if (filters.category) {
        results = results.filter(doc => doc.category === filters.category);
    }

    return results;
}

/**
 * Sort documents by a given criteria.
 * @param {Array} documents
 * @param {string} sortBy - 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc'
 * @returns {Array} Sorted documents
 */
export function sortDocuments(documents, sortBy = 'date-desc') {
    const sorted = [...documents];

    switch (sortBy) {
        case 'date-desc':
            return sorted.sort((a, b) => parseDate(b.uploadDate) - parseDate(a.uploadDate));
        case 'date-asc':
            return sorted.sort((a, b) => parseDate(a.uploadDate) - parseDate(b.uploadDate));
        case 'title-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        case 'title-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        default:
            return sorted;
    }
}

/**
 * Parse dd/mm/yyyy date string to Date object.
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Update the results count display.
 * @param {HTMLElement} element - Container element with #results-text inside
 * @param {number} count - Filtered count
 * @param {number} total - Total documents
 */
export function updateResultsCount(element, count, total) {
    if (!element) return;

    const textEl = element.querySelector('#results-text');
    if (textEl) {
        textEl.textContent = count === total
            ? `Hiển thị tất cả ${total} tài liệu`
            : `Tìm thấy ${count} / ${total} tài liệu`;
    }
}
