# Bravemath Platform - Hướng Dẫn cho Copilot

**Áp dụng cho**: bravemath (toàn bộ dự án)

## Tổng Quan Dự Án
BraveMath là nền tảng chia sẻ tài liệu học thuật miễn phí, tập trung vào môn Toán cho học sinh THPT và sinh viên Đại học. Tài liệu được lưu trữ trên Google Drive và phục vụ qua Cloudflare Workers để đảm bảo tốc độ và ẩn danh link gốc.

## Hướng Dẫn Chi Tiết cho Copilot
### Quy Tắc Vàng:
1. **GENERATE CODE trực tiếp**, comment ngắn gọn trong code
2. **GHI CHÉP chi tiết vào `/docs/roadmap-check.md`** SAU khi hoàn thành
3. **KHÔNG hỏi "Bạn đã hiểu chưa?"** - Làm ngay, giải thích sau

### Quy Trình Làm Việc:

#### Bước 1: Phân Tích & Code
- Đọc yêu cầu
- Generate code hoàn chỉnh ngay
- Comment ngắn trong code (tiếng Việt)

#### Bước 2: Cập Nhật Roadmap
- Ghi vào `/docs/roadmap-check.md`:
  - Code đã viết + giải thích chi tiết
  - Kiến thức mới (HTML/CSS/JS concepts)
  - Lỗi thường gặp
  - Tips & tricks


### Ví Dụ Cách Làm:

**ĐÚNG** - Generate code trực tiếp:
```javascript
// Tìm kiếm tài liệu
function searchDocuments(query) {
  // Lọc documents theo query (title, description, tags)
  return allDocuments.filter(doc => 
    doc.title.toLowerCase().includes(query.toLowerCase())
  );
}
```

**SAI** - Hỏi nhiều, giải thích dài:
"Trước khi viết code search, bạn đã hiểu DOM Manipulation chưa? Array.filter() là gì? Tôi giải thích trước nhé..."


### Nguyên Tắc Generate Code:

#### KHI VIẾT HTML:
- Viết HTML hoàn chỉnh ngay
- Dùng Tailwind CSS classes
- Comment ngắn cho các section quan trọng
- Semantic HTML (header, main, footer, nav, section)

#### KHI VIẾT CSS/TAILWIND:
- Viết đầy đủ Tailwind classes ngay
- Responsive từ đầu (md:, lg: breakpoints)
- Dùng custom classes từ input.css nếu cần
- Comment ngắn cho phần phức tạp

#### KHI VIẾT JAVASCRIPT:
- Viết code hoàn chỉnh, đầy đủ logic
- Comment tiếng Việt cho functions quan trọng
- Xử lý errors (try-catch)



## Mục Tiêu Dự Án
- Tạo nền tảng chia sẻ tài liệu học tập miễn phí, dễ sử dụng
- Tối ưu trải nghiệm người dùng với giao diện thân thiện
- Đảm bảo hiệu suất cao với tải nhanh, tìm kiếm mượt mà
- Bảo mật link tài liệu gốc trên Google Drive
- Hỗ trợ mở rộng tính năng trong tương lai (lọc nâng cao, yêu thích, thống kê)
- Dễ dàng bảo trì và phát triển thêm


## Công Nghệ Sử Dụng

### Giao Diện (Frontend)
- **Khung làm việc**: HTML/CSS/JavaScript thuần túy (không dùng framework)
- **CSS**: Tailwind CSS
- **Công cụ build**: Vite (dev server + build tool)
- **Tối ưu hóa**: Lazy loading, minification
- **Nơi lưu trữ**: GitHub Pages (static hosting)

### Máy chủ/Proxy (Backend)
- **Proxy**: Cloudflare Workers
- **Lưu trữ file**: Google Drive (file PDF)
- **Dữ liệu**: File JSON (thông tin metadata)

### Hệ Thống Thiết Kế
- **Chủ đề màu**: Chế độ tối (mặc định), Chế độ sáng (tương lai)
- **Font chữ**:
  - Logo/Brand: Imperial Script
  - Heading (H1-H6): Cambria, Cambria Math
  - Body text: Cambria, Cambria Math
  - Code/Monospace: Fira Code
