# 📜 Scripts Automation

Scripts tự động hóa để quản lý tài liệu trên Bravemath.

---

## 🚀 Available Scripts

### **1. Thêm Tài Liệu Mới** (`add-document.js`)

**Công dụng**: Thêm tài liệu mới vào `documents.json` một cách nhanh chóng và tự động.

```bash
npm run add:document
```

**Workflow**:
1. Upload PDF lên Google Drive
2. Click chuột phải → Share → "Anyone with the link" → Copy link
3. Lấy Drive ID từ URL (ví dụ: `https://drive.google.com/file/d/1ABC123xyz/view` → ID là `1ABC123xyz`)
4. **Mở PDF và đếm số trang** (Google Drive API không cung cấp pageCount)
5. Chạy script và nhập thông tin theo hướng dẫn:
   - Drive ID
   - Tiêu đề tài liệu
   - Mô tả ngắn
   - Level (THPT/Đại học)
   - Category (Lý thuyết/Đề thi/Bài tập/Giải chi tiết)
   - Môn học (toan, ly, hoa...)
   - Tác giả
   - **Tags** (phân cách bằng dấu phẩy, VD: `Giải tích, Đại học, Tóm tắt`)
     - ✅ Viết có dấu hoặc không dấu đều được
     - ✅ Tự động convert sang kebab-case: `Giải tích` → `giai-tich`
   - **Số trang (nhập thủ công)**

**Tự động**:
- ✅ Tạo ID mới (doc-001, doc-002...)
- ✅ Lấy file size từ Google Drive (HEAD request)
- ✅ Tạo thumbnail URL
- ✅ Tạo slug từ tiêu đề (Vietnamese → ASCII)
- ✅ **Convert tags sang kebab-case** (giải-tich, dai-hoc, tom-tat...)
- ✅ Thêm vào documents.json
- ✅ Cập nhật metadata (totalDocuments, lastUpdated)

**Ví dụ Output**:
```
✅ ===== THÀNH CÔNG! =====
📄 ID: doc-003
📖 Tiêu đề: Bài tập Đại số tuyến tính
🔗 Drive ID: 1XYZ789abc
📊 Size: 1.2 MB | Pages: 25 (manual input)

💡 Next steps:
   1. git add data/documents.json
   2. git commit -m "Add: Bài tập Đại số tuyến tính"
   3. git push
```

---

### **2. Cập Nhật Metadata** (`update-metadata.js`)

**Công dụng**: Tự động cập nhật file size cho TẤT CẢ tài liệu trong `documents.json`.

```bash
npm run update:metadata
```

**Khi nào dùng**:
- Sau khi cập nhật file PDF trên Drive (file size thay đổi)
- Kiểm tra lại metadata định kỳ

**Tự động**:
- ✅ Fetch file size từ Google Drive API (HEAD request)
- ⚠️ KHÔNG thay đổi số trang (pages) - giữ nguyên giá trị đã nhập thủ công

**Lưu ý**: Script này **chỉ cập nhật file size**, không động chạm đến số trang vì:
- Google Drive API không có field `pageCount`
- Số trang đã nhập thủ công chính xác hơn

---

## ❓ FAQ

### **Q: Tại sao không tự động lấy số trang từ Google Drive?**

**A:** Google Drive API v3 **KHÔNG cung cấp field `pageCount`** cho PDF files!

Fields có sẵn trong Drive API:
- ✅ `size` (file size in bytes)
- ✅ `name`, `mimeType`, `modifiedTime`, `fileExtension`
- ❌ `pageCount`, `numberOfPages` - **KHÔNG TỒN TẠI**

Để lấy số trang PDF cần:
1. **Download file và parse** bằng library (pdf-lib, pdf-parse) - quá phức tạp, tốn bandwidth
2. **Nhập thủ công** - đơn giản nhất và chính xác 100% ⭐

→ **Giải pháp**: User nhập số trang khi chạy `add-document.js` script.

---

### **Q: Script có kiểm tra tài liệu trùng lặp không?**

**A:** Có! Script tự động kiểm tra 2 loại duplicate:

**1️⃣ Duplicate Drive ID** (BLOCKING - không cho phép):
```
❌ ===== LỖI: TÀI LIỆU ĐÃ TỒN TẠI =====
📄 ID: doc-001
📖 Tiêu đề: Tài liệu ABC
💡 Drive ID này đã được sử dụng. Vui lòng dùng Drive ID khác.
```
→ Script **tự động dừng**, phải dùng Drive ID khác.

