# Tổng Quan Kiến Trúc & Logic Dự Án thonas-world

Dự án **thonas-world** là một website cá nhân / portfolio kiêm blog kỹ thuật chuyên sâu dành cho **Unity Game Developer**, xây dựng theo phong cách mỹ cảm cổ phong Á Đông (giấy Dó, mực tàu, thếp vàng, chu sa, ấn triện). Toàn bộ hệ thống chạy dưới dạng static site không phụ thuộc backend server, triển khai trên GitHub Pages.

---

## 1. Cấu Trúc Thư Mục & Các Thành Phần

```text
thonas-world/
├── index.html                      # Trang chủ portfolio chính
├── articles/                       # Các trang bài viết kỹ thuật độc lập
│   ├── zero-alloc-gc.html          # Chuyên đề tối ưu Garbage Collection trong Unity
│   ├── scriptable-objects-architecture.html # Chuyên đề kiến trúc GameEvent ScriptableObjects
│   └── water-ink-shader.html       # Chuyên đề URP Shader Graph Thủy Mặc & Sobel
├── assets/
│   └── js/
│       └── article-interactions.js # Module xử lý tương tác độc giả & LocalStorage
└── PROJECT_LOGIC_SUMMARY.md        # Tài liệu tóm tắt logic toàn bộ dự án
```

---

## 2. Logic Chi Tiết Từng Thành Phần

### 2.1. Trang Chủ (`index.html`)

- **Phong cách & Giao diện:**
  - Tailwind CSS qua CDN với bảng màu tùy biến `heritage` (`ink`, `card`, `border`, `gold`, `amber`, `cinnabar`, `parchment`, `muted`).
  - Họa tiết chấm hạt giấy Dó (`bg-do-paper`), hiệu ứng ánh sáng mờ (`ink-glow`), con dấu triện (`seal-stamp`).
  - Hệ thống icon Lucide (`lucide.createIcons()`).