- **Bảng màu** (Deep Blue + Pure Black):
  - Background: #000000 (Pure Black)
  - Text chính: #ffffff (White)
  - Text phụ: #94a3b8 (Slate 400)
  - Màu chính: #3b82f6 (Blue 500)
  - Màu đậm: #2563eb (Blue 600)
  - Màu accent: #1d4ed8 (Blue 700)
  - Border: #334155 (Slate 700)
  - Card/Panel: #0f172a (Slate 900)
- **Triết lý thiết kế**: Tối giản, sạch sẽ, trải nghiệm người dùng mượt mà, chuyên nghiệp

## Cấu Trúc Dự Án

**LƯU Ý**: TẤT CẢ tên file và folder KHÔNG có dấu tiếng Việt để tránh lỗi encoding.

```
bravemath/
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── css/
│   │   ├── input.css           # Tailwind input
│   │   └── styles.css          # Tailwind output (compiled)
│   ├── js/
│   │   ├── main.js             # Core functionality
│   │   ├── search.js           # Search/Filter logic
│   │   └── api.js              # Cloudflare Worker API calls
│   └── pages/
│       ├── index.html          # Home page
│       ├── about.html          # About page
│       └── subject.html        # Subject detail template
├── public/                      # Production build folder (generated)
│   ├── assets/
│   │   └── images/
│   └── index.html
├── data/
│   └── documents.json          # Metadata của tất cả tài liệu
├── cloudflare-worker/
│   ├── src/
│   │   └── index.js            # Worker script
│   ├── wrangler.toml           # Cloudflare config
│   └── README.md               # Deployment guide
├── assets/                      # PDF storage (not deployed, not in git)
│   ├── .gitkeep                # Keep folder in git
│   ├── dai_hoc/                # NO DIACRITICS
│   │   ├── toan_roi_rac/
│   │   └── xac_suat_thong_ke/
│   ├── de_luyen_tap/           # NO DIACRITICS
│   └── thptqg/                 # NO DIACRITICS
├── docs/
│   ├── architecture.md         # System design
│   ├── project-structure.md    # Project organization
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
```

## Cấu Trúc URL

URL sạch, phân cấp rõ ràng:
- `/toan/thpt/ly-thuyet-toan-12`
- `/toan/daihoc/xac-suat-thong-ke`
- `/toan/thpt/de-luyen-tap`

**Mẫu URL**: `/{mon-hoc}/{cap-hoc}/{ten-tai-lieu}`
- `mon-hoc`: toan, ly, hoa, v.v.
- `cap-hoc`: thpt, daihoc
- `ten-tai-lieu`: tên tài liệu dạng kebab-case (cách nhau bởi dấu gạch ngang)

## Tính Năng

### Giai Đoạn 1 (Hiện Tại)
- [ ] Trang chủ với danh sách tài liệu
- [ ] Chức năng tìm kiếm/lọc
- [ ] Trang chi tiết môn học
- [ ] Phần giới thiệu (footer)
- [ ] Chế độ tối (mặc định)

### Giai Đoạn 2 (Tương Lai)
- [ ] Chuyển đổi chế độ sáng
- [ ] Lọc nâng cao
- [ ] Yêu thích/Đánh dấu tài liệu
- [ ] Thống kê lượt tải
- [ ] Phần Blog/Tin tức

## Cấu Trúc Dữ Liệu

### Cấu trúc file documents.json
```json
{
  "documents": [
    {
      "id": "unique-id",
      "title": "Tên tài liệu (có dấu tiếng Việt OK)",
      "subject": "toan",
      "level": "thpt" | "daihoc",
      "category": "ly-thuyet" | "de-thi" | "bai-tap",
      "slug": "ly-thuyet-toan-12",
      "driveId": "Google Drive file ID",
      "description": "Mô tả ngắn",
      "tags": ["toan-12", "dai-so", "hinh-hoc"],
      "fileSize": "5.2 MB",
      "pages": 120,
      "uploadDate": "28/11/2025",
      "author": "Bùi Quang Chiến",
      "thumbnail": "/assets/images/thumbnails/thumbnail.jpg"
    }
  ]
}
```

**LƯU Ý Quan Trọng**:
- `uploadDate`: Định dạng **dd/mm/yyyy** (ngày/tháng/năm)
- `author`: **Bùi Quang Chiến** (không có số)
- `title`, `description`: Có dấu tiếng Việt (hiển thị cho người dùng)
- `slug`, `tags`, `subject`, `level`, `category`: KHÔNG dấu

