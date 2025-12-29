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
4. Chạy script và nhập thông tin theo hướng dẫn:
   - Drive ID
   - Tiêu đề tài liệu
   - Mô tả ngắn
   - Level (THPT/Đại học)
   - Category (Lý thuyết/Đề thi/Bài tập/Giải chi tiết)
   - Môn học (toan, ly, hoa...)
   - Tác giả
   - Tags (phân cách bằng dấu phẩy)

**Tự động**:
- ✅ Tạo ID mới (doc-001, doc-002...)
- ✅ Lấy file size từ Google Drive
- ✅ Ước lượng số trang
- ✅ Tạo thumbnail URL
- ✅ Tạo slug từ tiêu đề
- ✅ Thêm vào documents.json
- ✅ Cập nhật metadata (totalDocuments, lastUpdated)

**Ví dụ Output**:
```
✅ ===== THÀNH CÔNG! =====
📄 ID: doc-003
📖 Tiêu đề: Bài tập Đại số tuyến tính
🔗 Drive ID: 1XYZ789abc
📊 Size: 1.2 MB, Pages: 25

💡 Next steps:
   1. git add data/documents.json
   2. git commit -m "Add: Bài tập Đại số tuyến tính"
   3. git push
```

---

### **2. Cập Nhật Metadata** (`update-metadata.js`)

**Công dụng**: Tự động cập nhật file size và số trang cho TẤT CẢ tài liệu trong `documents.json`.

```bash
npm run update:metadata
```

**Khi nào dùng**:
- Sau khi cập nhật file PDF trên Drive (file size thay đổi)
- Kiểm tra lại metadata định kỳ
- Sau khi thêm nhiều tài liệu bằng tay

**Tự động**:
- ✅ Fetch file size từ Google Drive API
- ✅ Ước lượng số trang (1 page ≈ 50KB)
- ✅ Cập nhật tất cả documents trong 1 lần chạy

---

## 📋 Workflow Khuyến Nghị

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
