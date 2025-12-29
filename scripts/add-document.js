/**
 * Script thêm document mới vào documents.json
 * Chạy: node scripts/add-document.js
 * 
 * WORKFLOW:
 * 1. Upload PDF lên Google Drive
 * 2. Share "Anyone with the link" 
 * 3. Copy Drive ID từ URL (ví dụ: https://drive.google.com/file/d/1ABC123xyz/view)
 * 4. Chạy script này và nhập thông tin
 */

import fs from 'fs/promises';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCUMENTS_PATH = resolve(__dirname, '../data/documents.json');

// Setup readline để nhập liệu
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Tự động lấy metadata từ Google Drive
 * LƯU Ý: Google Drive API không cung cấp số trang cho PDF, user phải nhập thủ công
 */
async function getDriveMetadata(driveId) {
  try {
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
    console.error(`❌ Error fetching metadata:`, error.message);
    return { size: 'N/A' };
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Tạo slug từ title
 */
function createSlug(title) {
  // Bảng chuyển đổi ký tự tiếng Việt
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
  
  let result = title;
  
  // Replace Vietnamese characters
  for (const [viet, ascii] of Object.entries(vietnameseMap)) {
    result = result.split(viet).join(ascii);
  }
  
  // Clean and format
  return result
    .toLowerCase()
    .replace(/\s+/g, '-')           // Space → dash
    .replace(/[^a-z0-9-]/g, '')     // Remove special chars
    .replace(/-+/g, '-')            // Multiple dashes → single
    .replace(/^-|-$/g, '');         // Remove leading/trailing dashes
}

/**
 * Tạo ID mới
 */
async function generateNewId() {
  const data = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
  const maxId = data.documents.reduce((max, doc) => {
    const num = parseInt(doc.id.replace('doc-', ''));
    return num > max ? num : max;
  }, 0);
  return `doc-${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * Main function
 */
async function addDocument() {
  console.log('\n📚 ===== THÊM TÀI LIỆU MỚI =====\n');
  
  try {
    // 1. Nhập thông tin
    const driveId = await question('📎 Drive ID (từ URL): ');
    if (!driveId.trim()) {
      console.log('❌ Drive ID không được để trống!');
      rl.close();
      return;
    }
    
    const title = await question('📖 Tiêu đề tài liệu: ');
    const description = await question('📝 Mô tả ngắn: ');
    
    console.log('\n🏷️  Chọn Level:');
    console.log('  1. THPT');
    console.log('  2. Đại học');
    const levelChoice = await question('Chọn (1 hoặc 2): ');
    const level = levelChoice === '1' ? 'thpt' : 'daihoc';
    
    console.log('\n📂 Chọn Category:');
    console.log('  1. Lý thuyết (ly-thuyet)');
    console.log('  2. Đề thi (de-thi)');
    console.log('  3. Bài tập (bai-tap)');
    console.log('  4. Giải chi tiết (giai-chi-tiet)');
    const categoryChoice = await question('Chọn (1-4): ');
    const categories = ['ly-thuyet', 'de-thi', 'bai-tap', 'giai-chi-tiet'];
    const category = categories[parseInt(categoryChoice) - 1] || 'ly-thuyet';
    
    const subject = await question('📚 Môn học (vd: toan, ly, hoa): ') || 'toan';
    const author = await question('👤 Tác giả: ') || 'Bùi Quang Chiến';
    const tags = await question('🏷️  Tags (phân cách bằng dấu phẩy): ');
    
    // 2. Tự động lấy metadata từ Google Drive (chỉ size, không có pageCount API)
    console.log('\n⏳ Đang lấy file size từ Google Drive...');
    const metadata = await getDriveMetadata(driveId);
    console.log(`✅ File size: ${metadata.size}`);
    
    // 3. Nhập số trang thủ công (Google Drive API không cung cấp)
    const pagesInput = await question('📄 Số trang (mở PDF xem): ');
    const pages = parseInt(pagesInput) || 1;
    
    // 4. Tạo document object
    const newId = await generateNewId();
    const slug = createSlug(title);
    const uploadDate = new Date().toLocaleDateString('vi-VN');
    
    const newDoc = {
      id: newId,
      title: title.trim(),
      subject: subject.trim().toLowerCase(),
      level: level,
      category: category,
      slug: slug,
      driveId: driveId.trim(),
      description: description.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      fileSize: metadata.size,
      pages: pages,
      uploadDate: uploadDate,
      author: author.trim(),
      thumbnail: `https://drive.google.com/thumbnail?id=${driveId.trim()}&sz=w400`
    };
    
    // 5. Thêm vào documents.json
    console.log('\n⏳ Đang cập nhật documents.json...');
    const data = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
    data.documents.push(newDoc);
    data.metadata.totalDocuments = data.documents.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(
      DOCUMENTS_PATH,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log('\n✅ ===== THÀNH CÔNG! =====');
    console.log(`📄 ID: ${newDoc.id}`);
    console.log(`📖 Tiêu đề: ${newDoc.title}`);
    console.log(`🔗 Drive ID: ${newDoc.driveId}`);
    console.log(`📊 Size: ${newDoc.fileSize} | Pages: ${newDoc.pages} (manual input)`);
    console.log('\n💡 Next steps:');
    console.log('   1. git add data/documents.json');
    console.log('   2. git commit -m "Add: [Tên tài liệu]"');
    console.log('   3. git push');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
  } finally {
    rl.close();
  }
}

// Chạy script
addDocument();