- **Các phân khu nội dung (Sections):**
  1. `header`: Thanh điều hướng cố định với menu desktop và drawer mobile menu (toggle qua id `menu-btn` và `mobile-menu`).
  2. `#hero`: Lời tựa, định danh "Unity Game Artisan", thẻ trạng thái thông số kỹ thuật (120 FPS, 0 B GC, URP Pipeline).
  3. `#about` (Ngẫm & Luận): 3 trụ cột triết lý làm game (Tối ưu thuần khiết, Game Feel, Mỹ cảm Á Đông).
  4. `#articles` (Ký Sự Kỹ Nghệ): Danh sách 3 bài viết chuyên đề dạng thẻ liên kết (`<a href="./articles/..." data-article-link>`).
  5. `#projects` (Kỳ Thư Tác Phẩm): Giới thiệu dự án game nổi bật (*Cổ Kiếm Vấn Đạo*, *Vân Sơn Mê Cung*).
  6. `#tech` (Khí Cụ Làm Game): Danh sách công cụ (C#, Unity, Shader Graph, Unity Profiler, Git LFS, FMOD, Blender, DOTS).
  7. `#contact` (Bái Phỏng): Khung kết nối qua email và GitHub.
- **Logic Script Trang Chủ:**
  - **Mobile Menu Toggle:** Đóng/mở drawer trên thiết bị di động, tự đóng khi click vào liên kết.
  - **Điều hướng bài viết tức thời:** Bắt sự kiện click trên `[data-article-link]` để chuyển hướng ngay sang trang bài viết.
  - **Đồng bộ chỉ số tương tác thời gian thực:** Duyệt qua các ID bài viết (`zero-alloc-gc`, `scriptable-objects-architecture`, `water-ink-shader`), đọc số lượt Ấn Triện (`tamDac`) và số lượt bình luận từ `localStorage`, ghi đè lên các thuộc tính `[data-home-reaction]` và `[data-home-comments]`.

---

### 2.2. Module Tương Tác Dùng Chung (`assets/js/article-interactions.js`)

Module hướng đối tượng `ArticleInteractions`, khởi tạo theo từng `data-article-id` của trang bài viết. Toàn bộ dữ liệu được quản lý với tiền tố key `ky_su_game_`.

#### A. Thanh tiến trình đọc (`initProgressBar`)
- Lắng nghe sự kiện `scroll` của `window`.
- Tính tỷ lệ: `(scrollTop / (scrollHeight - clientHeight)) * 100`.
- Cập nhật trực tiếp `width: X%` vào phần tử `#reading-progress-bar`.

#### B. Hệ thống Ấn Triện / Phản hồi (`toggleReaction`)
- Phân loại:
  - `tamDac`: 💮 Tâm Đắc (Ấn Chu Sa đỏ - tương đương Like/Clap).
  - `khaiSang`: 💡 Khai Sáng (Ấn Hổ Phách vàng - tương đương Insightful).
- Cơ chế lưu trữ:
  - `ky_su_game_reactions_[articleId]`: Lưu tổng số lượng từng loại. Có giá trị khởi tạo mặc định.
  - `ky_su_game_user_voted_[articleId]`: Lưu trạng thái đã ấn của người dùng hiện tại (bấm lần 1 tăng điểm + đổi màu nút, bấm lần 2 thu hồi điểm).
- Hiệu ứng thị giác: `showStampAnimation` tạo badge con dấu dập nảy (`animate-bounce`) bung lên phía trên nút ấn.

#### C. Tàng Thư Các / Bookmark (`toggleBookmark`)
- Lưu mảng các ID bài viết đã đánh dấu vào `ky_su_game_bookmarks`.
- Cập nhật trạng thái hiển thị của nút `#btn-bookmark` (đổi sang viền vàng hoàng kim khi đã lưu).

#### D. Sao chép liên kết (`copyArticleLink`)
- Gọi `navigator.clipboard.writeText(window.location.href)`.
- Hiển thị Toast thông báo cổ phong ở góc dưới màn hình.

#### E. Khu vực Đàm Đạo / Bình Luận (`loadComments`, `addComment`)
- Khóa lưu trữ: `ky_su_game_comments_[articleId]`.
- Cấu trúc 1 bình luận: `{ id, author, avatar, date, content, isGoogle }`.
- Luồng hoạt động:
  - Khởi tạo với bình luận mẫu nếu chưa có dữ liệu trong máy.
  - Khi người dùng gửi form `#form-comment`: Kiểm tra chuỗi, escape HTML chống XSS, tạo bình luận mới, đẩy lên đầu danh sách (`unshift`), lưu `localStorage`, cập nhật lại giao diện và thông báo Toast.
  - Nút `#btn-google-login`: chỉ mô phỏng. Mở `prompt()` nhập danh xưng, rồi gắn `isGoogle: true` (hiện huy hiệu "Google Verified"). Không có OAuth thật (xem mục 5).

#### F. Thông báo Toast cổ phong (`showToast`)
- Tự động sinh container `#heritage-toast` cố định ở góc dưới (`fixed bottom-8 right-8`).
- Đi kèm đèn tín hiệu chu sa nhấp nháy (`bg-heritage-cinnabar animate-pulse`), tự động ẩn sau 3 giây.

---

### 2.3. Các Trang Bài Viết Độc Lập (`articles/*.html`)

Mỗi trang là một tài liệu HTML hoàn chỉnh, kế thừa layout Á Đông của trang chủ:
- Có thanh tiến trình đọc trên cùng (`#reading-progress-bar`).
- Có Header với nút quay lại trang chủ và các nút hành động nhanh (`Chia sẻ`, `Tàng Thư`).
- Breadcrumb điều hướng phân cấp rõ ràng.
- Nội dung chuyên sâu kèm code block có format giao diện trình đọc code.
- Khung hành động "Hạ Bút Ấn Triện" (`#btn-tam-dac`, `#btn-khai-sang`).
- Khu vực "Góc Đàm Đạo Đồng Đạo" với form bình luận và danh sách bình luận đã lưu.

---

## 3. Cơ Chế Lưu Trữ Dữ Liệu Cục Bộ (LocalStorage Schema)

| Key trong LocalStorage | Kiểu Dữ Liệu | Mục Đích |
| :--- | :--- | :--- |
| `ky_su_game_reactions_{id}` | `{ tamDac: number, khaiSang: number }` | Lưu tổng số lượt ấn triện của bài viết `{id}` |
| `ky_su_game_user_voted_{id}` | `{ tamDac: boolean, khaiSang: boolean }` | Lưu trạng thái người dùng đã ấn triện hay chưa |
| `ky_su_game_bookmarks` | `Array<string>` | Danh sách các ID bài viết đã lưu vào Tàng Thư |
| `ky_su_game_comments_{id}` | `Array<{ id, author, avatar, date, content, isGoogle }>` | Danh sách bình luận của bài viết `{id}` |

---

## 4. Cách Vận Hành & Lưu Ý Triển Khai (Deployment)

1. **GitHub Pages:**
   - Website được deploy tự động từ nhánh `main`.
   - Lưu ý đệm cache (`Cache-Control: max-age=600`): Khi có commit mới đẩy lên, cần **Ctrl + F5** hoặc mở tab ẩn danh để trình duyệt bỏ qua cache cũ.
2. **Khả năng mở rộng — thêm bài viết mới:**
   1. Nhân bản một file trong `articles/`, đặt `data-article-id="id-moi"`.
   2. Thêm thẻ liên kết trong `#articles` của `index.html` với `data-article-link`, `data-home-reaction="id-moi"`, `data-home-comments="id-moi"`.
   3. Thêm `id-moi` vào mảng ID trong script đồng bộ chỉ số của `index.html` (hiện: `['zero-alloc-gc', 'scriptable-objects-architecture', 'water-ink-shader']`). Bỏ bước này thì thẻ trang chủ không cập nhật số liệu.
   4. (Tùy chọn) Thêm dữ liệu mặc định cho `id-moi` vào `DEFAULT_REACTIONS` và `DEFAULT_COMMENTS` trong `article-interactions.js`. Nếu bỏ qua, reaction mặc định là `{ tamDac: 10, khaiSang: 5 }` và danh sách bình luận rỗng.
   - Phần tương tác bên trong trang bài viết (reaction, bookmark, bình luận) tự khởi tạo riêng theo ID.

---

## 5. Giới Hạn Hiện Tại

1. **Dữ liệu chỉ nằm trên trình duyệt (`localStorage`).**
   - Reaction, bookmark, bình luận không chia sẻ giữa người dùng hoặc thiết bị. Đây là mô phỏng giao diện tương tác, không phải tính năng cộng đồng.
   - Số liệu ban đầu lấy từ `DEFAULT_REACTIONS` / `DEFAULT_COMMENTS` (hardcode trong `article-interactions.js`; ví dụ `zero-alloc-gc`: `tamDac: 42`, `khaiSang: 28`). Bình luận mẫu là dữ liệu giả.
   - Xóa dữ liệu trình duyệt sẽ mất toàn bộ trạng thái.
2. **Không có xác thực thật.**
   - `#btn-google-login` chỉ mở `prompt()` để nhập danh xưng, rồi gắn cờ `isGoogle: true`. Không có OAuth / Google Sign-In.
   - Huy hiệu "Google Verified" không có giá trị xác minh và có thể bị giả mạo.
3. **Bảo mật:**
   - `escapeHtml` được áp dụng cho `author` và `content` khi hiển thị.
   - `alt="${c.author}"` và `src="${c.avatar}"` của thẻ `<img>` được chèn vào HTML không qua `escapeHtml`. Cần rà soát nếu cho phép dữ liệu bên ngoài.
   - Tiền tố key `ky_su_game_` chỉ là namespace, không mang ý nghĩa bảo mật.
4. **Phụ thuộc bên ngoài:**
   - Tailwind (`cdn.tailwindcss.com`), Lucide, Google Fonts, avatar DiceBear (`api.dicebear.com`) tải qua CDN/API ngoài, không có SRI và không có fallback offline. Tailwind CDN không khuyến nghị cho production.
5. **Chưa có:** meta SEO / Open Graph, kiểm tra accessibility, đo hiệu năng của chính trang web.
