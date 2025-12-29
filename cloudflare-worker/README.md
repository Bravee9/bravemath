# Hướng Dẫn Triển Khai Cloudflare Worker

## Yêu Cầu

1. Tài khoản Cloudflare (bậc miễn phí hoạt động)
2. Node.js >= 18
3. Wrangler CLI

## Thiết Lập

### 1. Cài Đặt Wrangler

```bash
npm install -g wrangler
# hoặc
npx wrangler --version
```

### 2. Đăng Nhập Cloudflare

```bash
npx wrangler login
```

Sẽ mở trình duyệt để xác thực.

### 3. Cấu Hình wrangler.toml

Sửa `wrangler.toml` và thêm ID tài khoản Cloudflare của bạn:

```toml
account_id = "YOUR_ACCOUNT_ID"
```

Để tìm ID tài khoản:
- Đăng nhập Cloudflare Dashboard
- Vào Workers & Pages
- Click vào profile của bạn → Copy Account ID

### 4. Kiểm Tra Cục Bộ

```bash
npx wrangler dev
```

Khởi động server phát triển cục bộ tại `http://localhost:8787`

Kiểm tra endpoints:
```bash
# Lấy thông tin
curl http://localhost:8787/

# Tải file (thay bằng Drive ID thật)
curl http://localhost:8787/download/YOUR_DRIVE_FILE_ID
```

## Triển Khai

### Triển khai lên Cloudflare

```bash
npx wrangler deploy
```

Sau khi triển khai, bạn sẽ nhận được URL như:
```
https://bravemath-proxy.YOUR_SUBDOMAIN.workers.dev
```

### Cập Nhật Cấu Hình Giao Diện

Trong code giao diện của bạn, cập nhật URL worker:

```javascript
// src/js/api.js
const WORKER_URL = 'https://bravemath-proxy.YOUR_SUBDOMAIN.workers.dev';
```

## Các Điểm Cuối API

### GET /download/{driveId}

Tải một file từ Google Drive.

**Ví dụ:**
```bash
curl https://bravemath-proxy.workers.dev/download/1abc123xyz
```

**Phản hồi:**
- `200 OK`: Trả về nội dung file
- `400 Bad Request`: Thiếu Drive ID
- `500 Internal Server Error`: Thất bại khi lấy từ Drive

### GET /preview/{driveId}

Redirects to Google Drive preview page.

**Example:**
```bash
curl -L https://bravemath-proxy.workers.dev/preview/1abc123xyz
```

## Monitoring

### View Logs

```bash
npx wrangler tail
```

### Analytics

Visit Cloudflare Dashboard → Workers & Pages → Your Worker → Metrics

## Troubleshooting

### Issue: "Authentication error"

**Solution:**
```bash
npx wrangler logout
npx wrangler login
```

### Issue: "Module not found"

**Solution:**
Check `wrangler.toml` has correct `main` path:
```toml
main = "src/index.js"
```

### Issue: CORS errors

**Solution:**
The worker already includes CORS headers. Make sure you're calling from the correct origin.

## Advanced Features (Optional)

### Add Caching with KV

1. Create KV namespace:
```bash
npx wrangler kv:namespace create "CACHE"
```

2. Add to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-namespace-id"
```

3. Update worker code to cache responses.

### Rate Limiting

Requires Workers Paid plan. Add to worker:

```javascript
// Check request rate per IP
const ip = request.headers.get('CF-Connecting-IP');
// Implement rate limiting logic
```

## Security

### Recommended Settings

1. **Restrict origins** (in production):
```javascript
const allowedOrigins = ['https://yourusername.github.io'];
```

2. **Add API key** (optional):
```javascript
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== env.API_KEY) {
  return new Response('Unauthorized', { status: 401 });
}
```

3. **Validate Drive IDs**:
```javascript
const driveIdPattern = /^[a-zA-Z0-9_-]{25,}$/;
if (!driveIdPattern.test(driveId)) {
  return new Response('Invalid Drive ID', { status: 400 });
}
```

## Cost

Cloudflare Workers Free Tier:
- 100,000 requests/day
- 10ms CPU time per request
- More than enough for a student document site

## Support

- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Discord: https://discord.gg/cloudflaredev
