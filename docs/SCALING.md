# 📐 Hướng Dẫn Scale Bravemath

Tài liệu này hướng dẫn cách mở rộng hệ thống khi cần thêm:
- **Cấp độ mới** (VD: THCS, Cao học)
- **Môn học mới** (VD: Tối ưu hoá, Vật lý, Hóa học)
- **Thể loại mới** (VD: Slide bài giảng, Video)

---

## 📁 Danh Sách File Cần Sửa

| File | Mục đích | Bắt buộc |
|------|----------|----------|
| `data/documents.json` | Thêm tài liệu với level/subject mới | ✅ |
| `src/js/main.js` | Cập nhật `levelMap`, `categoryMap` hiển thị | ✅ |
| `src/js/subject.js` | Cập nhật `levelMap`, `categoryMap` | ✅ |
| `src/pages/index.html` | Thêm options vào filter dropdowns | ✅ |
| `src/pages/admin.html` | Thêm options vào GUI form | ✅ |
| `scripts/add-document.js` | Thêm options vào CLI (nếu dùng) | ⚠️ Optional |
| `src/js/search.js` | Logic tìm kiếm (thường không cần sửa) | ❌ |

---

## 🎯 Ví Dụ: Thêm Cấp Độ "THCS"

### 1. Cập nhật `levelMap` trong `src/js/main.js`

```javascript
// Tìm đoạn này (khoảng line 165-170)
const levelMap = {
    'thpt': 'THPT',
    'daihoc': 'Đại học'
};

// Sửa thành:
const levelMap = {
    'thcs': 'THCS',        // ← Thêm mới
    'thpt': 'THPT',
    'daihoc': 'Đại học'
};
```

### 2. Cập nhật `levelMap` trong `src/js/subject.js`

```javascript
// Tìm đoạn này (khoảng line 175)
const levelMap = {
    'thpt': 'THPT',
    'daihoc': 'Đại học'
};

// Sửa thành:
const levelMap = {
    'thcs': 'THCS',        // ← Thêm mới
    'thpt': 'THPT',
    'daihoc': 'Đại học'
};
```

### 3. Thêm option vào filter dropdown trong `src/pages/index.html`

```html
<!-- Tìm select có id="level-filter" -->
<select id="level-filter" class="filter-select">
    <option value="">Tất cả cấp độ</option>
    <option value="thcs">THCS</option>      <!-- ← Thêm mới -->
    <option value="thpt">THPT</option>
    <option value="daihoc">Đại học</option>
</select>
```

### 4. Thêm chip vào Admin GUI trong `src/pages/admin.html`

```html
<!-- Tìm div có id="levelChips" -->
<div class="subject-chips" id="levelChips">
    <button type="button" class="subject-chip" data-value="thcs">THCS</button>  <!-- Đã có -->
    <button type="button" class="subject-chip" data-value="thpt">THPT</button>
    <button type="button" class="subject-chip selected" data-value="daihoc">Đại học</button>
</div>
```

---

## 🎯 Ví Dụ: Thêm Môn Học "Tối Ưu Hoá"

### 1. Thêm option vào filter dropdown trong `src/pages/index.html`

```html
<!-- Tìm select có id="subject-filter" -->
<select id="subject-filter" class="filter-select">
    <option value="">Tất cả môn học</option>
    <option value="giai-tich">Giải tích</option>
    <option value="xac-suat-thong-ke">Xác suất thống kê</option>
    <option value="toan-roi-rac">Toán rời rạc</option>
    <option value="dai-so">Đại số</option>
    <option value="hinh-hoc">Hình học</option>
    <option value="toi-uu">Tối ưu hoá</option>    <!-- ← Thêm mới -->
</select>
```

### 2. Thêm chip vào Admin GUI trong `src/pages/admin.html`

```html
<!-- Tìm div có id="subjectChips" -->
<div class="subject-chips" id="subjectChips">
    <button type="button" class="subject-chip selected" data-value="toan">Toán</button>
    <button type="button" class="subject-chip" data-value="ly">Vật lý</button>
    <button type="button" class="subject-chip" data-value="hoa">Hóa học</button>
    <button type="button" class="subject-chip" data-value="tin">Tin học</button>
    <button type="button" class="subject-chip" data-value="toi-uu">Tối ưu hoá</button>  <!-- Đã có -->
</div>
```

### 3. Thêm tài liệu với subject mới trong `data/documents.json`

