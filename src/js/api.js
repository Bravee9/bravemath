/**
 * API Module - Giao tiếp với Cloudflare Worker
 */

// Worker URL - ĐANG DÙNG PRODUCTION
const WORKER_URL = 'https://bravemath-proxy.bravechien2209.workers.dev';

/**
 * Sanitize filename để tránh lỗi encoding khi download
 * @param {string} filename - Tên file gốc
 * @returns {string} Tên file đã sanitize (ASCII only)
 */
function sanitizeFilename(filename) {
    // Bảng chuyển đổi ký tự tiếng Việt sang không dấu
    const vietnameseMap = {
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
        'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
        'Đ': 'D'
    };
    
    let result = filename;
    
    // Replace Vietnamese characters
    for (const [viet, ascii] of Object.entries(vietnameseMap)) {
        result = result.split(viet).join(ascii);
    }
    
    // Replace spaces and special characters with dash
    result = result
        .replace(/\s+/g, '-')           // Space → dash
        .replace(/[^a-zA-Z0-9.-]/g, '-') // Special chars → dash
        .replace(/-+/g, '-')             // Multiple dashes → single dash
        .replace(/^-|-$/g, '')           // Remove leading/trailing dashes
        .toLowerCase();                  // Lowercase
    
    // Tách tên file và extension
    const lastDotIndex = result.lastIndexOf('.');
    if (lastDotIndex > 0) {
        const name = result.substring(0, lastDotIndex);
        const ext = result.substring(lastDotIndex);
        return `${name}-bravemath${ext}`;
    }
    
    return `${result}-bravemath`;
}

/**
 * Tải danh sách documents từ documents.json
 * @returns {Promise<Object>} Dữ liệu documents
 */
export async function loadDocuments() {
    try {
        // Fetch với base path cho GitHub Pages
        const basePath = import.meta.env.BASE_URL || '/';
        // Thêm timestamp để force reload (cache busting)
        const timestamp = new Date().getTime();
        const url = `${basePath}data/documents.json?v=${timestamp}`;
        console.log('Fetching documents from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading documents:', error);
        throw error;
    }
}

/**
 * Tải tài liệu qua Cloudflare Worker
 * @param {string} driveId - Google Drive File ID
 * @param {string} filename - Tên file để tải về
 */
export async function downloadDocument(driveId, filename) {
    try {
        const url = `${WORKER_URL}/download/${driveId}`;
        
        // Hiển thị loading modal
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) {
            loadingModal.classList.remove('hidden');
        }
        
        // Fetch file từ worker
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Lấy blob data
        const blob = await response.blob();
        
        // Sanitize filename để tránh lỗi encoding
        const safeFilename = sanitizeFilename(filename || 'document.pdf');
        
        // Tạo download link
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        // Ẩn loading modal
        if (loadingModal) {
            loadingModal.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error downloading document:', error);
        
        // Ẩn loading modal
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) {
            loadingModal.classList.add('hidden');
        }
        
        // Hiển thị thông báo lỗi
        alert('Không thể tải tài liệu. Vui lòng thử lại sau.');
        throw error;
    }
}

/**
 * Xem trước tài liệu trong tab mới
 * @param {string} driveId - Google Drive File ID
 */
export function previewDocument(driveId) {
    const url = `${WORKER_URL}/preview/${driveId}`;
    window.open(url, '_blank');
}

/**
 * Kiểm tra Worker có hoạt động không
 * @returns {Promise<boolean>}
 */
export async function checkWorkerHealth() {
    try {
        const response = await fetch(`${WORKER_URL}/`);
        return response.ok;
    } catch (error) {
        console.warn('Worker health check failed:', error);
        return false;
    }
}

