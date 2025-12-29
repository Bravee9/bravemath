/**
 * Script tự động cập nhật fileSize và pages từ Google Drive
 * Chạy: node scripts/update-metadata.js
 */

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCUMENTS_PATH = resolve(__dirname, '../data/documents.json');

/**
 * Lấy metadata từ Google Drive (public file)
 * @param {string} driveId 
 * @returns {Promise<{size: string, pages: number}>}
 */
async function getDriveMetadata(driveId) {
  try {
    // Google Drive file metadata endpoint (cho public files)
    const url = `https://www.googleapis.com/drive/v3/files/${driveId}?fields=size,name,mimeType&key=YOUR_API_KEY`;
    
    // Nếu không có API key, ước lượng từ HEAD request
    const response = await fetch(`https://drive.google.com/uc?id=${driveId}&export=download`, {
      method: 'HEAD'
    });
    
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      const bytes = parseInt(contentLength);
      const size = formatFileSize(bytes);
      
      // Ước lượng số trang (1 page ≈ 50KB cho PDF text-heavy)
      const estimatedPages = Math.max(1, Math.round(bytes / 50000));
      
      return { size, pages: estimatedPages };
    }
    
    return { size: 'N/A', pages: 0 };
  } catch (error) {
    console.error(`❌ Error fetching metadata for ${driveId}:`, error.message);
    return { size: 'N/A', pages: 0 };
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
 * Cập nhật documents.json với metadata mới
 */
async function updateDocuments() {
  try {
    console.log('📖 Đọc documents.json...');
    const data = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
    
    console.log(`📄 Tìm thấy ${data.documents.length} tài liệu\n`);
    
    for (const doc of data.documents) {
      console.log(`⏳ Đang xử lý: ${doc.title}`);
      
      const metadata = await getDriveMetadata(doc.driveId);
      
      // Cập nhật metadata
      doc.fileSize = metadata.size;
      doc.pages = metadata.pages;
      
      console.log(`   ✅ Size: ${metadata.size}, Pages: ${metadata.pages}\n`);
    }
    
    // Ghi lại file
    await fs.writeFile(
      DOCUMENTS_PATH, 
      JSON.stringify(data, null, 2), 
      'utf-8'
    );
    
    console.log('✅ Đã cập nhật documents.json thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Chạy script
updateDocuments();