```json
{
    "id": "doc-010",
    "title": "Bài tập Quy hoạch tuyến tính",
    "subject": "toi-uu",           // ← Giá trị slug
    "level": "daihoc",
    "category": "bai-tap",
    "tags": ["toi-uu", "quy-hoach-tuyen-tinh", "dai-hoc"],
    ...
}
```

---

## 🎯 Ví Dụ: Thêm Thể Loại "Slide Bài Giảng"

### 1. Cập nhật `categoryMap` trong `src/js/main.js`

```javascript
// Tìm đoạn này (khoảng line 158-164)
const categoryMap = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết'
};

// Sửa thành:
const categoryMap = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết',
    'slide': 'Slide bài giảng'     // ← Thêm mới
};
```

### 2. Cập nhật `categoryMap` trong `src/js/subject.js`

```javascript
// Tìm đoạn này (khoảng line 165-171)
const categoryMap = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết'
};

// Thêm:
const categoryMap = {
    'ly-thuyet': 'Lý thuyết',
    'de-thi': 'Đề thi',
    'bai-tap': 'Bài tập',
    'giai-chi-tiet': 'Giải chi tiết',
    'slide': 'Slide bài giảng'     // ← Thêm mới
};
```

### 3. Thêm option vào filter và Admin GUI

```html
<!-- index.html: select#category-filter -->
<option value="slide">📊 Slide bài giảng</option>

<!-- admin.html: select#category -->
<option value="slide">📊 Slide bài giảng</option>
```

---

## ⚡ Quick Checklist

Khi thêm **Level** mới:
- [ ] `src/js/main.js` → `levelMap`
- [ ] `src/js/subject.js` → `levelMap`
- [ ] `src/pages/index.html` → `#level-filter`
- [ ] `src/pages/admin.html` → `#levelChips`
- [ ] (Optional) `scripts/add-document.js`

Khi thêm **Subject** mới:
- [ ] `src/pages/index.html` → `#subject-filter`
- [ ] `src/pages/admin.html` → `#subjectChips`
- [ ] (Optional) `scripts/add-document.js`

Khi thêm **Category** mới:
- [ ] `src/js/main.js` → `categoryMap`
- [ ] `src/js/subject.js` → `categoryMap`
- [ ] `src/pages/index.html` → `#category-filter`
- [ ] `src/pages/admin.html` → `#category`
- [ ] (Optional) `scripts/add-document.js`

---

## 🔧 Tips & Best Practices

### Naming Convention (Slug)
- Luôn dùng **kebab-case** cho values: `toan-roi-rac`, `giai-chi-tiet`
- Không dùng dấu tiếng Việt trong slug
- Dùng dấu `-` thay vì `_` hoặc space

### Consistent Data Structure
```json
{
    "subject": "toan",           // Slug, không dấu
    "level": "daihoc",           // Slug, không dấu  
    "category": "ly-thuyet",     // Slug, có dấu gạch ngang
    "tags": ["giai-tich", "dai-hoc"]  // Array of slugs
}
```

### Tìm kiếm tự động
Module `search.js` tự động tìm kiếm trong:
- `title` - Tiêu đề
- `description` - Mô tả
- `tags` - Tags
- `subject` - Môn học
- `author` - Tác giả

→ **Không cần sửa `search.js`** khi thêm level/subject/category mới!

---

## 📊 Cấu Trúc Data Flow

```
documents.json
    ↓
loadDocuments() [api.js]
    ↓
filterDocuments() [search.js]
    ↓
renderDocuments() [main.js / subject.js]
    ↓
levelMap / categoryMap → Hiển thị label đẹp
```

---

## 🚀 Scale Lớn Hơn

Nếu số lượng môn học/cấp độ tăng lên rất nhiều, có thể refactor sang:

### Option 1: Config File
```javascript
// src/config/taxonomy.js
export const LEVELS = {
    'thcs': { label: 'THCS', order: 1 },
    'thpt': { label: 'THPT', order: 2 },
    'daihoc': { label: 'Đại học', order: 3 }
};

export const CATEGORIES = { ... };
export const SUBJECTS = { ... };
```

### Option 2: Fetch từ JSON
```javascript
// data/config.json
{
    "levels": [...],
    "categories": [...],
    "subjects": [...]
}
```

Rồi load config này khi app khởi tạo.

---

**Last updated**: 2026-01-02