## Cloudflare Worker

### Mục Đích
- Làm proxy cho các yêu cầu tới Google Drive
- Ẩn link Google Drive trực tiếp
- Cho phép sử dụng URL tùy chỉnh
- Thêm header cache để tăng tốc
- Tùy chọn: Giới hạn số lượt truy cập, thống kê

### Mẫu Đường Dẫn API
```
https://worker.yourdomain.workers.dev/download/{driveId}
```

Quy trình: Giao diện gọi worker → Worker lấy file từ Drive → Trả file về cho người dùng

## Hướng Dẫn Phát Triển

### Phong Cách Code
- Sử dụng HTML5 semantic (ngữ nghĩa)
- Thiết kế responsive ưu tiên mobile trước
- Khả năng truy cập: Nhãn ARIA, điều hướng bằng bàn phím
- Hiệu suất: Lazy loading (tải dần), chia nhỏ code
- SEO: Meta tags, dữ liệu có cấu trúc

### Quy Trình Git
- Nhánh main: Code đã sẵn sàng production
- Nhánh feature: `feature/ten-chuc-nang`
- Commit message: Theo định dạng Conventional Commits

### Quy Tắc Đặt Tên File
- HTML: chữ thường, cách nhau bởi dấu gạch ngang
- CSS: Phương pháp BEM hoặc Tailwind utilities
- JS: camelCase cho biến, PascalCase cho class
- Assets: chữ thường, cách nhau bởi dấu gạch ngang

## Các Lệnh (Sẽ bổ sung)

```bash
# Phát triển
npm run dev          # Khởi động server phát triển
npm run build        # Build cho production

# Tailwind
npm run css:watch    # Theo dõi thay đổi CSS
npm run css:build    # Build CSS cho production

# Cloudflare Worker
npm run worker:dev   # Test worker trên máy local
npm run worker:deploy # Deploy lên Cloudflare
```

## Ghi Chú cho Copilot

1. **Luôn dùng Tailwind CSS** - Không viết CSS tùy chỉnh trừ khi thực sự cần thiết
2. **Ưu tiên chế độ tối** - Thiết kế với màu tối làm mặc định
3. **URL sạch** - Tạo slug từ văn bản tiếng Việt một cách chính xác
4. **Tích hợp Drive** - Không bao giờ để lộ link Drive trực tiếp ở giao diện
5. **Hiệu suất** - Tối ưu hình ảnh, lazy load nội dung
6. **Hỗ trợ tiếng Việt** - Xử lý UTF-8 đúng cách, hiển thị văn bản tiếng Việt
7. **Không dùng Emoji** - Tránh sử dụng emoji trong comment code, tài liệu, hoặc văn bản hiển thị để giữ tính chuyên nghiệp.
9. **Tên GitHub của tôi là Bravee9** - Sử dụng tên này khi cần tham chiếu đến tác giả hoặc người quản lý dự án.
10. **Quy ước đặt tên nhất quán** - Tuân thủ nghiêm ngặt các mẫu đặt tên file và biến đã thiết lập.xong.
12. **Mục tiêu: Nền tảng miễn phí cho học sinh/sinh viên Việt Nam** - Ưu tiên tính năng phù hợp với đối tượng này.
13. **Hãy đảm bảo rằng tất cả các tài liệu và mã nguồn đều được tổ chức một cách rõ ràng và dễ hiểu để tôi có thể dễ dàng theo dõi và học hỏi từ chúng.**
14. **Hãy sử dụng ngôn ngữ tiếng Việt trong các bình luận và tài liệu để tôi có thể hiểu rõ hơn về các khái niệm và quy trình phát triển.**
15. **Font chữ chủ đạo là Cambria cho tiêu đề và cho nội dung để đảm bảo tính chuyên nghiệp và dễ đọc.**

## Biến Môi Trường (Tương Lai)

```env
CLOUDFLARE_WORKER_URL=https://bravemath-proxy.bravechien2209.workers.dev/
GOOGLE_DRIVE_API_KEY=1Y-sdgoE6ii6DrGffEGyLG2GzqIfX8UvR
```

---
**Tác giả**: Bùi Quang Chiến
**GitHub**: Bravee9
**Cập nhật lần cuối**: 28-11-2025
**Trạng thái**: Giai đoạn thiết lập ban đầu
