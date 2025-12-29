# Kiến Trúc Nền Tảng BraveMath

## Tổng Quan Hệ Thống

BraveMath là một ứng dụng JAMstack với các thành phần sau:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────┐         ┌──────────────────┐
│  GitHub Pages   │◄────────┤   Static Files   │
│   (Frontend)    │         │  (HTML/CSS/JS)   │
└────────┬────────┘         └──────────────────┘
         │
         │ API Call
         ▼
┌──────────────────┐        ┌──────────────────┐
│ Cloudflare Worker│◄───────┤   Google Drive   │
│     (Proxy)      │  Fetch │   (PDF Storage)  │
└──────────────────┘        └──────────────────┘
         │
         │ Cache
         ▼
┌──────────────────┐
│   Cloudflare CDN │
│    (Edge Cache)  │
└──────────────────┘
```

## Các Thành Phần

### 1. Giao Diện (GitHub Pages)

**Công nghệ:**
- HTML5
- Tailwind CSS
- Vanilla JavaScript (ES6+)

**Trách nhiệm:**
- Hiển thị danh mục tài liệu
- Giao diện tìm kiếm và lọc
- Định tuyến client (tùy chọn)
- Gọi API Cloudflare Worker

**Files:**
```
src/
├── pages/
│   ├── index.html      # Home page
│   ├── subject.html    # Subject detail
│   └── about.html      # About page
├── js/
│   ├── main.js         # App initialization
│   ├── api.js          # Worker API calls
│   ├── search.js       # Search/filter logic
│   └── router.js       # Client-side routing
└── css/
    └── styles.css      # Tailwind output
```

### 2. Cloudflare Worker (Lớp Proxy)

**Mục đích:**
- Ẩn link Google Drive trực tiếp
- Thêm header cache
- Xử lý CORS
- Tùy chọn: Giới hạn tốc độ, thống kê

**Điểm cuối API:**
```
GET /download/{driveId}  - Tải xuống PDF
GET /preview/{driveId}   - Xem trước trong trình duyệt
```

**Quy trình:**
1. Giao diện yêu cầu: `worker.dev/download/abc123`
2. Worker lấy từ Drive: `drive.google.com/uc?id=abc123`
3. Worker thêm CORS headers + cache
4. Trả file về cho người dùng

### 3. Lớp Dữ Liệu (JSON)

**File:** `data/documents.json`

**Schema:**
```json
{
  "id": "unique-id",
  "title": "Document title",
  "subject": "toan",
  "level": "thpt|daihoc",
  "category": "ly-thuyet|de-thi|bai-tap",
  "slug": "url-friendly-slug",
  "driveId": "Google Drive file ID",
  "description": "...",
  "tags": ["tag1", "tag2"],
  "fileSize": "5.2 MB",
  "pages": 120,
  "uploadDate": "2025-11-14",
  "author": "Author name"
}
```

### 4. Lưu Trữ (Google Drive)

**Tổ chức:**
```
BraveMath/
├── THPT/
│   ├── Toan/
│   ├── Ly/
│   └── Hoa/
└── DaiHoc/
    ├── GiaiTich/
    ├── DaiSo/
    └── XacSuat/
```

**Chia sẽ File:**
- Thiết lập thành "Bất kỳ ai có link đều xem được"
- Trích xuất file ID từ link chia sẽ
- Thêm vào `documents.json`

## Luồng Dữ Liệu

### Luồng Tải Xuống Tài Liệu

```
User clicks download
    │
    ▼
Frontend calls API
    │
    ▼
Worker receives request
    │
    ▼
Worker checks cache (optional)
    │
    ├─ Cache hit ──► Return cached file
    │
    └─ Cache miss ──► Fetch from Drive
                          │
                          ▼
                      Return to user
                          │
                          ▼
                      Store in cache
```

### Search/Filter Flow

```
User types in search
    │
    ▼
JavaScript filters documents.json
    │
    ▼
Display filtered results
    │
    ▼
User clicks document
    │
    ▼
Redirect to /toan/thpt/slug
    │
    ▼
Show document detail + download button
```

## URL Structure

### Frontend URLs (GitHub Pages)

```
/                           # Home page
/toan/thpt/ly-thuyet-12     # Document detail
/toan/daihoc/xac-suat       # Document detail
/about                      # About page
```

**Routing Options:**

**Option A: Static files**
```
/toan/thpt/ly-thuyet-12.html
```

**Option B: Client-side routing** (Recommended)
```
/toan/thpt/ly-thuyet-12
```
Use `router.js` to handle routes and load content dynamically.

### API URLs (Cloudflare Worker)

```
https://bravemath-proxy.workers.dev/download/{driveId}
https://bravemath-proxy.workers.dev/preview/{driveId}
```

## Performance Optimizations

### 1. Caching Strategy

**Browser Cache:**
```javascript
// Cache documents.json for 1 hour
Cache-Control: public, max-age=3600
```

**CDN Cache (Cloudflare):**
```javascript
// Cache PDF files for 24 hours
Cache-Control: public, max-age=86400
```

### 2. Lazy Loading

- Load `documents.json` on page load
- Lazy load images/thumbnails
- Defer non-critical JS

### 3. Code Splitting

- Separate bundles for each page
- Load search.js only on pages with search

### 4. Image Optimization

- Use WebP format for thumbnails
- Responsive images with `srcset`
- Lazy load images below fold

## Security Considerations

### 1. XSS Prevention

- Sanitize user input in search
- Use `textContent` instead of `innerHTML`
- CSP headers

### 2. Rate Limiting

Implement in Cloudflare Worker:
```javascript
const rateLimiter = new Map();
// Track requests per IP
```

### 3. Validation

- Validate Drive IDs (format check)
- CORS whitelist (production)
- API key for Worker (optional)

## Deployment Strategy

### Development

```bash
# Frontend
npm run dev

# Worker (separate terminal)
cd cloudflare-worker
npx wrangler dev
```

### Staging

- Branch: `staging`
- Deploy to: `staging.github.io`
- Worker: `bravemath-proxy-staging.workers.dev`

### Production

```bash
# Frontend
npm run build
git subtree push --prefix public origin gh-pages

# Worker
cd cloudflare-worker
npx wrangler deploy
```

## Monitoring & Analytics

### 1. Cloudflare Analytics

- Request count
- Bandwidth usage
- Error rate
- Cache hit ratio

### 2. Google Analytics (Optional)

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

Track:
- Page views
- Document downloads
- Search queries

### 3. Error Logging

```javascript
// In worker
try {
  // ...
} catch (error) {
  // Log to external service or KV store
  await logError(error);
}
```

## Future Enhancements

### Phase 2
- [ ] User authentication (optional)
- [ ] Document ratings/reviews
- [ ] Download counter
- [ ] Popular documents section

### Phase 3
- [ ] Search with Algolia/Fuse.js
- [ ] PDF preview in browser
- [ ] Mobile app (PWA)
- [ ] Admin dashboard

## Cost Estimation

### Free Tier
- GitHub Pages: ✅ Free
- Cloudflare Workers: ✅ Free (100k req/day)
- Google Drive: ✅ Free (15GB)

### Paid (if needed)
- Cloudflare Workers: $5/month (10M req)
- Google Drive: $1.99/month (100GB)

Total: **$0 - $7/month**

## Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **GitHub Pages**: https://docs.github.com/en/pages
