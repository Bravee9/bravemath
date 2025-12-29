/**
 * Router Module - Client-side routing cho SPA
 */

const routes = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/about.html': 'about.html',
    '/subject.html': 'subject.html'
};

/**
 * Lấy route từ URL
 * @returns {string} Route path
 */
export function getCurrentRoute() {
    return window.location.pathname;
}

/**
 * Điều hướng đến route
 * @param {string} path - Đường dẫn
 */
export function navigateTo(path) {
    if (path.startsWith('http')) {
        window.location.href = path;
        return;
    }
    
    // Xử lý relative paths
    if (path.startsWith('/')) {
        window.location.pathname = path;
    } else {
        window.location.pathname = `/${path}`;
    }
}

/**
 * Xử lý navigation links
 */
export function setupRouter() {
    // Xử lý tất cả internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Bỏ qua external links và anchors
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
            return;
        }
        
        // Bỏ qua nếu có modifier keys
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            return;
        }
        
        // Nếu là internal link, điều hướng bình thường (browser sẽ xử lý)
        // Hoặc có thể implement SPA routing ở đây nếu cần
    });
}

