/**
 * API Module - Giao tiếp với Cloudflare Worker
 */

// Worker URL - ĐANG DÙNG PRODUCTION
const WORKER_URL = 'https://bravemath-proxy.bravechien2209.workers.dev';

/**
 * Tải danh sách documents từ documents.json
 * @returns {Promise<Object>} Dữ liệu documents
 */
export async function loadDocuments() {
    try {
        // Fetch với base path cho GitHub Pages
        const basePath = import.meta.env.BASE_URL || '/';
        const url = `${basePath}data/documents.json`;
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
        
        // Tạo download link
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'document.pdf';
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

