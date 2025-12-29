# BraveMath Platform

> Nền tảng chia sẻ tài liệu học thuật miễn phí cho học sinh THPT và sinh viên Đại học

## Giới thiệu

BraveMath là một trang website cá nhân, website tĩnh (static site) được thiết kế để chia sẻ tài liệu học thuật, tập trung vào môn Toán. Tài liệu được lưu trữ trên Google Drive và được phục vụ thông qua Cloudflare Workers để đảm bảo tốc độ tải nhanh và bảo mật.

## Tính năng

- Tìm kiếm và lọc tài liệu theo môn học, cấp độ
- Responsive design - hoạt động mượt mà trên mọi thiết bị
- Dark mode (mặc định)
- Tải tài liệu nhanh qua Cloudflare Workers
- Thiết kế tối giản, dễ sử dụng

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Tailwind CSS
- **Proxy**: Cloudflare Workers
- **Storage**: Google Drive
- **Hosting**: GitHub Pages

## Cấu Trúc Dự Án

```
bravemath/
├── .github/
│   └── copilot-instructions.md    # Cấu hình GitHub Copilot
├── src/
│   ├── css/                       # File CSS nguồn
│   ├── js/                        # Module JavaScript
│   └── pages/                     # Mẫu HTML
├── public/                        # File sẵn sàng production
├── data/
│   └── documents.json             # Metadata tài liệu
├── cloudflare-worker/             # Code Cloudflare Worker
├── assets/                        # PDF phát triển (không triển khai)
└── docs/                          # Tài liệu
```

## Bắt Đầu

### Yêu Cầu

- Node.js >= 18
- npm hoặc yarn
- Tài khoản Cloudflare (cho triển khai Worker)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/Bravee9/bravemath.git
cd bravemath

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build Tailwind CSS
npm run css:watch
```

### Deploy

#### 1. Deploy frontend lên GitHub Pages

```bash
# Build production
npm run build

# Push to gh-pages branch
git subtree push --prefix public origin gh-pages
```

#### 2. Deploy Cloudflare Worker

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler deploy
```

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết

## Tác giả

**Bravee9**

- GitHub: [@Bravee9](https://github.com/Bravee9)

## Cảm ơn

- Thiết kế lấy cảm hứng từ [Happy Hues](https://www.happyhues.co/palettes/4)
- Tài liệu học thuật từ Bùi Quang Chiến

---

Made with love for Vietnamese students <3