**2️⃣ Duplicate Title** (WARNING - cảnh báo):
```
⚠️  Cảnh báo: Đã có tài liệu với tiêu đề tương tự
Bạn có chắc muốn tiếp tục? (y/n):
```
→ User có thể chọn tiếp tục hoặc hủy.

---

## 📋 Workflow Khuyến Nghị

### **📌 QUAN TRỌNG: Naming Convention cho Google Drive**

**Vấn đề**: File có tên tiếng Việt (có dấu) sẽ bị lỗi encoding khi download:
```
❌ Các thường trong lý thuyết đồ thị.pdf
→ Download: C_c thu_ng_trong l_thuy_t__th_.pdf (LỖI!)
```

**Giải pháp**: Đặt tên file **KHÔNG DẤU, kebab-case** trên Google Drive:
```
✅ ĐÚNG: cac-thuong-trong-ly-thuyet-do-thi.pdf
✅ ĐÚNG: giai-tich-1-bai-tap-co-ban.pdf
✅ ĐÚNG: xstk-de-thi-giua-ky.pdf
```

**Quy tắc đặt tên**:
1. ✅ Chữ thường (lowercase)
2. ✅ Bỏ dấu tiếng Việt
3. ✅ Thay space bằng dấu gạch ngang `-`
4. ✅ Chỉ dùng: `a-z`, `0-9`, `-`, `.`
5. ❌ KHÔNG dùng: `_`, space, ký tự đặc biệt, Unicode

**Ví dụ Convert**:
```
"Đại số tuyến tính.pdf"  → dai-so-tuyen-tinh.pdf
"Giải tích 1 & 2.pdf"     → giai-tich-1-2.pdf
"Đề thi THPT QG.pdf"      → de-thi-thpt-qg.pdf
```

**💡 Lưu ý**: 
- Script `add-document.js` **TỰ ĐỘNG sanitize** filename khi thêm vào JSON
- Website sẽ download với tên đã sanitize (không lỗi chữ)
- Tên hiển thị trên web vẫn có dấu bình thường (từ field `title`)

---

### **Thêm 1 tài liệu mới**:
```bash
# Bước 1: Upload file lên Drive và get Drive ID
# Bước 2: Chạy script thêm tài liệu
npm run add:document

# Bước 3: Commit và push
git add data/documents.json
git commit -m "Add: [Tên tài liệu]"
git push
```

### **Cập nhật hàng loạt metadata**:
```bash
npm run update:metadata
git add data/documents.json
git commit -m "Update: Refresh metadata for all documents"
git push
```

---

## 🔧 Technical Notes

### **Google Drive API**
Scripts sử dụng Google Drive public endpoints:
- **Thumbnail**: `https://drive.google.com/thumbnail?id={DRIVE_ID}&sz=w400`
- **Download**: `https://drive.google.com/uc?id={DRIVE_ID}&export=download`
- **Metadata**: HEAD request to download URL để lấy Content-Length

**Không cần API Key** vì files đã public "Anyone with the link".

### **File Size Estimation**
- Sử dụng `Content-Length` header từ HEAD request
- Format: bytes → KB → MB

### **Pages Estimation**
- Công thức: `pages = Math.round(fileSize_bytes / 50000)`
- Giả định: 1 trang PDF text-heavy ≈ 50KB
- Có thể điều chỉnh trong code nếu cần chính xác hơn

---

## ⚠️ Troubleshooting

### **"npm is not recognized"** (Windows PowerShell)
```bash
# Chạy trong WSL thay vì PowerShell
wsl
cd /mnt/b/EnvironmentProjects/bravemath
npm run add:document
```

### **"Error fetching metadata"**
- Kiểm tra Drive ID có đúng không
- Kiểm tra file đã set "Anyone with the link" chưa
- Thử truy cập trực tiếp URL: `https://drive.google.com/uc?id={DRIVE_ID}`

### **"Drive ID không được để trống"**
- Paste đầy đủ Drive ID (thường là chuỗi ~30 ký tự)
- Ví dụ: `1LVkS0ctxyT_ydVwVmHY7IWY4EL71o1NM`

---

**Maintained by**: Bùi Quang Chiến (@Bravee9)  
**Last Updated**: 2025-12-29
