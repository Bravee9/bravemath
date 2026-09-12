/**
 * API Module — Google Drive direct links (no proxy)
 * Simplified: no Cloudflare Worker dependency.
 */

/**
 * Validate Google Drive ID format
 * @param {string} driveId
 * @returns {boolean}
 */
function isValidDriveId(driveId) {
    if (!driveId || typeof driveId !== 'string') return false;
    // Google Drive IDs: 28-44 chars, alphanumeric + dash/underscore
    return /^[a-zA-Z0-9_-]{28,44}$/.test(driveId);
}

/**
 * Extract Drive ID from various input formats:
 *   - Raw ID:       "1FVLyrCNe6QnchZhFkD64_qHxbCzLgtxQ"
 *   - Share URL:    "https://drive.google.com/file/d/{id}/view..."
 *   - Thumbnail URL that already contains a full link in ?id=...
 * @param {string} input
 * @returns {string|null} Clean Drive ID or null
 */
export function extractDriveId(input) {
    if (!input) return null;

    // Match /file/d/{id}/ pattern
    const fileMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]{28,44})/);
    if (fileMatch) return fileMatch[1];

    // Match ?id={id} pattern (may appear in thumbnail URLs)
    const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]{28,44})/);
    if (idMatch) return idMatch[1];

    // Raw ID
    if (isValidDriveId(input.trim())) return input.trim();

    return null;
}

/**
 * Load documents list from documents.json
 * @returns {Promise<Object>}
 */
export async function loadDocuments() {
    try {
        const basePath = import.meta.env.BASE_URL || '/';
        const timestamp = new Date().getTime();
        const url = `${basePath}data/documents.json?v=${timestamp}`;
        console.log('Fetching documents from:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading documents:', error);
        throw error;
    }
}

/**
 * Download document directly via Google Drive export URL.
 * Opens in new tab — avoids CORS / Worker dependency.
 * @param {string} driveId - Google Drive File ID
 * @param {string} filename - Filename hint (unused for direct link)
 */
export function downloadDocument(driveId, filename) {
    if (!isValidDriveId(driveId)) {
        console.error('Invalid Drive ID format:', driveId);
        alert('ID tài liệu không hợp lệ. Vui lòng thử lại.');
        return;
    }

    // Direct Google Drive download link
    const url = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Track in Google Analytics 4 if available
    if (typeof gtag === 'function') {
        gtag('event', 'file_download', {
            file_name: filename || driveId,
            file_id: driveId,
            content_type: 'application/pdf'
        });
    }
}

/**
 * Open document preview in new tab via Google Drive viewer.
 * @param {string} driveId - Google Drive File ID
 */
export function previewDocument(driveId) {
    if (!isValidDriveId(driveId)) {
        console.error('Invalid Drive ID format:', driveId);
        alert('ID tài liệu không hợp lệ. Vui lòng thử lại.');
        return;
    }

    const url = `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview`;
    window.open(url, '_blank', 'noopener,noreferrer');
}
