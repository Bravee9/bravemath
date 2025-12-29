# Cấu Trúc Dự Án BraveMath

## Cấu trúc thư mục hoàn chỉnh

```
bravemath/
│
├── .github/
│   └── copilot-instructions.md    [DONE] Hướng dẫn GitHub Copilot
│
├── src/                            Mã nguồn (Phát triển)
│   ├── css/
│   │   ├── input.css              [DONE] File input Tailwind
│   │   └── styles.css             [TODO] Tạo bởi Tailwind (tự động)
│   ├── js/
│   │   ├── main.js                [TODO] Khởi tạo ứng dụng
│   │   ├── api.js                 [TODO] Gọi API Worker
│   │   ├── search.js              [TODO] Tìm kiếm/Lọc
│   │   └── router.js              [TODO] Định tuyến client
│   └── pages/
│       ├── index.html             [DONE] Trang chủ
│       ├── subject.html           [TODO] Chi tiết môn học
│       └── about.html             [TODO] Giới thiệu về người sáng tạo trang web (tôi, Brave9)
│
├── data/
│   └── documents.json             [DONE] Metadata tài liệu
│
├── cloudflare-worker/             Proxy Cloudflare Worker
│   ├── src/
│   │   └── index.js               [DONE] Script Worker
│   ├── wrangler.toml              [DONE] Cấu hình Cloudflare
│   ├── package.json               [DONE] Dependencies Worker
│   └── README.md                  [DONE] Hướng dẫn triển khai
│
├── assets/                        File PDF & Images (Chỉ phát triển)
│   ├── .gitkeep                   [DONE] Giữ folder trong git
│   ├── images/
│   │   └── menu_icon.png          [DONE] Custom hamburger icon
│   ├── dai_hoc/                   PDF Đại học (không dấu)
│   │   ├── toan_roi_rac/
│   │   └── xac_suat_thong_ke/
│   ├── de_luyen_tap/              PDF Đề luyện tập (không dấu)
│   └── thptqg/                    PDF THPT (không dấu)
│
├── docs/                          Tài liệu
│   ├── architecture.md            [DONE] Kiến trúc hệ thống
│   ├── project-structure.md       [DONE] Cấu trúc dự án
│   └── roadmap-check.md           [TODO] Ghi chép học tập
│
├── package.json                   [DONE] Dependencies dự án
├── tailwind.config.js             [DONE] Cấu hình Tailwind
├── postcss.config.js              [DONE] Cấu hình PostCSS
├── .gitignore                     [DONE] Quy tắc Git ignore
├── LICENSE                        [DONE] Giấy phép MIT
└── README.md                      [DONE] Tổng quan dự án
```

## Danh Sách Tiến Độ

### Giai Đoạn 1: Thiết Lập Dự Án (HOÀN THÀNH)
- [x] Tạo cấu trúc thư mục
- [x] Cấu hình Tailwind CSS
- [x] Thiết lập Cloudflare Worker
- [x] Tạo schema dữ liệu (documents.json)
- [x] Viết tài liệu
- [x] Tạo copilot-instructions.md

### Giai Đoạn 2: Phát Triển Giao Diện (ĐANG THỰC HIỆN)
- [x] Tạo mẫu HTML (index.html với header, hero, documents grid, footer)
- [ ] Viết module JavaScript
- [ ] Triển khai tìm kiếm/lọc (UI đã có, cần JS)
- [x] Thiết kế giao diện responsive
- [x] Thêm style chế độ tối

### Giai Đoạn 3: Tích Hợp
- [ ] Kết nối giao diện với Worker
- [ ] Kiểm tra luồng tải xuống
- [ ] Thêm trạng thái loading
- [ ] Xử lý lỗi

### Giai Đoạn 4: Nội Dung
- [ ] Tải PDF lên Google Drive
- [ ] Lấy Drive IDs
- [ ] Cập nhật documents.json
- [ ] Tạo ảnh thumbnail

### Giai Đoạn 5: Triển Khai
- [ ] Triển khai Cloudflare Worker
- [ ] Build giao diện
- [ ] Triển khai lên GitHub Pages
- [ ] Kiểm tra production

## Các Lệnh Quan Trọng

### Phát Triển

