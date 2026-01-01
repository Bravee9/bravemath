/**
 * Admin Server - GUI để thêm tài liệu vào Bravemath
 * 
 * Chạy: npm run admin
 * → Tự động mở browser tại http://localhost:3000
 * → Điền form, click "Submit & Add" → Done!
 */

import express from 'express';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCUMENTS_PATH = resolve(__dirname, '../data/documents.json');
const ADMIN_HTML_PATH = resolve(__dirname, 'admin.html');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve admin.html at root
app.get('/', async (req, res) => {
  try {
    const html = await fs.readFile(ADMIN_HTML_PATH, 'utf-8');
    res.type('html').send(html);
  } catch (error) {
    res.status(500).send('Không tìm thấy admin.html');
  }
});

// Vietnamese to ASCII conversion (giống admin.html)
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

function toKebabCase(str) {
  let result = str.toLowerCase();
  for (const [viet, ascii] of Object.entries(vietnameseMap)) {
    result = result.split(viet).join(ascii);
  }
  return result
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createSlug(title) {
  return toKebabCase(title);
}

// Get Drive metadata (giống update-metadata.js)
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
    console.error(`❌ Error fetching metadata for ${driveId}:`, error.message);
    return { size: 'N/A' };
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Generate new ID
async function generateNewId() {
  const data = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
  const maxId = data.documents.reduce((max, doc) => {
    const num = parseInt(doc.id.replace('doc-', ''));
    return num > max ? num : max;
  }, 0);
  return `doc-${String(maxId + 1).padStart(3, '0')}`;
}

// Main endpoint
app.post('/add-document', async (req, res) => {
  try {
    const {
      driveId,
      title,
      description,
      pages,
      author,
      level,
      category,
      subject,
      tags: tagsString
    } = req.body;

    // Validation
    if (!driveId || !title || !description || !pages) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ các trường bắt buộc (*): driveId, title, description, pages'
      });
    }

    if (!/^[a-zA-Z0-9_-]{28,44}$/.test(driveId)) {
      return res.status(400).json({
        success: false,
        error: 'Drive ID không hợp lệ! Phải có 28-44 ký tự alphanumeric.'
      });
    }

    // Check duplicate Drive ID
    const existingData = JSON.parse(await fs.readFile(DOCUMENTS_PATH, 'utf-8'));
    const duplicateDoc = existingData.documents.find(doc => doc.driveId === driveId);
    if (duplicateDoc) {
      return res.status(400).json({
        success: false,
        error: `Drive ID này đã được sử dụng cho tài liệu: ${duplicateDoc.title} (${duplicateDoc.id})`
      });
    }

    // Check duplicate title (warning, but allow)
    const duplicateTitle = existingData.documents.find(doc =>
      doc.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    if (duplicateTitle) {
      console.log(`⚠️  Cảnh báo: Đã có tài liệu với tiêu đề tương tự: ${duplicateTitle.title} (${duplicateTitle.id})`);
    }

    // Fetch metadata
    console.log(`⏳ Đang lấy file size từ Google Drive cho ${driveId}...`);
    const metadata = await getDriveMetadata(driveId);
    console.log(`✅ File size: ${metadata.size}`);

    // Process tags
    const tags = tagsString
      ? tagsString.split(',').map(t => toKebabCase(t.trim())).filter(t => t)
      : [];

    // Auto-add some tags
    const autoTags = [level, category, subject];
    const allTags = [...new Set([...tags, ...autoTags.map(t => toKebabCase(t))])];

    // Create document
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
      tags: allTags.filter(t => t),
      fileSize: metadata.size,
      pages: parseInt(pages),
      uploadDate: uploadDate,
      author: author.trim() || 'Bùi Quang Chiến',
      thumbnail: `https://drive.google.com/thumbnail?id=${driveId.trim()}&sz=w400`
    };

    // Add to documents.json
    existingData.documents.push(newDoc);
    existingData.metadata.totalDocuments = existingData.documents.length;
    existingData.metadata.lastUpdated = new Date().toISOString();

    await fs.writeFile(
      DOCUMENTS_PATH,
      JSON.stringify(existingData, null, 2),
      'utf-8'
    );

    console.log(`✅ ===== THÀNH CÔNG! =====`);
    console.log(`📄 ID: ${newDoc.id}`);
    console.log(`📖 Tiêu đề: ${newDoc.title}`);
    console.log(`🔗 Drive ID: ${newDoc.driveId}`);
    console.log(`🏷️  Tags: ${newDoc.tags.join(', ')}`);
    console.log(`📊 Size: ${newDoc.fileSize} | Pages: ${newDoc.pages}`);

    res.json({
      success: true,
      message: 'Tài liệu đã được thêm thành công!',
      document: newDoc
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server: ' + error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Open browser helper
function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  
  if (platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  
  exec(cmd, (error) => {
    if (error) {
      console.log(`💡 Mở trình duyệt thủ công: ${url}`);
    }
  });
}

// Start server
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 BRAVEMATH ADMIN SERVER                                 ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  📍 URL: ${url}                              ║`);
  console.log('║                                                            ║');
  console.log('║  📝 Workflow:                                              ║');
  console.log('║     1. Điền thông tin tài liệu trong form                  ║');
  console.log('║     2. Click "📤 Submit & Add"                             ║');
  console.log('║     3. git add → commit → push                             ║');
  console.log('║                                                            ║');
  console.log('║  ⏹️  Nhấn Ctrl+C để dừng server                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Auto open browser
  openBrowser(url);
});