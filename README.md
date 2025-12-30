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

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết

## Tác giả

**Bravee9**

- GitHub: [@Bravee9](https://github.com/Bravee9)

---

Made with love for Vietnamese students <3