```bash
# Cài đặt dependencies
npm install

# Khởi động server phát triển
npm run dev

# Theo dõi Tailwind CSS
npm run css:watch
```

### Phát Triển Worker

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler dev
```

### Build Production

```bash
# Build CSS (QUAN TRỌNG: Chạy trên WSL2 Ubuntu)
wsl npm run css:build

# Hoặc trong WSL2 terminal:
npm run css:build

# Build giao diện
npm run build
```

### Triển Khai

```bash
# Triển khai Worker
cd cloudflare-worker
npx wrangler deploy

# Triển khai GitHub Pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## File Mô Tả Chi Tiết

### Đã Tạo

| File | Mục đích |
|------|----------|
| `.github/copilot-instructions.md` | Hướng dẫn cho GitHub Copilot |
| `package.json` | Dependencies và scripts |
| `tailwind.config.js` | Cấu hình Tailwind CSS với bảng màu |
| `.gitignore` | Quy tắc Git ignore |
| `README.md` | Tổng quan dự án |
| `LICENSE` | Giấy phép MIT |
| `data/documents.json` | Metadata của tài liệu |
| `cloudflare-worker/src/index.js` | Script proxy Worker |
| `cloudflare-worker/wrangler.toml` | Cấu hình Cloudflare |
| `cloudflare-worker/README.md` | Hướng dẫn triển khai Worker |
| `docs/architecture.md` | Kiến trúc hệ thống |
| `src/css/input.css` | File input Tailwind |
| `src/pages/index.html` | Trang chủ hoàn chỉnh |
| `assets/images/menu_icon.png` | Custom menu icon |
| `postcss.config.js` | Cấu hình PostCSS |

### Cần Tạo

| File | Mục đích |
|------|----------|
| `src/pages/index.html` | Trang chủ |
| `src/pages/subject.html` | Chi tiết môn học |
| `src/pages/about.html` | Giới thiệu |
| `src/js/main.js` | Khởi tạo ứng dụng |
| `src/js/api.js` | Gọi API tới Worker |
| `src/js/search.js` | Logic tìm kiếm/lọc |
| `src/js/router.js` | Định tuyến client |

## Các Bước Tiếp Theo

1. **Bước tiếp theo**: Tạo mẫu HTML
   - Bố cục trang chủ
   - Component thẻ tài liệu
   - Thanh tìm kiếm
   - Điều hướng

2. **Sau đó**: Chức năng JavaScript
   - Tải documents.json
   - Hiển thị danh sách tài liệu
   - Triển khai tìm kiếm
   - Xử lý tải xuống

3. **Cuối cùng**: Tích hợp & triển khai
   - Kết nối với Cloudflare Worker
   - Kiểm tra luồng đầu-cuối
   - Triển khai lên production

## Mẹo Hay

- **Quy trình phát triển**: Chạy `npm run css:watch` trong một terminal, code trong terminal khác
- **Kiểm tra Worker cục bộ**: Dùng `wrangler dev` để test trước khi triển khai
- **Quy trình Git**: Commit thường xuyên, mỗi tính năng một commit
- **Tài liệu hóa**: Cập nhật `documents.json` mỗi khi thêm tài liệu mới

## Hướng Dẫn Chi Tiết - Các Bước Tiếp Theo

### BƯỚC 1: Cài Đặt Dependencies (BẮT BUỘC)

```bash
# Di chuyển vào thư mục dự án
cd b:\EnvironmentProjects\bravemath

# Cài đặt Node.js dependencies
npm install

# Cài đặt dependencies cho Cloudflare Worker
cd cloudflare-worker
npm install
cd ..
```

**Kết quả mong đợi**: 
- Folder `node_modules/` xuất hiện
- File `package-lock.json` được tạo
- Không có lỗi trong quá trình cài đặt

---

### BƯỚC 2: Tạo File HTML Đầu Tiên - Trang Chủ

Bạn cần tạo `src/pages/index.html` với cấu trúc:

**Nội dung cần có:**
1. **Header/Điều Hướng**:
   - Logo "BraveMath"
   - Menu: Trang chủ, THPT, Đại học, Giới thiệu
   - Thanh tìm kiếm (input với icon tìm kiếm)

2. **Phần Hero**:
   - Tiêu đề chính: "Tài liệu học thuật miễn phí"
   - Mô tả ngắn về nền tảng
   - Nút CTA: "Khám phá ngay"

