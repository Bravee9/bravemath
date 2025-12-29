/**
 * Script tự động cập nhật fileSize từ Google Drive
 * LƯU Ý: KHÔNG cập nhật pages vì Google Drive API không cung cấp pageCount
 * Chạy: node scripts/update-metadata.js
 */

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCUMENTS_PATH = resolve(__dirname, '../data/documents.json');

/**
 * Lấy metadata từ Google Drive (chỉ file size)
 * LƯU Ý: Google Drive API không có pageCount field, số trang phải nhập thủ công
 * @param {string} driveId 
 * @returns {Promise<{size: string}>}
 */
async function getDriveMetadata(driveId) {
  try {
    // Không có API key, chỉ lấy Content-Length từ HEAD request
    const response = await fetch(`https://drive.google.com/uc?id=${driveId}&export=download`, {
      method: 'HEAD'
    });
    
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      const bytes = parseInt(contentLength);
      const size = formatFileSize(bytes);
      
      return { size };
    }
    
    return { size: 'N/A' };
  } catch (error) {
    console.error(`❌ Error fetching metadata for ${driveId}:`, error.message);
    return { size: 'N/A' };
  }
}

/**
 * Format file size
 * @param {number} bytes 
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Cập nhật documents.json với file size mới (KHÔNG động số trang đã nhập thủ công)
 */
async function updateDocuments() {
  try {
    console.log('📖 Đọc documents.json...');
    const data = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
    
    console.log(`📄 Tìm thấy ${data.documents.length} tài liệu\n`);
    
    for (const doc of data.documents) {
      console.log(`⏳ Đang xử lý: ${doc.title}`);
      
      const metadata = await getDriveMetadata(doc.driveId);
      
      // Chỉ cập nhật fileSize, KHÔNG thay đổi pages (đã nhập thủ công)
      doc.fileSize = metadata.size;
      
      console.log(`   ✅ Size: ${metadata.size} | Pages: ${doc.pages} (giữ nguyên)\n`);
    }
    
    // Ghi lại file
    await fs.writeFile(
      DOCUMENTS_PATH, 
      JSON.stringify(data, null, 2), 
      'utf-8'
    );
    
    console.log('✅ Đã cập nhật file sizes trong documents.json!');
    console.log('💡 Số trang KHÔNG bị thay đổi (vì Google Drive API không cung cấp pageCount)');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Chạy script
updateDocuments();