3. **Lưới Tài Liệu**:
   - Hiển thị danh sách tài liệu dưới dạng thẻ
   - Mỗi thẻ có:
     - Ảnh thumbnail (placeholder nếu chưa có ảnh)
     - Tiêu đề tài liệu
     - Nhãn danh mục (Lý thuyết, Đề thi, v.v.)
     - Nhãn cấp học (THPT, Đại học)
     - Số trang + Kích thước file
     - Nút "Tải xuống"

4. **Footer**:
   - Thông tin tác giả
   - Liên kết (GitHub, Email)
   - Bản quyền

**Các class Tailwind cần dùng**:
- Container: `container mx-auto px-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Card: `card` (đã định nghĩa trong input.css)
- Button: `btn btn-primary`
- Nền tối: `bg-background-dark`
- Màu chữ: `text-headline-dark`, `text-paragraph-dark`

---

### BƯỚC 3: Tạo Module JavaScript - Lớp API

Tạo `src/js/api.js`:

**Chức năng cần triển khai:**

```javascript
// 1. Tải documents từ documents.json
async function loadDocuments() {
  // Fetch data/documents.json
  // Return parsed JSON
}

// 2. Tải tài liệu qua Cloudflare Worker
async function downloadDocument(driveId, filename) {
  // Gọi worker: WORKER_URL/download/{driveId}
  // Kích hoạt tải xuống trong trình duyệt
}

// 3. Xem trước tài liệu
function previewDocument(driveId) {
  // Mở URL xem trước worker trong tab mới
}

// 4. Tìm kiếm/lọc tài liệu
function filterDocuments(documents, query, filters) {
  // Lọc theo: truy vấn tìm kiếm, môn học, cấp học, danh mục
  // Trả về mảng đã lọc
}
```

**Hằng số cần định nghĩa:**
```javascript
const WORKER_URL = 'http://localhost:8787'; // Dev
// const WORKER_URL = 'https://bravemath-proxy.bravechien2209.workers.dev'; // Production
```

---

### BƯỚC 4: Tạo Module JavaScript - Ứng Dụng Chính

Tạo `src/js/main.js`:

**Chức năng:**

```javascript
// 1. Khởi tạo ứng dụng khi DOM loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Tải documents
  // Hiển thị thẻ tài liệu
  // Thiết lập event listeners
});

// 2. Hiển thị thẻ tài liệu
function renderDocuments(documents) {
  // Lặp qua documents
  // Tạo HTML thẻ cho mỗi tài liệu
  // Thêm vào container lưới
}

// 3. Thiết lập tìm kiếm
function setupSearch() {
  // Lắng nghe input tìm kiếm
  // Lọc khi keyup/change
  // Hiển thị lại kết quả đã lọc
}

// 4. Thiết lập nút tải xuống
function setupDownloadButtons() {
  // Thêm click listeners cho tất cả nút tải xuống
  // Gọi api.downloadDocument()
}
```

---

### BƯỚC 5: Build Tailwind CSS

```bash
# Chế độ theo dõi (để code CSS realtime)
npm run css:watch

# Hoặc build một lần
npm run css:build
```

**Kết quả**: File `src/css/styles.css` được tạo với Tailwind đã biên dịch

---

### BƯỚC 6: Kiểm Tra Cục Bộ

**Tùy chọn A: HTTP server đơn giản**
```bash
# Dùng Python
python -m http.server 8000 --directory src/pages

# Hoặc dùng Node
npx http-server src/pages -p 8000
```

**Tùy chọn B: Live Server (Extension VS Code)**
- Cài đặt extension "Live Server"
- Right-click vào `index.html` → "Open with Live Server"

**Truy cập**: http://localhost:8000/index.html

---

### BƯỚC 7: Kiểm Tra Cloudflare Worker (Song Song)

Trong terminal riêng:

```bash
cd cloudflare-worker
npx wrangler dev
```

**Kiểm tra endpoints:**
```bash
# Kiểm tra endpoint thông tin
curl http://localhost:8787/

# Kiểm tra tải xuống (với Drive ID thật từ Google Drive)
curl http://localhost:8787/download/YOUR_DRIVE_ID
```

---

### BƯỚC 8: Tải PDF Lên Google Drive

1. **Tổ chức file**:
   - Tạo folder "BraveMath" trên Drive
   - Tạo subfolder: "THPT", "DaiHoc"
   - Tải các PDF từ `assets/`

2. **Lấy Drive IDs**:
   - Right-click file → "Get link"
   - Định dạng URL: `https://drive.google.com/file/d/FILE_ID/view`
   - Copy `FILE_ID`

3. **Thiết lập quyền**:
   - Click "Share"
   - Đổi thành "Anyone with the link can view"

4. **Cập nhật documents.json**:
   - Thay `YOUR_GOOGLE_DRIVE_FILE_ID_HERE` bằng Drive ID thật
   - Cập nhật filename, fileSize, pages nếu cần

---

### BƯỚC 9: Kết Nối Giao Diện ↔ Worker

Trong `src/js/api.js`, kiểm tra luồng tải xuống:

```javascript
// Hàm kiểm tra
async function testDownload() {
  const testDriveId = 'YOUR_ACTUAL_DRIVE_ID';
  await downloadDocument(testDriveId, 'test.pdf');
}
```

**Kiểm tra**:
- Click nút "Tải xuống"
- Worker nhận request
- File được tải về máy
- Không lộ link Drive gốc

---

### BƯỚC 10: Tạo Các Trang Còn Lại (Tùy chọn cho v1)

1. **subject.html**: Chi tiết môn học
   - Lọc tài liệu theo môn học
   - Hiển thị chỉ tài liệu của môn đó

2. **about.html**: Giới thiệu
   - Về BraveMath
   - Về tác giả
   - Thông tin liên hệ

---

## Danh Sách Kiểm Tra Thực Hiện

```
Giai Đoạn 2: Phát Triển Giao Diện
├─ [x] BƯỚC 1: npm install (cả root và cloudflare-worker)
├─ [x] BƯỚC 2: Tạo src/pages/index.html với bố cục đầy đủ
├─ [ ] BƯỚC 3: Tạo src/js/api.js với 4 hàm
├─ [ ] BƯỚC 4: Tạo src/js/main.js với khởi tạo ứng dụng
├─ [ ] BƯỚC 5: Build Tailwind CSS (npm run css:watch)
├─ [ ] BƯỚC 6: Kiểm tra giao diện cục bộ (http-server hoặc Live Server)
├─ [ ] BƯỚC 7: Kiểm tra Cloudflare Worker (wrangler dev)
├─ [ ] BƯỚC 8: Tải PDFs lên Drive + lấy IDs
├─ [ ] BƯỚC 9: Kiểm tra luồng tải xuống đầu-cuối
└─ [ ] BƯỚC 10: Tạo subject.html và about.html (tùy chọn)
```

---

## Xử Lý Lỗi Thường Gặp

### Lỗi 1: npm install thất bại
```bash
# Xóa cache
npm cache clean --force
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json
# Cài đặt lại
npm install
```

### Lỗi 2: Tailwind không tạo CSS
```bash
# Kiểm tra đường dẫn content trong tailwind.config.js
# Đảm bảo có: "./src/**/*.{html,js}"
# Khởi động lại npm run css:watch
```

### Lỗi 3: Lỗi CORS khi gọi Worker
```javascript
// Worker đã có CORS headers
// Kiểm tra worker có đang chạy không (wrangler dev)
// Kiểm tra URL đúng: http://localhost:8787
```

### Lỗi 4: Không thể tải từ Drive
```bash
# Kiểm tra:
# 1. File Drive có công khai không?
# 2. Drive ID đúng định dạng không?
# 3. Worker có fetch được không? (kiểm tra wrangler logs)
```

---

## Tài Nguyên Tham Khảo

- [Tài liệu Tailwind CSS](https://tailwindcss.com/docs)
- [Tài liệu Cloudflare Workers](https://developers.cloudflare.com/workers/)


---

**Trạng thái hiện tại**: Giai đoạn 2 đang thực hiện - HTML hoàn thành, cần JavaScript
**Ngày cập nhật**: 28/12/2025
**Bước tiếp theo**: BƯỚC 3 - Tạo src/js/api.js và src/js/main.js
**Lưu ý quan trọng**: Build CSS bằng WSL2 Ubuntu (`wsl npm run css:build`)
